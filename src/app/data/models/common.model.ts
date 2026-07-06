export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface AccessLog {
  id: number;
  username: string;
  login?: string;
  action: string;
  timestamp: Date;
  date?: any;
  ipAddress: string;
  agent?: string;
}

export interface RecalculatePayload {
  idBoitier: number;
  idBoitiers: number[];
  recalculeStartDate: number | null;
}

export function createRecalculatePayload(): RecalculatePayload {
  return {
    idBoitier: 0,
    idBoitiers: [],
    recalculeStartDate: null
  };
}

export interface DeviceOptDTO {
  idBoitier: number;
  optionId: number;
  enabled: boolean;
}

export interface DeviceSettingDTO {
  idBoitier: number;
  settingName: string;
  settingValue: string;
}

export interface VehiculeSettingDTO {
  idBoitier: number;
  odometre: number;
}

export interface PathConfigPayloadDTO {
  idBoitier: number;
  path: string;
}

export interface TraccarDto {
  id: number;
  name: string;
  imei: string;
  lastupdate?: string;
  category?: string;
  contact?: string;
  phone?: string;
  model?: string;
  disabled?: boolean;
  iccid?: string;
  latitude?: number;
  longitude?: number;
}

export interface Path {
  path: string;
}

export interface Raw {
  gprmc: string;
  idTram: number;
}

export interface Raws {
  raws: Raw[];
  count: number;
}

export function createRaws(): Raws {
  return {
    raws: [],
    count: 0
  };
}
