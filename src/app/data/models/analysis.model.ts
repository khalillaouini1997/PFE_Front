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
  totalExpectedFrames: number;
  totalReceivedFrames: number;
  healthScore: number;
  offlineGaps: OfflineGap[];
  signalTrend: SignalTrend;
  prediction: string;
  failureProbability30Days: number;
}
