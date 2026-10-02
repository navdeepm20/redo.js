import * as assert from "assert/strict";
import { test } from "node:test";
import { retryOperation } from "../src/lib/retryOperation";

const fastRetry = {
  retryDelay: 0,
  enableLogging: false,
};

test("succeeds on first attempt and invokes onSuccessCallback", async () => {
  let successValue: string | undefined;

  await retryOperation({
    ...fastRetry,
    retryCallback: () => "ok",
    onSuccessCallback: (response) => {
      successValue = response as string;
    },
  });

  assert.equal(successValue, "ok");
});

test("retries until callback succeeds", async () => {
  let attempts = 0;
  let errorCallbacks = 0;

  await retryOperation({
    ...fastRetry,
    retryCount: 5,
    retryCallback: () => {
      attempts++;
      if (attempts < 3) {
        throw new Error("not yet");
      }
      return "done";
    },
    onErrorCallback: () => {
      errorCallbacks++;
    },
    onSuccessCallback: (response) => {
      assert.equal(response, "done");
    },
  });

  assert.equal(attempts, 3);
  assert.equal(errorCallbacks, 2);
});

test("invokes afterLastAttemptErrorCallback when retries are exhausted", async () => {
  let attempts = 0;
  let finalError: Error | undefined;

  await retryOperation({
    ...fastRetry,
    retryCount: 2,
    retryCallback: () => {
      attempts++;
      throw new Error(`fail-${attempts}`);
    },
    afterLastAttemptErrorCallback: (error) => {
      finalError = error as Error;
    },
  });

  assert.equal(attempts, 3);
  assert.equal(finalError?.message, "fail-3");
});

test("supports async retryCallback", async () => {
  let resolved = false;

  await retryOperation({
    ...fastRetry,
    retryCallback: async () => {
      await Promise.resolve();
      resolved = true;
      return 42;
    },
    onSuccessCallback: (response) => {
      assert.equal(response, 42);
    },
  });

  assert.equal(resolved, true);
});

test("respects retryCondition", async () => {
  let attempts = 0;

  await retryOperation({
    ...fastRetry,
    retryCount: 10,
    retryCallback: () => {
      attempts++;
      throw new Error("always fails");
    },
    retryCondition: (_count, lastError) =>
      (lastError as Error)?.message !== "always fails" || attempts < 2,
    afterLastAttemptErrorCallback: () => {},
  });

  assert.equal(attempts, 2);
});
