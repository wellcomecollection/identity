export interface Location {
  code: string;
  name: string;
}

export interface Hold {
  code: string;
  name: string;
}

export interface Hold {
  id: string;
  patron: string;
  frozen?: boolean;
  placed: string;
  pickupByDate: string;
  location?: Location;
  status?: HoldStatus;
}

export interface HoldResultSet {
  total?: number;
  start?: number;
  entries: Hold[];
}
