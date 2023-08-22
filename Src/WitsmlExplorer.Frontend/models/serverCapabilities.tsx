export interface ServerCapabilities {
  apiVers: string;
  contact: ContactInformation;
  description: string;
  name: string;
  vendor: string;
  version: string;
  schemaVersion: string;
  maxRequestLatestValues: number;
  functions: ServerCapabilitiesFunction[];
}

export interface ServerCapabilitiesFunction {
  name: string;
  dataObjects: ServerCapabilitiesFunctionDataObject[];
}

export interface ServerCapabilitiesFunctionDataObject {
  name: string;
  maxDataNodes: number;
  maxDataPoints: number;
}

export interface ContactInformation {
  name: string;
  email: string;
  phone: string;
}
