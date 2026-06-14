export interface Intervention {
  id: number;
  type: 'REQUEST' | 'INPROGRESS' | 'CARRYOUT' | 'REJECTED';
  idBoitiers: number;
  content: string;
  request: string;
  response: string;
  createdAt: Date;
  submitAt: Date;
  priority: number;
}

export function createIntervention(): Intervention {
  return {
    id: 0,
    type: 'REQUEST',
    idBoitiers: 0,
    content: '',
    request: '',
    response: '',
    createdAt: new Date(),
    submitAt: new Date(),
    priority: 0
  };
}

export interface UpdateIntervention extends Intervention {
  idTenant: number;
}

export interface InterventionInfo {
  deviceId: number;
  matricule: string;
  mark: string;
  driver: string;
  technician: string;
  createdAt: Date;
  verifiedAt: Date;
  verified: boolean;
}
