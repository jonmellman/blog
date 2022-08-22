---
title: 'Advanced TypeScript Patterns: API Contracts'
template: post
slug: /posts/typescript-for-api-contracts-1
date: '2022-08-16T00:58:42.270Z'
draft: false
description: 'Using TypeScript to eliminate a class of bugs by guaranteeing compatibility between your API client and server.'
category: Tech
tags:
  - 'Code'
---

<style>
div pre code.language-ts {
  font-size: 15px !important;
}

div pre code.language-diff {
  font-size: 15px !important;
}
</style>

TypeScript is one of the [most loved programming languages](https://insights.stackoverflow.com/survey/2021#most-loved-dreaded-and-wanted-language-love-dread), yet I often see teams miss opportunities to leverage it. In this post, we'll explore an approach to writing pragmatic API contracts in TypeScript that eliminate an entire class of bugs.

## What & Why

A "contract" here is simply a common specification of what data the API sends and receives.

When the client and server both reference the same TypeScript spec, we've codified the spec as a contract. At that point, our code _simply won't compile_ if there's any mismatch between what the client is sending and what the server is expecting, and vice versa.

This forces the client and server to evolve in lockstep, making it impossible e.g. for the client to reference nonexistent properties, or for the server to remove properties the client depends on.

_This post will use [axios](npmjs.com/package/axios) and [express](npmjs.com/package/express) for the API client and server libraries respectively, though the approach generalizes to any library that supports types._

_If you want to skip to the code, I have [an example repository set up here](https://github.com/jonmellman/blog-examples/tree/master/typescript-for-api-contracts)._

## Understand Your Type Parameters

The first step is to realize that your API client library and server framework _already support type parameters_. I'm surprised by how often developers don't realize this or don't know how to use them.

(To be fair, the type implementations can be intimidating - see [axios's](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/express-serve-static-core/index.d.ts#L122-L175) and [express's](https://github.com/axios/axios/blob/649d739288c8e2c55829ac60e2345a0f3439c730/index.d.ts#L350-L369). And while there are actually libraries that don't support type parameters, there are workarounds.)

The next step is to actually understand the type parameters. This takes some digging and experimentation with your libraries, so I'll just tell you:

1. `axios` requests takes a type representing the response data.
2. `express` API routes take types representing the path parameters, response body, request body, and query parameters.

## Type Parameters: Axios

Now we can start using these type parameters in a simple example: an API like `GET /api/users/:userId`.

The API client might look like:

```ts
// client/api/users.ts
import axios from 'axios';

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

## Type Parameters: Express

On the `express` side, it's a little more complicated. But not much.

Consider:

<!-- prettier-ignore -->
```ts
// server/routes/users.ts
type User = {
  userId: number;
  name: string;
};

export const usersRouter = express.Router();

usersRouter.get<
  /* path params: */ { userId: number },
  /* response: */ User
>(
  '/api/users/:userId',
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

Great - the compiler now makes sure we're accessing defined path parameters and that we're returning the expected data type to the client.

## Extracting a TypeScript API spec

It's good that the client and server types now behave correctly, but each duplicates its own version of the types! This means the compiler can't warn us about contract violations _at the client/server boundary_, which is where violations are likely to take place.

So, the next step is to extract a single API spec that both client and server can reference.

For simplicity, let's create a sibling `shared-types/` directory alongside existing `client/` and `server/` directories. Then let's make a `UsersApi.ts` file for our API spec:

```diff
client/
server/
+ shared-types/
+   UsersApi.ts
```

Let's represent the API response body, as well as the Express path params:

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

Of course, this is a _very_ lightweight and pragmatic API spec. It's not comprehensive in the way an [OpenAPI](https://swagger.io/specification/) spec would be, but it's disproportionately valuable.

Some notes:

1. We nest the `PathParams` and `ResponseBody` type inside a `GetUserApi` type. This is purely a convention for organization. Use whatever convention makes sense for you.
1. You shouldn't need to modify your build process to reference this file from client code - it exclusively contains type definitions, which are erased during compilation. (You can even import it in `create-react-app` applications, which typically [don't let you import from outside your client's source directory](https://stackoverflow.com/questions/44114436/the-create-react-app-imports-restriction-outside-of-src-directory).)
1. It's not always a good idea to colocate your application model types, like `User`, with their respective API contracts. For example, if other APIs referenced `User`, we'd want to reorganize and extract that type.

## Integrating with the API spec

Now that we have a dedicated TypeScript API contract, our client code can become:

```ts
// client/api/users.ts
import axios from 'axios';
import { GetUserApi, User } from '../shared-types/UsersApi';

export const getUser = async (userId: number): Promise<User> => {
  const { data } = await axios.get<GetUserApi['ResponseBody']>(
    `/api/users/${userId}`
  );
  return data;
};
```

A subtle point: The `getUser` method signature references the `User` type, while the implementation references the equivalent `GetUserApi['ResponseBody']` type. By _encapsulating the API contract within the client implementation_, we allow the rest of the application to use the simpler `User` type.

And our server code:

<!-- prettier-ignore -->
```ts
// server/routes/users.ts
import express from 'express';
import { GetUserApi, GetUsersApi } from '../shared-types/UsersApi';

export const usersRouter = express.Router();

usersRouter.get<
  GetUserApi['PathParams'],
  GetUserApi['ResponseBody']
>(
  '/api/users/:userId',
  async (req, res) => {
    const { userId } = req.params;
    const user = await dao.getUser(userId);

    res.status(200).json(user);
  }
);
```

## The Result

Now let's see how different bugs are prevented at compile-time:

#### 1. Client Misuse of the API

If the client references a nonexistent property, the code won't compile. For example:

```diff
export const getUser = async (userId: number): Promise<User> => {
  const { data } = await axios.get<GetUserApi['ResponseBody']>(
    `/api/users/${userId}`
  );
+ console.log(data.id);
  return data;
};
```

This results in a compilation error:

```
Property 'id' does not exist on type 'User'
```

#### 2. Backwards-Incompatible Changes to the Spec

If the spec is modified in a breaking way, the code won't compile. Say properties are replaced, like:

```diff
// shared-types/UsersApi.ts
export type User = {
  userId: number;
- name: string;
+ firstName: string;
+ lastName: string;
};
```

The compiler will warn about any code still relying on `User['name']`, across client and server, with errors like:

```
Property 'name' does not exist on type 'User'.
```

#### 3. Backwards-Incompatible Changes to the Server

Say the server wants to modify a data type before sending it to the client:

```diff
usersRouter.get<
  GetUserApi['PathParams'],
  GetUserApi['ResponseBody']
 >('/api/users/:userId', async (req, res) => {
  const { userId } = req.params;
  const user = await dao.getUser(userId);
+ user.userId = user.userId.toString();

  res.status(200).json(user);
});
```

This causes compiler errors like:

```
Type 'string' is not assignable to type 'number'.
```

The API spec, client, and server must all be mutually compatible for any given change to compile.

## Conclusion

I like this approach to API contracts because it's pragmatic: it's lightweight, nonintrusive, broadly compatible, and can be introduced gradually. Feel free to play around with my [example repository](https://github.com/jonmellman/blog-examples/tree/master/typescript-for-api-contracts).

This was just an introduction. In production use, you'll run into cases that I didn't touch on here like:

- Representing request bodies and querystrings in the API contract
- Representing API errors in the contract itself
- Serialization/deserialization of API types
- Managing types for domain models used by many APIs
- Properly representing nonexistent parameters

If there's interest, I'll explore these in a followup. Cheers!

#### Appendix: Backwards-Incompatible Rollouts

Although this pattern prevents backward incompatibilities within any given version of the codebase, your rollout strategy might permit clients and servers to be on different versions.

For example, if your client bundle is cached in the CDN then, during rollout, your servers will be upgraded to version N while clients are still using the cached N-1. Similarly, a new client might load version N of the bundle before all servers have been upgraded from N-1.

So, it's important to consider your rollout strategy - don't assume all your clients and all your servers will always be on the same version at the same time.
