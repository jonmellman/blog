---
title: 'Elixir Atoms III: Atoms vs String Performance'
template: post
slug: /posts/atoms3
date: "2019-08-16T23:46:37.121Z"
draft: true
description: 'How much faster is it to compare atoms instead of strings?'
category: Tech
tags:
  - "Elixir"
  - "Atoms"
---


Atoms have a drawback of being garbage collected. And, although I didn't find many resources on this, [apparently](http://erlang.org/pipermail/erlang-questions/2013-July/074834.html) they're also stored in a table shared across processes and use locks to coordinate reading and writing.

The prevailing wisdom seems to be that it's worth using atoms because they're optimized for comparison. In this post we'll see how much better they are for comparison than ordinary strings.
