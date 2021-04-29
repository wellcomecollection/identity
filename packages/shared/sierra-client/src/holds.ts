export interface HoldResultSet {
  entries: Hold[];
}

export interface Hold {
  id: string;
  patron: string;
  record: string?;
  location: HoldLocation?;
  status: HoldStatus?;
}

export interface HoldLocation {
  code: string;
  name: string?;
}

export interface HoldStatus {
  code: string;
  name: string?;
}

export function toHoldResultSet(holdResultSet: any): HoldResultSet {
  return {
    recordNumber: patronRecord.id,
    barcode: getVarFieldContent(patronRecord.varFields, 'b'),
    email: getVarFieldContent(patronRecord.varFields, 'z')
  });
}