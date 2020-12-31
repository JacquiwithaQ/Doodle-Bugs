# Doodle-Bugs
Doodle Bugs is a web-based puzzle game, playable at www.doodlebugs.art. The central feature is a drawing tool with ten colors, each of which has its own "bug" that users must discover. The game presents a series of images that users must draw, accounting for and making use of the tool's "bugs." Their drawings are auto-graded and accepted if they are close enough to the goal image and don't use too many strokes. The game is currently in beta. Feedback and questions can be sent to contact@doodlebugs.art.

## Tools
- Canvas: click and drag here to draw a stroke in your currently selected color
- Color Palette: click on a colored square here to select that color (the large square shows what's currently selected)
- Undo Button: click here up to 20 times to undo the latest clear action or stroke
- Clear Canvas Button: click here to remove all strokes from the canvas and reset the stroke counter
- Submit Button: click here to have your drawing graded for accuracy (if it fails, mistakes will be circled in red)
- Level Selection Window: your current level is shown with an arrow next to it; scroll to and click on another level to switch to it
- Show/Hide Color Blind Labels Button: click here to toggle color blind assistance, which labels every tool and stroke with a label A-J

## Currently Active "Bugs"
- Pink strokes are pushed by the cursor if it intersects them during subsequent strokes.
- Red strokes stick to the cursor until the next stroke starts.
- Orange strokes cannot be made if the cursor is moving from right to left (only left to right is allowed).
- Yellow strokes have a second copy of themselves rotated 180 degrees from where the stroke began.
- Brown strokes do not stop drawing until the next stroke starts, even if you release your click.
- Aqua strokes alternate between being aqua (even #s) and white (odd #s) whenever a subsequent stroke is added.
- Green strokes progessively un-draw themselves (starting from the beginning) during subsequent strokes.
- Blue strokes progressively un-draw previous strokes (starting from the beginning) as they are drawn.
- Purple strokes have gravity and fall to the bottom of the canvas when they are done being drawn.
- Black strokes are reflected vertically across the canvas' center line from the cursor.

## Credits
Doodle Bugs was primarily developed and is maintained by [Jacqui Fashimpaur](https://www.jacquifashimpaur.com). An early version of it appeared in [Puzzlehunt CMU's Spring 2020 Hunt](https://puzzlehunt.club.cc.cmu.edu/hunt/14/) under the name ["Stroke of Genius."](https://puzzlehunt.club.cc.cmu.edu/puzzle/11011/) This puzzle was co-written by Jacqui Fashimpaur and [Tom Wildenhain](http://tomwildenhain.com). The mechanic was inspired by [Ben Fry's fugpaint](https://benfry.com/fugpaint/).

## Disclaimer
I am providing the code in this repository under an open source license. Because this is my personal repository, the license you receive to my code is from me and not my employer (Facebook).
