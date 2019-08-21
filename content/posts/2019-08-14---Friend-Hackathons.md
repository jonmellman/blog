---
title: 'Friend-Hackathons: Having Fun Building Something Fun'
template: post
slug: /posts/hackathon-1
date: "2019-08-14T23:46:37.121Z"
draft: false
description: 'This post focuses on some of my thoughts on the concept of friend-hackathons'
category: Tech
tags:
  - "Hackathon"
---

Last Wednesday, my friend Micah and I had a "friend-hackathon" where we hacked together paper-thin and velocity-sensitive drum pad MIDI controllers. This non-technical post explores some of my thoughts and learnings on the friend-hackathon concept.

![Micah Thinking](/media/velo-pads/micah1.jpg)
_Micah pondering._

If you want to make your own VeloPads, see [this accompanying post](http://localhost:8000/posts/velopads) on the actual technical details of the project.

## Friend-hackathon? Did you make that up?

You've never heard of a friend-hackathon? Me neither. Yes, I made it up. But I think it names a concept that can be quite novel, fun, and educational.

A friend-hackathon is a day you set with a friend of yours who shares overlapping interests. On this day, you meet up and collaborate to build _something_.

## Benefits

Micah and I wouldn't have built anything at all had we not made the intentional commitment to have our hackathon. I see this as idea versus execution. Lots of people want to build things, but comparatively few will put in the effort to make things happen.

We didn't know how our hackathon would turn out. Even if the chance of building something cool was only 1%, that's infinitely better than ideating without producing anything, which will never build something.

Micah and I share interests in music, Arduino, and software. The time commitment of a 1-day hackathon seemed relatively low for determining whether we could combine our knowledge to make something that we wouldn't have the motivation or experience to make by ourselves.

I think the following are benefits you might reasonably realize through a friend-hackathon:
* Build habits of execution, as opposed to ideation.
* Gain valuable hands-on experience with a topic of interest.
* Validate that you're _actually_ interested in said topic of interest. Often I like the idea of something more than I like the reality of being hands-on with it.
* Fulfill primal urge to create.
* Bond with a friend through a shared project. Strengthen your relationship through applied teamwork with a common goal.

## Implementation Details

So maybe the previous section resonated with you somewhat. You've had a lot of energy for creation recently, you have tech-savvy friends you might be able to hack with, and you have ideas or interests to explore.

1. **Set a date**. This is the most important part. Once you set a date, there's mutual social pressure for both of you to show up. And once you've shown up, it

	In our case, we had originally agreed on Tuesday but I put it in my calendar for Wednesday 🤦. When I got a text from Micah saying "Coffee is on, bagels when you arrive :)" I felt terrible about rescheduling for the next day. But now there was extra social pressure!

1. **Come prepared**. If you have an idea of what you'll be hacking on, set up your workspace ahead of time and read up on the basics. Small mistakes from inexperience can often lead to long, frustrated troubleshooting. Try to get these mistakes out of the way ahead of time.

	In our case, I knew that Micah was much more experienced with circuits and Arduino. I spent some time by myself the day before, setting up the Arduino IDE and experimenting with some basic circuits. I also experimented with the Velostat material, which was new to both of us. This allowed us to hit the ground running when we joined forces.

1. **Bring good vibes.** Micah had a good tactic: bagels and coffee! Think about small things you can do to cultivate an environment of lighthearted teamwork.
1. **Brainstorm.** We started with an unstructured brainstorm, where we each talked about our shared areas of interests. We knew we wanted to do _something_ with Velostat, and we had shared interests in software and music. I think this process helped to excite us about what we were going to do, even if we didn't have a set goal yet.
1. **Keep it realistic.** You don't want to end your friend-hackathon feeling disappointed that you didn't complete your goal. Set yourself up for success by questioning whether your goal is realistic.

	Consider this paraphrased exchange:

	_Me: "It would be cool to make a MIDI fingerpad with this Velostat stuff."_

	_Micah: "Yeah I'm on board!"_

	_Me: "It would be awesome to make a self-contained fingerpad with its own audio out"_

	_Micah: "That would be awesome, but we definitely can't do that in a single day"_

	I was definitely fortunate that Micah had enough experience to know that my idea would take longer than the time we had. If you're not sure if you can get your goal done in a single day, it may be better to cut scope so you can leave the hackathon feeling proud and excited, instead of disappointed.
1. **Plan your tasks.** Before you start building anything, break your goal down into smaller tasks and write them down somewhere.

	We put our goal and tasks into a [Google Doc](https://docs.google.com/document/d/10Y9HAPHGN7Vc1d5B34AozdSZECfUrpppmGIHSPZplt4/edit?usp=sharing). As you can tell, we didn't make it polished. But, breaking down the tasks and writing them down together helped us get (and stay) on the same page. Several times, one of us would correct the other's idea of what a task would consist of, and this helped fill in knowledge gaps or correct false assumptions.

	Look back at your goal and tasks often. I found that this helped me be more intentional about how I was spending my time. The small refactor to the software or the circuit that I'm thinking of? That's in our "fine tuning" task, which we agreed we'd do after all the other tasks.
1. **Celebrate progress.** I find that good things often get lost in a sea of busyness. As you accomplish the tasks you wrote down, make an effort celebrate! It's a marvelous thing when you plan on accomplishing something, and then put in time and sweat that _actually results in that thing getting done_.

	Celebrating can be as simple as sitting back and giving your partner a high five. I find that these micro-celebrations actually boost my self-efficacy as they contribute to my memories of times when I accomplished what I set out to. They're also a small gamification to feed your reward system.
1. **Take breaks** Don't fatigue yourself. Energy and clarity of thought are finite resources. If you just finished a task or are getting frustrated by a bug, it's a good time to take a break.

	Micah and I took a music break in the morning, to listen to a jam we had recently recorded. In the afternoon, we took a nice walk to a local cafe for lunch where we barely talked about our project. I think that in the long run, these breaks helped us stay focused and excited about the hackathon.
1. **Reflect.** Hackathons often go by in a flurry and a blur, but take some time to reflect on what you accomplished and learned.

	For example, my experience with this hackathon taught me that while I enjoy DIY electronics, I much prefer software and coding.
	  1. With software, it's trivial to revert bad changes or go back to previous working versions. Hardware, on the other hand, needs to be rewired, which can be quite tedious.
	  1. Software can be perfectly duplicated an infinite number of times. With our VeloPads on the other hand, we needed to physically construct each additional drum pad.
	  1. Software is easier to debug. Granted, a lot of this is that my years in software development have biased me. But, I still find it annoying when circuits behave in non-intuitive ways.
1. **Record a demo video at the end of the day.** I got a lot of joy out of showing friends our demo and hearing their thoughts and reactions. It also served as content for the technical blog post.

I had a lot of fun and learned a lot in my friend-hackathon, so I encourage others to explore this concept. Let me know if you find a cool idea to hack on. Happy hacking!
