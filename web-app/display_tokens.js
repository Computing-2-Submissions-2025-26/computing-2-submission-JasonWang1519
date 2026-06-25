const piece_symbols = Object.freeze([
    "",
    "♔",
    "♞",
    "♟",
    "♝",
    "♛",
    "♙",
    "♜"
]);

const piece_labels = Object.freeze([
    "Empty square",
    "White king",
    "Black knight",
    "Pursuing pawn wall",
    "Black bishop",
    "Grand Regent Queen",
    "Royal guard pawn",
    "Queen's Wrath rook"
]);

const player_types = Object.freeze({
    "1": "White Pieces",
    "2": "Black Pieces"
});

export {
    piece_labels,
    piece_symbols,
    player_types
};
