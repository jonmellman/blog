---
title: 'Cattelganger: Finding Your Cat Lookalike with Python'
template: post
slug: /posts/cattelganger
date: "2019-08-29T16:12:20.214Z"
draft: false
description: 'Hacking together human/cat face comparison using Python, ML, Computer Vision, and TensorFlow'
category: Tech
tags:
  - "Hackathon"
  - "Machine Learning"
  - "Computer Vision"
---


![Side-by-side of feature extraction](/media/cattelganger/both_annotated.png)

In another recent [friend-hackathon](/posts/hackathon-1), my friend [Kristian](https://hartikainen.github.io/) and I met up to build something cool: a script that finds your cat lookalike.

By the end of the day we had written a script that detects human facial features from a photo and compares them to a set of extracted cat facial features. Sure, this set contained data from only two cats, but, hey, it's a proof of concept.

Here is our brief demo video from the end of the day:

<iframe width="560" height="315" src="https://www.youtube.com/embed/nNZps3C8-Zo" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

_Like I said, proof a concept._

Kristian is about to start his PhD in Artificial Intelligence (specializing in Reinforcement Learning), so he knew much more than I did going into this project. When I mentioned I wanted to make an app that showed your furry-friend lookalike, his reaction: "that sounds easy."

In the end, I wouldn't say it was "easy", but certain aspects of scripting with computer vision and machine learning were definitely simpler than I expected. Other aspects were honestly terrible (spoiler: Python dependency management).

All in all it was a tremendous amount of fun, and I learned a lot about machine learning, computer vision, and TensorFlow.

## An Origin Story

Way back in 2011 there was a website called Doggelganger that would take a photo of your face and then show you your your dog lookalike.

![doggelganger](/media/catt
elganger/pedigree_doggelganger.jpg)
_Screenshot from the original http://doggelganger.co.nz website, which is no longer running._

In reality, it was a [clever marketing stunt from a New Zealand animal shelter](http://doggelganger.co.nz/). I suspect they displaying random dog images and assuming users would imagine some similarity to the human photo.

But it's 2019 now. We have the technology. And I wanted to use it to build a modern Doggelganger.

### So what the heck is Cattelganger?

To our surprise, it turns out cats are much better ML subjects than dogs. We struggled to find open source tools for dog ML, but we easily found a [cat face bounding box detection algorithm](https://github.com/opencv/opencv/tree/master/data/haarcascades),a  [cat landmark recognition script](https://github.com/marando/pycatfd), and a fairly large [dataset of cat photos](https://www.kaggle.com/crawford/cat-dataset) for training.

Team Dog is really behind here. I suspect cats are planting these algorithms and datasets for humans, knowing that each hackathon brings them one step closer to technological immortality as an artificial super-entity. Good move.

So Team Cat won, and we decided to pivot to cat comparison, rebrand as Cattelganger, and descend one level deeper into wordplay hell.

## How does it work?

Our source code is available [here](https://github.com/jonmellman/Cattelganger/blob/master/src/cattelganger.py). It's hackathon quality, so don't judge too harshly.

We found the [pycatfd](https://github.com/marando/pycatfd) repository, which we used to detect landmarks on cat faces. Then we modified an open-source implementation of [FaceNet using TensorFlow](https://github.com/DequanZhu/FaceNet-and-FaceLoss-collections-tensorflow2.0) to extract similar landmarks from a human face.

With landmarks for multiple cat faces and a single human face, we simply compared the human's landmark locations against those of each cat to determine the most similar cat.

### Cat Feature Extraction

![Cat with feature annotation](/media/cattelganger/cat_annotated.jpg)
_Cat facial features extracted by `pycatfd`_

As you can see above, the `pycatfd` library made it easy to determine the cat face bounding box, as well as to extract the locations of 8 facial landmarks: left/right eyes, nose, chin, and the left/right points for both ears.

We could more or less use this out of the box, although we had to restructure the package to call it from other Python code.

### Human Feature Extraction

The FaceNet implementation we used extracted much more granular landmarks from human faces. Instead of just 8 landmark locations like `pycatfd` returns, FaceNet returns a whopping 68.

This means that instead of getting a single coordinate representing "left eye", we get a set of points representing the entire curve of the eyebrow and the shape of the eye.

It would be great to use this granularity, but our lowest common denominator is the cat extraction library. It doesn't give us data about the eyebrow curve, so we don't have this data for cats and can't use it for comparison.

To deal with this issue, we computed the averages of these granular landmarks to derive human landmarks that can be directly compared with those of our cats:

```python
# Define a dictionary which maps the relevant facial features
# to their indexes in the FaceNet return shape.
FACIAL_LANDMARKS_IDXS = OrderedDict([
    ("jaw", (0, 17)),
    ("right_eyebrow", (17, 22)),
    ("left_eyebrow", (22, 27)),
    ("nose", (27, 35)),
    ("right_eye", (36, 42)),
    ("left_eye", (42, 48)),
    ("mouth", (48, 68))
])

# We only want to extract features that can be directly compared to our cat features.
FEATURES = ["jaw", "left_eye", "right_eye", "nose"]

def compute_feature_averages(shape):
    # With Python list comprehensions, we can easily create a new array
    # containing the averages of each relevant slice of the original array.
    return np.concatenate([
        np.mean(shape[slice(*FACIAL_LANDMARKS_IDXS[feature])],
                axis=0, keepdims=True)
        for feature in FEATURES
    ], axis=0).astype(np.int32)
```

We can visualize the coarser, averaged landmarks that this approach derives:

![Human with feature annotation](/media/cattelganger/human_annotated.png)
_Human facial features extracted by FaceNet, including default and derived landmarks_

The default granular landmarks are the small red dots, and the large purple dots are the coarse landmarks we derived by averaging the surrounding coarse landmarks.

The purple dots are the landmarks that can be directly compared to the landmarks in each cat photo.

### Human/Cat Comparison

We used a very simple algorithm for the comparison (no ML). With the locations of comparable landmarks, we compared the human landmarks to those of each cat by calculating the difference. Whichever cat had the least difference was deemed the most similar cat.



```python
# Pass our cat faces into the pycatfd model.
cat_face_predictions = pycatfd.model(cat_faces)

# Pass our human face into the FaceNet model.
human_face_prediction = facenet.model(human_face[None, ...])

# Compute the distance of the human face from each of the cat faces.
distances = tf.norm(human_face_prediction -
                    cat_face_predictions, axis=1, ord=2)

# The index of the lowest distance is the index of the most similar cat.
cat_index = tf.argmin(distances)
```

## Learnings
1. **It's hard to validate ML algorithms.** With this project, and much of ML, it's hard to tell when the algorithm is working correctly. How do we validate that our algorithm is actually picking the most similar cat?

    There's clearly no right answer here, and humans certainly can't deterministically compare their friends to cats. Maybe it's not fair to expect so much of computers.
1. **Python package management is annoying.** We spent entirely too much time cloning Python libraries from GitHub and then installing missing dependencies one at a time as we encountered them. There were also packages that had to be rearranged to be imported correctly. Some packages we tried did these right, but not many.

    Maybe Python has best practices and tools that solve this, but as someone just dipping into Python for a day of hacking, I found it asked much more of me than, say, NodeJS's `package.json` installations.
1. **Despite the previous point, there are some very impressive open-source Python packages.** I was amazed that open-source packages can extract human and cat facial features so easily.

    I imagine this is largely attributable to Python's popularity in academia, where folks code remarkable things but perhaps don't have experience with packaging or dependency management best practices.

## Next Up

Given how little I knew when we started, I'm really happy with our proof of concept. But, we left a lot of work ahead of us before we can really call this project done.

* **Use a larger dataset of cat photos.** We used a set of just two cat images for our proof of concept, but we were able to find a [dataset of over 9000 cat photos](https://www.kaggle.com/crawford/cat-dataset) online.

    To incorporate this dataset, we would write an offline processing script to iterate over each cat photo in the dataset and extract its landmark locations. These landmark locations would be stored in a way that facilitates efficient computation. They would also be stored with a reference to the original photo.

    Ideally, Cattelganger won't need to extract any cat features at runtime, since this can all be done beforehand. At runtime, then, it will simply extract features from the input human photo, perform the comparison against a database of cat landmarks, and pull the photo for the most similar cat.
* **Scale the bounding box.** Each face bounding boxes should be scaled to a consistent size before extracting landmark locations. This way, the algorithm will compare the _relative_ differences in landmark locations.

    Currently it compares the _absolute_ difference in landmark locations, which means that two of the same photo with different crops may actually have very different landmark locations.
* **Improve the comparison algorithm.** Ours is a simple vector difference across the facial landmarks. Perhaps the results would be more satisfying if the algorithm were tuned to favor, for example, distance between eyes, or other second-order features.
* **Wrap it in an app.** Having a script is cool, but to take Cattelganger to the masses we could wrap it in a shiny web or mobile application that lets users upload their own photos for comparison. I also think that a polished UI will give the impression that our results are more trustworthy.
