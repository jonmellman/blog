---
title: "Measuring Test Flakiness with a Bash One-Liner"
template: post
slug: /posts/flakiness-one-liner
date: "2021-01-07T03:34:08.453Z"
draft: false
description: "How do you know that you've really fixed the flakiness? How about some cold hard data."
category: Tech
tags:
  - "Code"
---

I've had to fix a handful of flaky test suites lately. It's a pain[^1].

Flakiness isn't reproducible by definition, so how do you know if you've actually fixed it? If there's more than one problem, how do you know if you've made any improvement at all?

Here's the one-liner I've been using to measure flake rate:

<!-- Lower font size to prevent the one-liner from overflowing -->
<style>
div pre code.language-bash {
  font-size: 14px !important;
}
</style>

```bash
while; do npm test && echo 0 >> results.txt || echo 1 >> results.txt; done
```

(Of course, substitute `npm test` for the command that runs your tests.)

## Explanation

Maybe it needs no explanation, but I'll give one anyway. It repeatedly runs tests, appending a 0 to `results.txt` on success and a 1 on failure. Let it run for a while, then derive your flake rate.

I collect data before attempting a fix (my control group) and again after (my treatment group). This quantifies both the problem and the improvement. Plus, hard numbers in PR descriptions always make you look smart.

Sometimes you learn something surprising. Maybe there was a 9% flake rate, and even after the big refactor everyone's been clamoring for, there's still a 2% flake rate.

What are other practical tips for fixing flakiness? I'd love to hear your tools and tactics.

[^1]:
  * Problem 1: Shared, mutable state across a large test suite and poor test isolation. Solution: Add a hook so the test runner guarantees clean state for each test.
  * Problem 2: Testing the failure condition for code that retries using exponential backoff and jitter. Solution: SinonJS's [`await clock.runAllAsync()`](https://github.com/sinonjs/fake-timers), which is magical and lets us avoid nondeterministic assertion polling.
  * Problem 3: Tests for a logger that assert against the log file, which may not be flushed to disk yet. Solution: Add a 20ms sleep to the assertion helper. Hey, we're pragmatic :)
