---
title: "Advanced Promise Patterns: Promise Memoization"
template: post
slug: /posts/singleton-promises
date: "2020-12-12T23:57:42.191Z"
draft: true
description: ""
category: Tech
tags:
  - "Code"
---

## Use Case: Caching via Promise Memoization

Now we move on to our next use case. Consider we have the following simple API client:

```ts
export const getUserById = async (userId: string) => {
  const user = await request.get(`https://users-service/api/v1/${userId}`);
  return user;
};
```

What if the downstream users-service takes a long time to resolve user IDs, and we expect many calls for the same few user IDs?

Well, we probably want to implement some kind of cache. Here's a naive solution:

```ts
const usersCache = new Map<string, User>();

export const getUserById = async (userId: string) => {
  if (!usersCache.has(userId)) {
    const user = await request.get(`https://users-service/v1/${userId}`);
    usersCache.set(userId, user);
  }

  return usersCache.get(userId);
};
```

This approach probably works fine for most applications. But it will make two duplicate network calls in the following case:

```ts
await Promise.all([
  getUserById('user1'),
  getUserById('user1')
]);
```

Again, the problem is that we assign the cache _after_ the call resolves. So concurrent invocations will make duplicate API calls.

### Singleton Promise(s) to the Rescue

Here too we can fix this problem with singleton promises. Instead of caching the _resolved_ value of the promise, we can cache the promise itself:

```ts
const userPromisesCache = new Map<string, Promise<User>>();

export const getUserById = async (userId: string) => {
  if (!userPromisesCache.has(userId)) {
    const userPromise = request.get(`https://users-service/v1/${userId}`);
    userPromisesCache.set(userId, userPromise);
  }

  return userPromisesCache.get(userId);
};
```

### Promise Memoization

Astute readers will notice that this pattern effectively _memoizes_ our method. We're caching the user promise, which is itself the method result!

This insight means that we're really just doing general memoization. As a result, we can use off-the-shelf memoization utilities:

```ts
import _ from 'lodash';

export const getUserById = _.memoize(async (userId: string) => {
  const user = await request.get(`https://users-service/v1/${userId}`);
  return user;
});
```

By memoizing our method, we ensure that:
1. We'll only make one API call per user.
2. Concurrent invocations won't create duplicate API calls.

// TODO:
// Separate posts for singleton promise vs promise memoization
