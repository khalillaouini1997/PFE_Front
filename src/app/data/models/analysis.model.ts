export interface DeviceInstallationEvolution {
  periodLabel: string;
  cumulativeCount: number;
  newInstallations: number;
}

export interface OfflineGap {
  startTime: string;
  endTime: string;
  durationMinutes: number;
  probableCause: string;
}

export interface SignalTrend {
  avgSignal: number;
  trend: 'STABLE' | 'DEGRADING' | 'IMPROVING';
}

export interface BoitierAnalysis {
  boitierId: number;
  numBoitier: number;
  analyzedDays: number;
  uptimePercentage: number;
  totalReceivedFrames: number;
  healthScore: number;
  offlineGaps: OfflineGap[];
  signalTrend: SignalTrend;
  prediction: string;
  anomalyCount: number;
  anomalyRate: number;
  topAnomalyTypes: Record<string, number>;
  structuralAnomalies: number;
  logicalAnomalies: number;
  mlAnomalies: number;
}
