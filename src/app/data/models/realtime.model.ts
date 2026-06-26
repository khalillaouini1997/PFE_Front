export interface RealTime {
  deviceid: number;
  matricule: string;
  status: string;
  latitude: number;
  longitude: number;
  validity: boolean;
  speed: number;
  ignition: boolean;
  record_time: Date;
  numPuce: string;
  imei: string;
  version: string;
}

export interface RealTimeSummary {
  deviceid: number;
  status: string;
  speed: number;
  ignition: boolean;
  record_time: Date;
  signal: number;
  numPuce: string;
  imei: string;
}

export interface Tram {
  login: string;
  deviceid: number;
  status: string;
  latitude: number;
  longitude: number;
  fuel: number;
  ignition: boolean;
  mems_x: number;
  mems_y: number;
  mems_z: number;
  power: number;
  record_time: Date;
  sat_in_view: number;
  send_flag: number;
  speed: number;
  temperature: string;
  type: string;
  validity: boolean;
  signal: number;
  rotation_angle: number;
  rpm: number;
  fuel_rate: number;
  tfu: number;
  temp_engine: number;
  accum_odo: number;
  last_raw_time: Date;
  matricule: string;
  ignitionStatistique: number;
  speedStatistique: number;
  invalidityStatistique: number;
  numPuce: string;
  imei: string;
  version: string;
  lastIdRaw: number;
  lastId: number;
  lastTime: Date;
}
