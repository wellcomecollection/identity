export interface Location {
  code: string;
  name: string;
}

export interface HoldStatus {
  code: string;
  name: string;
}

export interface Hold {
  id: string;
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
