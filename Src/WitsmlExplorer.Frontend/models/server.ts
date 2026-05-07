export interface Server {
  id: string | undefined;
  name: string;
  description: string;
  url: string;
  etpUrl?: string;
  roles: string[];
  credentialIds: string[];
  currentUsername?: string;
  usernames?: string[];
  depthLogDecimals: number;
  isPriority: boolean;
}

export function emptyServer(): Server {
  return {
    id: undefined,
    name: "",
    description: "",
    url: "",
    etpUrl: undefined,
    roles: [],
    credentialIds: [],
    currentUsername: undefined,
    usernames: [],
    depthLogDecimals: 0,
    isPriority: false
  };
}
