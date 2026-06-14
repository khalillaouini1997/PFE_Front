import { OptionInfoDTO } from './option.model';
import { IpAddress } from './device.model';

export interface CompteServer {
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
  installedBoitiersCount: number;
  totalBoitiersCount: number;
  availableSlotsCount: number;
}

export function createCompteServer(): CompteServer {
  return {
    idCompteClientServer: 0,
    pseudo: '',
    intervaleStart: 0,
    intervaleEnd: 0,
    ipAdresse: '',
    login: '',
    date_creation: 0,
    date_Expiration: 0,
    password: '',
    expired: false,
    during: false,
    str_expiration: '',
    installedBoitiersCount: 0,
    totalBoitiersCount: 0,
    availableSlotsCount: 0
  };
}

export interface CompteServerWithBoitier {
  compteServer: CompteServer;
  nbrBoitiers: number;
}

export interface CompteWeb {
  idCompteClientWeb: number;
  login: string;
  password: string;
  rawPassword: string;
  date_creation: number;
  date_expiration: number;
  code_pays: string;
  options: OptionInfoDTO[];
  compteClientServer: CompteServer;
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
}

export function createCompteWeb(): CompteWeb {
  return {
    idCompteClientWeb: 0,
    login: '',
    password: '',
    rawPassword: '',
    date_creation: 0,
    date_expiration: 0,
    code_pays: '+212',
    options: [],
    compteClientServer: createCompteServer(),
    expired: false,
    during: false,
    ipAdresse: 'localhost',
    pool: 0,
    firstname: '',
    lastname: '',
    email: '',
    telephone: 0,
    area: '',
    administratorCompte: createAdministratorCompte(),
    notificationSubquery: '',
    mobileNotif: false,
    deviceFeeByDay: 0,
    accountFeeByMonth: 0,
    deviceFeePerMonth: 0,
    simCardFeePerMonth: 0
  };
}

export interface AdministratorCompte {
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
}

export function createAdministratorCompte(): AdministratorCompte {
  return {
    idAdministratorCompte: 0,
    username: '',
    password: '',
    role: '',
    token: '',
    idTraccar: 0,
    useFcm: false,
    fcmApikey: '',
    fcmPrefix: '',
    mailSupport: '',
    deviceCostByDay: 0,
    accountFreePerMonth: 0,
    transctionFee: 0,
    numLastBoitierAvailable: 0
  };
}

export interface CompteClientWebInfoDTO {
  idCompteClientWeb: number;
  login: string;
  password: string;
  rawPassword: string;
  date_creation: Date;
  date_expiration: Date;
  code_pays: string;
  pool: number;
  firstname: string;
  lastname: string;
  telephone: number;
  email: string;
  area: string;
  notificationSubquery: string;
  mobileNotif: boolean;
  deviceFeeByDay: number;
  accountFeeByMonth: number;
  deviceFeePerMonth: number;
  simCardFeePerMonth: number;
  options: OptionInfoDTO[];
  compteClientServer: CompteServer;
}
