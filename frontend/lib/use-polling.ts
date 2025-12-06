"use client";

import * as React from "react";

export type UsePollingOptions<T> = {
  fetchFn: () => Promise<T>;
  interval?: number;
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
};

export function usePolling<T>({
  fetchFn,
  interval = 3000,
  enabled = true,
  onSuccess,
  onError,
}: UsePollingOptions<T>) {
  const [data, setData] = React.useState<T | null>(null);
  const [error, setError] = React.useState<Error | null>(null);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = React.useRef(true);

  const fetchFnRef = React.useRef(fetchFn);
  const onSuccessRef = React.useRef(onSuccess);
  const onErrorRef = React.useRef(onError);

  React.useEffect(() => {
    fetchFnRef.current = fetchFn;
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  });

  const poll = React.useCallback(async () => {
    try {
      const result = await fetchFnRef.current();
      if (isMountedRef.current) {
        setData(result);
        setError(null);
        onSuccessRef.current?.(result);
      }
    } catch (err) {
      if (isMountedRef.current) {
        const normalizedError =
          err instanceof Error ? err : new Error("Unknown error");
        setError(normalizedError);
        onErrorRef.current?.(normalizedError);
      }
    }
  }, []);

  React.useEffect(() => {
    isMountedRef.current = true;

    if (enabled) {
      poll();
      intervalRef.current = setInterval(poll, interval);
    }

    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, interval, poll]);

  return { data, error };
}
