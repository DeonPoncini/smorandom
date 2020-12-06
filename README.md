---
Title: Super Mario Odyssey Randomizer
Description: Randomizer for Super Mario Odyssey
Author: Deon Poncini

---
SMO Randomizer
==================
Available at http://smorandom.com

Description
-----------
This is a website that allows you to generate randomized moon sequences through
Super Mario Odyssey. It is a port of the [original randomizer](https://github.com/DeonPoncini/odyssey_randomizer)
written in Rust that did All Moons randomization and printed to console. The
implementation here is a straight port to TypeScript from Rust.
This updated version is hopefully much prettier, as well as providing options
for Any%, Dark Side, Darker Side, All Moons and having World Peace variants of
each other.

Current Moon Routing Assumptions
--------------------------------
This randomizer makes the following assumptions:

* If world peace is selected, don't leave until that moon is encountered in
a random walk of moons in the dependency graph
* There is no use of sequence breaks (IP Clip, Snow Dram, Lake Clip etc)
* Hint art moons require a visit to the kingdom with the art before hand
* Secret path moons just involve a visit to the kingdom that starts the secret
path, however its not the best as it doesn't require the visit to precede the
kingdom with the secret path moon, so you might have to travel
* In post game, you only need to collect one moon before potentially leaving
* Mushroom Achievement moons are collected in numerical order, although not
strictly necessary I wanted to sort them mostly to the end
* In the first playthrough of the kingdoms, there is no backtracking to previous
kingdoms, just simply visit each in sequence (with divergent routes randomly
chosen) until reaching Mushroom. In post game, travel from one kingdom to the
next is completely randomized
* Sub area moons are not generally tied together, so repeated visits to sub areas
are required

How does Kingdom Routing work?
------------------------------
Each kingdom has two functions that control routing, however this is only active
in pre-game (before the first visit to Mushroom). In post game, routing is
ignored and kingdom selection is random

    add_prerequisite(id: KingdomName);
    link_next(id: KingdomName);

The `add_prerequisite` function adds any kingdoms that must be visited before
this kingdom can be scheduled for routing.

The `link_next` function adds any kingdoms that can be visited next after this
current kingdom, and is used to select the next kingdoms that can be traveled to.
If you want to for example allow backtracking after a first kingdom visit, you
can alter this to add all previous kingdoms as potential next destinations.

When deciding whether to leave a kingdom, two functions are consulted

    can_leave(state: State): boolean;
    available(state: State): boolean;

The available function checks that the Kingdom is currently available to be
scheduled, which it does through checking the prerequisites are scheduled and
enough moons have been scheduled to unlock this kingdom (used for Dark Side and
Darker Side).

The `can_leave` function figures out if the we can leave the kingdom and visit
the next one. This is determined to see if the moon required to exit has been
scheduled, and also if we have enough moons scheduled to leave. During pre-game,
this is the amount of moons required by the game to go to the next kingdom. During
post game, this is currently set to one.

The concept of an exit moon is really only required once in the game, the Mecha
Broodal fight in Bowser's Kingdom. All other Kingdoms can simply be left after
getting the right number of moons. If World Peace option is selected,the exit
moon for each kingdom is set to be the World Peace conclusion moon.

How does Moon Routing work?
---------------------------
The moons in each kingdom are organized as a dependency graph. The moons are
scheduled according to these dependencies by getting a list of available moons
in each kingdom, scheduling them, and repeating until the Kingdom is exited.
The dependencies are controlled with the following functions:

    add_prereq_kingdom(kingdom: KingdomName);
    add_prereq_kingdom_count(kingdom: KingdomName, visited: number);
    add_prereq_moon(moon: MoonID);
    set_prereq_moon_count(count: number);

The `add_prereq_kingdom` function allows to put a dependency on visiting a
certain Kingdom before this moon is able to be scheduled. This is useful for
things like painting moons, as well as postgame moons that only unlock after
Mushroom is visited.

The `add_prereq_kingdom_count` function determines how many times a previous
kingdom needs to be visited before this moon will be available to schedule. This
is useful for things like hint art where the hint art picture is only available
post game, so requires two visits to the kingdom with the picture before the
moon is available.

The `add_prereq_moon` function lists a moon is a direct dependency. Many moons
require a previous moon to be received first before unlocking. If you want to
make it so sub area moons are tied together so you only visit a sub area once,
then you can make one a pre-req of another, for example.

The `set_prereq_moon_count` function sets how many moons must be scheduled before
this moon is available. Currently just used for the Mushroom achievement moons
for 100, 300 and 600 moons.

To determine what moons are available, the state machine executes the following

    return_available(state: State): Array<MoonID>;

Which determines what moons are available by checking if each moon is available
based on the criteria set by the above functions. These are then returned, and
a subset of them are randomly sorted and scheduled. This continues until the
kingdom is exited, and a new batch of available moons are dispatched.

How does non-All Moons work?
----------------------------
The original engine just did All Moons routing, so Any%, Dark and Darker Sides
are hacks on top of this, attempting to stop when reaching the right point.
For Any% and Dark Side, the leave chance is manipulated to always leave after
receiving the minimum number of moons required to leave a kingdom. In World Peace
it will keep going until the World Peace moon is scheduled, which being a random
walk means that technically all pre-game moons may be scheduled first. This can
lead to strange situations where Any% World Peace may schedule hundreds of moons.
The right way to fix this is to do a shortest path from world peace moon to the
edge of the dependency graph, and I might fix it one day.
When reaching the right target kingdom for Any% (Mushroom) it is terminated.
Note that Any% schedules moons in Moon Kingdom, which strictly isn't necessary,
the user can skip them if they please but I preferred it this way.
When reaching the target moon count in Dark and Darker Side, the kingdom scheduling
just clears the queue and schedules the kingdom and then terminates. Dark Side
visits itself twice before quitting because I always schedule Captain Toad ahead
of Rabbit Ridge, to stop people being a situation where you have to do the boss
rush twice. As the moon selection is random, even removing this dependency in
Dark Side might end up scheduling just Captain Toad and not Rabbit Ridge.
A fix for this might be to specify exactly the moon to schedule, but as no
mechanism exists for this I just left it as is, if you want to not grab the
Captain Toad moon it isn't a big deal. Something for the future fixes list.

How does World Peace work?
--------------------------
For world peace mode, the algorithm calculates the shortest path through the
graph using breadth first search from the moon needed to exit. This is named
the exit moon chain, and stored separately from the moons to schedule list.
When in world peace mode (or always for Bowser's Kingdom) and in pre-game, when
scheduling a moon it is checked if that moon is in the list of dependencies of
the World Peace moon. If so, it isn't scheduled. Then, when scheduling, the
scheduler randomly selects from the two lists - either randomly from available
moons, or just the next dependency moon. If the number of moons left to schedule
before exiting is equal to the length of dependent moons left, they are all
scheduled in order to ensure that world peace is achieved before the number of
total moons are met.

What is the seed format?
------------------------
The seed is constructed from two 32 bit numbers put together into a single 64
bit number. The first 32 bits are control bits - most of these are zero for
future expansion. The second 32 bits are the actual random number used to seed
the random number generator.
Currently these bits are used:
* First four bits are run type 0000: unset, 0001: Any% 0010: Dark Side
0011: Darker Side 0100: All Moons
* Fifth bit is world peace 0: no world peace 1: world peace
All the rest are currently unused, will be used if TODOs are implemented

TODO
----
* Allow saving of current marked off moons
* Add configuration parameter for leave chance (harded to 10% currently)
* Add configuration parameter for number of moons before trying to leave in post
game (currently hard coded to 1)
* Support Dark Side without Captain Toad moon
