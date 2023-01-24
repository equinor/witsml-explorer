export interface Server {
  id: string | undefined;
  name: string;
  description: string;
  url: string;
  securityscheme: string;
  roles: string[];
  currentUsername?: string;
  usernames?: string[];
}

export function emptyServer(): Server {
  return {
    id: undefined,
    name: "",
    description: "",
    url: "",
    securityscheme: "Basic",
    roles: [],
    currentUsername: undefined,
    usernames: []
  };
}
