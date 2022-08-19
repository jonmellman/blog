---
title: "Advanced TypeScript Patterns: API Contracts"
template: post
slug: /posts/typescript-for-api-contracts
date: "2022-08-16T00:58:42.270Z"
draft: true
description: "Getting the most out of TypeScript"
category: Tech
tags:
  - "Code"
---

TypeScript is one of the [most loved programming languages](https://insights.stackoverflow.com/survey/2021#most-loved-dreaded-and-wanted-language-love-dread), yet I often see teams miss opportunities to use it more effectively. In this post, we'll look at how we can eliminate a class of bugs by enforcing REST API contracts in full-stack TypeScript applications.

A "contract" here is simply a specification of what data the API sends and receives. We'll write an API spec in TypeScript that both the client and server understand and enforce.

When we guarantee that the client and server are both complying to the same spec, our code _simply won't compile_ if there's any mismatch between what the client is sending and what the server is expecting, and vice versa.

## General Idea

The idea is simple: we'll create an API spec in TypeScript, and then reference it in both the client and server code.

This post will use [axios](npmjs.com/package/axios) and [express](npmjs.com/package/express) for the API client and server libraries respectively, though the approach generalizes to any library that supports types.

The first step is to realize that your API client library and server framework already _support type parameters_. I'm surprised by how often developers don't realize this or don't know how to use them. (To be fair, the type implementations can be intimidating - see [axios's](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/express-serve-static-core/index.d.ts#L122-L175) and [express's](https://github.com/axios/axios/blob/649d739288c8e2c55829ac60e2345a0f3439c730/index.d.ts#L350-L369).)

## Understand the Type Parameters

The next step is to actually understand and _use_ the type parameters. This takes some digging and experimentation with your libraries, so I'll just tell you:

1. `axios` requests takes a type representing the response data
2. `express` API routes take types representing the path parameters, response body, request body, and query parameters.

Now we can start using these type parameters in a simple example.

## Simple Example - Axios

Consider:

```ts
import axios from "axios";

type User = {
  userId: number;
  name: string;
};

export const getUser = async (userId: number): Promise<User> => {
  const { data } = await axios.get<User>(`/api/users/${userId}`);

  // 🚫 Property 'userName' does not exist on type 'User'.
  console.log(data.userName);

  // ✅ `data` matches the return type of the method signature.
  return data;
};
```

Very straightforward. We told Axios the data type, and now it's enforced by the compiler.

## Simple Example - Express

On the `express` side, it's a little more complicated. But not much.

Consider:

```ts
type User = {
  userId: number;
  name: string;
};

export const usersRouter = express.Router();

usersRouter.get</* path params: */ { userId: number }, /* response: */ User>(
  "/api/users/:userId",
  async (req, res) => {
    // 🚫 Property 'id' does not exist on type '{ userId: number; }'
    const { id } = req.params;

    // ✅ `userId` is of type `number`
    const { userId } = req.params;
    const user = await dao.getUser(userId);

    // 🚫 Type 'undefined' is not assignable to type 'string'
    user.name = undefined;

    // ✅ Our response type matches the router's type signature.
    res.status(200).json(user);
  }
);
```

The compiler now makes sure we're accessing defined path parameters and that we're returning the expected data type to the client.

## Extracting a TypeScript API spec

The client and server types behave how we want, but the types are duplicated in each. This is a big problem, since when the types drift apart it will cause bad bugs.

So, the next step is to extract a single API spec that both client and server can reference.

For simplicity, let's create a sibling `shared-types/` directory alongside the existing `client/` and `server/` directories. Then let's make a `UsersApi.ts` file for our API spec:

```diff
client/
server/
+ shared-types/
+   UsersApi.ts
```

We know that we need the API's response body for both Axios and Express, and the path params for Express, so let's represent those:

```ts
// shared-types/UsersApi.ts

export type User = {
  userId: number;
  name: string;
};

export type GetUserApi = {
  PathParams: {
    userId: number;
  };
  ResponseBody: User;
};
```

Some small notes:

1. For now, the `User` type is defined in the same file as the API. We'll see later why this isn't always ideal.
2. We nest the `PathParams` and `ResponseBody` type under a `GetUserApi` type. This is purely a convention for organization - use whatever convention makes sense for you.

## Integrating with the API spec

Our client code now becomes:

```ts
import axios from "axios";
import { GetUserApi, User } from "../shared-types/UsersApi";

export const getUser = async (userId: number): Promise<User> => {
  const { data } = await axios.get<GetUserApi["ResponseBody"]>(
    `/api/users/${userId}`
  );
  return data;
};
```

Note that the `getUser` method signature references the `User` type, while the implementation reference the `GetUserApi['ResponseBody']` type. Both types are equivalent for now, but we make a distinction to maintain our abstractions. The _implementation_ is what knows about the API spec and prevents API spec types from leaking into the rest of the client code. It's a subtle point, but as the business logic grows you'll be glad to have this separation.

And our server code:

<!-- prettier-ignore -->
```ts
import express from "express";
import { GetUserApi, GetUsersApi } from "../shared-types/UsersApi";

export const usersRouter = express.Router();

usersRouter.get<
  GetUserApi["PathParams"],
  GetUserApi["ResponseBody"]
>(
  "/api/users/:userId",
  async (req, res) => {
    const { userId } = req.params;
    const user = await dao.getUser(userId);

    res.status(200).json(user);
  }
);
```

## Naive Approach - Client

Here's a naive approach I see too often:

```ts
import axios from "axios";

type User = {
  userId: number;
  name: string;
};

export const getUsers = async (): Promise<User[]> => {
  const { data } = await axios.get("/api/users");
  return data;
};
```

Here are reasons this is bad:

1. Our `getUsers` method actually provides _no_ type safety. (Axios will type the data as `any` by default.)
2. Our server must, presumably, duplicate the exact same `User` type. These duplicate definitions are likely to drift apart over time.

## Naive Approach - Server

Likewise, on the server I'll often see:

One way to think about it is that types flow outward from the backend (which houses most business logic and interfaces with the database).

As with any type of sharing, questions of _ownership_ emerge. If the types are shared, who _owns_ them? My claim is that the backend, which houses most business logic, should own the application's models.

## Goals

Our goals are:

1. The API _server_ shouldn't compile if it's modified in a way that breaks API clients.
2. The API _client_ shouldn't compile if it's modified in a way that breaks itself.

## Example

## Serialization

## API Errors

## GraphQL

## Representing "no parameter" in TypeScript

## Changes to build process

Because the approach here relies only on referencing type declarations, which are erased at compile time, there are no changes to your build process.

## Drawbacks: Rollout

Rollouts are often not atomic. That is, new code is typically deployed to some servers before others. And client-side code is often cached in the browser or CDN even after deployment. So, it's important to understand that might still be making a breaking change even if your API contract compiles.

Example where a server is on vN but the client is on vN-1: Deploying a new required property on the API, you update the client code and deploy in lockstep. Can you spot the problem? Clients still may be running older versions of the code depending on your cache policy. These clients would be making requests according to the _old_ version of your API, which didn't require this property. As a result, API calls from these clients will fail.

Example where a client is on vN but the server is on vN-1: If you employ gradual rollouts, the release will reach some servers before others. It's possible that a new client fetches vN of the client code and its API calls get load balances to a server still on vN-1. This can be a problem if, say, the client code is sending a property that vN-1 doesn't understand.

## Autogenerating from OAS

A little over a year ago, I did look into autogenerating TypeScript API clients and servers from an OpenAPI specification. At the time, the tooling seemed too immature. I hope this changes soon.
