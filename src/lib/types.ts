export interface Product {
  id: string;
  deviceId: string;
  batchId: string;
  manufacturingDate: string; // YYYY-MM-DD
  rohsCompliant: boolean;
  serialNumber: string;
  labelImageUrl?: string; 
}

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error';
}

export type ProcessStatus = 
  | 'idle' 
  | 'inspecting' 
  | 'completed_accepted' 
  | 'completed_rejected';
