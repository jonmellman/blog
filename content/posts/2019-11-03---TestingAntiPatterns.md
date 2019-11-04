---
title: 'JavaScript Testing Anti-Patterns'
template: post
slug: /posts/javascript-testing-anti-patterns
date: "2019-11-04T06:52:26.516Z"
draft: false
description: 'How not to initialize test objects: avoid these practices to make tests more concise, maintainable, readable, and trustworthy.'
category: Tech
tags:
  - "Code"
---


There are a handful of anti-patterns I see repeatedly in JavaScript test code. Here we'll go over two simple traps I often see, and how to avoid them to make your tests more concise, maintainable, readable, and trustworthy.

# ❌ Anti-pattern #1: Test objects initialized in each test

Consider the following oversimplified example, in which our `mockUser` test object is initialized in each test case:

```js
const validateUser = ({ userId }) => {
	return typeof userId === 'string';
};

describe('The user validation', () => {
	it('should succeed when the user is valid', () => {
		const mockUser = {
			userId: 'theUserId',
			name: 'John Smith',
			language: 'en-US'
		};

		expect(validateUser(mockUser)).toBe(true);
	});

	it('should fail when the user is invalid', () => {
		const mockUser = {
			name: 'John Smith',
			language: 'en-US'
		};

		expect(validateUser(mockUser)).toBe(false);
	});
});
```

This seems straightforward. What's wrong in this example?

1. **It's verbose**. Imagine what happens when instead of two tests we have 24, and instead of three properties, our user objects have 11.
1. **Test objects are duplicated**. As our test suite and business logic grow over time, developers will have to modify each individual test. This is toilsome, error prone, and likely to be forgotten.
1. **Our second test isn't very readable**. It's not intuitive why `mockUser` is invalid without reading the surrounding code and understanding the validation logic.


# ❌ Anti-pattern #2: Test objects initialized in a `describe` block

Let's look at a common way that anti-pattern is resolved, and then we'll see why this is itself an anti-pattern:

```js
const validateUser = (user) => {
	return typeof user.userId === 'string';
};

describe('The user validation', () => {
	const MOCK_USER = {
		userId: 'theUserId',
		name: 'John Smith',
		language: 'en-US'
	};

	it('should succeed when the user is valid', () => {
		expect(validateUser(MOCK_USER)).toBe(true);
	});

	it('should fail when the user is invalid', () => {
		delete MOCK_USER.userId;
		expect(validateUser(MOCK_USER)).toBe(false);
	});
});
```

Wait - this looks great, you say. We declare our user object once! And what's more, our second test explicitly deletes the `userId` property, making the test much more readable!

The problem is that our tests now share the same reference to our user object, meaning that any single test can **mutate** our user object for following tests. This can cause **false positives** (tests failing when they should pass) or **false negatives** (tests passing when they should fail).

As we'll see, false negatives are especially insidious because they often mask bugs, creating a false sense of security.

Consider what happens when a developer comes along and adds a new test, asserting that users need a `language`:

```js
const validateUser = (user) => {
	return typeof user.userId === 'string';
};

describe('The user validation', () => {
	const MOCK_USER = {
		userId: 'theUserId',
		name: 'John Smith',
		language: 'en-US'
	};

	it('should succeed when the user is valid', () => {
		expect(validateUser(MOCK_USER)).toBe(true);
	});

	it('should fail when the user is invalid', () => {
		delete MOCK_USER.userId;
		expect(validateUser(MOCK_USER)).toBe(false);
	});

	it('should fail when the user has no language', () => {
		delete MOCK_USER.language;
		expect(validateUser(MOCK_USER)).toBe(false);
	});
});
```

The new behavior hasn't even been implemented, but the test still passes!

That's because the previous test deleted the `userId` property, so our user object is still invalid when our new test executes.

# ✅ Best Practice: Test objects initialized in a `beforeEach` block

To avoid these hard-to-catch mutable-state bugs, test objects should be initialized in a `beforeEach` block:

```js
const validateUser = (user) => {
	return typeof user.userId === 'string';
};

describe('The user validation', () => {

	let mockUser;

	beforeEach(() => {
		mockUser = {
			userId: 'theUserId',
			name: 'John Smith',
			language: 'en-US'
		};
	});

	it('should succeed when the user is valid', () => {
		expect(validateUser(mockUser)).toBe(true);
	});

	it('should fail when the user is invalid', () => {
		delete mockUser.userId;
		expect(validateUser(mockUser)).toBe(false);
	});

	it('should fail when the user has no language', () => {
		delete mockUser.language;
		expect(validateUser(mockUser)).toBe(false);
	});
});
```

Now our last test fails like we expect it to, and the developer is reminded to actually implement their new feature ;)

By re-initializing test objects before each test, our tests are guaranteed to be **independent**. That is, the behavior of one test won't affect the result of another.

We've also made our tests more concise, readable, and reduced duplication.

Happy testing!
