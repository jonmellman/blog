---
title: 'Code Consistency'
template: post
slug: /posts/todo
date: "TODO"
draft: true
description: 'TODO'
category: Tech
tags:
  - "TODO"
---

I'm a huge believe in [Opportunistic Refactoring](https://martinfowler.com/bliki/OpportunisticRefactoring.html). In our unending battle against [software entropy](TODO), we do some serious damage over time through a constant onslaught of small but positive improvements.

But these refactorings can come at a cost, which is rarely discussed: they often introduce inconsistency across our codebase.

In this post, I'll discuss more about opportunistic refactoring and the costs involved. I'll go through several examples from my day job.

## What is opportunistic refactoring?

## What is code consistency?

Code consistency, in this context, is simply the idea that our code should adhere to a single cohesive design and style. This helps readability and comprehension.

I _don't_ mean that different authors write code differently, though this can also be considered code inconsistency. I mean when the team's idea of best practices evolve, leaving some existing code behind.

Any time two pieces of code are written in different ways, we'll say the code is inconsistent.

An example is when Module A is written in an object-oriented style, while Module B is written in a functional style

Another example is when Module A interacts with the database with a DAO pattern, while Module B uses a Repository pattern.

## The Tension

Opportunistic refactors, by definition, are easy refactors. Ensuring code consistency in our refactors makes them much harder. In large codebases, there may be an overwhelming amount of code to keep consistent.

So, there's a tension here. If we want to foster continual, gradual, opportunistic code improvements, we need to sacrifice code consistency. If we want to foster highly consistent code, we need to sacrifice opportunistic code improvements.

## Real-World Examples

Let's look at some increasingly-controversial examples inspired by my day job:

### 1. Migrating to TypeScript

As a team, we decided we want to write in TypeScript instead of JavaScript [for many reasons](TODO). But, we have ~100k LOC in JS to maintain.

What should we do?

1. Refactor all JS to TS in a big-bang rewrite, so all code is consistently written in TS
2. Assess that a big-bang rewrite is too expensive, so all code will continue to consistently be written in JS
3. Sacrifice consistency. _New_ code can be written in TS, but old code remains in JS until it's convenient to upgrade

The team decided to do the latter.

### 2. Improved logger API

The team had an abstruse `formatLog` function that had to be called prior to logging messages. There was also what I'm calling the "try/catch/log/throw" anti-pattern - where any method call is wrapped in a try/catch block that simply logs the error and re-throws.

```js
const doSomething = (sessionId) => {
	let result
	try {
		result = someNormalOperation(context, user)
	} catch(error) {
		logger.error(formatLog('E1425', 'Dangerous operation failed!' { ...context, ...user, time: Date.now() }, error.message))
		throw error
	}
	return result
}
```

This has a few problems:

1. Lots_of boilerplate when logging messages, since we have to always call `formatLog` first and remember the nonintuitive parameters.
2. Lots_of boilerplate when writing methods, since we have to wrap calls in a try/catch
3. Duplicate error logs for any single error, since each layer of the call stack had its own logging.
4. The log output isn't readable, since in our case it was outputting nested stringified JSON.
5. Error logs don't include stack traces

I proposed introducing a higher-order logging utility to solve these problems. This lets us write code like:

```js
const doSomething = withLogContext((logContext) => (sessionId) => {
  logContext.logID = "E1425";
  Object.assign(logContext, context, user);

  return someNormalOperation(context, user);
});
```

`withLogContext` wraps our method, injecting a `logContext` where we can declaratively attach log details. The wrapper automatically logs errors if the method throws, including the entire `logContext`. It also logs regular JSON instead of nested JSON strings.

I pitched this as a big improvement, and the team agreed.

But, similar to the TypeScript example, there were thousands of log sites using the bad logging pattern.

We had a choice:

1. Refactor all the existing log sites in a bag-bang upgrade
2. Assess that a big-bang upgrade is too expensive, so all code will continue to consistently be written with the bad logging pattern
3. Sacrifice consistency. _New_ code can be written with the improved pattern, but old code remains as-is until it's convenient to upgrade.

What did we do? It's actually not so simple.

This time, there were loud voices who were in favor of the improvement but were _more_ opposed to the inconsistency that would result.

In the end, we compromised. The codebases that I own would adopt approach #3, and other codebases would defer the upgrade until there was more time for a big-bang upgrade.

### 3. `isModifierField`, `isPricingField`

Our product has a feature that needs to special-case a field. The current data model looks something like:

```js
const forms = [
  {
    label: "Region",
    formId: "region",
    options: ["North", "South", "East", "West"],
  },
  {
    label: "Color",
    formId: "color",
    options: ["red", "blue"],
  },
  {
    label: "Modifier",
    formId: "modifier",
    isModifierField: true, // Note this boolean field.
    options: [0, 0.5, 1],
  },
];
```

A refactor opportunity arose when a team member proposed introducing a new Value field, like:

```js
{
	label: "Value",
	isValueField: true, // Now we have another boolean field.
	options: [.75, 1, 1.25]
}
```

I suggested that, instead of proliferating the `isFooField`/`isBarField` pattern, which requires us to add new properties for any new field we add.

This schema is persisted in the database, and so any changes require a migration.

## Conclusion

My experience taught me that there's a lot of gray area in how individuals assess the benefits of code improvement versus consistency.

Personally, I've found that I'm heavily biased towards improvement over consistency. If we learn of a better practice, we should find a way to start using it right away. If we have to upgrade

I've found that when there's a strong culture around documentation and communication, code consistency is not so important.

My views are based on several premises:

1. The cost of consistency is a factor of the
2. Code consistency matters less if the team has a strong culture around documentation and communication.
3. There is more code ahead of us than behind us, so the sooner we stop proliferating bad patterns, the better.

I'm curious to know how universal these beliefs are. When do you sacrifice consistency for improvement? When do you not?

## Premises

1. There is more code ahead of us than behind us
