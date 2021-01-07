---
title: "Measuring Test Flakiness with a Bash One-Liner"
template: post
slug: /posts/one-liner-measuring-flakiness
date: "2021-01-07T03:34:08.453Z"
draft: true
description: "How do you know that you've really fixed the flakiness? How about some cold hard data."
category: Tech
tags:
  - "Code"
---

# Measuring Test Flakiness with a Bash One-Liner

Lately, I've had to fix a handful of flaky test suites[^1]. The problem is not reproducible, so how do you know if you've fixed it or just gotten lucky in your test run? There's nothing worse than declaring a problem fixed only to have a teammate's next build fail for the same reason.

Here's the one-liner I've been using to measure flakiness:

<!-- Lower font size to prevernt the one-liner from overflowing -->
<style>
div pre code.language-sh {
  font-size: 13px !important;
}
</style>

```sh
while true; do yarn test && echo 0 >> results.txt || echo 1 >> results.txt; done
```

Of course, substitute `yarn test` for whatever your test command is.

## Explanation

Maybe it needs no explanation, but I'll give one anyway. It repeatedly runs tests, appending a 0 to `results.txt` on success and a 1 on failure.

When terminated, you'll have a file that tells you the approximate flakiness rate. I run it before attempting any fixes (my "control group") and after (my "treatment group") and compare the flakiness rates. Now I have solid data I can add to my pull request.

Probably this method is a lifesaver for some readers and primitive to others. I'd love to hear from you whichever camp you're in. What methods do you use for resolving test flakiness?

[^1]:
  * Problem 1: shared, mutable test state, and tests have inconsistent (sometimes bad) cleanup behavior. Solution: Add a hook so the test runner guarantees clean database state for each test.
  * Problem 2: Testing the failure condition for code that retries using exponential backoff. Solution: sinon's [`await clock.runAllAsync()`](https://github.com/sinonjs/fake-timers), which is magical.
  * Problem 3: Tests for a logger invoke the logger and immediately assert against the log file, when the logs may not all be flushed to disk yet. Solution: Add a 20ms sleep to the assertion helper. Hey, we're pragmatic :)
