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
- `web-app/default.css` contains the board and interface styling.
- `web-app/tests/KingCrossing.test.js` contains focused rule tests.

The browser code asks the game module what moves are legal and then redraws the
interface. The rules for movement, captures, the queen duel, AI choices, and end
states are kept in `KingCrossing.js` so the game can also be played and tested
from code.

## Installation

- Clone the repository.
- Run `npm install` in the root directory to install the development tools.

## Running

The game opens the same way as the example coursework web apps:

- In VS Code, run `Run Web App - Firefox` from the Run and Debug panel.
- Or open `web-app/index.html` directly in Firefox.
- If a browser blocks local module files, serve the `web-app` folder with a
  static server and open the local address.

Useful commands:

```sh
npm test
npm run docs
```
