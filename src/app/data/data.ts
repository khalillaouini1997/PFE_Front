export class Archive {
  date: string = "";
  trame_id: number = 0;
  idDevice: number = 0;
  latitude: number = 0;
  longitude: number = 0;
  speed: number = 0;
  fuel: number = 0;
  temp: number = 0;
  x: number = 0;
  y: number = 0;
  z: number = 0;
  ignition: boolean = false;
  rpm: number = 0;
  fuel_rate: number = 0;
  tfu: number = 0;
  odo: number = 0;
  satInView: number = 0;
  signal: number = 0;
  heading: number = 0;
  charger: number = 0;
}

export class Boitier {
  idBoitier: number;
  label: string;
  numBoitier: number;
  etatBoitier: string;
  streamId: number;
  ipAdresse: IpAddress;

  // Real-time fields (transient/runtime only)
  emplacement?: string;
  dateLastTrame?: number;
  vitesse?: number;
  gpsLastTrame?: number;
  gsmLastTrame?: number;
  stat?: boolean = true;

  constructor() {
    this.idBoitier = 0;
    this.label = '';
    this.numBoitier = 0;
    this.etatBoitier = '';
    this.ipAdresse = new IpAddress();
    this.streamId = 0;
  }
}

export interface BoitierRealTime {
  idBoitier: number;
  numBoitier: number;
  emplacement: string;
  dateLastTrame: number;
  vitesse: number;
  gpsLastTrame: number;
  gsmLastTrame: number;
}

export class CompteServer {

  idCompteClientServer: number;
  pseudo: string;
  intervaleStart: number;
  intervaleEnd: number;
  ipAdresse: string;
  login: string;
  date_creation: number;
  date_Expiration: number;
  password: string;
  expired: boolean;
  during: boolean;

  str_expiration: string;
  constructor() {
    this.idCompteClientServer = 0;

    this.pseudo = "";
    this.ipAdresse = "";

    this.login = "";

    this.password = "";
    this.expired = false;

    this.during = false;
    this.intervaleStart = 0;
    this.intervaleEnd = 0;
    this.str_expiration = "";
  }
}

export class CompteServerWithBoitier {
  compteServer: CompteServer;
  nbrBoitiers: number;

  constructor() {
    this.compteServer = new CompteServer();
    this.nbrBoitiers = 0;
  }
}

export class CompteWeb {
  idCompteClientWeb: number;
  login: string;
  password: string;
  rawPassword: string;
  date_creation: number;
  date_expiration: number;
  code_pays: string;
  options: Option[];
  compteClientServer: CompteServer = new CompteServer();
  expired: boolean;
  during: boolean;
  ipAdresse: string;
  pool: number;
  firstname: string;
  lastname: string;
  email: string;
  telephone: number;
  area: string;
  administratorCompte: AdministratorCompte;
  notificationSubquery: string;
  mobileNotif: boolean;
  deviceFeeByDay: number;
  accountFeeByMonth: number;
  deviceFeePerMonth: number;
  simCardFeePerMonth: number;

  constructor() {
    this.idCompteClientWeb = 0;
    this.login = "";
    this.password = "";
    this.rawPassword = "";
    this.code_pays = "+212";
    this.expired = false;
    this.ipAdresse = 'localhost';
    this.during = false;
  }

}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export class AdministratorCompte {
  idAdministratorCompte: number;
  username: string;
  password: string;
  role: string;
  token: string;
  idTraccar: number;
  useFcm: boolean;
  fcmApikey: string;
  fcmPrefix: string;
  mailSupport: string;
  deviceCostByDay: number;
  accountFreePerMonth: number;
  transctionFee: number;
  numLastBoitierAvailable: number;
  constructor() {
    this.idAdministratorCompte = 0;
    this.username = '';
    this.role = '';
  }
}

export class ConfigurationVehicules {
  idConfig: number;
  vehiculeGender: string;
  pathMinSpeed: number;
  pathMin: number;
  stopMin: number;
  pauseMin: number;
  distancemin: number;
  constructor() {
    this.idConfig = 0;
    this.vehiculeGender = "";
    this.pathMinSpeed = 0;
    this.pathMin = 0;
    this.stopMin = 0;
    this.pauseMin = 0;
    this.distancemin = 0;
  }
}


