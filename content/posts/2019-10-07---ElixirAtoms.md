---
title: 'Elixir Atoms vs JavaScript Symbols'
template: post
slug: /posts/elixir-atoms
date: "2019-10-07T21:49:58.849Z"
draft: false
description: 'What are Elixir "atoms", and how are they different from JavaScript Symbols?'
category: Tech
tags:
  - "Elixir"
  - "Code"
---

Over the past few weeks, I've been reading up on the Elixir programming language. It's focus on concurrency, scalability, fault-tolerance, and the developer experience are all very intriguing to me.

[![Elixir logo](/media/elixir-atoms/elixir.png)](https://elixir-lang.org/)

However, I'm coming from the idiosyncratic world of JavaScript (and the notably more sane world of TypeScript), so some fundamental Elixir concepts are new to me.

One such example is Elixir "atoms", which often seem to be used in place of strings for things like flags and object property names.

## Example

Consider this Elixir code, which uses two atoms in a single line, to create a file and verify the operation:

```elixir
iex(1)> {:ok, file} = File.open("hello", [:write])
```

NodeJS, by contrast, [implements file system flags as strings](https://nodejs.org/api/fs.html#fs_file_system_flags), so the JavaScript code uses strings:

```js
const file = fs.openSync('hello', 'w');
```

(This example also illustrates the difference in error handling philosophies between Elixir and JavaScript. Elixir methods idiomatically return an `{:error, :reason}` tuple on errors, while JavaScript typically relies on thrown Exception objects and try/catch constructs.)

## So what actually is an atom?

According to the [Elixir documentation](https://elixir-lang.org/getting-started/basic-types.html#atoms):

> "An atom is a constant whose value is its own name. Some other languages call these symbols."

Symbols, eh? Symbols in JavaScript aren't nearly as prominent as atoms in Elixir. Are they really the same thing? If not, how are they different?

## JavaScript Symbols

In JavaScript, symbols are primitives introduced in [ES6](https://www.ecma-international.org/ecma-262/6.0/#sec-symbol-objects).

A fundamental property of JavaScript symbols is that they're always unique objects, even when constructed with the same input.

```js
> Symbol('MySymbol') == Symbol('MySymbol')
false
```

So why would you want a data type with this characteristic?

1. Preventing property name collision on objects. Libraries that share a reference to some object can attach their own symbols to it with no risk of conflict, unlike string keys.

2. Flag values. In our file-writing example, instead of indicating file modes with strings such as `'w'`, the filesystem module could certainly be implemented using `Symbol('w')`.

    I would actually argue that using symbols in this case is preferable. Unlike strings, the symbols must be retrieved from the object in question, in order to match the flag the object is checking against internally. This forces callers to be more intentional in how they invoke the function.

3. Metaprogramming and reflection, which are more advanced use cases. The `Symbol` global has ["well-known" symbols](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol#Well-known_symbols) attached to it, which are referred to by the runtime itself while executing constructs like `for of` loops and spread operators.

    By using these well-known symbols in custom data types, developers can write third party data types that have first class support for these language constructs.


## Elixir Atoms

In Elixir, there's one big, overarching reason for the widespread use of atoms instead of strings: their implementation allows for very efficient equality comparisons.

This is because atoms with the same name are stored at the same memory address. This means that, when comparing atoms, the memory address can be compared directly without consulting the string representation and doing a character-by-character check.

In algorithmic notation, the atom equality can be checked in constant O(_1_) time. String equality, on the other hand, is linear O(_n_) where _n_ is the length of the shorter string.

Because atoms with the same name are stored in the same memory address, unlike JavaScript Symbols, atoms with the same name _are_ considered equal to one another.

```elixir
iex(1)> :MySymbol == :MySymbol
true
```

## So they're different!

Definitely. Very different.

In Elixir, all atoms with the same name are equal and, under the hood, share a reference. This is completely different from JavaScript, where symbols are only equal if they've been explicitly assigned to the same reference by the developer.

As this post has shown, the use cases for each are largely orthogonal.

There happens to be some interesting overlap, though: both Elixir atoms and JavaScript symbols can be used to implement flag constants. However, this commonality is coincidental.

In Elixir, atoms flags make sense for performance reasons, whereas, in JavaScript, symbol flags are beneficial because they impose intentionality in calling code (which is a much more subtle point).

I imagine the subtlety in the JavaScript use case is why string flags are still idiomatic despite the availability of symbols.

## Conclusion

While the Elixir documentation on atoms says _"Some other languages call these symbols"_, we've learned that JavaScript is not one of those languages.

Considering the influence of Ruby on Elixir, I imagine the documentation is referring to Ruby-like languages.

_Disclaimer: I'm still learning Elixir, so if anything in this post is inaccurate, I'd appreciate corrections at [jonmellman@gmail.com](mailto:jonmellman@gmail.com)._
