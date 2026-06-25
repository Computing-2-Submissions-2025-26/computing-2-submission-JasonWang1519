import assert from "node:assert/strict";
import KingCrossing from "../KingCrossing.js";

const final_duel_game = function () {
    let game = KingCrossing.create_game();

    game = KingCrossing.place_piece(game, 0);
    game = KingCrossing.begin_queen_arrival(game);
    return KingCrossing.begin_queen_duel(game);
};

const with_state = function (game, changes) {
    return Object.freeze({
        ...game,
        ...changes
    });
};

const explain_game = function (game) {
    return JSON.stringify(game, null, 4);
};

const play_countdown_demo_turns = function () {
    let game = KingCrossing.create_game();
    let safety_counter = 0;

    while (
        game.result === "playing" &&
        game.phase !== "royal_guard_arrival" &&
        safety_counter < 80
    ) {
        if (game.phase === "place_piece") {
            const choice = KingCrossing.choose_countdown_piece_placement(game);
            game = KingCrossing.place_piece(game, choice.column);
        } else if (game.phase === "move_king") {
            const choice = KingCrossing.choose_countdown_king_move(game);
            game = KingCrossing.move_king_to(
                game,
                choice.position,
                choice.royal_jump === true
            );
        } else if (game.phase === "scroll_world") {
            game = KingCrossing.finish_forward_move(game);
        }

        safety_counter += 1;
    }

    return game;
};

const play_guided_tutorial_countdown = function () {
    let game = KingCrossing.create_game();
    let safety_counter = 0;

    // These are the player-guided tutorial moves before the fast-forward begins.
    // The countdown should continue from this board, not reset to a fresh game.
    game = KingCrossing.place_piece(game, 4);
    game = KingCrossing.move_king_to(game, {column: 4, row: 3});
    game = KingCrossing.finish_forward_move(game);
    game = KingCrossing.place_piece(game, 2);
    game = KingCrossing.move_king_to(game, {column: 4, row: 3});
    game = KingCrossing.finish_forward_move(game);
    game = KingCrossing.place_piece(game, 4);
    game = KingCrossing.move_king_to(game, {column: 4, row: 4}, true);
    game = KingCrossing.finish_forward_move(game);

    while (
        game.result === "playing" &&
        game.phase !== "royal_guard_arrival" &&
        safety_counter < 80
    ) {
        if (game.phase === "place_piece") {
            const choice = KingCrossing.choose_countdown_piece_placement(game);
            game = KingCrossing.place_piece(game, choice.column);
        } else if (game.phase === "move_king") {
            const choice = KingCrossing.choose_countdown_king_move(game);
            game = KingCrossing.move_king_to(
                game,
                choice.position,
                choice.royal_jump === true
            );
        } else if (game.phase === "scroll_world") {
            game = KingCrossing.finish_forward_move(game);
        }

        safety_counter += 1;
    }

    return game;
};

