import { WebSocketMessage, ServiceDeparture, Incident, StandbyDeployment, OperationsSnapshot } from '@/types/operations';

export interface OperationsSocketCallbacks {
  onDepartureUpdate?: (departure: ServiceDeparture) => void;
  onIncidentCreated?: (incident: Incident) => void;
  onIncidentUpdated?: (incident: Incident) => void;
  onStandbyDeployed?: (deployment: StandbyDeployment) => void;
  onSystemStatus?: (snapshot: OperationsSnapshot) => void;
  onConnectionChange?: (connected: boolean) => void;
  onError?: (error: string) => void;
}

export class OperationsSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private callbacks: OperationsSocketCallbacks = {};
  private isConnecting = false;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private url: string;

  constructor(url: string = '/api/ops/stream/') {
    this.url = url;
  }

  connect(callbacks: OperationsSocketCallbacks): void {
    this.callbacks = callbacks;
    this.connectWebSocket();
  }

  private connectWebSocket(): void {
    if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.isConnecting = true;
    
    try {
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = () => {
        console.log('Operations WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        this.callbacks.onConnectionChange?.(true);
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('Operations WebSocket disconnected:', event.code, event.reason);
        this.isConnecting = false;
        this.callbacks.onConnectionChange?.(false);
        this.stopHeartbeat();
        
        if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('Operations WebSocket error:', error);
        this.isConnecting = false;
        this.callbacks.onError?.('WebSocket connection error');
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.isConnecting = false;
      this.callbacks.onError?.('Failed to create WebSocket connection');
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'departure_update':
        this.callbacks.onDepartureUpdate?.(message.data as ServiceDeparture);
        break;
      case 'incident_created':
        this.callbacks.onIncidentCreated?.(message.data as Incident);
        break;
      case 'incident_updated':
        this.callbacks.onIncidentUpdated?.(message.data as Incident);
        break;
      case 'standby_deployed':
        this.callbacks.onStandbyDeployed?.(message.data as StandbyDeployment);
        break;
      case 'system_status':
        this.callbacks.onSystemStatus?.(message.data as OperationsSnapshot);
        break;
      default:
        console.warn('Unknown WebSocket message type:', message.type);
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000);
    
    console.log(`Scheduling WebSocket reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      this.connectWebSocket();
    }, delay);
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() }));
      }
    }, 30000); // Send ping every 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  disconnect(): void {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    this.isConnecting = false;
  }

  send(message: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
export const operationsSocket = new OperationsSocket();
