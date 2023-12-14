export interface Server {
  id: string | undefined;
  name: string;
  description: string;
  url: string;
  roles: string[];
  credentialId?: string;
  currentUsername?: string;
  usernames?: string[];
  depthLogDecimals: number;
}

export function emptyServer(): Server {
  return {
    id: undefined,
    name: "",
    description: "",
    url: "",
    roles: [],
    credentialId: undefined,
    currentUsername: undefined,
    usernames: [],
    depthLogDecimals: 0
  };
}