describe("King's Crossing", function () {
    it("reports display tokens for the starting pieces", function () {
        const game = KingCrossing.create_game();

        assert.equal(
            KingCrossing.cell_token(game, game.king),
            1
        );
        assert.equal(
            KingCrossing.cell_token(game, {column: 0, row: 0}),
            3
        );
    });

    it("leaves the game unchanged when an action is not legal", function () {
        const game = KingCrossing.create_game();
        const waiting_for_black = KingCrossing.move_king_to(
            game,
            {column: 4, row: 3}
        );

        assert.strictEqual(
            waiting_for_black,
            game,
            "White should not move before Black has placed a piece."
        );

        const ready_for_white = KingCrossing.place_piece(game, 0);
        const far_square = KingCrossing.move_king_to(
            ready_for_white,
            {column: 4, row: 7}
        );

        assert.strictEqual(
            far_square,
            ready_for_white,
            "The game module should reject a king move outside its range."
        );
    });

    it("allows a two-square king move only when Royal Jump is used", function () {
        const game = KingCrossing.place_piece(KingCrossing.create_game(), 0);
        const jump_square = {column: 6, row: 3};

        assert.strictEqual(
            KingCrossing.move_king_to(game, jump_square),
            game,
            "A two-square move should not be legal as a normal king move."
        );

        const jumped_game = KingCrossing.move_king_to(game, jump_square, true);

        assert.deepEqual(jumped_game.king, jump_square);
        assert.notStrictEqual(jumped_game, game);
    });

    it("scrolls by the upward distance of a Royal Jump", function () {
        const game = KingCrossing.place_piece(KingCrossing.create_game(), 0);
        const jump_square = {column: 4, row: 4};
        const jumped_game = KingCrossing.move_king_to(
            game,
            jump_square,
            true
        );
        const scrolled_game = KingCrossing.finish_forward_move(jumped_game);

        assert.equal(KingCrossing.pending_scroll_rows(jumped_game), 2);
        assert.deepEqual(
            scrolled_game.king,
            {column: 4, row: 2}
        );
        assert.equal(
            scrolled_game.turn,
            2,
            "A two-row climb should charge the queen counter by two."
        );
    });

    it("does not advance an ended game", function () {
        const ended_game = with_state(KingCrossing.create_game(), {
            phase: "ended",
            result: "won"
        });

        assert.strictEqual(
            KingCrossing.place_piece(ended_game, 0),
            ended_game,
            "Black should not place a piece after the game has ended."
        );
        assert.strictEqual(
            KingCrossing.begin_queen_arrival(ended_game),
            ended_game,
            "The queen arrival should not begin after the result is decided."
        );
        assert.strictEqual(
            KingCrossing.move_king_to(ended_game, {column: 4, row: 3}),
            ended_game,
            "White should not move after the result is decided."
        );
    });

    it("cycles Black Pieces through pawn, knight, and bishop", function () {
        let game = KingCrossing.create_game();

        game = KingCrossing.place_piece(game, 0);
        assert.equal(KingCrossing.cell_token(game, {column: 0, row: 8}), 3);
        assert.equal(game.next_piece, "knight");

        game = KingCrossing.move_king_to(game, {column: 3, row: 2});
        game = KingCrossing.move_king_to(game, {column: 4, row: 2});
        game = KingCrossing.place_piece(game, 1);
        assert.equal(KingCrossing.cell_token(game, {column: 1, row: 8}), 2);
        assert.equal(game.next_piece, "bishop");

        game = KingCrossing.move_king_to(game, {column: 3, row: 2});
        game = KingCrossing.move_king_to(game, {column: 4, row: 2});
        game = KingCrossing.place_piece(game, 2);
        assert.equal(KingCrossing.cell_token(game, {column: 2, row: 8}), 4);
        assert.equal(game.next_piece, "pawn");
    });

    it("allows the king to capture only undefended Black pieces", function () {
        const bishop_square = {column: 4, row: 3};
        const undefended_game = with_state(KingCrossing.create_game(), {
            phase: "move_king",
            king: {column: 4, row: 2},
            pieces: [
                {type: KingCrossing.BISHOP, column: 4, row: 3}
            ]
        });

        const captured_game = KingCrossing.move_king_to(
            undefended_game,
            bishop_square
        );

        assert.equal(
            captured_game.pieces.length,
            0,
            "The undefended bishop should be removed from the board.\n" +
            explain_game(captured_game)
        );
        assert.deepEqual(captured_game.king, bishop_square);

        const defended_game = with_state(undefended_game, {
            pieces: [
                {type: KingCrossing.BISHOP, column: 4, row: 3},
                {type: KingCrossing.KNIGHT, column: 3, row: 5}
            ]
        });

        assert.equal(
            KingCrossing.is_piece_defended(defended_game, bishop_square),
            true,
            "The knight should defend the bishop in this position."
        );
        assert.strictEqual(
            KingCrossing.move_king_to(defended_game, bishop_square),
            defended_game,
            "The king should not be allowed to take a defended bishop."
        );
    });

    it("allows Queen's Wrath to spawn a rook on a safe empty square", function () {
        const game = final_duel_game();
        const rook_position = {column: 0, row: 3};

        assert.equal(
            KingCrossing.can_spawn_wrath_rook(game, rook_position),
            true
        );

        const next_game = KingCrossing.spawn_wrath_rook(game, rook_position);

        assert.equal(next_game.phase, "move_king");
        assert.equal(
            KingCrossing.cell_token(next_game, rook_position),
            7
        );
    });

    it("prevents Queen's Wrath from directly checking the king", function () {
        const game = final_duel_game();

        assert.equal(
            KingCrossing.can_spawn_wrath_rook(game, {column: 0, row: 2}),
            false
        );
        assert.equal(
            KingCrossing.can_spawn_wrath_rook(game, {column: 4, row: 5}),
            false
        );
    });

    it("prevents Queen's Wrath from using occupied or blocked squares", function () {
        const game = final_duel_game();

        assert.equal(
            KingCrossing.can_spawn_wrath_rook(game, game.king),
            false
        );
        assert.equal(
            KingCrossing.can_spawn_wrath_rook(game, game.queen),
            false
        );
        assert.equal(
            KingCrossing.can_spawn_wrath_rook(game, {column: 0, row: 0}),
            false
        );
        assert.equal(
            KingCrossing.can_spawn_wrath_rook(game, {column: 0, row: 8}),
            false
        );
        assert.equal(
            KingCrossing.can_spawn_wrath_rook(game, {column: 0, row: 7}),
            false
        );
    });

    it("lets White win the final duel by reaching the royal guard row", function () {
        const game = with_state(KingCrossing.create_game(), {
            phase: "move_king",
            result: "playing",
            turn: 12,
            queen_active: true,
            royal_guard_active: true,
            king: {column: 4, row: 6},
            queen: {column: 0, row: 4},
            pieces: []
        });

        const won_game = KingCrossing.move_king_to(
            game,
            {column: 4, row: 7}
        );

        assert.equal(
            won_game.result,
            "won",
            "White should win by reaching the row under the royal guard.\n" +
            explain_game(won_game)
        );
    });

    it("lets the escape row beat queen control in the final duel", function () {
        const game = with_state(KingCrossing.create_game(), {
            phase: "move_king",
            result: "playing",
            turn: 12,
            queen_active: true,
            royal_guard_active: true,
            king: {column: 4, row: 6},
            queen: {column: 4, row: 4},
            pieces: []
        });

        const won_game = KingCrossing.move_king_to(
            game,
            {column: 4, row: 7}
        );

        assert.equal(
            won_game.result,
            "won",
            "Touching the row under the royal guard should end the crossing,\n" +
            "even if the queen controls that square.\n" +
            explain_game(won_game)
        );
    });

    it("chooses a legal queen action for the Black AI", function () {
        const game = final_duel_game();
        const action = KingCrossing.choose_ai_queen_action(game);

        assert.notEqual(action, undefined);

        if (action.type === "move_queen") {
            assert.equal(
                KingCrossing.is_queen_move_legal(game, action.position),
                true
            );
        } else {
            assert.equal(action.type, "spawn_wrath_rook");
            assert.equal(
                KingCrossing.can_spawn_wrath_rook(game, action.position),
                true
            );
        }
    });

    it("chooses a legal AI placement for Black Pieces", function () {
        const game = KingCrossing.create_game();
        const choice = KingCrossing.choose_ai_piece_placement(game);

        assert.equal(
            KingCrossing.can_place_piece(game, choice.column),
            true
        );
    });

    it("chooses a legal AI king move for White Pieces", function () {
        let game = KingCrossing.create_game();
        game = KingCrossing.place_piece(game, 4);

        const choice = KingCrossing.choose_ai_king_move(game);
        const legal_targets = KingCrossing.legal_king_targets(game);

        assert.equal(
            legal_targets.some(function (target) {
                return (
                    target.column === choice.position.column &&
                    target.row === choice.position.row
                );
            }),
            true
        );
    });

    it("plays the countdown demo through 12 turns without a reset", function () {
        const game = play_countdown_demo_turns();

        assert.equal(game.result, "playing");
        assert.equal(game.turn, game.target_turns);
        assert.equal(game.phase, "royal_guard_arrival");
    });

    it("continues the guided tutorial route into the queen arrival", function () {
        const game = play_guided_tutorial_countdown();

        assert.equal(game.result, "playing");
        assert.equal(game.turn, game.target_turns);
        assert.equal(game.phase, "royal_guard_arrival");
    });
});
