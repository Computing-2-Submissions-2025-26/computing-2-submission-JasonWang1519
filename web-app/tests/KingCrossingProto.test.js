import assert from "node:assert/strict";
import KingCrossing from "../KingCrossingProto.js";

const final_duel_game = function () {
    let game = KingCrossing.create_game();

    game = KingCrossing.place_piece(game, 0);
    game = KingCrossing.begin_queen_arrival(game);
    return KingCrossing.begin_queen_duel(game);
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
});
