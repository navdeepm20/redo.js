# Redo.js

> A powerful and lightweight library to help you write robust and fault-tolerant code.

<img src="https://img.shields.io/badge/Version-1.0.1-brightgreen" alt="Version">

---

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Retry Synchronous Operations](#retry-synchronous-operations)
  - [Retry Asynchronous Operations](#retry-asynchronous-operations)
- [License](#license)

---

## Installation

Using npm:

```bash
npm install redo.js
```

Using yarn:

```bash
yarn add redo.js
```

---

## Usage

### Retry Synchronous Operations

```javascript
// Import the function
import { retryOperation } from "redo.js";

retryOperation({
  retryCount: 3, // Optional. Default: 3. Number of retry attempts
  retryDelay: 1000, // Optional. Default: 1000ms. Delay in ms between retries
  // incrementalDelayFactor: 2, // Optional. Default: 1.5 Exponential backoff factor
  retryCallback: () => {
    console.log("Retrying operation...");
    throw new Error("Operation failed");
  },
  onErrorCallback: () => {
    console.log("An error occurred.");
  },
  onSuccessCallback: () => {
    console.log("Operation succeeded!");
  },
  afterLastAttemptErrorCallback: (error) => {
    console.error("Final error:", error.message);
  },
});
```

### Retry Asynchronous Operations

```javascript
import axios from "axios";
import { retryAsyncOperation } from "redo.js";

const fetchData = async () => {
  return await axios({
    url: "https://jsonplaceholder.typicode.com/posts", // Example endpoint
    method: "GET",
  });
};

retryAsyncOperation({
  retryCount: 3, // Optional. Default: 3. Number of retry attempts
  retryDelay: 1000, // Optional. Default: 1000ms. Delay in ms between retries
  // incrementalDelayFactor: 2, // Optional. Default: 1.5 Exponential backoff factor
  retryAsyncCallback: async () => {
    return await fetchData();
  },
  onErrorCallback: (error, currentRetryCount) => {
    console.log(`Retry #${currentRetryCount} failed: ${error.message}`);
  },
  onSuccessCallback: (response) => {
    console.log("Operation succeeded with status:", response.status);
  },
  afterLastAttemptErrorCallback: (error) => {
    console.error("Final error:", error.message);
  },
});
```

---

## License

Refer to the LICENSE file in the repository.
