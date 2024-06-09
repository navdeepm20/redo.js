interface IRetryOperation {
  retryCount: number | "infinite";
  retryCallback: () => void;
  onErrorCallback: (error: Error) => void;
  onSuccessCallback: (response: any) => void;
}
function retryOperation({
  retryCount,
  retryCallback,
  onErrorCallback,
  onSuccessCallback,
}: IRetryOperation) {
  let noOfRetries = 0;
  while (retryCount !== noOfRetries) {
    try {
      const response = retryCallback();
      onSuccessCallback(response);
    } catch (error: any) {
      onErrorCallback(error);
      noOfRetries++;
    }
  }
}

module.exports = retryOperation;
