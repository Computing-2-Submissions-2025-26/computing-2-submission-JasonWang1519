# King's Crossing

King's Crossing is a chess-themed two-player survival game for Computing 2.

Player 1 controls the escaping king and tries to cross the board. Player 2
controls the enemy court by placing chess pieces in the king's path. The pawn
wall advances from below whenever the king moves forward, so standing still for
too long becomes dangerous.

## How to Play

- Player 2 places alternating knights and bishops on the top row.
- Player 1 moves the king with `Q`, `W`, `E`, `A`, `D`, and `S`, or by clicking
  legal move dots.
- Enemy pieces attack using chess-style movement.
- The king loses if it moves onto the pawn wall, into the pawn danger row, onto
  an enemy piece, or into an attacked square.
- The king can capture an enemy piece only when that piece is not defended.
- Eagle Vision reveals dangerous squares when charged.
- Royal Jump lets the king move up to two squares when charged.
- When the queen meter fills, the royal guard blocks the top row and the Grand
  Regent Queen arrives for the final duel.
- During the final duel, Player 2 can move the queen or use Queen's Wrath to
  place a rook on an empty square that does not immediately check the king.
- Player 1 wins by reaching the row beneath the royal guard.

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
