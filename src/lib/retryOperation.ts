interface RetryOperation {
  retryCount: number | "infinite";
  retryDelay: number;
  retryCallback: (payload?: any) => any;
  onErrorCallback: (error?: Error, currentRetryCount?: number) => void;
  onSuccessCallback: (response?: any) => void;
  afterLastAttemptErrorCallback?: (error?: any) => void;
  incrementalDelayFactor?: number; // Optional factor to increase the delay
}

interface RetryAsyncOperationExtended extends RetryOperation {
  retryAsyncCallback: () => Promise<void>;
}

type RetryAsyncOperation = Omit<RetryAsyncOperationExtended, "retryCallback">;

// Utility function to introduce a delay
const sleep = (delay: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, delay));
};

// Synchronous retry operation with error handling and exponential delay
async function retryOperation({
  retryCallback,
  onErrorCallback,
  onSuccessCallback,
  afterLastAttemptErrorCallback,
  retryCount = 3, // Default retry count is 3
  retryDelay = 1000, // Default is 1 second
  incrementalDelayFactor = 1.5, // Default factor is 1.5
}: RetryOperation): Promise<void> {
  let currentRetryCount = 0;
  let lastError: any = null;
  let currentDelay = retryDelay;

  // Loop until retries are exhausted or successful
  while (retryCount === "infinite" || currentRetryCount <= retryCount) {
    try {
      if (currentDelay > 0 && currentRetryCount > 0) {
        await sleep(currentDelay); // Wait for the delay if it's not the first attempt
      }

      const response = retryCallback();
      onSuccessCallback(response); // Call success callback on success
      return;
    } catch (error) {
      lastError = error;
      onErrorCallback(error as Error, currentRetryCount); // Handle error with retry count
      currentDelay *= incrementalDelayFactor; // Increase the delay for the next retry
      currentRetryCount++;
    }
  }

  // Call the final error callback if retries are exhausted
  if (afterLastAttemptErrorCallback) {
    afterLastAttemptErrorCallback(lastError);
  }
}

// Asynchronous retry operation with error handling and exponential delay
async function retryAsyncOperation({
  retryAsyncCallback,
  onErrorCallback,
  onSuccessCallback,
  afterLastAttemptErrorCallback,
  retryCount = 3, // Default retry count is 3
  retryDelay = 1000, // Default is 1 second
  incrementalDelayFactor = 1.5, // Default factor is 1.5
}: RetryAsyncOperation): Promise<void> {
  let currentRetryCount = 0;
  let lastError: any = null;
  let currentDelay = retryDelay;

  // Loop until retries are exhausted or successful
  while (retryCount === "infinite" || currentRetryCount <= retryCount) {
    try {
      if (currentDelay > 0 && currentRetryCount > 0) {
        await sleep(currentDelay); // Wait for the delay if it's not the first attempt
      }

      const response = await retryAsyncCallback();
      onSuccessCallback(response); // Call success callback on success
      return;
    } catch (error) {
      lastError = error;
      onErrorCallback(error as Error, currentRetryCount); // Handle error with retry count
      currentDelay *= incrementalDelayFactor; // Increase the delay for the next retry
      currentRetryCount++;
    }
  }

  // Call the final error callback if retries are exhausted
  if (afterLastAttemptErrorCallback) {
    afterLastAttemptErrorCallback(lastError);
  }
}

export {
  retryOperation,
  retryAsyncOperation,
  RetryOperation,
  RetryAsyncOperation,
};
