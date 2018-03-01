# 2048

My version of the 2048 game that was written by Gabriele Cirulli originally
[here](https://gabrielecirulli.github.io/2048/).

How it works is described [here](<https://en.wikipedia.org/wiki/2048_(video_game)>).

There is now a completion panel for both losing and winning, with a restart button. 

It only inserts one number, except at the beginning, when two are inserted.
I'm not sure why I thought that it should always be two.

It's no longer possible to make more than one move between mnumbers being inserted.
The delay between redrawing after a move and inserting a new number and redrawing again 
was originally a debugging thing, but the effect is nice.

I have now added scoring. The score is added to whenever two blocks coalesce.
