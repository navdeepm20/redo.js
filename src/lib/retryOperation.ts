interface RetryOperation<TResponse> {
  retryCount?: number | "infinite";
  retryDelay?: number;
  retryCallback?: (payload?: any) => TResponse | Promise<TResponse>;
  onErrorCallback?: (
    error?: Error,
    currentRetryCount?: number
  ) => void | Promise<void>;
  onSuccessCallback?: (response: TResponse) => void | Promise<void>;
  afterLastAttemptErrorCallback?: (error?: any) => void | Promise<void>;
  incrementalDelayFactor?: number; // Optional factor to increase the delay
  logCallback?: (message: string) => void; // Optional logging mechanism
  enableLogging?: boolean; // Enable or disable logging
  retryCondition?: RetryCondition; // Custom condition to decide retry continuation
}

type RetryCondition = (currentRetryCount: number, lastError: any) => boolean;

const MAX_DELAY = 30000; // Maximum delay in milliseconds

// Utility function to introduce a delay
const sleep = (delay: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, delay));
};

/**
 * Retries a callback function with error handling and exponential delay.
 * Supports both synchronous and asynchronous functions.
 *
 * @param retryCallback - The function to retry (sync/async).
 * @param onErrorCallback - Called on each retry failure.
 * @param onSuccessCallback - Called on successful retry.
 * @param retryCount - Maximum retry attempts or "infinite".
 * @param retryDelay - Initial retry delay in milliseconds.
 * @param incrementalDelayFactor - Multiplier for delay after each retry.
 * @param afterLastAttemptErrorCallback - Called after the last failed attempt.
 * @param logCallback - Optional logging mechanism for debugging.
 * @param enableLogging - Enables/disables logging (default: true).
 * @param retryCondition - Custom condition to decide if retry should continue.
 */
async function retryOperation<TResponse>({
  retryCallback,
  onErrorCallback,
  onSuccessCallback,
  afterLastAttemptErrorCallback,
  retryCount = 3, // Default retry count is 3
  retryDelay = 1000, // Default is 1 second
  incrementalDelayFactor = 1.5, // Default factor is 1.5
  logCallback,
  enableLogging = true, // Default to true
  retryCondition,
}: RetryOperation<TResponse>): Promise<void> {
  let currentRetryCount = 0;
  let lastError: any = null;
  let currentDelay = retryDelay;

  // Helper function to log messages if logging is enabled
  const log = (message: string) => {
    if (enableLogging && logCallback) {
      logCallback(message);
    }
  };

  // Loop until retries are exhausted or successful
  while (
    (retryCount === "infinite" || currentRetryCount <= retryCount) &&
    (!retryCondition || retryCondition(currentRetryCount, lastError))
  ) {
    try {
      if (currentDelay > 0 && currentRetryCount > 0) {
        log(`Attempt ${currentRetryCount}: Waiting for ${currentDelay} ms`);
        await sleep(currentDelay); // Wait for the delay if it's not the first attempt
      }

      log(`Attempt ${currentRetryCount}: Executing callback`);
      const response = await retryCallback();

      log(`Attempt ${currentRetryCount}: Success`);
      if (onSuccessCallback) {
        try {
          const successResponse = onSuccessCallback(response);
          if (successResponse instanceof Promise) await successResponse;
        } catch (successCallbackError) {
          log(`Error in onSuccessCallback: ${successCallbackError}`);
        }
      }
      return;
    } catch (error) {
      lastError = error;
      log(`Attempt ${currentRetryCount}: Failed with error: ${error}`);
      if (onErrorCallback) {
        try {
          const errorResponse = onErrorCallback(
            error as Error,
            currentRetryCount
          );
          if (errorResponse instanceof Promise) await errorResponse;
        } catch (callbackError) {
          log(`Error in onErrorCallback: ${callbackError}`);
        }
      }
      currentDelay = Math.min(currentDelay * incrementalDelayFactor, MAX_DELAY); // Increase delay
      currentRetryCount++;
    }
  }

  // Call the final error callback if retries are exhausted
  if (afterLastAttemptErrorCallback) {
    try {
      log(`Retries exhausted. Invoking afterLastAttemptErrorCallback`);
      const finalErrorResponse = afterLastAttemptErrorCallback(lastError);
      if (finalErrorResponse instanceof Promise) await finalErrorResponse;
    } catch (finalCallbackError) {
      log(`Error in afterLastAttemptErrorCallback: ${finalCallbackError}`);
    }
  }
}

export { retryOperation, RetryOperation, RetryCondition };
