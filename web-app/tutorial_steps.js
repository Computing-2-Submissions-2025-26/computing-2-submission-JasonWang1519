/*jslint browser: true */

const freeze_step = function (step) {
    return Object.freeze(step);
};

/**
 * Static tutorial slides used by the classic explanation mode.
 */
export const tutorial_rule_steps = Object.freeze([
    freeze_step({
        "phase": "rule_place_piece",
        "focus": "top_row",
        "text": (
            "Player 2 controls the Black Pieces. Black chooses a top-row " +
            "square for each new piece, using the mouse or the arrow keys " +
            "and Space."
        )
    }),
    freeze_step({
        "phase": "rule_king_moves",
        "focus": "king",
        "text": (
            "Player 1 controls the White Pieces. White guides the king " +
            "upward by clicking a dot, or by using W, A, S, D and Space."
        )
    }),
    freeze_step({
        "phase": "rule_pawn_wall",
        "focus": "danger_row",
        "text": (
            "The pawn wall keeps climbing. Stay off the wall and the row " +
            "just above it."
        )
    }),
    freeze_step({
        "phase": "rule_bishop_capture",
        "focus": "enemy_attacks",
        "text": (
            "The king can capture a black piece when it is left undefended."
        )
    }),
    freeze_step({
        "phase": "rule_bishop_defended",
        "focus": "enemy_attacks",
        "text": (
            "If another black piece protects it, that capture is no longer " +
            "safe."
        )
    }),
    freeze_step({
        "phase": "rule_stage_goal",
        "focus": "stage_goal",
        "text": (
            "Player 1 can use Eagle Vision to reveal danger, then Royal " +
            "Jump to give the king a longer leap when the path gets tight."
        )
    }),
    freeze_step({
        "phase": "rule_queen_wrath",
        "focus": "queen_phase",
        "text": (
            "When the counter reaches 12, the Grand Regent Queen enters and " +
            "Queen's Wrath joins Player 2's Black Pieces."
        )
    }),
    freeze_step({
        "phase": "rule_queen_goal",
        "focus": "queen_goal",
        "text": (
            "In the final duel, White must reach the highlighted row beneath " +
            "the royal guard."
        )
    })
]);

/**
 * Guided tutorial sequence. Each step describes the expected player action,
 * while the browser code controls the board setup and validation.
 */
export const tutorial_practice_steps = Object.freeze([
    freeze_step({
        "phase": "practice_crossing_story",
        "focus": "crossing_story",
        "action": "continue",
        "setup": "crossing_story",
        "text": (
            "The crossing begins with a simple rhythm: Player 2 controls " +
            "Black and places pressure from the top row, while Player 1 " +
            "controls White and guides the king upward."
        )
    }),
    freeze_step({
        "phase": "practice_place_pawn",
        "focus": "top_row",
        "action": "place_piece",
        "text": (
            "Player 2 moves first as the Black Pieces. Their pieces enter " +
            "from the top row, starting the repeating cycle of pawn, knight, " +
            "bishop. Place the opening pawn."
        )
    }),
    freeze_step({
        "phase": "practice_move_king",
        "focus": "king",
        "action": "move_king",
        "text": (
            "Player 1 answers as the White Pieces. Choose a safe dot for " +
            "the king and keep climbing toward the top of the board."
        )
    }),
    freeze_step({
        "phase": "practice_place_knight",
        "focus": "top_row",
        "action": "place_piece",
        "text": (
            "Player 2 continues the Black Pieces cycle. After the pawn " +
            "comes the knight. A knight protects L-shaped squares, so the " +
            "outlined file lets it defend the pawn from a distance."
        )
    }),
    freeze_step({
        "phase": "practice_eagle_vision",
        "focus": "stage_goal",
        "action": "eagle_vision",
        "text": (
            "When the board starts to feel crowded, White can call Eagle " +
            "Vision. Use it now to reveal the danger squares in blue."
        )
    }),
    freeze_step({
        "phase": "practice_move_after_vision",
        "focus": "king",
        "action": "move_king",
        "text": (
            "Now use what Eagle Vision showed you. Move the king to a safe " +
            "dot that avoids the blue danger."
        )
    }),
    freeze_step({
        "phase": "practice_place_bishop",
        "focus": "top_row",
        "action": "place_piece",
        "text": (
            "The third Player 2 piece is the bishop. The strongest bishop is " +
            "not just nearby: it works with the knight's L-shape so Black's " +
            "pieces protect each other."
        )
    }),
    freeze_step({
        "phase": "practice_royal_jump",
        "focus": "stage_goal",
        "action": "royal_jump",
        "text": (
            "White also has Royal Jump for tight moments. Use it now and the " +
            "king's normal dots will open into a wider gold jump range."
        )
    }),
    freeze_step({
        "phase": "practice_use_jump",
        "focus": "king",
        "action": "move_king",
        "text": (
            "Royal Jump only lasts for this move. Choose one of the gold " +
            "dots and leap before Black closes in."
        )
    }),
    freeze_step({
        "phase": "practice_queen_countdown_intro",
        "focus": "queen_meter",
        "action": "continue",
        "text": (
            "Those turns build toward the Grand Regent Queen. After 12 " +
            "turns, the board enters the final duel. Click when you are " +
            "ready to watch the route speed up from here."
        )
    }),
    freeze_step({
        "phase": "practice_queen_countdown",
        "focus": "queen_meter",
        "action": "watch_queen_countdown",
        "setup": "queen_countdown",
        "text": (
            "The route now accelerates toward turn 12. White keeps climbing " +
            "and uses abilities when the path gets tight."
        )
    }),
    freeze_step({
        "phase": "practice_endgame_goal",
        "focus": "queen_goal",
        "action": "continue",
        "setup": "queen_duel",
        "text": (
            "The final duel begins after 12 turns. Player 1 wins by " +
            "reaching the highlighted row beneath the royal guard. Player 2 " +
            "wins by trapping the king before that escape."
        )
    }),
    freeze_step({
        "phase": "practice_queens_wrath",
        "focus": "queen_phase",
        "action": "queens_wrath",
        "text": (
            "In the final duel, Player 2's Black Pieces gain Queen's " +
            "Wrath. Use it to call a rook onto the board and tighten the " +
            "net around the king."
        )
    }),
    freeze_step({
        "phase": "practice_place_rook",
        "focus": "queen_phase",
        "action": "spawn_wrath_rook",
        "text": (
            "Call the rook onto the outlined square. It helps Black close " +
            "space while the queen still keeps watch."
        )
    }),
    freeze_step({
        "phase": "practice_complete",
        "focus": "none",
        "action": "continue",
        "setup": "complete_notice",
        "text": (
            "You have completed the tutorial. Click anywhere to begin the " +
            "match."
        )
    })
]);
