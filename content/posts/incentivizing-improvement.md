---
title: "Incentivizing Improvement in Legacy Codebases"
template: post
slug: /posts/todo
date: "todo"
draft: true
description: "TODO"
category: Tech
tags:
  - "Code"
---

In this post, I'll explore some thoughts around the disproportionate cost curve of small incremental changes.

## A Tale of Two Codebases

On my team, there are two products whose codebases have roughly the same size, activity, and maturity. We'll anonymize these codebases by calling them Green and Blue.

When developing on codebase Green, submitting a pull request has some small but additional overhead. Specifically, authors must increment the version file and add an entry to the CHANGELOG.md, such that a one-line code change requires modifying three files.

Codebase Blue has no such process, and one-line changes are simply that.

This doesn't seem like a big deal. Aren't most code changes over many different lines and a handful of files? What's an extra two files to change per pull request? It's not hard to increment a version and describe the change, so surely developers just get used to it and it becomes habitual.

Sure it's extra effort, but it's so small that it's completely inconsequential. Right?

## A Tale of Two Feature Branches

A (perhaps) nonintuitive consequence of codebase Green's change process is that merging one pull request _breaks every open pull request_.

Consider two open pull requests, both branched off of master at version 1.2.

They each increment the version file to 1.3, and they each prepend a new entry to CHANGELOG.md.

But, they can't both be version 1.3! As soon as Akbar merges his change, Boba's build will fail because:
1. The build wants his version to be 1.4, which is incremented from master.
2. There are merge conflicts in CHANGELOG.md, since both changes modify the same lines.

Regardless of which change is merged first, the other will break and require the author to update their change.

## Not So Inconsequential

This means the "trivial" effort of updating the version and CHANGELOG.md is not incurred once per change.

If you want your build to be green, you'll need to update your change N times after submitting it, where N is the number of changes that just so happen to be merged while yours is open.

## Blue vs Green

For fun, let's compare codebases Green and Blue.

* Codebase Blue's documentation is better.
* Codebase Blue's logging is more useful.
* Codebase Blue's code style is more consistent.
* Codebase Blue's dependencies are more up-to-date.
* Codebase Blue's code patterns are more modern.

In short, quality of life is better on the Blue side.

Sure, there are lots of factors involved. But I'd like to posit that, as a developer, I feel more _empowered_ to improve codebase Blue if I find something to change.

## So why did Green start this process?

The benefits are easy to quantify

## Why does Green continue this process?

The costs are hard to quantify.

## What if we want this process?

GitLab solved this problem by requiring changelog entries to be separate files, rather than entries in a single file. And with custom tooling.
* https://about.gitlab.com/blog/2018/07/03/solving-gitlabs-changelog-conflict-crisis/
* Also: https://pspdfkit.com/blog/2018/the-challenges-of-changelogs/

Probably, you should just use semantic release: https://github.com/semantic-release/semantic-release
