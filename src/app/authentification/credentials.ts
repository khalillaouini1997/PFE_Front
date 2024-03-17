export class Credentials {
    username: string;
    password: string;
    ancienPassword: string;
  
    constructor() {
      this.username = '';
      this.password = '';
    }
  }

  
  export class Authority {
    id: string;
    name: string;
    label: string;
  
    constructor() { }
  }
  
  export class AccessLog{
    userId: number;
    login: string;
    ipAddress: string;
    date: Date;
    constructor() { }
  }
  