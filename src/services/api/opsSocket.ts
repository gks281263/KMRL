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

  constructor(url?: string) {
    // Use environment-aware URL construction
    if (url) {
      this.url = url;
    } else {
      // In development, use the Vite dev server WebSocket proxy
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      this.url = `${protocol}//${host}/api/ops/stream/`;
    }
  }

  connect(callbacks: OperationsSocketCallbacks): void {
    this.callbacks = callbacks;
    
    // In development mode, check if we should attempt WebSocket connection
    if (import.meta.env.DEV) {
      console.log('Development mode: WebSocket connection may fail if backend server is not running');
      console.log('Attempting to connect to:', this.url);
    }
    
    this.connectWebSocket();
  }

  private connectWebSocket(): void {
    if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.isConnecting = true;
    
    try {
      // Add connection timeout
      const connectionTimeout = setTimeout(() => {
        if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
          console.warn('WebSocket connection timeout, closing connection');
          this.ws.close();
        }
      }, 10000); // 10 second timeout

      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = () => {
        console.log('Operations WebSocket connected');
        clearTimeout(connectionTimeout);
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
        clearTimeout(connectionTimeout);
        console.log('Operations WebSocket disconnected:', event.code, event.reason);
        this.isConnecting = false;
        this.callbacks.onConnectionChange?.(false);
        this.stopHeartbeat();
        
        // Only attempt reconnection if it wasn't a clean close and we haven't exceeded max attempts
        if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.warn('Max WebSocket reconnection attempts reached. Please check server status.');
          this.callbacks.onError?.('WebSocket connection failed after maximum retry attempts');
        }
      };

      this.ws.onerror = (error) => {
        clearTimeout(connectionTimeout);
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

  // Method to check if WebSocket server is available (for development)
  async checkServerAvailability(): Promise<boolean> {
    try {
      const response = await fetch('/api/ops/health', { 
        method: 'HEAD',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      return response.ok;
    } catch (error) {
      console.warn('WebSocket server health check failed:', error);
      return false;
    }
  }
}

// Singleton instance
export const operationsSocket = new OperationsSocket();
