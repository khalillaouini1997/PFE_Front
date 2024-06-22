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
  emplacement: string;
  dateLastTrame: number;
  vitesse: number;
  etatBoitier: string;
  gpsLastTrame: number;
  gsmLastTrame: number;
  stat: boolean = true;
  streamId: number;
  ipAdresse: IpAdresse;
  constructor() {
    this.idBoitier = 0;
    this.label = '';
    this.numBoitier = 0;
    this.etatBoitier = '';
    this.ipAdresse = new IpAdresse();
  }
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

export class IpAddress {
  idIpAdresse: number | null; // Allow null or number
  label: string;
  value: string;
  typeConnection: String | null; // Allow null or String
  jdbcUser: String | null;  // Allow null or String
  jdbcPass: String | null; // Allow null or String
  url: String | null;  // Allow null or String
  dbName: String | null;  // Allow null or String
  constructor() {
    this.idIpAdresse = null;
    this.label = "";
    this.value = "";
    this.typeConnection = null;
    this.jdbcUser = null;
    this.jdbcPass = null;
    this.url = null;
    this.dbName = null;
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
  numLastBoitierAvailable:number;
  constructor() {
    this.idAdministratorCompte = 0;
    this.username = '';
    this.role = '';
  }
}

export class AccessLog {
  login: string;
  date: Date;
  userId: number;
  ipAddress: string;
  agent: string;
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
  constructor(){

    this.idBoitiers=[];
    this.idBoitier = 0;
    this.useFms=false;
    this.useFuel=false;
    this.useIdDriver=false;
    this.useIgnition=false;
    this.useJ1708=false;
    this.useStop=false;
    this.useTemp=false;
  }

}

export class DeviceSetting {
  idBoitiers: number[];
  idIpAdresse : number;
  streamId: number;

  constructor() {
    this.idBoitiers = [];
  }
}

export class IpAdresse {
  idIpAdresse: number;
  label: string;
  value: string;
  urlGetId: string;
  constructor() {}
}

export class VehiculeSetting {
  idBoitiers: number[];
  accumOdo : number;

  constructor() {
    this.idBoitiers = [];
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

export class PathConfigPayload {
  boitiersId: number[];
  pathMinSpeed: number
  pathMinSec: number
  stopMinSec: number
  pauseMinSec: number
  distanceMinMeter: number

  constructor() { }

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

export class RecalculatePayload {

  idBoitier: number;
  idBoitiers: number[];
  recalculeStartDate: number | null ;

  constructor() {
    this.idBoitier = 0
    this.idBoitiers = [];
    this.recalculeStartDate = null;

  }
}

export class TraccarDto {
  id: number;
  name: string;
  imei: string;
}

export interface Tram {
  login: String;
  deviceid: number;
  status: String;
  latitude: number;
  longitude: number;
  fuel: Number;
  ignition: boolean;
  mems_x: number;
  mems_y: number;
  mems_z: number;
  power: number;
  record_time: Date;
  sat_in_view: number;
  send_flag: number;
  speed: number;
  temperature: String;
  type: String;
  validity: boolean;
  signal: number;
  rotation_angle: number;
  rpm: number;
  fuel_rate: number;
  tfu: number;
  temp_engine: number;
  accum_odo: number;
  last_raw_time: Date;
  matricule: String;
  ignitionStatistique: number;
  speedStatistique: number;
  invalidityStatistique: number;

  numPuce: String;
  imei: String;
  version: String;
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
  constructor(){}
}
