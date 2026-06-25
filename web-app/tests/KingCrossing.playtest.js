import assert from "node:assert/strict";
import KingCrossing from "../KingCrossing.js";

const with_state = function (game, changes) {
    return Object.freeze(Object.assign({}, game, changes));
};

const finish_scroll_if_needed = function (game) {
    if (game.phase === "scroll_world") {
        return KingCrossing.finish_forward_move(game);
    }

    return game;
};

const play_to_queen_arrival = function () {
    let game = KingCrossing.create_game();
    let safety_counter = 0;

    while (
        game.result === "playing" &&
        game.phase !== "royal_guard_arrival" &&
        safety_counter < 80
    ) {
        if (game.phase === "place_piece") {
            game = KingCrossing.place_piece(
                game,
                KingCrossing.choose_countdown_piece_placement(game).column
            );
        } else if (game.phase === "move_king") {
            const choice = KingCrossing.choose_countdown_king_move(game);

            game = KingCrossing.move_king_to(
                game,
                choice.position,
                choice.royal_jump === true
            );
        }

        game = finish_scroll_if_needed(game);
        safety_counter += 1;
    }

    return game;
};

const play_to_final_duel = function () {
    const arrival_game = play_to_queen_arrival();

    return KingCrossing.begin_queen_duel(
        KingCrossing.begin_queen_arrival(arrival_game)
    );
};

const playtest = function (name, action) {
    try {
        action();
        console.log(`PASS ${name}`);
    } catch (error) {
        console.error(`FAIL ${name}`);
        throw error;
    }
};

playtest("the countdown route reaches the Grand Regent Queen", function () {
    const game = play_to_queen_arrival();

    assert.equal(game.result, "playing");
    assert.equal(game.turn, game.target_turns);
    assert.equal(game.phase, "royal_guard_arrival");
});

playtest("a full route reaches a playable final duel", function () {
    const game = play_to_final_duel();

    assert.equal(game.result, "playing");
    assert.equal(game.phase, "move_queen");
    assert.equal(game.queen_active, true);
    assert.equal(game.royal_guard_active, true);
});

playtest("the escape row wins even if the queen controls it", function () {
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
    const won_game = KingCrossing.move_king_to(game, {column: 4, row: 7});

    assert.equal(won_game.result, "won");
});
