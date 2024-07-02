interface RetryOperation {
  retryCount: number | "infinite";
  retryDelay: number;
  retryCallback: (payload?: any) => any;
  onErrorCallback: (error?: Error) => void;
  onSuccessCallback: (response?: any) => void;
  afterLastAttemptErrorCallback?: (error?: any) => void;
  incrementalDelayFactor?: number; // Optional factor to increase the delay
}

interface RetryAsyncOperationExtended extends RetryOperation {
  retryAsyncCallback: () => Promise<void>;
}

type RetryAsyncOperation = Omit<RetryAsyncOperationExtended, "retryCallback">;

const sleep = (delay: number) => {
  return new Promise((resolve) => setTimeout(resolve, delay));
};

async function retryOperation({
  retryCount,
  retryDelay,
  retryCallback,
  onErrorCallback,
  onSuccessCallback,
  afterLastAttemptErrorCallback,
  incrementalDelayFactor = 1, // Default factor is 1 (no increment)
}: RetryOperation) {
  let noOfRetries = 0;
  let lastError: any = null;
  let currentDelay = retryDelay;

  const shouldRetry = () =>
    retryCount === "infinite" || noOfRetries < retryCount;

  while (shouldRetry()) {
    noOfRetries++;
    try {
      if (currentDelay > 0 && noOfRetries > 1) {
        await sleep(currentDelay);
      }
      const response = retryCallback();
      onSuccessCallback(response);
      return;
    } catch (error) {
      lastError = error;
      onErrorCallback(error as Error);
      currentDelay *= incrementalDelayFactor; // Increase the delay
    }
  }

  if (noOfRetries === retryCount && afterLastAttemptErrorCallback) {
    afterLastAttemptErrorCallback(lastError);
  }
}

async function retryAsyncOperation({
  retryCount,
  retryDelay,
  retryAsyncCallback,
  onErrorCallback,
  onSuccessCallback,
  afterLastAttemptErrorCallback,
  incrementalDelayFactor = 1, // Default factor is 1 (no increment)
}: RetryAsyncOperation) {
  let noOfRetries = 0;
  let lastError: any = null;
  let currentDelay = retryDelay;

  const shouldRetry = () =>
    retryCount === "infinite" || noOfRetries < retryCount;

  while (shouldRetry()) {
    noOfRetries++;
    try {
      if (currentDelay > 0 && noOfRetries > 1) {
        await sleep(currentDelay);
      }
      const response = await retryAsyncCallback();
      onSuccessCallback(response);
      return;
    } catch (error) {
      lastError = error;
      onErrorCallback(error as Error);
      currentDelay *= incrementalDelayFactor; // Increase the delay
    }
  }

  if (noOfRetries === retryCount && afterLastAttemptErrorCallback) {
    afterLastAttemptErrorCallback(lastError);
  }
}

export {
  retryOperation,
  retryAsyncOperation,
  RetryOperation,
  RetryAsyncOperation,
};
