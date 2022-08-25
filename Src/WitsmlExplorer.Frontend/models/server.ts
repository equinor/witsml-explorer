export interface Server {
  id: string | undefined;
  name: string;
  description: string;
  url: string;
  securityscheme: string;
  role: string;
}

export function emptyServer(): Server {
  return {
    id: undefined,
    name: "",
    description: "",
    url: "",
    securityscheme: "Basic",
    role: ""
  };
}
