import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { OperationsSocket } from '@/services/api/opsSocket';
import { ServiceDeparture, Incident, StandbyDeployment, OperationsSnapshot } from '@/types/operations';

// Mock WebSocket
const mockWebSocket = {
  readyState: 1, // OPEN
  send: vi.fn(),
  close: vi.fn(),
  onopen: null as (() => void) | null,
  onmessage: null as ((event: { data: string }) => void) | null,
  onclose: null as ((event: { code: number; reason: string; wasClean: boolean }) => void) | null,
  onerror: null as ((error: any) => void) | null,
};

global.WebSocket = vi.fn(() => mockWebSocket) as any;

describe('OperationsSocket', () => {
  let socket: OperationsSocket;
  let callbacks: any;

  beforeEach(() => {
    vi.clearAllMocks();
    socket = new OperationsSocket();
    callbacks = {
      onDepartureUpdate: vi.fn(),
      onIncidentCreated: vi.fn(),
      onIncidentUpdated: vi.fn(),
      onStandbyDeployed: vi.fn(),
      onSystemStatus: vi.fn(),
      onConnectionChange: vi.fn(),
      onError: vi.fn(),
    };
  });

  afterEach(() => {
    socket.disconnect();
  });

  describe('connect', () => {
    it('creates WebSocket connection with correct URL', () => {
      socket.connect(callbacks);
      
      expect(global.WebSocket).toHaveBeenCalledWith('/api/ops/stream/');
    });

    it('sets up WebSocket event handlers', () => {
      socket.connect(callbacks);
      
      expect(mockWebSocket.onopen).toBeDefined();
      expect(mockWebSocket.onmessage).toBeDefined();
      expect(mockWebSocket.onclose).toBeDefined();
      expect(mockWebSocket.onerror).toBeDefined();
    });

    it('calls onConnectionChange when connection opens', () => {
      socket.connect(callbacks);
      
      mockWebSocket.onopen!();
      
      expect(callbacks.onConnectionChange).toHaveBeenCalledWith(true);
    });

    it('starts heartbeat when connection opens', () => {
      vi.useFakeTimers();
      socket.connect(callbacks);
      
      mockWebSocket.onopen!();
      
      vi.advanceTimersByTime(30000); // 30 seconds
      
      expect(mockWebSocket.send).toHaveBeenCalledWith(
        JSON.stringify({ type: 'ping', timestamp: expect.any(String) })
      );
      
      vi.useRealTimers();
    });
  });

  describe('message handling', () => {
    beforeEach(() => {
      socket.connect(callbacks);
    });

    it('handles departure_update messages', () => {
      const departure: ServiceDeparture = {
        id: 'dep-1',
        trainId: 'T001',
        routeId: 'R001',
        plannedDeparture: '2024-01-01T08:00:00Z',
        status: 'scheduled',
        destination: 'Central Station',
        isBoarded: false,
        hasFault: false,
        lastUpdated: '2024-01-01T08:00:00Z'
      };

      const message = {
        type: 'departure_update',
        data: departure,
        timestamp: '2024-01-01T08:00:00Z'
      };

      mockWebSocket.onmessage!({ data: JSON.stringify(message) });
      
      expect(callbacks.onDepartureUpdate).toHaveBeenCalledWith(departure);
    });

    it('handles incident_created messages', () => {
      const incident: Incident = {
        id: 'inc-1',
        trainId: 'T001',
        serviceId: 'dep-1',
        type: 'mechanical',
        severity: 'high',
        description: 'Brake system malfunction',
        reportedAt: '2024-01-01T08:00:00Z',
        reportedBy: 'operator1',
        status: 'open'
      };

      const message = {
        type: 'incident_created',
        data: incident,
        timestamp: '2024-01-01T08:00:00Z'
      };

      mockWebSocket.onmessage!({ data: JSON.stringify(message) });
      
      expect(callbacks.onIncidentCreated).toHaveBeenCalledWith(incident);
    });

    it('handles incident_updated messages', () => {
      const incident: Incident = {
        id: 'inc-1',
        trainId: 'T001',
        serviceId: 'dep-1',
        type: 'mechanical',
        severity: 'high',
        description: 'Brake system malfunction',
        reportedAt: '2024-01-01T08:00:00Z',
        reportedBy: 'operator1',
        status: 'investigating'
      };

      const message = {
        type: 'incident_updated',
        data: incident,
        timestamp: '2024-01-01T08:00:00Z'
      };

      mockWebSocket.onmessage!({ data: JSON.stringify(message) });
      
      expect(callbacks.onIncidentUpdated).toHaveBeenCalledWith(incident);
    });

    it('handles standby_deployed messages', () => {
      const deployment: StandbyDeployment = {
        id: 'deploy-1',
        standbyTrainId: 'ST001',
        replacementForServiceId: 'dep-1',
        replacementForTrainId: 'T001',
        deployedAt: '2024-01-01T08:00:00Z',
        deployedBy: 'operator1',
        status: 'active'
      };

      const message = {
        type: 'standby_deployed',
        data: deployment,
        timestamp: '2024-01-01T08:00:00Z'
      };

      mockWebSocket.onmessage!({ data: JSON.stringify(message) });
      
      expect(callbacks.onStandbyDeployed).toHaveBeenCalledWith(deployment);
    });

    it('handles system_status messages', () => {
      const snapshot: OperationsSnapshot = {
        timestamp: '2024-01-01T08:00:00Z',
        totalServices: 10,
        onTimeServices: 7,
        delayedServices: 2,
        cancelledServices: 1,
        activeIncidents: 1,
        availableStandby: 3,
        deployedStandby: 0,
        systemStatus: 'operational'
      };

      const message = {
        type: 'system_status',
        data: snapshot,
        timestamp: '2024-01-01T08:00:00Z'
      };

      mockWebSocket.onmessage!({ data: JSON.stringify(message) });
      
      expect(callbacks.onSystemStatus).toHaveBeenCalledWith(snapshot);
    });

    it('handles unknown message types gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const message = {
        type: 'unknown_type',
        data: {},
        timestamp: '2024-01-01T08:00:00Z'
      };

      mockWebSocket.onmessage!({ data: JSON.stringify(message) });
      
      expect(consoleSpy).toHaveBeenCalledWith('Unknown WebSocket message type:', 'unknown_type');
      
      consoleSpy.mockRestore();
    });

    it('handles malformed JSON gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      mockWebSocket.onmessage!({ data: 'invalid json' });
      
      expect(consoleSpy).toHaveBeenCalledWith('Failed to parse WebSocket message:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('connection management', () => {
    it('handles connection close events', () => {
      socket.connect(callbacks);
      
      mockWebSocket.onclose!({ code: 1000, reason: 'Normal closure', wasClean: true });
      
      expect(callbacks.onConnectionChange).toHaveBeenCalledWith(false);
    });

    it('handles connection errors', () => {
      socket.connect(callbacks);
      
      mockWebSocket.onerror!('Connection error');
      
      expect(callbacks.onError).toHaveBeenCalledWith('WebSocket connection error');
    });

    it('schedules reconnection on unclean close', () => {
      vi.useFakeTimers();
      socket.connect(callbacks);
      
      mockWebSocket.onclose!({ code: 1006, reason: 'Abnormal closure', wasClean: false });
      
      expect(callbacks.onConnectionChange).toHaveBeenCalledWith(false);
      
      // Should schedule reconnection
      vi.advanceTimersByTime(1000);
      
      expect(global.WebSocket).toHaveBeenCalledTimes(2);
      
      vi.useRealTimers();
    });

    it('limits reconnection attempts', () => {
      vi.useFakeTimers();
      socket.connect(callbacks);
      
      // Simulate 6 failed reconnection attempts
      for (let i = 0; i < 6; i++) {
        mockWebSocket.onclose!({ code: 1006, reason: 'Abnormal closure', wasClean: false });
        vi.advanceTimersByTime(1000);
      }
      
      // Should not attempt more reconnections
      vi.advanceTimersByTime(1000);
      
      expect(global.WebSocket).toHaveBeenCalledTimes(6); // Initial + 5 reconnection attempts
      
      vi.useRealTimers();
    });

    it('stops heartbeat on disconnect', () => {
      vi.useFakeTimers();
      socket.connect(callbacks);
      
      mockWebSocket.onopen!();
      socket.disconnect();
      
      vi.advanceTimersByTime(30000);
      
      expect(mockWebSocket.send).not.toHaveBeenCalled();
      
      vi.useRealTimers();
    });
  });

  describe('send', () => {
    it('sends messages when connected', () => {
      socket.connect(callbacks);
      mockWebSocket.onopen!();
      
      const message = { type: 'test', data: 'test' };
      socket.send(message);
      
      expect(mockWebSocket.send).toHaveBeenCalledWith(JSON.stringify(message));
    });

    it('warns when trying to send while disconnected', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const message = { type: 'test', data: 'test' };
      socket.send(message);
      
      expect(consoleSpy).toHaveBeenCalledWith('WebSocket not connected, cannot send message');
      
      consoleSpy.mockRestore();
    });
  });

  describe('isConnected', () => {
    it('returns true when WebSocket is open', () => {
      socket.connect(callbacks);
      mockWebSocket.readyState = 1; // OPEN
      
      expect(socket.isConnected()).toBe(true);
    });

    it('returns false when WebSocket is not open', () => {
      socket.connect(callbacks);
      mockWebSocket.readyState = 3; // CLOSED
      
      expect(socket.isConnected()).toBe(false);
    });
  });

  describe('disconnect', () => {
    it('closes WebSocket connection', () => {
      socket.connect(callbacks);
      socket.disconnect();
      
      expect(mockWebSocket.close).toHaveBeenCalledWith(1000, 'Client disconnect');
    });

    it('stops heartbeat', () => {
      vi.useFakeTimers();
      socket.connect(callbacks);
      
      mockWebSocket.onopen!();
      socket.disconnect();
      
      vi.advanceTimersByTime(30000);
      
      expect(mockWebSocket.send).not.toHaveBeenCalled();
      
      vi.useRealTimers();
    });
  });
});
