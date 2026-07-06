export interface Archive {
  date: string | Date;
  trame_id: number;
  idDevice: number;
  latitude: number;
  longitude: number;
  speed: number;
  fuel: number;
  temp: number;
  x: number;
  y: number;
  z: number;
  ignition: boolean;
  rpm: number;
  fuel_rate: number;
  tfu: number;
  odo: number;
  satInView: number;
  signal: number;
  heading: number;
  charger: number;
}

export interface Boitier {
  idBoitier: number;
  label: string;
  numBoitier: number;
  etatBoitier: string;
  streamId: number;
  ipAdresse: IpAddress;
  emplacement?: string;
  latitude?: number;
  longitude?: number;
  dateLastTrame?: number | string | Date;
  vitesse?: number;
  gpsLastTrame?: number;
  gsmLastTrame?: number;
  stat?: boolean;
}

export function createBoitier(): Boitier {
  return {
    idBoitier: 0,
    label: '',
    numBoitier: 0,
    etatBoitier: '',
    streamId: 0,
    ipAdresse: createIpAddress(),
    stat: true
  };
}

export interface BoitierRealTime {
  idBoitier: number;
  numBoitier: number;
  emplacement: string;
  latitude: number;
  longitude: number;
  dateLastTrame: number | string;
  vitesse: number;
  gpsLastTrame: number;
  gsmLastTrame: number;
}

export interface IpAddress {
  idIpAdresse: number | null;
  label: string;
  value: string;
  typeConnection: string | null;
  jdbcUser: string | null;
  jdbcPass: string | null;
  url: string | null;
  dbName: string | null;
  urlGetId: string | null;
}

export function createIpAddress(): IpAddress {
  return {
    idIpAdresse: null,
    label: '',
    value: '',
    typeConnection: null,
    jdbcUser: null,
    jdbcPass: null,
    url: null,
    dbName: null,
    urlGetId: null
  };
}

export interface DeviceOpt {
  idBoitiers: number[];
  idBoitier: number;
  useIgnition: boolean;
  useFuel: boolean;
  useTemp: boolean;
  useFms: boolean;
  useJ1708: boolean;
  useIdDriver: boolean;
  useStop: boolean;
  useDoor: boolean;
  useDoor2: boolean;
}

export interface DeviceSetting {
  idBoitiers: number[];
  idIpAdresse: number;
  streamId: number;
}

export interface VehiculeSetting {
  idBoitiers: number[];
  accumOdo: number;
  lastId: number;
}

export function createVehiculeSetting(): VehiculeSetting {
  return {
    idBoitiers: [],
    accumOdo: 0,
    lastId: 0
  };
}

export interface PathConfigPayload {
  boitiersId: number[];
  pathMinSpeed: number;
  pathMinSec: number;
  stopMinSec: number;
  pauseMinSec: number;
  distanceMinMeter: number;
}

export interface ConfigurationVehicules {
  idConfig: number;
  vehiculeGender: string;
  pathMinSpeed: number;
  pathMin: number;
  stopMin: number;
  pauseMin: number;
  distancemin: number;
}
