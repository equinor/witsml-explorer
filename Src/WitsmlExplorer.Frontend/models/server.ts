export interface Server {
  id: string | undefined;
  name: string;
  description: string;
  url: string;
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
    roles: [],
    credentialIds: [],
    currentUsername: undefined,
    usernames: [],
    depthLogDecimals: 0,
    isPriority: false
  };
}
