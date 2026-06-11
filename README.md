# King's Crossing

King's Crossing is a chess-themed two-player survival game for Computing 2.

White Pieces guide the king upward through the crossing. Black Pieces place
threats on the top row and try to close the route before the king escapes. The
pawn wall advances from below whenever the king moves forward, so standing still
for too long becomes dangerous.

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
- Royal Jump lets the king move up to two squares when charged.
- When the queen meter fills, the royal guard blocks the top row and the Grand
  Regent Queen arrives for the final duel.
- During the final duel, Black Pieces can press `Tab` to switch between moving
  the queen and using Queen's Wrath. Use the arrow keys to choose a legal square
  and `Space` to confirm.
- Queen's Wrath places a rook on an empty square that does not immediately check
  the king.
- White Pieces win by reaching the row beneath the royal guard.

## Project Files

- `web-app/KingCrossingProto.js` contains the pure game rules and state transitions.
- `web-app/mainProto.js` contains the browser UI, keyboard controls, tutorial, and
  animations.
- `web-app/defaultProto.css` contains the board and interface styling.
- `web-app/tests/KingCrossingProto.test.js` contains focused rule tests.

## Running

Open `web-app/index.html` in a browser, or serve the folder with a local static
server.

Useful commands:

```sh
npm test
npm run docs
```
