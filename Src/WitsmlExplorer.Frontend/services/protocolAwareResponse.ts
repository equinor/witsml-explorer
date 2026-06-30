import { WitsmlProtocol } from "services/authorizationService";

export type ProtocolAwareResponse<T> = {
  data: T;
  usedProtocol?: WitsmlProtocol;
};

export function getResponseHeader(
  response: Response,
  headerName: string
): string | undefined {
  return response.headers.get(headerName) ?? undefined;
}

export function getUsedProtocol(
  response: Response
): WitsmlProtocol | undefined {
  const usedProtocolHeader = getResponseHeader(response, "witsmlprotocol");
  return Object.values(WitsmlProtocol).includes(
    usedProtocolHeader as WitsmlProtocol
  )
    ? (usedProtocolHeader as WitsmlProtocol)
    : undefined;
}
