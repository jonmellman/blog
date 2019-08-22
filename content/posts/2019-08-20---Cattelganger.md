---
title: 'Cattelganger: Using ML and computer vision to find your cat lookalike'
template: post
slug: /posts/cattelganger
date: "2019-08-21T01:13:39.181Z"
draft: true
description: 'How we made a python script to find your cat lookalike'
category: Tech
tags:
  - "Hackathon"
  - "Machine Learning"
  - "Computer Vision"
---

Continuing with the [friend-hackathon](/posts/hackathon-1) concept, last Tuesday my friend Kristian and I met up to build something cool: a script that takes a photo of you and finds your cat lookalike.

<iframe width="560" height="315" src="https://www.youtube.com/embed/nNZps3C8-Zo" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

_Our demo video at the end of the day._

Believe it or not, at the end of the day we had a script that would detect human facial features from a photo and compare feature landmark locations to a database of cat facial features. Sure, this database contained data from only 2 cats, but, hey, we had a proof of concept.

Kristian is about to start his PhD in Artificial Intelligence (specializing in Reinforcement Learning), so he knew much more about the topic than I. When I mentioned I wanted to make an app that showed your furry-friend lookalike, his reaction: "that sounds easy".

I wouldn't say it was "easy", but certain aspects of scripting with computer vision and machine learning were definitely simpler than I anticipated. Other aspects were much more annoying than I expected (*cough* Python packaging *cough*).

All in all it was a tremendous amount of fun, and I learned a lot about the state of machine learning and computer vision libraries and algorithms.

## An Origin Story

Way back in 2011 there was a website called Doggelganger that would take a photo of your face and then show you your your dog-lookalike.

![doggelganger](/media/catt
elganger/pedigree_doggelganger.jpg)
_Screenshot from the original http://doggelganger.co.nz website. The original site is no longer up and running._

In reality, it was a [clever marketing stunt from a New Zealand animal shelter](http://doggelganger.co.nz/). They probably were just surfacing random dog images and assuming the audience would imagine some visual connection to the human photo.

But it's 2019 now. We have the technology. And I wanted to use it to build a modern Doggelganger.

### So what the heck is Cattelganger?

As it turns out, we easily found a [cat face bounding box detection algorithm](https://github.com/opencv/opencv/tree/master/data/haarcascades), [cat landmark recognition scripts](https://github.com/marando/pycatfd), and a fairly large [databases of cat photos](https://www.kaggle.com/crawford/cat-dataset) to use as training data.

Much to our dismay, no such things exist for dogs. At least, not that came up in a brief internet search. So we decided to pivot to cat recognition and rebrand as Cattelganger. This is a forward-looking move too, as it makes a future expansion into Cattleganger for cow recognition stay on-brand.

## How does it work?

The source code is available [here](TODO).

We used the [pycatfd](TODO) library to detect landmarks on cat faces. Then we modified an [open-source FaceNet implementation](TODO) to extract similar landmarks from human faces.

<!-- TODO: Photo of cat feature annotation -->

As you can see above, the pycatfd library made it easy to extract the cat face bounding box, as well as extract the locations of landmarks (TODO list of the landmarks).

The FaceNet implementation we used extracted even more granular landmarks from human faces. We were able to find the average of these landmarks to get the same landmarks as pycatfd, which we need to compare the human and cat facial landmarks.

The screen shot below shows the granular landmarks in green, and the coarse landmarks we derived from those in purple. The purple dots are what we will use to compare to the cat database.

<!-- TODO: Photo of human feature annotation -->

## Learnings
A big takeaway is that with this project, and much of ML, it's hard to tell when the algorithm is working correctly. This is just a silly project, so

## Next Up

* **Process the database of cat images.** This will involve writing an offline script to iterate over the cat images, extract their features, and store the landmarks along with a reference to the original image.
* **Improve the comparison algorithm.** Ours is a simple vector difference across the facial landmarks, but perhaps the algorithm can be tuned to favor, for example, distance between eyes.
* **Scale the bounding box.** For more consistent results, we think the face bounding box should be scaled so that different face sizes don't result in different landmark locations.
* **Wrap it in an app.** Having a script is cool, but to take Cattelganger to the masses we would need to wrap it in a shiny web or mobile application. I think that a polished UI will make the results more trustworthy.
