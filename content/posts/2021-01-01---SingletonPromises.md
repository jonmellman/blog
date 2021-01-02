---
title: "Advanced Async Patterns: Singleton Promises"
template: post
slug: /posts/singleton-promises
date: "2021-01-02T00:52:49.916Z"
draft: false
description: "Demonstrating a common concurrency race condition and fixing it using a Singleton Promise."
category: Tech
tags:
  - "Code"
---

# Singleton Promises

In this post, we'll look at how we can improve concurrent JavaScript code using what I'm calling the Singleton Promise pattern.

We'll look at a common lazy initialization use case. We'll then show how the intuitive solution contains a race condition bug. Finally, we'll use a singleton promise to fix the race condition and properly solve the problem.

(Note that code examples will be in TypeScript, which I think is better for education.)

## Use Case: One-Time Lazy Initialization

"One-time lazy initialization" is a mouthful, but it's actually quite common. For example, it commonly applies to database clients (think `Sequelize`, `Mongoose`, `TypeORM`, etc.), or custom wrappers around these clients.

In plain English: lazy one-time initialization means that the database client initializes itself as-needed before performing any queries, and it only does this once.

### "Initialization"
_Initialization_ in this case means authenticating with the database server, grabbing a connecton from a connection pool, or whatever operations must complete before queries can execute.

### "Lazy"
Note that it's ergonomic to support _lazy_ initialization. This means that the client will connect itself before executing the first query. Callers don't need to explicitly connect the database client, because the client encapsulates its connection status.

### "One-time"
Finally, this means that initialization only happens once. This is important because excessive initialization can add latency or exhaust the connection pool, for example.

## Naive Solution

Now that we understand the requirements, let's implement a simple database client. We'll expose a single `getRecord()` method that, internally, calls a private `.connect()` method which performs the initialization:

```ts
class DbClient {
  private isConnected: boolean;

  constructor() {
    this.isConnected = false;
  }

  private async connect() {
    if (this.isConnected) {
      return;
    }

    await connectToDatabase(); // stub
    this.isConnected = true;
  }

  public async getRecord(recordId: string) {
    await this.connect();
    return getRecordFromDatabase(recordId); // stub
  }
}
```

(The actual implementations of `connectToDatabase()` and `getRecordFromDatabase()` are not important here.)

At first glance, this looks fine. If the client isn't already connected, it will connect itself. This means consumers can simply execute queries without caring about connection status:

```ts
const db = new DbClient()
const record = await db.getRecord('record1');
```

So, we've solved lazy one-time initialization, right?

Not so fast. Take another look at the `.getRecord()` method and see if you can spot the concurrency race condition.

## The Race Condition

Consider a caller that queries in batches:
```ts
const db = new DbClient();
const [record1, record2] = await Promise.all([
  db.getRecord('record1'),
  db.getRecord('record2'),
]);
```

This will likely cause our database client to connect _twice_! We've violated our "one-time" requirement!

The problem is this: because our DB client's `.connect()` method is asynchronous, it's unlikely to have completed by the time the second `.getRecord()` call is executed. As a result, `this.isConnected` is still `false` when `.connect()` is called the second time.

This may not seem like a big deal. However, I once worked on a system where it was a _very big deal_. We had a queue producer with this exact bug, and it created a resource leak that would eventually bring down the server. Yikes!

## Singleton Promise to the Rescue

As explained above, the problem is subtle but important: we check whether initialization is complete but not whether it's in progress. How should we fix this?

We could introduce an additional `isConnectionInProgress` boolean, but now we're getting complex. Besides, how would we use it? What would we return to the second caller?

Instead, what we need is a reference to the promise for the first `.connect()` call. We can then guarantee this promise has resolved before executing any future queries:

```ts
class DbClient {
  private connectionPromise: Promise<void> | null;

  constructor() {
    this.connectionPromise = null;
  }

  private async connect() {
    if (!this.connectionPromise) {
      this.connectionPromise = connectToDatabase(); // stub
    }

    return this.connectionPromise;
  }

  public async getRecord(recordId: string) {
    await this.connect();
    return getRecordFromDatabase(recordId); // stub
  }
}
```

Because we assign `this.connectionPromise` synchronously, repeated calls to `.getRecord()` are guaranteed to always reuse the same promise. This means that the second `.getRecord()` call will wait until the first call's `.connect()` has resolved before proceeding.

We've fixed the bug!

We can call `this.connectionPromise` a _singleton promise_, because there's never more than one instance of it. By restricting it in this way, we prevent concurrent initialization.

## Conclusion

We've demonstrated a common race condition and how it can be fixed using the Singleton Promise pattern.

What do you think? Are there other patterns you prefer? I'd love to hear from you.

In a future post, I'll build off of the Singleton Promise to introduce the Promize Memoization pattern. Stay tuned!

____
## Followup Experiment

If you're new to promises, our final `DbClient` implementation may not be intuitive to you. How are we able to use `connectionPromise` without awaiting it, and how can we call `await this.connectionPromise` after it's already resolved?

This works because resolved promises can still be awaited on. (This is actually how `await Promise.resolve()` works, since `Promise.resolve()` returns a resolved promise.)

I think the best way to wrap your head around promise behavior is to run your own experiments. Consider the following experiment, which you can run in your browser's JS console:

```js
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const myPromise = sleep(5000); // Note we don't `await` yet.

console.time('first await');
await myPromise;
console.timeEnd('first await');

console.time('second await');
await myPromise;
console.timeEnd('second await');
```
For me, it outputs:
```
first await: 5002ms - timer ended
second await: 0ms - timer ended
```

This experiment demonstrates that:
1. We can await the same promise multiple times.
2. We can await a promise that's already resolved, and doing so will resolve immediately.
