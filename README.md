# Redo.js

> A simple but powerful library for retrying operations — sync or async.

<img src="https://img.shields.io/badge/Version-1.3.0-brightgreen" alt="Version">

---

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Synchronous](#synchronous)
  - [Asynchronous](#asynchronous)
  - [Options](#options)
- [Migration from &lt; 1.3.0](#migration-from--130)
- [License](#license)

---

## Installation

```bash
npm install redo.js
```

```bash
yarn add redo.js
```

---

## Usage

One API: `retryOperation`. Pass a sync or async `retryCallback`.

### Synchronous

```javascript
import { retryOperation } from "redo.js";

await retryOperation({
  retryCallback: () => {
    // your operation
    return "ok";
  },
  onErrorCallback: (error, currentRetryCount) => {
    console.log(`Attempt ${currentRetryCount} failed:`, error.message);
  },
  onSuccessCallback: (response) => {
    console.log("Succeeded:", response);
  },
  afterLastAttemptErrorCallback: (error) => {
    console.error("All retries failed:", error.message);
  },
});
```

### Asynchronous

```javascript
import { retryOperation } from "redo.js";

await retryOperation({
  retryCount: 3,
  retryDelay: 1000,
  retryCallback: async () => {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },
  onErrorCallback: async (error, currentRetryCount) => {
    console.log(`Retry #${currentRetryCount} failed:`, error.message);
  },
  onSuccessCallback: (data) => {
    console.log("Succeeded with", data.length, "posts");
  },
  afterLastAttemptErrorCallback: (error) => {
    console.error("Final error:", error.message);
  },
});
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `retryCallback` | `(payload?) => T \| Promise<T>` | — | **Required.** Function to retry (sync or async). |
| `retryCount` | `number \| "infinite"` | `3` | Max retries after the first attempt. |
| `retryDelay` | `number` | `1000` | Initial delay between retries (ms). |
| `incrementalDelayFactor` | `number` | `1.5` | Backoff multiplier (capped at 30s). |
| `onErrorCallback` | `(error?, count?) => void \| Promise<void>` | — | Called after each failed attempt. |
| `onSuccessCallback` | `(response) => void \| Promise<void>` | — | Called when the operation succeeds. |
| `afterLastAttemptErrorCallback` | `(error?) => void \| Promise<void>` | — | Called when retries are exhausted. |
| `retryCondition` | `(count, lastError) => boolean` | — | Return `false` to stop retrying early. |
| `enableLogging` | `boolean` | `true` | Enable internal log messages. |
| `logCallback` | `(message: string) => void` | — | Receives log messages when logging is enabled. |

---

## Migration from &lt; 1.3.0

- `retryAsyncOperation` / `retryAsyncCallback` were removed. Use `retryOperation` with an async `retryCallback`.
- `retryCallback` is required.

See [CHANGELOG.md](./CHANGELOG.md) for the full list of changes.

---

## License

MIT — see the [LICENSE](./LICENSE) file.
