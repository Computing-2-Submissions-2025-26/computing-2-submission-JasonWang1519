# King's Crossing

King's Crossing is a chess-themed two-player survival game for Computing 2.

White Pieces guide the king upward through the crossing. Black Pieces place
threats on the top row and try to close the route before the king escapes. The
pawn wall advances from below whenever the king moves forward, so standing still
for too long becomes dangerous.

The game can be played as a two-player match or as a single-player match against
the built-in AI. In single player, choose either White Pieces or Black Pieces;
the AI takes the other side.

White Pieces are the harder side to play because the king has to keep finding
safe routes while Black Pieces, the pawn wall, and the queen counter all build
pressure.

## How to Play

- Black Pieces place one piece on the top row in a pawn, knight, bishop cycle.
- White Pieces move the king by clicking legal move dots, or by using `W`,
  `A`, `S`, and `D` to move the selector and `Space` to confirm.
- Black Pieces can use the mouse to place pieces, or use the left and right
  arrow keys to choose a top-row square and `Space` to confirm.
- Black pieces attack using chess-style movement.
- The king loses if it moves onto the pawn wall, into the pawn danger row, onto
  a black piece, or into an attacked square.
- The king can capture a black piece only when that piece is not defended.
- Eagle Vision reveals dangerous squares when charged.
- Royal Jump lets the king move up to two squares when charged. If the king
  climbs two rows, the pawn wall advances two rows as well, so the crossing
  keeps the same pressure.
- When the queen meter fills, the royal guard blocks the top row and the Grand
  Regent Queen arrives for the final duel. The queen arrives after 12 turns.
- During the final duel, Black Pieces can press `Tab` to switch between moving
  the queen and using Queen's Wrath. Use the arrow keys to choose a legal square
  and `Space` to confirm.
- Queen's Wrath places a rook on an empty square that does not immediately check
  the king.
- White Pieces win by reaching the row beneath the royal guard.

## Project Files

- `web-app/KingCrossing.js` contains the pure game rules and state transitions.
- `web-app/main.js` contains the browser UI, keyboard controls, tutorial, and
  animations.
- `web-app/tutorial_steps.js` contains the tutorial step data.
- `web-app/default.css` contains the board and interface styling.
- `web-app/tests/KingCrossing.test.js` contains focused rule tests.
- `Current_Standing_Rules.md` records the current intended rules.

The browser code asks the game module what moves are legal and then redraws the
interface. The rules for movement, captures, the queen duel, AI choices, and end
states are kept in `KingCrossing.js` so the game can also be played and tested
from code.

## Game Module API

The public API is in `web-app/KingCrossing.js`. It creates games, checks legal
moves, applies White and Black actions, runs the queen duel, gives AI choices,
and returns display information with `visible_state`.

## Game Module Implementation

The game module is written as pure state transitions. Illegal actions return the
unchanged game, ended games do not advance, and browser code does not decide the
rules directly.

## Unit Tests

The tests are grouped by behaviour: board display, king movement, Black
placement, capture rules, queen duel, AI choices, and the guided tutorial route.
There is also a route playtest for the countdown and final duel path.

## Web Application

The web app uses HTML for structure, CSS for presentation, and `main.js` for
browser behaviour. It supports mouse input, keyboard input, tutorial play,
two-player mode, single-player mode, animations, and result dialogs.

## Installation

- Clone the repository.
- Run `npm install` in the root directory to install the development tools.

## Running

The game opens the same way as the example coursework web apps:

- In VS Code, run `Run Web App - Firefox` from the Run and Debug panel.
- Or open `web-app/index.html` directly in Firefox.
- Or run `npm start` and open the address shown in the terminal.

Useful commands:

```sh
npm start
npm test
npm run playtest
npm run docs
```

## Manual Smoke Test

Before final submission, open the game in Firefox and check:

- the tutorial can be played and skipped;
- the two-player game starts correctly;
- single-player mode lets you choose White or Black;
- Royal Jump and Eagle Vision still work;
- the queen counter reaches the final duel;
- `npm test`, `npm run playtest`, and `npm run docs` complete successfully.
