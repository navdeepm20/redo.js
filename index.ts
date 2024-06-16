import { IRetryOperation } from "./lib/retryOperation";
const {
  retryOperation,
  retryAsyncOperation,
}: {
  retryOperation: IRetryOperation;
  retryAsyncOperation: IRetryOperation;
} = require("./lib/retryOperation");
module.exports = { retryOperation, retryAsyncOperation };
