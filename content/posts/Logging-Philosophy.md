---
title: 'NodeJS Logging for Production Applications'
template: post
slug: /posts/javascript-logging-for-production
date: "2019-11-04T06:52:26.516Z"
draft: true
description: 'Logging is critical and hard to get right. Here are gotchas I commonly see.'
category: Tech
tags:
  - "Code"
---

Logging is critical for insight into any production application. In NodeJS applications, I frequently see poor and inconsistent logging practices.

Logs should be machine-readable, meaningful, and correlatable.

### 1. Machine-readable

Understand how logs will get consumed in your system. If you have a log aggregator, familiarize yourself with it. If you don't, you may not need this post :)

I'm used to logs being parsed as JSON and used to populate ops dashboards and alerting tools.


❌ Bad:

```ts
logger.info('Successfully retrieved dataset records')
```

❌ Bad:

```ts
logger.info('Successfully retrieved dataset records', userId, datasetId)
```

❌ Bad:

```ts
logger.info({
  topic: 'dataset-client',
  subtopic: 'get-records',
  message: `Successfully retrieved ${records.length} dataset records from ${datasetId} for ${userId}`
})
```

✅ Good:

```ts
logger.info({
  topic: 'dataset-client',
  subtopic: 'get-records',
  message: 'Successfully retrieved dataset records',
  userId,
  datasetId,
  numRecords: records.length
})
```

### 2. Meaningful

* Logs should use appropriate levels:
  * `debug` for developer debugging. This should rarely be used in production.
  * `info` for meaningful business events.
  * `warn` for handled errors.
  * `error` for unhandled errors and assertion failures. Error logs should always include the error's stack trace.

❌ Bad:

```ts
logger.info({
  topic: 'dataset-client',
  subtopic: 'get-records',
  message: 'Fatal error retrieving dataset records!'
})
```

❌ Bad:

```ts
logger.error({
  topic: 'dataset-client',
  subtopic: 'get-records',
  message: `Recoverable or expected error retrieving dataset records`
})
```

✅ Good:

```ts
logger.warn({
  topic: 'dataset-client',
  subtopic: 'get-records',
  message: 'Recoverable or expected error retrieving dataset records',
  userId,
  datasetId
})
```

✅ Good:

```ts
logger.error({
  topic: 'dataset-client',
  subtopic: 'get-records',
  message: 'Fatal error retrieving dataset records!',
  userId,
  datasetId,
  error
})
```

### 3. Correlatable

This simply means that log entries contain relevant details so we can correlate them with other relevant logs. Generally, this means `userId`, `brandId`, `transactionId`, and `requestId`.




Don't log strings.
Do log JSON
	Why? We want our logs to be machine-readable. This may depend on your log aggregator (I'm used to SumoLogic), but my experience is to log JSON objects instead of simple strings.

Don't use console.log in production
Do
	Even if you're in early iterations and don't yet have your logging or monitoring infrastructure, don't use console.log. If you don't have time to create the logging infrastructure, create a stubbed logger and use this across your application.

Don't stringify error objects
Do log error stack traces

Don't log file or method names
Do log unique log identifiers
	Why? File and method names change as we refactor our application, and we don't want to break our monitoring dashboards that are tied to specific log messages.
