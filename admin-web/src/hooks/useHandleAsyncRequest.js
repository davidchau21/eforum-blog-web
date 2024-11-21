import { useCallback, useMemo, useState } from "react";

const useHandleAsyncRequest = (callbackFn) => {
  const [isLoading, setLoading] = useState(false);

  const handleAsyncRequest = useCallback(
    async (...agrs) => {
      setLoading(true);
      await callbackFn(...agrs);
      setLoading(false);
    },
    [callbackFn]
  );

  return useMemo(
    () => [isLoading, handleAsyncRequest],
    [isLoading, handleAsyncRequest]
  );
};

export default useHandleAsyncRequest;
