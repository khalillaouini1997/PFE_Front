export class Credentials {
  username = '';
  password = '';
  ancienPassword: string = '';
}

export class Authority {
  id: string = '';
  name: string = '';
  label: string = '';
}

export class AccessLog {
  userId: number = 0;
  login: string = '';
  ipAddress: string = '';
  date: Date = new Date();
}