export class Intervention {
  /**intervention id */
  id: number;
  /**intervention type :REQUEST|INPROGRESS|CARRYOUT|REJECTED*/
  type: 'REQUEST' | 'INPROGRESS' | 'CARRYOUT' | 'REJECTED';

  idBoitiers: number;

  content: string;
  /**request type */
  request: string;
  /**response */
  response: string;
  /**intervention was created at */
  createdAt: Date;

  submitAt: Date;
  /** we have three possibilities :moyen,faible,urgent */
  priority: number;

  constructor() { }
}

export class UpdateIntervention extends Intervention {
  idTenant: number;
  constructor() { super(); }
}

export class Option {
  idOption: number;
  description: string;
  constructor() {
    this.idOption = 0;
    this.description = ""
  }
}

export class Path {
  path: string;
  constructor() {
    this.path = "";
  }
}

export class raw {
  gprmc: string = "";
  idTram: number = 0;
}

export class raws {
  raws: raw[];
  count: number;
  constructor() {
    this.count = 0;
  }
}

export interface OptionInfoDTO {
  idOption: number;
  libelle: string;
  description: string;
}

export interface CompteClientWebInfoDTO {
  idCompteClientWeb: number;
  login: string;
  date_creation: Date;
  date_expiration: Date;
  code_pays: string;
  pool: number;
  firstname: string;
  lastname: string;
  telephone: number;
  email: string;
  area: string;
  options: OptionInfoDTO[];
  mobileNotif: boolean;
}

export class IpAddress {
  idIpAdresse: number | null = null;
  label: string = "";
  value: string = "";
  typeConnection: string | null = null;
  jdbcUser: string | null = null;
  jdbcPass: string | null = null;
  url: string | null = null;
  dbName: string | null = null;
  urlGetId: string | null = null;
}

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

export interface AccessLog {
  id: number;
  username: string;
  action: string;
  timestamp: Date;
  ipAddress: string;
}

export interface RecalculatePayloadDTO {
  start: Date;
  end: Date;
  devices: number[];
}

export class RecalculatePayload {
  idBoitier: number;
  idBoitiers: number[];
  recalculeStartDate: number | null;
  constructor() {
    this.idBoitier = 0;
    this.idBoitiers = [];
    this.recalculeStartDate = null;
  }
}

export interface DeviceOptDTO {
  idBoitier: number;
  optionId: number;
  enabled: boolean;
}

export class DeviceOpt {
  idBoitiers: number[];
  idBoitier: number;
  useIgnition: boolean;
  useFuel: boolean;
  useTemp: boolean;
  useFms: boolean;
  useJ1708: boolean;
  useIdDriver: boolean;
  useStop: boolean;
  constructor() {
    this.idBoitiers = [];
    this.idBoitier = 0;
    this.useFms = false;
    this.useFuel = false;
    this.useIdDriver = false;
    this.useIgnition = false;
    this.useJ1708 = false;
    this.useStop = false;
    this.useTemp = false;
  }
}

export interface DeviceSettingDTO {
  idBoitier: number;
  settingName: string;
  settingValue: string;
}

export class DeviceSetting {
  idBoitiers: number[];
  idIpAdresse: number = 0;
  streamId: number = 0;

  constructor() {
    this.idBoitiers = [];
  }
}

export interface VehiculeSettingDTO {
  idBoitier: number;
  odometre: number;
}

export class VehiculeSetting {
  idBoitiers: number[];
  accumOdo: number = 0;

  constructor() {
    this.idBoitiers = [];
  }
}

export interface PathConfigPayloadDTO {
  idBoitier: number;
  path: string;
}

export class PathConfigPayload {
  boitiersId: number[] = [];
  pathMinSpeed: number = 0;
  pathMinSec: number = 0;
  stopMinSec: number = 0;
  pauseMinSec: number = 0;
  distanceMinMeter: number = 0;

  constructor() { }
}

export class TraccarDto {
  id: number;
  name: string;
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

export class InterventionInfo {
  deviceId: number;
  matricule: string;
  mark: string;
  driver: string;
  technician: string;
  createdAt: Date;
  verifiedAt: Date;
  verified: boolean;
  constructor() { }
}
