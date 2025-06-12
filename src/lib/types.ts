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
  type: 'info' | 'success' | 'error' | 'ai';
}

export interface ValidationResult {
  isValid: boolean;
  validationMessage: string;
}

export type ProcessStatus = 
  | 'idle' 
  | 'inspecting' 
  | 'label_generated' 
  | 'ai_validating' 
  | 'validation_complete_accepted' 
  | 'validation_complete_rejected';
