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
  idBoitier: number = 0;
  label: string = '';
  numBoitier: number = 0;
  etatBoitier: string = '';
  streamId: number = 0;
  ipAdresse: IpAddress = new IpAddress();

  // Real-time fields (transient/runtime only)
  emplacement?: string;
  latitude?: number;
  longitude?: number;
  dateLastTrame?: number;
  vitesse?: number;
  gpsLastTrame?: number;
  gsmLastTrame?: number;
  stat?: boolean = true;
}

export interface BoitierRealTime {
  idBoitier: number;
  numBoitier: number;
  emplacement: string;
  latitude: number;
  longitude: number;
  dateLastTrame: number;
  vitesse: number;
  gpsLastTrame: number;
  gsmLastTrame: number;
}

export class CompteServer {
  idCompteClientServer: number = 0;
  pseudo: string = "";
  intervaleStart: number = 0;
  intervaleEnd: number = 0;
  ipAdresse: string = "";
  login: string = "";
  date_creation: number = 0;
  date_Expiration: number = 0;
  password: string = "";
  expired: boolean = false;
  during: boolean = false;
  str_expiration: string = "";
}

export class CompteServerWithBoitier {
  compteServer: CompteServer = new CompteServer();
  nbrBoitiers: number = 0;
}

export class CompteWeb {
  idCompteClientWeb: number = 0;
  login: string = "";
  password: string = "";
  rawPassword: string = "";
  date_creation: number = 0;
  date_expiration: number = 0;
  code_pays: string = "+212";
  options: Option[] = [];
  compteClientServer: CompteServer = new CompteServer();
  expired: boolean = false;
  during: boolean = false;
  ipAdresse: string = 'localhost';
  pool: number = 0;
  firstname: string = "";
  lastname: string = "";
  email: string = "";
  telephone: number = 0;
  area: string = "";
  administratorCompte!: AdministratorCompte;
  notificationSubquery: string = "";
  mobileNotif: boolean = false;
  deviceFeeByDay: number = 0;
  accountFeeByMonth: number = 0;
  deviceFeePerMonth: number = 0;
  simCardFeePerMonth: number = 0;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export class AdministratorCompte {
  idAdministratorCompte: number = 0;
  username: string = '';
  password: string = '';
  role: string = '';
  token: string = '';
  idTraccar: number = 0;
  useFcm: boolean = false;
  fcmApikey: string = '';
  fcmPrefix: string = '';
  mailSupport: string = '';
  deviceCostByDay: number = 0;
  accountFreePerMonth: number = 0;
  transctionFee: number = 0;
  numLastBoitierAvailable: number = 0;
}

export class ConfigurationVehicules {
  idConfig: number = 0;
  vehiculeGender: string = "";
  pathMinSpeed: number = 0;
  pathMin: number = 0;
  stopMin: number = 0;
  pauseMin: number = 0;
  distancemin: number = 0;
}


export class Intervention {
  /**intervention id */
  id: number = 0;
  /**intervention type :REQUEST|INPROGRESS|CARRYOUT|REJECTED*/
  type!: 'REQUEST' | 'INPROGRESS' | 'CARRYOUT' | 'REJECTED';

  idBoitiers: number = 0;

  content: string = "";
  /**request type */
  request: string = "";
  /**response */
  response: string = "";
  /**intervention was created at */
  createdAt!: Date;

  submitAt!: Date;
  /** we have three possibilities :moyen,faible,urgent */
  priority: number = 0;
}

export class UpdateIntervention extends Intervention {
  idTenant: number = 0;
}

export class Option {
  idOption: number = 0;
  description: string = "";
}

export class Path {
  path: string = "";
}

export class raw {
  gprmc: string = "";
  idTram: number = 0;
}

export class raws {
  raws: raw[] = [];
  count: number = 0;
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
  login?: string;
  action: string;
  timestamp: Date;
  date?: any;
  ipAddress: string;
  agent?: string;
}

export interface RecalculatePayloadDTO {
  start: Date;
  end: Date;
  devices: number[];
}

export class RecalculatePayload {
  idBoitier: number = 0;
  idBoitiers: number[] = [];
  recalculeStartDate: number | null = null;
}

export interface DeviceOptDTO {
  idBoitier: number;
  optionId: number;
  enabled: boolean;
}

export class DeviceOpt {
  idBoitiers: number[] = [];
  idBoitier: number = 0;
  useIgnition: boolean = false;
  useFuel: boolean = false;
  useTemp: boolean = false;
  useFms: boolean = false;
  useJ1708: boolean = false;
  useIdDriver: boolean = false;
  useStop: boolean = false;
}

export interface DeviceSettingDTO {
  idBoitier: number;
  settingName: string;
  settingValue: string;
}

export class DeviceSetting {
  idBoitiers: number[] = [];
  idIpAdresse: number = 0;
  streamId: number = 0;
}

export interface VehiculeSettingDTO {
  idBoitier: number;
  odometre: number;
}

export class VehiculeSetting {
  idBoitiers: number[] = [];
  accumOdo: number = 0;
  lastId: number = 0;
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
}

export class TraccarDto {
  id!: number;
  name!: string;
  imei!: string;
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
  deviceId!: number;
  matricule!: string;
  mark!: string;
  driver!: string;
  technician!: string;
  createdAt!: Date;
  verifiedAt!: Date;
  verified!: boolean;
}
