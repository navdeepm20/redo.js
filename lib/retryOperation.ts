export interface IRetryOperation {
  retryCount: number | "infinite";
  retryDelay: number;
  retryCallback: (payload?: any) => any;
  onErrorCallback: (error?: Error) => void;
  onSuccessCallback: (response?: any) => void;
  afterLastAttemptErrorCallback?: (error?: any) => void;
  incrementalDelayFactor?: number; // Optional factor to increase the delay
}

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
}: IRetryOperation) {
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
      onErrorCallback(error);
      currentDelay *= incrementalDelayFactor; // Increase the delay
    }
  }

  if (noOfRetries === retryCount && afterLastAttemptErrorCallback) {
    afterLastAttemptErrorCallback(lastError);
  }
}
interface TRetryAsyncOperationF extends IRetryOperation {
  retryAsyncCallback: () => Promise<void>;
}

type TRetryAsyncOperation = Omit<TRetryAsyncOperationF, "retryCallback">;

async function retryAsyncOperation({
  retryCount,
  retryDelay,
  retryAsyncCallback,
  onErrorCallback,
  onSuccessCallback,
  afterLastAttemptErrorCallback,
  incrementalDelayFactor = 1, // Default factor is 1 (no increment)
}: TRetryAsyncOperation) {
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
      onErrorCallback(error);
      currentDelay *= incrementalDelayFactor; // Increase the delay
    }
  }

  if (noOfRetries === retryCount && afterLastAttemptErrorCallback) {
    afterLastAttemptErrorCallback(lastError);
  }
}

export { retryOperation, retryAsyncOperation };
