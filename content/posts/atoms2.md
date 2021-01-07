---
title: 'Elixir Atoms II: The Atoms Table'
template: post
slug: /posts/atoms2
date: "2019-08-16T23:46:37.121Z"
draft: true
description: 'TODO'
category: Tech
tags:
  - "TODO"
---

## The Atom Table

Because atoms can never be garbage collected, there's necessarily a limit on how many atoms a single process can create. Either this limit will be imposed by the language, or by your machine when it crashes because it can't store your garbage atoms. Fortunately, in Elixir the limit is imposed by the language/runtime.

Atoms are stored internally as integers, which are 4 bytes.

(Aside: I was confused by the [Erlang memory documentation](http://erlang.org/doc/efficiency_guide/advanced.html#memory), which seems to be saying that on 64-bit machines, atoms will be 8 bytes. If anybody could clear up for me why I'm not seeing this, that would be greatly appreciated.)

```
iex(1)> :erlang.memory(:atom_used)
307320
```

### Interesting Observations

On a clean `iex` session on my machine, the atom table already consumes 307KB of memory.

```
iex(1)> :erlang.memory(:atom_used)
307320
```

After I declare a new atom, this jumps up by an entire kilobyte:

```
iex(2)> :my_new_atom
:my_new_atom
iex(3)> :erlang.memory(:atom_used)
308311
```

I assume this is because the :erlang.memory function itself declares atoms internally before returning.

## The Atom Limit

Much like our own universe, Elixir can only support a specific number of atoms. This limit is 1,048,576 atoms by default:

```
iex(1)> :erlang.system_info(:atom_limit)
1048576
```

This seems like a massive number of atoms, but on a clean iex session, 29% of the atom table is already full. Presumably there are more atoms internal to Elixir and Erlang than we'd ever create ourselves, but I wonder how many atoms are declared just by third party dependencies in a medium sized production application.

With each atom taking 4 bytes of memory (discounting space for storing the string itself), we can store
