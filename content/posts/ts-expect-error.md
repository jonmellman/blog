---
title: "ts-expect-error"
template: post
slug: /posts/todo
date: "todo"
draft: true
description: "TODO"
category: Tech
tags:
  - "Code"
---

Consider the following JavaScript code:

```js
// resourceDao.js
import { MongoClient } from "mongodb";

const url = "mongodb://localhost:27017";
const RESOURCES_COLLECTION = "resources";

export const createResource = async (resource) => {
  const mongo = await MongoClient.connect(url);
  await mongo.db().collection(RESOURCES_COLLECTION).insert({
    ...resource,
    createdAt: new Date(),
  });
};
```

How should we upgrade this legacy code to TypeScript? We can simply change the file extension from .js to .ts, but in strict mode the compiler warns us about the untyped `resource` parameter.

When working with legacy code, it's common that _we don't actually know_ what type to use to represent this `resource`. We would have to examine all of the call sites at arbitrary depth, which is time-consuming and risky.

To be pragmatic, we should find some way to use the type system to represent:

1. We don't know what `resource` is.
1. If you, future caller, do know what `resource` is, you have to add a proper type for it.

## Option 1: `any`

This looks like:

```diff
// resourceDao.ts
import { MongoClient } from "mongodb";

const url = "mongodb://localhost:27017";
const RESOURCES_COLLECTION = "resources";

-export const createResource = async (resource) => {
+export const createResource = async (resource: any) => {
  const mongo = await MongoClient.connect(url);
  await mongo.db().collection(RESOURCES_COLLECTION).insert({
    ...resource,
    createdAt: new Date(),
  });
};
```

Although the code compiles, it's far too permissive. Callers can pass _anything at all_ in as `resource`, defeating the purpose of TypeScript.

As a concrete example, the compiler would give no warning on:

```ts
createResource(null);
```

(Interestingly, [ES6 allows spreading over null and undefined](https://www.bennadel.com/blog/3590-you-can-safely-apply-object-spread-to-null-and-undefined-values-in-typescript-3-2-4.htm). But, it's probably not what we want here.)

_During a JS to TS migration, it's best to add the most restrictive types necessary for compilation._ We can refine our types as more calling code is converted to TypeScript.

## Option 2: `object`

Ok, so we know `resource` is non-null and gets spread. This means it's an object, and we can use the `object` type!

```diff
// resourceDao.ts
import { MongoClient } from "mongodb";

const url = "mongodb://localhost:27017";
const RESOURCES_COLLECTION = "resources";

-export const createResource = async (resource: any) => {
+export const createResource = async (resource: object) => {
  const mongo = await MongoClient.connect(url);
  await mongo.db().collection(RESOURCES_COLLECTION).insert({
    ...resource,
    createdAt: new Date(),
  });
};
```

This is better because callers can no longer pass `null`, `undefined`, strings, or numbers. But it's still very permissive:

```ts
// No compiler warnings when we pass arbitrary objects:
createResource({
  isResource: false,
});

// No compiler warnings when we pass in a function!
createResource(createResource);
```

# Option 3: `unknown`, with cast

This is where `unknown` comes in. The `unknown` type lets us specify a type that the compiler won't allow callers to provide.

# Option 3: `unknown`, with `// @ts-expect-error`
