http://burakkanber.com/blog/machine-learning-in-js-k-nearest-neighbor-part-1/

nodes assign themselves the properties they are given
there is a node list that manages/contains all the nodes

A Node represents a single data point from the set, whether it's a pre-labeled (training) point, or an unknown point. The NodeList manages all the nodes and also does some canvas drawing to graph them all.

The Node constructor has nothing to it. It just expects an object with the properties "type", "area", and "rooms":

###You usually build a generalized kNN algorithm that can work with arbitrary features rather than the pre-defined ones here

// var Node = function(object) {
//   for (var key in object) {
//     this[key] = object[key]
//   };
// };
//
// var NodeList = function(k) {
//   this.nodes = [];
//   this.k = k;
// };

 The NodeList constructor takes the "k" from k-nearest-neighbor as its sole argument.

NodeList.prototype.add(node) function -- that just takes a node and pushes it onto the this.nodes array.

* Expected keys in object:
* rooms, area, type

###The Problem

Given the number of rooms and area (in square feet) of a type of dwelling, figure out if it's an apartment, house, or flat.

As always, we're starting with the most contrived possible problem in order to learn the basics. The description of this problem has given us the features we need to look at: number of rooms, and square feet. We can also assume that, since this is a supervised learning problem, we'll be given a handful of example apartments, houses, and flats

Here's a table of the example data we're given for this problem:

Rooms	 Area	 Type
1	     350	 apartment
2	     300	 apartment
3	     300	 apartment
4	     250	 apartment
4	     500	 apartment
4	     400	 apartment
5	     450	 apartment
7	     850	 house
7	     900	 house
7	     1200  house
8	     1500  house
9	     1300  house
8	     1240  house
10	   1700  house
9	     1000  house
1	     800	 flat
3	     900	 flat
2	     700	 flat
1	     900	 flat
2	     1150  flat
1	     1000  flat
2	     1200  flat
1	     1300  flat

We're going to plot the above as points on a graph in two dimensions, using number of rooms as the x-axis and the area as the y-axis.

When we inevitably run into a new, unlabeled data point ("mystery point"), we'll put that on the graph too. Then we'll pick a number (called "k") and just find the "k" closest points on the graph to our mystery point. If the majority of the points close to the new point are "flats", then we'll guess that our mystery point is a flat.

That's what k-nearest-neighbor means. "If the 3 (or 5 or 10, or 'k') nearest neighbors to the mystery point are two apartments and one house, then the mystery point is an apartment."

Here's the (simplified) procedure:

Put all the data you have (including the mystery point) on a graph.
Measure the distances between the mystery point and every other point.
Pick a number. Three is usually good for small data sets.
Figure out what the three closest points to the mystery point are.
The majority of the three closest points is the answer.







Supervised Learning

There are two giant umbrella categories within Machine Learning: supervised and unsupervised learning. Briefly, unsupervised learning is like data mining -- look through some data and see what you can pull out of it. Typically, you don't have much additional information before you start the process. We'll be looking at an unsupervised learning algorithm called k-means next week, so we can discuss that more in the next article.

Supervised learning, on the other hand, starts with "training data". Supervised learning is what we do as children as we learn about the world. We're in the kitchen with mom. Mom shows us an apple and says the word "apple". You see an object and your mother has labeled it for you.

The next day, she shows you a different apple. It's smaller, it's less red, and it has a slightly different shape. But your mother shows it to you and says the word "apple". This process repeats for a couple of weeks. Every day your mother shows you a slightly different apple, and tells you they're apples. Through this process you come to understand what an apple is.

Not every apple is exactly the same. Had you only ever seen one apple in your life, you might assume that every apple is identical. But instead, your mother has trained you to recognize the overall features of an apple. You're now able to create this category, or label, of objects in your mind. When you see an apple in the future you can recognize it as an apple because you've come to understand that while all apples share some features, they don't have to be identical to still be apples.

This is called "generalization" and is a very important concept in supervised learning algorithms. We would be useless if we couldn't recognize that an iPhone was an iPhone because it had a different case, or because it had a scratch across the screen.

