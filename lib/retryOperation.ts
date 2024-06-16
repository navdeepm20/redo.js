export interface IRetryOperation {
  retryCount: number | "infinite";
  retryDelay: number;
  retryCallback: (payload?: any) => any;
  onErrorCallback: (error?: Error) => void;
  onSuccessCallback: (response?: any) => void;
  afterLastAttemptErrorCallback?: (error?: any) => void;
}

const wait = (delay: number) =>
  new Promise((resolve) => setTimeout(resolve, delay));

async function retryOperation({
  retryCount,
  retryDelay,
  retryCallback,
  onErrorCallback,
  onSuccessCallback,
  afterLastAttemptErrorCallback,
}: IRetryOperation) {
  let noOfRetries = 0;
  let lastError: any = null;

  const shouldRetry = () =>
    retryCount === "infinite" || noOfRetries < retryCount;

  while (shouldRetry()) {
    noOfRetries++;
    try {
      if (retryDelay > 0) {
        await wait(retryDelay);
      }
      const response = retryCallback();
      onSuccessCallback(response);
      return;
    } catch (error) {
      lastError = error;
      onErrorCallback(error);
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
}: TRetryAsyncOperation) {
  let noOfRetries = 0;
  let lastError: any = null;

  const shouldRetry = () =>
    retryCount === "infinite" || noOfRetries < retryCount;

  while (shouldRetry()) {
    noOfRetries++;
    try {
      const response = await retryAsyncCallback();
      onSuccessCallback(response);
      return;
    } catch (error) {
      lastError = error;
      onErrorCallback(error);
    }
  }

  if (noOfRetries === retryCount && afterLastAttemptErrorCallback) {
    afterLastAttemptErrorCallback(lastError);
  }
}

export { retryOperation, retryAsyncOperation };
