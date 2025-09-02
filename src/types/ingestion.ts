export type SourceId = 'maximo' | 'cert' | 'branding' | 'iot' | 'cleaning' | 'yard' | 'overrides';

export type SourceStatus = 'ok' | 'warning' | 'error' | 'syncing';

export interface SourceData {
  id: SourceId;
  name: string;
  last_sync: string;
  status: SourceStatus;
  open_count?: number;
  error_count?: number;
  trains_invalid?: number[];
  total_records?: number;
  last_error?: string;
  sync_duration?: number; // in seconds
}

export interface IngestionStatus {
  snapshot_time: string;
  freshness_percentage: number;
  sources: SourceData[];
  last_full_snapshot: string;
  total_sources: number;
  sources_ok: number;
  sources_warning: number;
  sources_error: number;
}

export interface SyncJob {
  id: string;
  source: SourceId | 'all';
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress: number; // 0-100
  started_at: string;
  completed_at?: string;
  error_message?: string;
  logs: string[];
}

export interface UploadRequest {
  source: SourceId;
  file: File;
  validate_only?: boolean;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  records_processed: number;
  errors: UploadError[];
  preview_data?: any[];
}

export interface UploadError {
  row: number;
  field: string;
  message: string;
  value: string;
}

export interface ManualOverride {
  trainId: string;
  note: string;
  effective_until: string;
  created_by: string;
  created_at: string;
}

export interface OverrideRequest {
  trainId: string;
  note: string;
  effective_until: string;
}

export interface IngestionEvent {
  id: string;
  timestamp: string;
  source: SourceId;
  event_type: 'sync_started' | 'sync_completed' | 'sync_failed' | 'upload_success' | 'upload_failed' | 'override_added' | 'override_expired';
  message: string;
  details?: any;
}