When we build certain types of ML algorithms we therefore need to be aware of this idea of generalization. Our algorithms should be able to generalize but not over-generalize (easier said than done!). We want "this is red and kind of round and waxy, it must be an apple" and not "this is red and round, it must be a ball; this other thing is orange and round, it must be a ball." That's overgeneralization and can be a problem. Of course, under-generalization is a problem too. This is one of the main difficulties with ML: being able to find the generalization sweet spot. There are some tests you can run as you're training an algorithm to help you find the sweet spot, but we'll talk about those in the future when we get to more advanced algorithms.

Many supervised learning problems are "classification" problems. The classification problem goes like this: there's a bucket of apples, oranges, and pears. Each piece of fruit has a sticker that tells you which fruit it is -- except one! Figure out which fruit the mystery fruit is by learning from the other fruits you're given.

The classification problem is usually very easy for humans, but tough for computers. kNN is one type of many different classification algorithms.

Features

This is a great time to introduce another important aspect of ML: features. Features are what you break an object down into as you're processing it for ML. If you're looking to determine whether an object is an apple or an orange, for instance, you may want to look at the following features: shape, size, color, waxiness, surface texture, etc. It also turns out that sometimes an individual feature ends up not being helpful. Apples and oranges are roughly the same size, so that feature can probably be ignored and save you some computational overhead. In this case, size doesn't really add new information to the mix.

Knowing what features to look for is an important skill when designing for ML algorithms. Sometimes you can get by on intuition, but most of the time you'll want to use a separate algorithm to determine which are the most important features of a data set (we'll talk about that in a much more advanced article).

As you can imagine, features aren't always as straightforward as "color, size, shape". Processing documents is a tricky example. In some scenarios, each word in a document is an individual feature. Or maybe each pair of consecutive words ("bigrams") is a feature. We'll talk about document classification in a future article as well.

###Drawbacks, caveats

There are two issues with kNN I'd like to briefly point out. First of all, it should be pretty clear that if your training data is all over the place, this algorithm won't work well. The data needs to be "separable", or clustered somehow. Random speckles on the graph is no help, and very few ML algorithms can discern patterns from nearly-random data.

Secondly, you'll run into performance problems if you have thousands and thousands of Nodes. Calculating all those distances adds up! One way around this is to pre-filter out Nodes outside of a certain feature's range. For example, if our mystery point has # of rooms = 3, we might not even calculate distances for points with # of rooms > 6 at all.

###Normalizing Features

Look at the data in the table above. The number of rooms varies from 1 to 10, and the area ranges from 250 to 1700. What would happen if we tried to graph this data onto a chart (without scaling anything)? For the most part, the data points would be lined up in a vertical column. That'll look pretty ugly, and hard to read.

Unfortunately, that's not just an aesthetic problem. This is an issue of a large discrepancy of scale of our data features. The difference between 1 room and 10 rooms is huge when you consider what it means for classifying a "flat" vs a "house"! But the same difference of 9, when you're talking about square feet, is nothing. If you were to measure distances between Nodes right now without adjusting for that discrepancy, you'd find that the number of rooms would have almost no effect on the results because those points are so close together on the x-axis (the "rooms" axis).

Consider the difference between a dwelling with 1 room and 700 square feet and 5 rooms and 700 square feet. Looking at the data table by eye, you'd recognize the first to be a flat and the second to be an apartment. But if you were to graph these and run kNN, it would consider them both to be flats.

So instead of looking at absolute values of number of rooms and area, we should normalize these values to be between 0 and 1. After normalization, the lowest number of rooms (1) becomes 0, and the largest number of rooms (10) becomes 1. Similarly, the smallest area (250) becomes 0 and the largest area (1700) becomes 1. That puts everything on the same playing field and will adjust for discrepancies of scale. It's a simple thing to do that makes all the difference in the world.

Pro-tip: you don't need to scale things evenly (into a square) like I described above. If area is more important to the problem than the number of rooms, you can scale those two features differently -- this is called "weighting", and gives more importance to one feature or another. There are also algorithms that will determine the ideal feature weights for you. All in due time...
To start normalizing our data we should give NodeList a way of finding the minimum and maximum values of each feature:
