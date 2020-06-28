---
title: "On Opportunistic Refactoring"
template: post
slug: /posts/on-opportunistic-refactoring
date: "2020-06-28T09:47:36.623Z"
draft: false
description: "A useful piece of vocabulary for any software engineer. Commentary on the value of continuous and easy software refactors."
category: Tech
tags:
  - "Code"
---

I only just discovered the excellent [Martin Fowler article on Opportunistic Refactoring](https://martinfowler.com/bliki/OpportunisticRefactoring.html). It names and describes a concept I've been thinking a lot about recently. I was excited to learn that Fowler seems to share many of my mental models and intuitions :)

In this post, I explain the Fowler passages that resonated with me. I also add commentary from my professional experience using opportunistic refactors to maintain software.

## What is opportunistic refactoring?

On the developer level, opportunistic refactoring is about leaving code better than you found it.

On the systemic level, it's about promoting a culture where developers continuously make small, positive improvements that curb [software entropy](https://en.wikipedia.org/wiki/Software_entropy).

In my experience, a strong developer culture of opportunistic refactoring is inversely correlated with [software rot](https://en.wikipedia.org/wiki/Software_rot).

## Benefits Compound

Fowler says:

> If you always make things a little better, then repeated applications will make a big impact that's focused on the areas that are frequently visited - which are exactly the areas where clean code is most valuable.

Here, by "repeated applications will make a big impact", Fowler is talking about compounding effects:

- If we take a minute now to rename a confusingly-named variable, we make it easier for t1he next person to refactor the method signature.
- When they refactor the method signature, it's easier for the next person to notice functional similarities between this class and another, and combine them.
- When they combines these classes, our design simplifies and the next person can more easily implement their new feature.
- And so on...

## But Returns Can Diminish

I also really like the note that frequently-visited locations are "exactly the areas where clean code is most valuable." This highlights a big efficiency loss I often see: developer teams going out of their way to upgrade old code that hasn't been touched in a long time and won't be touched soon.

It's good that the team is refactoring, but the returns can diminish rapidly. The effort to refactor unvisited code would likely be better spent elsewhere - like refactoring code to make way for an upcoming feature.

## The Costs of Friction

Fowler says:

> My sense is that most teams don't do enough refactoring, so it's important to pay attention to anything that is discouraging people from doing it. To help flush this out be aware of any time you feel discouraged from doing a small refactoring, one that you're sure will only take a minute or two. Any such barrier is a smell that should prompt a conversation.

I strongly agree with this as well. We naturally discount the benefits of refactoring, for the same reasons we discount anything with a compounding effect or delayed return ([Hyperbolic Discounting](https://en.wikipedia.org/wiki/Hyperbolic_discounting)).

We can combat this by being _overly_ biased towards refactoring. Even knowing this, we need to refactor more than we think we do - [Hofstadter's law](https://en.wikipedia.org/wiki/Hofstadter%27s_law) of refactoring :)

Because we need to be overly biased towards refactoring, any friction getting in the way of opportunistic refactors needs to be addressed.

### Sources of Friction

Here are some sources of friction that I've seen:

- Even trivial improvements require a version increment and changelog entry, turning a one-line change into a three-file change.
- Slow code review process, so developers need to resolve merge conflicts to get their opportunistic refactors in. (This is greatly exacerbated by certain version increment and changelog schemes...)
- Overly-aggressive code reviews, where scope is increased by well-meaning but unrelated improvements. ("While you're touching this file, let's reorganize the imports")
- Poor test coverage, so developers need more time to be confident their refactor is safe.
- Lack of ownership. If developers don't think they'll reap the future rewards of the refactor, they'll be less inclined to refactor. This happens when developers are frequently swapped between codebases.
- So much technical debt that even opportunistic refactors are expensive ("Where do I even start?"). These situations may warrant a planned refactor to unblock opportunistic refactoring.

Any of the above impacts the pace of opportunistic refactors and interferes with the compounding benefits.

## Opportunistic vs Planned Refactors

Fowler says:

> Certainly there is a place for planned efforts at refactoring, even setting aside a day or two to attack a gnarly lump of code that's been getting in everyone's way for a few months. But a team that's using refactoring well should hardly ever need to plan refactoring, instead seeing refactoring as a constant stream of small adjustments that keep the project on the [DesignStaminaHypothesis](https://martinfowler.com/bliki/DesignStaminaHypothesis.html)

[Planned refactors](https://martinfowler.com/articles/workflowsOfRefactoring/#planned) have their place. Sometimes it's not feasible to refactor something opportunistically. For example, migrating the database from Mongo to PostgresSQL requires (lots of) planning. I'd be very scared if a team approaches that opportunistically.

### Rethinking Planned Refactors

But, in my experience, many real-world planned refactors can be reduced to a _required_ opportunistic and an _optional_ planned phases. This generally applies when we wish to replace an existing widespread Bad Pattern with a new superior Good Pattern.

Examples:

- Converting JavaScript to TypeScript
  - Bad Pattern: JavaScript
  - Good Pattern: TypeScript
- Supporting distributed tracing for our API calls
  - Bad Pattern: No distributed tracing
  - Good Pattern: Distributed tracing
- Logging stack traces on errors, instead of just error message
  - Bad Pattern: Logging error messages
  - Good Pattern: Logging the entire stack trace

With a planned refactor, the team might be to take several sprints and replace every instance of Bad Pattern with Good Pattern. Developers then use Good Pattern for all new code going forward.

### Introducing good patterns cheaply

I often advocate an alternate approach, where:

1. We stop proliferating Bad Pattern _today_ and begin writing all new code with Good Pattern.
2. We take some evaluation phase where we understand the (usually cognitive) overhead of having Bad Pattern and Good Pattern coexisting in our codebase.
3. After the evaluation phase, we can decide whether it's best to eliminate Bad Pattern at once in a planned refactor (it's often not), or gradually through opportunistic refactors.

I like this approach because:

1. It really lowers the barrier to beginning to use Good Pattern, which incentivizes continuous improvement.
2. We never invest in an expensive planned refactor unless we're confident in the return on investment.
3. It often exposes that we don't _really_ care about eliminating Bad Pattern completely. We care about using Good Pattern for all new code and for certain hot-spots of existing code. We learn that there's a long tail of old code that's not worth refactoring.
