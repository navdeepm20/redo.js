# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2026-10-02

### Breaking

- Removed `retryAsyncOperation` and `retryAsyncCallback`. Use `retryOperation` with an async `retryCallback` instead (#4).
- `retryCallback` is now required.

### Added

- Async support for `onErrorCallback`, `onSuccessCallback`, and `afterLastAttemptErrorCallback` (#1).
- Optional `logCallback` and `enableLogging`.
- Optional `retryCondition` to control retry continuation.
- Generic `TResponse` typing on `retryOperation` / `RetryOperation`.
- `MAX_DELAY` (30s) cap for exponential backoff.
- Unit tests for `retryOperation` and `npm test` script.
- `@types/node` for Node types in tests.

### Changed

- `retryCount` and `retryDelay` are optional (defaults: `3`, `1000`) (#2).
- One `retryOperation` supports both sync and async callbacks (#3, #4).
- `onSuccessCallback` response type is `TResponse | Awaited<TResponse>`.
- Callback errors are caught and logged so they don’t break the retry loop.
- TypeScript `module` / `moduleResolution` set to `Node16`.
- Split configs: `tsconfig.build.json` (emit) and `tsconfig.test.json` (tests).

### Fixed

- Improper typing of the async retry callback (#3).
- Type error where optional `retryCallback` could pass `undefined` into `onSuccessCallback`.
- Deprecated `moduleResolution: "node"` (`node10`) warning for TypeScript 6+.
