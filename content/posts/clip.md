---
title: 'Simple OSX CLI: Clip'
template: post
slug: /posts/simple-tools-clip
date: "2019-11-05T06:52:26.516Z"
draft: true
description: 'A one-line bash function for productivity and profit'
category: Tech
tags:
  - "Code"
---

For the past few years (and I'm not sure where I found it), I've kept the following in my .zshrc:

```sh
function clip {
	[ -t 0 ] && pbpaste || pbcopy;
}
```

This elegant function detects if its being run on stdin, and correspondingly uses `pbpaste` or `pbcopy` (OSX builtins for pasting from and copying to the clipboard, respectively). It's one of those simple tools that I now use all the time and rarely think about.

```sh
cat output.json | clip
```

```sh
clip > output.json
```

I wish I could remember where I found it - I know I didn't come up with it myself. If you know the origin, let me know so I can give credit where it's due.
