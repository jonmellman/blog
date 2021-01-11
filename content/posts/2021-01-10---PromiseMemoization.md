---
title: "Advanced Promise Patterns: Promise Memoization"
template: post
slug: /posts/promise-memoization
date: "2021-01-11T05:05:00.351Z"
draft: false
description: "Memoizing async methods to simplify caching and avoid common race conditions."
category: Tech
tags:
  - "Code"
---

In this post, we'll show how a common caching implementation exposes a race condition. We'll then show how to fix it, and (unlike most optimizations) we'll _simplify_ our implementation in the process.

We'll do this by introducing the Promise Memoization pattern, which builds on the [Singleton Promise](/posts/singleton-promises) pattern.

## Use Case: Caching Asynchronous Results

Consider the following simple API client:

<style>
div pre code.language-ts {
  font-size: 15px !important;
}
</style>

```ts
const getUserById = async (userId: string): Promise<User> => {
  const user = await request.get(`https://users-service/${userId}`);
  return user;
};
```
Very straightforward.

But, what should we do if performance is a concern? Perhaps `users-service` is slow to resolve user details, and maybe we're frequently calling this method with the same set of user IDs.

We'll probably want to add caching. How might we do this?

## Naive Solution

Here's the naive solution I frequently see:

```ts
const usersCache = new Map<string, User>();

const getUserById = async (userId: string): Promise<User> => {
  if (!usersCache.has(userId)) {
    const user = await request.get(`https://users-service/${userId}`);
    usersCache.set(userId, user);
  }

  return usersCache.get(userId);
};
```

It's pretty simple: after we resolve the user details from `users-service`, we populate an in-memory cache with the result.

## The Race Condition (Again)

What's wrong with this implementation? Well, it's subject to [the same race condition from my Singleton Promises post](/posts/singleton-promises#the-race-condition).

Specifically, it will make duplicate network calls in cases like the following:

```ts
await Promise.all([
  getUserById('user1'),
  getUserById('user1')
]);
```

The problem is that we don't assign the cache until _after_ the first call resolves. But wait, how can we populate a cache before we have the result?

## Singleton Promises to the Rescue

What if we cache the _promise for the result_, rather than the result itself? The code looks like this:

```ts
const userPromisesCache = new Map<string, Promise<User>>();

const getUserById = (userId: string): Promise<User> => {
  if (!userPromisesCache.has(userId)) {
    const userPromise = request.get(`https://users-service/v1/${userId}`);
    userPromisesCache.set(userId, userPromise);
  }

  return userPromisesCache.get(userId)!;
};
```

Very similar, but instead of `await`ing the network request, we place its promise into a cache and return it to the caller (who will `await` the result).

Note that we no longer declare our method `async`, since it no longer calls `await`. Our method signature hasn't changed though - we still return a promise, but we do so _synchronously_. (If this seems confusing, I encourage you to [run an experiment](/posts/singleton-promises#followup-experiment).)

This fixes the race condition. Regardless of timing, only one network request fires when we make multiple calls to `getUserById('user1')`. This is because all subsequent callers receive the same singleton promise as the first.

Problem solved! Now we're ready for the general insight.

## Promise Memoization

Seen from another angle, the final caching implementation is literally just [memoizing](https://en.wikipedia.org/wiki/Memoization) `getUserById`! When given an input we've already seen before, we return the same result (which happens to be a promise) without doing any work.

So, _memoizing_ our async method gave us caching without the race condition.

The upside of this insight is that there are many libraries that make memoization dead-simple, including [lodash](https://lodash.com/docs/4.17.15#memoize).

This means we can simplify our last solution to:

```ts
import _ from 'lodash';

const getUserById = _.memoize(async (userId: string): Promise<User> => {
  const user = await request.get(`https://users-service/${userId}`);
  return user;
});
```

We took our original cache-less implementation and dropped in the `_.memoize` wrapper! Very simple and uninvasive.

(For production use cases, you'll probably want something like [`memoizee`](https://www.npmjs.com/package/memoizee) that lets you control the caching strategy.)

## Conclusion

In this post, we learned that we can use memoization wrappers around our async methods.

While this approach is _simpler_ than manually populating a result cache, we also learned that it's _better_ because it avoids a common race condition.
