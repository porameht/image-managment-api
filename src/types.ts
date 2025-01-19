export interface ReplicateResponse {
    completed_at: string;
    created_at: string;
    data_removed: boolean;
    error: string | null;
    id: string;
    input: {
      image: string;
    };
    logs: string;
    metrics: {
      predict_time: number;
    };
    output: string;
    started_at: string;
    status: string;
    urls: {
      get: string;
      cancel: string;
    };
    version: string;
  }
