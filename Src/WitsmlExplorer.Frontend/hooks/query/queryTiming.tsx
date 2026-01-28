export async function withQueryTiming<T>(
  queryFn: () => Promise<T>
): Promise<TimedResponse<T>> {
  const start = Date.now();
  const data = await queryFn();
  return {
    data,
    responseTime: Date.now() - start
  };
}

export type TimedResponse<T> = {
  data: T;
  responseTime: number;
};

export function wrapPlaceholderData<T>(
  placeholderData?: T
): TimedResponse<T> | undefined {
  return placeholderData !== undefined
    ? { data: placeholderData, responseTime: 0 }
    : undefined;
}
