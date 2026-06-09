/*jslint browser */
import KingCrossing from "./KingCrossingProto.js?v=piece-cycle-3";

const piece_symbols = [
    "",
    "♔",
    "♞",
    "♟",
    "♝",
    "♛",
    "♙",
    "♜"
];

const piece_labels = [
    "Empty square",
    "Escaping king",
    "Enemy knight",
    "Pursuing pawn wall",
    "Enemy bishop",
    "Grand Regent Queen",
    "Royal guard pawn",
    "Queen's Wrath rook"
];

const player_types = {
    "1": "Escaping King",
    "2": "Enemy Court"
};

const visual_extra_top_rows = 1;
const visual_extra_bottom_rows = 1;

const opening_king_step_delay = 270;
const opening_pawn_step_delay = 168;
const opening_finish_delay = 400;

const pawn_wave_step_delay = 90;
const pawn_wave_finish_delay = 180;
const board_scroll_delay = 450;
const defeat_reveal_delay = 3000;

const royal_guard_step_delay = 150;
const royal_guard_finish_delay = 350;
const queen_disposal_step_delay = 260;
const queen_final_drop_delay = 500;

const eagle_vision_max_charge = 3;
const royal_jump_max_charge = 5;

const el = function (id) {
    return document.getElementById(id);
};

const range = function (start, end) {
    const values = [];
    let value = start;

    while (value < end) {
        values.push(value);
        value += 1;
    }

    return values;
};

const reverse = function (values) {
    return values.slice().reverse();
};

const game_board = el("game_board");
const result_dialog = el("result_dialog");

let game = KingCrossing.create_game();

let input_locked = true;
let result_pending = false;

let pawn_wave_active = false;
let pawn_wave_column = -1;
let pawn_wave_timer;

let result_timer;

let opening_active = false;
let opening_phase = "none";
let opening_king_row = -1;
let opening_pawn_column = -1;
let opening_timer;

let royal_guard_arrival_active = false;
let royal_guard_arrival_started = false;
let royal_guard_column = -1;
let royal_guard_timer;

let queen_arrival_active = false;
let queen_arrival_started = false;
let queen_removed_positions = [];
let queen_animation_position = undefined;
let queen_arrival_timer;

let eagle_vision_active = false;
let eagle_vision_charge = eagle_vision_max_charge;

let royal_jump_active = false;
let royal_jump_charge = royal_jump_max_charge;

let queens_wrath_active = false;

let hovered_column = undefined;
let hovered_position = undefined;

let tutorial_active = true;
let tutorial_phase = "title";
let tutorial_focus = "none";
let tutorial_step_index = 0;
let tutorial_timer;
let tutorial_animation_timer;
let tutorial_animation_start = 0;
let tutorial_pointer_down = undefined;

el("title").textContent = "King's Crossing";
el("home_player_type").textContent = player_types["1"];
el("away_player_type").textContent = player_types["2"];
el("home_ready").textContent = "The king enters the crossing...";
el("away_ready").textContent = "The enemy court waits.";

const instructions_button = document.createElement("button");
instructions_button.id = "instructions_button";
instructions_button.type = "button";
instructions_button.textContent = "Instructions";
document.body.append(instructions_button);

const eagle_vision_button = document.createElement("button");
eagle_vision_button.id = "eagle_vision_button";
eagle_vision_button.type = "button";
eagle_vision_button.innerHTML = `
    <span id="eagle_vision_label">Eagle Vision</span>
    <span id="eagle_vision_status">Ready</span>
    <span id="eagle_vision_bar">
        <span id="eagle_vision_fill"></span>
    </span>
`;
document.body.append(eagle_vision_button);

const royal_jump_button = document.createElement("button");
royal_jump_button.id = "royal_jump_button";
royal_jump_button.type = "button";
royal_jump_button.innerHTML = `
    <span id="royal_jump_label">Royal Jump</span>
    <span id="royal_jump_status">Ready</span>
    <span id="royal_jump_bar">
        <span id="royal_jump_fill"></span>
    </span>
`;
document.body.append(royal_jump_button);

const queens_wrath_button = document.createElement("button");
queens_wrath_button.id = "queens_wrath_button";
queens_wrath_button.type = "button";
queens_wrath_button.innerHTML = `
    <span id="queens_wrath_label">Queen's Wrath</span>
    <span id="queens_wrath_status">Final duel</span>
`;
document.body.append(queens_wrath_button);

const queen_progress_panel = document.createElement("section");
queen_progress_panel.id = "queen_progress_panel";
queen_progress_panel.innerHTML = `
    <span id="queen_progress_label">Grand Regent Queen</span>
    <span id="queen_progress_status">0/12</span>
    <span id="queen_progress_bar">
        <span id="queen_progress_fill"></span>
    </span>
`;
document.body.append(queen_progress_panel);

const instructions_dialog = document.createElement("dialog");
instructions_dialog.id = "instructions_dialog";
instructions_dialog.innerHTML = `
    <section id="instructions_card">
        <h2>How to Play</h2>
        <p><strong>Player 1:</strong> guide the king across the board.</p>
        <p><strong>Player 2:</strong> place the next enemy piece on the top row.</p>
        <p>If the top row is completely sealed, <strong>Player 2 wins</strong>.</p>
        <p>Move the king with <strong>Q W E</strong> to go forward, <strong>A D</strong> to dodge sideways, and <strong>S</strong> to move backwards.</p>
        <p><strong>Eagle Vision:</strong> reveal dangerous squares until the king's next move.</p>
        <p><strong>Royal Jump:</strong> when charged, the king can move up to two squares.</p>
        <p>Gold dots show movement range, not guaranteed safety.</p>
        <p>When the queen meter fills, Player 2 summons the royal guard and the Grand Regent Queen.</p>
        <p><strong>Queen's Wrath:</strong> in the final duel, Player 2 can place a rook on an empty square that does not immediately check the king.</p>
        <p>The king cannot capture the queen directly. Reach the row beneath the white royal guard to win.</p>
        <p class="click_hint">Click anywhere to close.</p>
    </section>
`;
document.body.append(instructions_dialog);

const tutorial_title_screen = document.createElement("div");
tutorial_title_screen.id = "tutorial_title_screen";
tutorial_title_screen.innerHTML = `
    <span id="tutorial_title_text">King's Crossing</span>
    <span id="tutorial_title_hint">Click anywhere to proceed.</span>
`;
document.body.append(tutorial_title_screen);

const tutorial_duel_screen = document.createElement("div");
tutorial_duel_screen.id = "tutorial_duel_screen";
tutorial_duel_screen.className = "hidden";
tutorial_duel_screen.innerHTML = `
    <span id="tutorial_duel_heading">A Two Player Game</span>
    <span id="tutorial_duel_layout">
        <span class="tutorial_player_card">
            <span class="tutorial_white_piece">♔</span>
            <span class="tutorial_player_label">Player 1</span>
        </span>
        <span class="tutorial_player_card">
            <span class="tutorial_black_pieces">♟ ♞ ♝ ♛ ♜</span>
            <span class="tutorial_player_label">Player 2</span>
        </span>
    </span>
    <span id="tutorial_duel_hint">Click anywhere to begin.</span>
`;
document.body.append(tutorial_duel_screen);

const tutorial_control_button = document.createElement("button");
tutorial_control_button.id = "tutorial_control_button";
tutorial_control_button.type = "button";
tutorial_control_button.textContent = "Skip tutorial";
document.body.append(tutorial_control_button);

const tutorial_text = document.createElement("div");
tutorial_text.id = "tutorial_text";
tutorial_text.className = "hidden";
document.body.append(tutorial_text);

const tutorial_rule_steps = Object.freeze([
    Object.freeze({
        "phase": "rule_place_piece",
        "focus": "top_row",
        "text": (
            "Player 2 places one enemy on the top row. The cycle is pawn, " +
            "knight, bishop, then pawn again."
        )
    }),
    Object.freeze({
        "phase": "rule_king_moves",
        "focus": "king",
        "text": (
            "Player 1 moves the king with Q, W, E, A, S, and D. The king " +
            "can step to any nearby dot."
        )
    }),
    Object.freeze({
        "phase": "rule_pawn_wall",
        "focus": "danger_row",
        "text": (
            "The pawn wall chases from below. The pawn row and the row above " +
            "it are unsafe."
        )
    }),
    Object.freeze({
        "phase": "rule_bishop_capture",
        "focus": "enemy_attacks",
        "text": (
            "If a bishop is undefended, the king can capture it by stepping " +
            "onto the bishop's square."
        )
    }),
    Object.freeze({
        "phase": "rule_bishop_defended",
        "focus": "enemy_attacks",
        "text": (
            "Now Player 2 places a knight two up and one left from the bishop. " +
            "That knight defends the bishop, so the king cannot capture it."
        )
    }),
    Object.freeze({
        "phase": "rule_stage_goal",
        "focus": "stage_goal",
        "text": (
            "Climb upward to scroll the board. Eagle Vision shows danger, " +
            "and Royal Jump can leap two squares."
        )
    }),
    Object.freeze({
        "phase": "rule_queen_phase",
        "focus": "queen_phase",
        "text": (
            "When the queen meter fills, phase 2 begins. The queen moves in " +
            "straight or diagonal lines, Queen's Wrath can add a safe rook, " +
            "and the king wins by reaching the row beneath the royal guard."
        )
    })
]);

const same_position = function (first, second) {
    return (
        first !== undefined &&
        second !== undefined &&
        first.column === second.column &&
        first.row === second.row
    );
};

const square_colour_class = function (position) {
    if ((position.column + position.row + game.turn) % 2 === 0) {
        return "light_square";
    }

    return "dark_square";
};

const clear_all_timers = function () {
    clearTimeout(pawn_wave_timer);
    clearTimeout(opening_timer);
    clearTimeout(result_timer);
    clearTimeout(royal_guard_timer);
    clearTimeout(queen_arrival_timer);
    clearTimeout(tutorial_timer);
    clearInterval(tutorial_animation_timer);
};

const reset_game_state = function () {
    clear_all_timers();

    game_board.classList.add("no_scroll_transition");
    game_board.classList.remove("board_scroll_animation");

    game = KingCrossing.create_game();

    input_locked = true;
    result_pending = false;

    pawn_wave_active = false;
    pawn_wave_column = -1;

    opening_active = false;
    opening_phase = "none";
    opening_king_row = -1;
    opening_pawn_column = -1;

    royal_guard_arrival_active = false;
    royal_guard_arrival_started = false;
    royal_guard_column = -1;

    queen_arrival_active = false;
    queen_arrival_started = false;
    queen_removed_positions = [];
    queen_animation_position = undefined;

    eagle_vision_active = false;
    eagle_vision_charge = eagle_vision_max_charge;

    royal_jump_active = false;
    royal_jump_charge = royal_jump_max_charge;

    queens_wrath_active = false;

    hovered_column = undefined;
    hovered_position = undefined;

    if (result_dialog.open) {
        result_dialog.close();
    }

    game_board.offsetHeight;

    setTimeout(function () {
        game_board.classList.remove("no_scroll_transition");
    }, 0);
};

const hide_tutorial_layers = function () {
    tutorial_title_screen.classList.add("hidden");
    tutorial_duel_screen.classList.add("hidden");
    tutorial_text.classList.add("hidden");
    document.body.classList.remove("tutorial_start_mode");
    document.body.classList.remove("tutorial_board_focus_mode");
    document.body.classList.remove("tutorial_focus_abilities");
    document.body.classList.remove("tutorial_focus_queen_meter");
    tutorial_focus = "none";
    tutorial_step_index = 0;
    clearInterval(tutorial_animation_timer);
};

const update_tutorial_focus_class = function () {
    document.body.classList.toggle(
        "tutorial_focus_abilities",
        tutorial_focus === "stage_goal" ||
        tutorial_focus === "queen_phase"
    );
    document.body.classList.toggle(
        "tutorial_focus_queen_meter",
        tutorial_focus === "queen_phase"
    );
};

const complete_tutorial = function () {
    clearTimeout(tutorial_timer);

    tutorial_active = false;
    tutorial_phase = "completed";
    tutorial_focus = "none";
    tutorial_step_index = 0;

    hide_tutorial_layers();

    tutorial_control_button.textContent = "Tutorial";
    input_locked = false;
    redraw_board();
};

const skip_tutorial_to_game = function () {
    reset_game_state();

    tutorial_active = false;
    tutorial_phase = "completed";
    tutorial_focus = "none";
    tutorial_step_index = 0;

    hide_tutorial_layers();

    tutorial_control_button.textContent = "Tutorial";
    start_opening_animation();
};

const start_tutorial_title = function () {
    reset_game_state();

    tutorial_active = true;
    tutorial_phase = "title";
    tutorial_focus = "none";
    tutorial_step_index = 0;

    tutorial_control_button.textContent = "Skip tutorial";

    tutorial_title_screen.classList.remove("hidden");
    tutorial_duel_screen.classList.add("hidden");
    tutorial_text.classList.add("hidden");
    document.body.classList.add("tutorial_start_mode");
    document.body.classList.remove("tutorial_board_focus_mode");

    input_locked = true;
    redraw_board();
};

const start_tutorial_at_duel_intro = function () {
    reset_game_state();

    tutorial_active = true;
    tutorial_phase = "duel_intro";
    tutorial_focus = "none";
    tutorial_step_index = 0;

    tutorial_control_button.textContent = "Skip tutorial";

    tutorial_title_screen.classList.add("hidden");
    tutorial_duel_screen.classList.remove("hidden");
    tutorial_text.classList.add("hidden");
    document.body.classList.add("tutorial_start_mode");
    document.body.classList.remove("tutorial_board_focus_mode");

    input_locked = true;
    redraw_board();
};

const start_tutorial_duel_intro = function () {
    tutorial_phase = "duel_intro";

    tutorial_title_screen.classList.add("hidden");
    tutorial_duel_screen.classList.remove("hidden");
    tutorial_text.classList.add("hidden");
    document.body.classList.add("tutorial_start_mode");
    document.body.classList.remove("tutorial_board_focus_mode");
};

const start_tutorial_king_opening = function () {
    tutorial_phase = "king_opening";

    tutorial_duel_screen.classList.add("hidden");
    tutorial_text.classList.add("hidden");
    document.body.classList.remove("tutorial_start_mode");
    document.body.classList.remove("tutorial_board_focus_mode");

    opening_active = true;
    opening_phase = "king";
    opening_king_row = -1;
    opening_pawn_column = -1;
    input_locked = true;

    redraw_board();

    opening_timer = setTimeout(
        continue_opening_king_run,
        opening_king_step_delay
    );
};

const show_pawn_chase_spotlight = function () {
    if (!tutorial_active) {
        return;
    }

    clearTimeout(tutorial_timer);

    tutorial_phase = "pawn_chase";
    tutorial_focus = "pawns";

    tutorial_text.textContent = (
        "Player 2's pawns will keep chasing the king up the board."
    );
    tutorial_text.classList.remove("hidden");
    document.body.classList.add("tutorial_board_focus_mode");

    opening_phase = "pawns";
    opening_pawn_column = -1;

    redraw_board();

    opening_timer = setTimeout(
        continue_opening_pawn_wave,
        opening_pawn_step_delay
    );
};

const show_current_tutorial_rule = function () {
    const step = tutorial_rule_steps[tutorial_step_index];

    clearInterval(tutorial_animation_timer);

    if (step === undefined) {
        complete_tutorial();
        return;
    }

    tutorial_phase = step.phase;
    tutorial_focus = step.focus;
    tutorial_text.textContent = step.text;
    tutorial_text.classList.remove("hidden");
    document.body.classList.remove("tutorial_start_mode");
    document.body.classList.add("tutorial_board_focus_mode");
    update_tutorial_focus_class();

    if (tutorial_phase === "rule_place_piece") {
        tutorial_animation_start = Date.now();
        tutorial_animation_timer = setInterval(redraw_board, 120);
    }

    input_locked = true;
    redraw_board();
};

const start_tutorial_rules = function () {
    tutorial_step_index = 0;
    show_current_tutorial_rule();
};

const advance_tutorial_rule = function () {
    tutorial_step_index += 1;
    show_current_tutorial_rule();
};

const show_player_one_spotlight = function () {
    if (!tutorial_active) {
        return;
    }

    tutorial_phase = "player_one";
    tutorial_focus = "king";

    tutorial_text.textContent = (
        "Player 1 controls the white king and is trying to escape upward."
    );
    tutorial_text.classList.remove("hidden");
    document.body.classList.add("tutorial_board_focus_mode");

    redraw_board();
};

const tutorial_click = function () {
    if (!tutorial_active) {
        start_tutorial_title();
        return;
    }

    if (tutorial_phase === "title") {
        start_tutorial_duel_intro();
        return;
    }

    if (tutorial_phase === "duel_intro") {
        start_tutorial_king_opening();
        return;
    }

    if (tutorial_phase === "player_one") {
        show_pawn_chase_spotlight();
        return;
    }

    if (tutorial_phase === "pawn_chase" && !opening_active) {
        start_tutorial_rules();
        return;
    }

    if (tutorial_phase.indexOf("rule_") === 0) {
        advance_tutorial_rule();
    }
};

const is_click_on_tutorial_control = function (event) {
    return (
        event.target === tutorial_control_button ||
        tutorial_control_button.contains(event.target)
    );
};

document.addEventListener("pointerdown", function (event) {
    if (!tutorial_active) {
        return;
    }

    if (is_click_on_tutorial_control(event)) {
        return;
    }

    if (event.button !== 0 || event.isPrimary === false) {
        tutorial_pointer_down = undefined;
        return;
    }

    tutorial_pointer_down = {
        "x": event.clientX,
        "y": event.clientY,
        "target": event.target
    };
});

document.addEventListener("pointerup", function (event) {
    const pointer_down = tutorial_pointer_down;
    tutorial_pointer_down = undefined;

    if (!tutorial_active || pointer_down === undefined) {
        return;
    }

    if (is_click_on_tutorial_control(event)) {
        return;
    }

    if (event.button !== 0 || event.isPrimary === false) {
        return;
    }

    if (
        Math.abs(event.clientX - pointer_down.x) > 6 ||
        Math.abs(event.clientY - pointer_down.y) > 6
    ) {
        return;
    }

    event.preventDefault();
    tutorial_click();
});

tutorial_control_button.onclick = function (event) {
    event.preventDefault();
    event.stopPropagation();

    if (tutorial_active) {
        skip_tutorial_to_game();
        return;
    }

    start_tutorial_at_duel_intro();
};

const direction_step = function (value) {
    if (value > 0) {
        return 1;
    }

    if (value < 0) {
        return -1;
    }

    return 0;
};

const bishop_attack_path = function () {
    const attacker = game.attacker;
    const king = game.king;
    const column_difference = king.column - attacker.column;
    const row_difference = king.row - attacker.row;
    const column_step = direction_step(column_difference);
    const row_step = direction_step(row_difference);
    const path = [];

    let current = {
        "column": attacker.column,
        "row": attacker.row
    };

    if (Math.abs(column_difference) !== Math.abs(row_difference)) {
        return [attacker, king];
    }

    while (!same_position(current, king)) {
        path.push(current);

        current = {
            "column": current.column + column_step,
            "row": current.row + row_step
        };
    }

    path.push(king);
    return path;
};

const queen_attack_path = function () {
    const attacker = game.attacker;
    const king = game.king;
    const column_difference = king.column - attacker.column;
    const row_difference = king.row - attacker.row;
    const column_step = direction_step(column_difference);
    const row_step = direction_step(row_difference);
    const path = [];

    let current = {
        "column": attacker.column,
        "row": attacker.row
    };

    if (
        column_difference !== 0 &&
        row_difference !== 0 &&
        Math.abs(column_difference) !== Math.abs(row_difference)
    ) {
        return [attacker, king];
    }

    while (!same_position(current, king)) {
        path.push(current);

        current = {
            "column": current.column + column_step,
            "row": current.row + row_step
        };
    }

    path.push(king);
    return path;
};

const attack_path = function () {
    if (
        game.result !== "lost" ||
        game.attacker === undefined
    ) {
        return [];
    }

    if (game.attacker.type === "bishop") {
        return bishop_attack_path();
    }

    if (game.attacker.type === "queen") {
        return queen_attack_path();
    }

    if (game.attacker.type === "rook") {
        return queen_attack_path();
    }

    return [game.attacker, game.king];
};

const is_attack_path_square = function (position) {
    return attack_path().some(function (path_position) {
        return same_position(path_position, position);
    });
};

const is_attacking_piece = function (position) {
    return (
        game.attacker !== undefined &&
        same_position(game.attacker, position)
    );
};

const is_queen_removed_position = function (position) {
    return queen_removed_positions.some(function (removed_position) {
        return same_position(removed_position, position);
    });
};

const queen_final_position = function () {
    return {
        "column": Math.floor(game.width / 2),
        "row": game.height - 3
    };
};

const is_queen_animation_square = function (position) {
    return (
        queen_arrival_active &&
        queen_animation_position !== undefined &&
        same_position(position, queen_animation_position)
    );
};

const is_royal_guard_source_square = function (position) {
    return (
        royal_guard_arrival_active &&
        position.row === game.height &&
        position.column > royal_guard_column
    );
};

const is_royal_guard_target_square = function (position) {
    return (
        royal_guard_arrival_active &&
        position.row === game.height - 1 &&
        position.column <= royal_guard_column
    );
};

const is_opening_king_square = function (position) {
    return (
        opening_active &&
        opening_phase === "king" &&
        position.column === game.king.column &&
        position.row === opening_king_row
    );
};

const is_opening_pawn_source_square = function (position) {
    return (
        opening_active &&
        opening_phase === "pawns" &&
        position.row === -1 &&
        position.column > opening_pawn_column
    );
};

const is_opening_pawn_target_square = function (position) {
    return (
        opening_active &&
        opening_phase === "pawns" &&
        position.row === 0 &&
        position.column <= opening_pawn_column
    );
};

const is_pawn_wave_source_square = function (position) {
    return (
        pawn_wave_active &&
        position.row === 0 &&
        position.column <= pawn_wave_column
    );
};

const is_pawn_wave_target_square = function (position) {
    return (
        pawn_wave_active &&
        position.row === 1 &&
        position.column <= pawn_wave_column
    );
};

const is_extra_top_row = function (position) {
    return position.row >= game.height;
};

const is_extra_bottom_row = function (position) {
    return position.row < 0;
};

const is_tutorial_king_focus_square = function (position) {
    return (
        tutorial_active &&
        tutorial_focus === "king" &&
        same_position(position, game.king)
    );
};

const is_tutorial_pawn_focus_square = function (position) {
    return (
        tutorial_active &&
        tutorial_focus === "pawns" &&
        position.row === 0
    );
};

const is_tutorial_top_row_focus_square = function (position) {
    return (
        tutorial_active &&
        tutorial_focus === "top_row" &&
        position.row === game.height - 1
    );
};

const is_tutorial_danger_focus_square = function (position) {
    return (
        tutorial_active &&
        tutorial_focus === "danger_row" &&
        (position.row === 0 || position.row === 1)
    );
};

const is_tutorial_queen_goal_focus_square = function (position) {
    return (
        tutorial_active &&
        tutorial_focus === "queen_phase" &&
        position.row === game.height - 2
    );
};

const is_tutorial_stage_goal_square = function (position) {
    return false;
};

const tutorial_knight_position = function () {
    return {"column": 1, "row": game.height - 1};
};

const tutorial_placing_knight_position = function () {
    const elapsed = (Date.now() - tutorial_animation_start) % 4200;
    const columns = (
        elapsed < 900
        ? [0, 1, 2]
        : elapsed < 1900
        ? [3, 4, 5, 6]
        : elapsed < 2900
        ? [5, 4, 3, 2]
        : [1]
    );
    const step = Math.floor(elapsed / 300) % columns.length;

    return {"column": columns[step], "row": game.height - 1};
};

const tutorial_bishop_position = function () {
    return {"column": 2, "row": 6};
};

const tutorial_capture_king_position = function () {
    return {"column": 2, "row": 5};
};

const tutorial_queen_position = function () {
    return {"column": 4, "row": 6};
};

const tutorial_rook_position = function () {
    return {"column": 1, "row": 5};
};

const tutorial_stage_bishop_position = function () {
    return {"column": game.king.column + 2, "row": 6};
};

const tutorial_stage_knight_position = function () {
    return {"column": game.king.column - 2, "row": 6};
};

const tutorial_positions_include = function (positions, position) {
    return positions.some(function (test_position) {
        return same_position(position, test_position);
    });
};

const tutorial_ray_squares = function (origin, directions) {
    return directions.reduce(function (squares, direction) {
        let current = {
            "column": origin.column + direction.column,
            "row": origin.row + direction.row
        };

        while (is_inside_board(current)) {
            squares.push(current);
            current = {
                "column": current.column + direction.column,
                "row": current.row + direction.row
            };
        }

        return squares;
    }, []);
};

const tutorial_knight_attack_squares = function () {
    const knight = tutorial_knight_position();

    return [
        {"column": -2, "row": -1},
        {"column": -2, "row": 1},
        {"column": -1, "row": -2},
        {"column": -1, "row": 2},
        {"column": 1, "row": -2},
        {"column": 1, "row": 2},
        {"column": 2, "row": -1},
        {"column": 2, "row": 1}
    ].map(function (offset) {
        return {
            "column": knight.column + offset.column,
            "row": knight.row + offset.row
        };
    }).filter(is_inside_board);
};

const tutorial_bishop_attack_squares = function () {
    return tutorial_ray_squares(tutorial_bishop_position(), [
        {"column": -1, "row": -1},
        {"column": -1, "row": 1},
        {"column": 1, "row": -1},
        {"column": 1, "row": 1}
    ]);
};

const tutorial_rook_attack_squares = function () {
    return tutorial_ray_squares(tutorial_rook_position(), [
        {"column": -1, "row": 0},
        {"column": 1, "row": 0},
        {"column": 0, "row": -1},
        {"column": 0, "row": 1}
    ]);
};

const tutorial_queen_attack_squares = function () {
    return tutorial_ray_squares(tutorial_queen_position(), [
        {"column": -1, "row": -1},
        {"column": -1, "row": 0},
        {"column": -1, "row": 1},
        {"column": 0, "row": -1},
        {"column": 0, "row": 1},
        {"column": 1, "row": -1},
        {"column": 1, "row": 0},
        {"column": 1, "row": 1}
    ]);
};

const tutorial_queen_phase_attack_squares = function () {
    return tutorial_queen_attack_squares().concat(
        tutorial_rook_attack_squares()
    ).filter(function (position) {
        return position.row > 0 && position.row < game.height - 1;
    });
};

const tutorial_stage_attack_squares = function () {
    return tutorial_ray_squares(tutorial_stage_bishop_position(), [
        {"column": -1, "row": -1},
        {"column": -1, "row": 1},
        {"column": 1, "row": -1},
        {"column": 1, "row": 1}
    ]).concat([
        {"column": game.king.column - 1, "row": 4},
        {"column": game.king.column, "row": 5},
        {"column": game.king.column + 1, "row": 4}
    ]);
};

const tutorial_demo_token_at = function (position) {
    if (!tutorial_active || tutorial_phase.indexOf("rule_") !== 0) {
        return undefined;
    }

    if (
        tutorial_phase === "rule_place_piece" &&
        same_position(position, tutorial_placing_knight_position())
    ) {
        return 2;
    }

    if (
        tutorial_phase === "rule_bishop_defended" &&
        same_position(position, tutorial_knight_position())
    ) {
        return 2;
    }

    if (
        (
            tutorial_phase === "rule_bishop_capture" ||
            tutorial_phase === "rule_bishop_defended"
        ) &&
        same_position(position, tutorial_bishop_position())
    ) {
        return 4;
    }

    if (
        (
            tutorial_phase === "rule_bishop_capture" ||
            tutorial_phase === "rule_bishop_defended"
        ) &&
        same_position(position, tutorial_capture_king_position())
    ) {
        return 1;
    }

    if (
        tutorial_phase === "rule_stage_goal" &&
        same_position(position, game.king)
    ) {
        return 1;
    }

    if (
        tutorial_phase === "rule_stage_goal" &&
        same_position(position, tutorial_stage_bishop_position())
    ) {
        return 4;
    }

    if (
        tutorial_phase === "rule_stage_goal" &&
        same_position(position, tutorial_stage_knight_position())
    ) {
        return 2;
    }

    if (
        tutorial_phase === "rule_queen_phase" &&
        same_position(position, tutorial_queen_position())
    ) {
        return 5;
    }

    if (
        tutorial_phase === "rule_queen_phase" &&
        same_position(position, tutorial_rook_position())
    ) {
        return 7;
    }

    if (
        tutorial_phase === "rule_queen_phase" &&
        position.row === game.height - 1
    ) {
        return 6;
    }

    return undefined;
};

const is_tutorial_demo_piece_square = function (position) {
    return tutorial_demo_token_at(position) !== undefined;
};

const is_tutorial_placing_knight_square = function (position) {
    return (
        tutorial_active &&
        tutorial_phase === "rule_place_piece" &&
        same_position(position, tutorial_placing_knight_position())
    );
};

const is_tutorial_placed_knight_square = function (position) {
    return (
        is_tutorial_placing_knight_square(position) &&
        (Date.now() - tutorial_animation_start) % 4200 >= 2900
    );
};

const is_tutorial_move_hint_square = function (position) {
    return (
        tutorial_active &&
        tutorial_phase === "rule_king_moves" &&
        Math.abs(position.column - game.king.column) <= 1 &&
        Math.abs(position.row - game.king.row) <= 1 &&
        !same_position(position, game.king) &&
        position.row > 0
    );
};

const is_tutorial_attack_square = function (position) {
    if (
        !tutorial_active ||
        (
            tutorial_phase !== "rule_bishop_capture" &&
            tutorial_phase !== "rule_bishop_defended"
        )
    ) {
        return false;
    }

    if (tutorial_phase === "rule_bishop_capture") {
        return tutorial_positions_include(
            tutorial_bishop_attack_squares(),
            position
        );
    }

    return tutorial_positions_include(
        tutorial_bishop_attack_squares().concat(tutorial_knight_attack_squares()),
        position
    );
};

const is_tutorial_capture_square = function (position) {
    return (
        tutorial_active &&
        (
            tutorial_phase === "rule_bishop_capture" ||
            tutorial_phase === "rule_bishop_defended"
        ) &&
        same_position(position, tutorial_bishop_position())
    );
};

const is_tutorial_defense_square = function (position) {
    return (
        tutorial_active &&
        tutorial_phase === "rule_bishop_defended" &&
        (
            same_position(position, tutorial_knight_position()) ||
            same_position(position, tutorial_bishop_position())
        )
    );
};

const is_tutorial_queen_attack_square = function (position) {
    if (!tutorial_active || tutorial_phase !== "rule_queen_phase") {
        return false;
    }

    return tutorial_positions_include(
        tutorial_queen_phase_attack_squares(),
        position
    );
};

const is_tutorial_arrow_square = function (position) {
    if (
        tutorial_active &&
        tutorial_phase === "player_one" &&
        tutorial_positions_include([
            {"column": game.king.column, "row": game.king.row + 1},
            {"column": game.king.column, "row": game.king.row + 2}
        ], position)
    ) {
        return true;
    }

    if (
        tutorial_active &&
        tutorial_phase === "rule_queen_phase" &&
        tutorial_positions_include([
            {"column": game.king.column, "row": 3},
            {"column": game.king.column + 1, "row": 4},
            {"column": game.king.column + 1, "row": 5},
            {"column": game.king.column + 2, "row": 6}
        ], position)
    ) {
        return true;
    }

    return false;
};

const is_tutorial_royal_jump_square = function (position) {
    return (
        tutorial_active &&
        tutorial_phase === "rule_stage_goal" &&
        Math.abs(position.column - game.king.column) <= 2 &&
        Math.abs(position.row - game.king.row) <= 2 &&
        !same_position(position, game.king) &&
        is_inside_board(position) &&
        !KingCrossing.is_pawn_wall(game, position)
    );
};

const is_tutorial_eagle_vision_square = function (position) {
    return (
        tutorial_active &&
        tutorial_phase === "rule_stage_goal" &&
        tutorial_positions_include(tutorial_stage_attack_squares(), position)
    );
};

const is_tutorial_rule_square = function (position) {
    return (
        is_tutorial_move_hint_square(position) ||
        (
            tutorial_active &&
            tutorial_phase === "rule_place_piece" &&
            position.row === game.height - 1
        )
    );
};

const is_tutorial_focus_square = function (position) {
    return (
        is_tutorial_demo_piece_square(position) ||
        is_tutorial_king_focus_square(position) ||
        is_tutorial_pawn_focus_square(position) ||
        is_tutorial_top_row_focus_square(position) ||
        is_tutorial_danger_focus_square(position) ||
        is_tutorial_queen_goal_focus_square(position) ||
        is_tutorial_rule_square(position) ||
        is_tutorial_attack_square(position) ||
        is_tutorial_capture_square(position) ||
        is_tutorial_queen_attack_square(position) ||
        is_tutorial_stage_goal_square(position) ||
        is_tutorial_arrow_square(position) ||
        is_tutorial_royal_jump_square(position) ||
        is_tutorial_eagle_vision_square(position) ||
        is_tutorial_defense_square(position)
    );
};

const is_player_one_turn = function () {
    return (
        game.result === "playing" &&
        game.phase === "move_king" &&
        !opening_active &&
        !pawn_wave_active &&
        !royal_guard_arrival_active &&
        !queen_arrival_active &&
        !input_locked
    );
};

const is_player_two_piece_turn = function () {
    return (
        game.result === "playing" &&
        game.phase === "place_piece" &&
        !opening_active &&
        !pawn_wave_active &&
        !royal_guard_arrival_active &&
        !queen_arrival_active &&
        !input_locked
    );
};

const is_player_two_queen_turn = function () {
    return (
        game.result === "playing" &&
        game.phase === "move_queen" &&
        game.queen_active &&
        !opening_active &&
        !pawn_wave_active &&
        !royal_guard_arrival_active &&
        !queen_arrival_active &&
        !input_locked
    );
};

const is_queens_wrath_turn = function () {
    return is_player_two_queen_turn() && queens_wrath_active;
};

const ghost_token = function () {
    if (game.next_piece === "knight") {
        return 2;
    }

    if (game.next_piece === "pawn") {
        return 3;
    }

    return 4;
};

const is_ghost_piece_square = function (base_token, position) {
    return (
        is_player_two_piece_turn() &&
        hovered_column !== undefined &&
        position.column === hovered_column &&
        position.row === game.height - 1 &&
        base_token === 0
    );
};

const normal_king_offsets = Object.freeze([
    {"column": -1, "row": 1},
    {"column": 0, "row": 1},
    {"column": 1, "row": 1},
    {"column": -1, "row": 0},
    {"column": 1, "row": 0},
    {"column": -1, "row": -1},
    {"column": 0, "row": -1},
    {"column": 1, "row": -1}
]);

const royal_jump_offsets = Object.freeze(
    range(-2, 3).reduce(function (offsets, column_offset) {
        return offsets.concat(
            range(-2, 3).map(function (row_offset) {
                return {
                    "column": column_offset,
                    "row": row_offset
                };
            })
        );
    }, []).filter(function (offset) {
        return !(offset.column === 0 && offset.row === 0);
    })
);

const royal_jump_available = function () {
    return game.queen_active || royal_jump_active;
};

const active_king_offsets = function () {
    if (game.queen_active || royal_jump_active) {
        return royal_jump_offsets;
    }

    return normal_king_offsets;
};

const is_piece_on_square = function (position) {
    const token = KingCrossing.cell_token(game, position);

    return token === 2 || token === 4 || token === 5 || token === 6 || token === 7;
};

const is_inside_board = function (position) {
    if (KingCrossing.is_inside_board !== undefined) {
        return KingCrossing.is_inside_board(game, position);
    }

    return (
        position.column >= 0 &&
        position.column < game.width &&
        position.row >= 0 &&
        position.row < game.height
    );
};

const is_possible_king_range_square = function (position) {
    if (!is_player_one_turn()) {
        return false;
    }

    if (!is_inside_board(position)) {
        return false;
    }

    return active_king_offsets().some(function (offset) {
        return same_position(position, {
            "column": game.king.column + offset.column,
            "row": game.king.row + offset.row
        });
    });
};

const is_legal_king_hint_square = function (position) {
    if (!is_possible_king_range_square(position)) {
        return false;
    }

    if (KingCrossing.is_pawn_wall(game, position)) {
        return false;
    }

    if (KingCrossing.is_royal_guard(game, position)) {
        return false;
    }

    if (KingCrossing.cell_token(game, position) === 5) {
        return false;
    }

    if (
        is_piece_on_square(position) &&
        KingCrossing.cell_token(game, position) !== 5 &&
        KingCrossing.is_piece_defended(game, position)
    ) {
        return false;
    }

    return true;
};

const is_king_move_hint_square = function (position) {
    return is_legal_king_hint_square(position);
};

const is_royal_jump_range_square = function (position) {
    return (
        royal_jump_available() &&
        is_possible_king_range_square(position)
    );
};

const is_normal_move_dot_square = function (position) {
    return (
        !royal_jump_available() &&
        is_king_move_hint_square(position)
    );
};

const is_ghost_king_square = function (position) {
    return (
        is_player_one_turn() &&
        hovered_position !== undefined &&
        same_position(hovered_position, position) &&
        is_king_move_hint_square(position)
    );
};

const is_queen_move_hint_square = function (position) {
    return (
        is_player_two_queen_turn() &&
        !queens_wrath_active &&
        KingCrossing.is_queen_move_legal(game, position)
    );
};

const is_queens_wrath_hint_square = function (position) {
    return (
        is_queens_wrath_turn() &&
        KingCrossing.can_spawn_wrath_rook(game, position)
    );
};

const is_ghost_queen_square = function (base_token, position) {
    return (
        is_player_two_queen_turn() &&
        hovered_position !== undefined &&
        same_position(hovered_position, position) &&
        is_queen_move_hint_square(position) &&
        base_token === 0
    );
};

const is_ghost_rook_square = function (base_token, position) {
    return (
        is_queens_wrath_turn() &&
        hovered_position !== undefined &&
        same_position(hovered_position, position) &&
        is_queens_wrath_hint_square(position) &&
        base_token === 0
    );
};

const is_pawn_wall_danger_square = function (position) {
    return position.row === 1;
};

const should_show_eagle_vision = function (position) {
    return (
        eagle_vision_active &&
        game.result === "playing" &&
        !opening_active &&
        !pawn_wave_active &&
        !royal_guard_arrival_active &&
        !queen_arrival_active &&
        !KingCrossing.is_pawn_wall(game, position) &&
        (
            KingCrossing.is_square_attacked(game, position) ||
            is_pawn_wall_danger_square(position)
        )
    );
};

const is_king_checked_square = function (position) {
    return (
        game.queen_active &&
        game.phase === "move_king" &&
        KingCrossing.is_king_in_check(game) &&
        same_position(position, game.king)
    );
};

const visual_token_for_position = function (base_token, position) {
    const tutorial_demo_token = tutorial_demo_token_at(position);

    if (tutorial_demo_token !== undefined) {
        return tutorial_demo_token;
    }

    if (
        tutorial_active &&
        (
            tutorial_phase === "rule_bishop_capture" ||
            tutorial_phase === "rule_bishop_defended"
        ) &&
        base_token === 1
    ) {
        return 0;
    }

    if (is_queen_animation_square(position)) {
        return 5;
    }

    if (queen_arrival_active && is_queen_removed_position(position)) {
        return 0;
    }

    if (is_royal_guard_source_square(position)) {
        return 6;
    }

    if (is_royal_guard_target_square(position)) {
        return 6;
    }

    if (is_opening_king_square(position)) {
        return 1;
    }

    if (
        opening_active &&
        opening_phase === "king" &&
        base_token === 1
    ) {
        return 0;
    }

    if (is_opening_pawn_source_square(position)) {
        return 3;
    }

    if (is_opening_pawn_target_square(position)) {
        return 3;
    }

    if (opening_active && base_token === 3) {
        return 0;
    }

    if (is_extra_bottom_row(position)) {
        return 0;
    }

    if (is_extra_top_row(position) && !is_royal_guard_source_square(position)) {
        return 0;
    }

    if (is_pawn_wave_target_square(position)) {
        return 3;
    }

    if (is_pawn_wave_source_square(position)) {
        return 0;
    }

    if (is_ghost_king_square(position)) {
        return 1;
    }

    if (is_ghost_queen_square(base_token, position)) {
        return 5;
    }

    if (is_ghost_rook_square(base_token, position)) {
        return 7;
    }

    if (is_ghost_piece_square(base_token, position)) {
        return ghost_token();
    }

    return base_token;
};

const class_for_token = function (token, base_token, position) {
    const classes = [
        "board_cell",
        square_colour_class(position)
    ];

    if (token === 0) {
        classes.push("empty_square");
    }

    if (token === 1 && !is_ghost_king_square(position)) {
        classes.push("king_square");
    }

    if (token === 1 && is_ghost_king_square(position)) {
        classes.push("ghost_king_square");
    }

    if (token === 2) {
        classes.push("enemy_piece");
        classes.push("knight_square");
    }

    if (token === 3) {
        classes.push("pawn_wall_square");
    }

    if (token === 4) {
        classes.push("enemy_piece");
        classes.push("bishop_square");
    }

    if (token === 5 && !is_ghost_queen_square(base_token, position)) {
        classes.push("enemy_piece");
        classes.push("queen_square");
    }

    if (token === 5 && is_ghost_queen_square(base_token, position)) {
        classes.push("ghost_queen_square");
    }

    if (token === 6) {
        classes.push("royal_guard_square");
    }

    if (token === 7 && !is_ghost_rook_square(base_token, position)) {
        classes.push("enemy_piece");
        classes.push("rook_square");
    }

    if (token === 7 && is_ghost_rook_square(base_token, position)) {
        classes.push("ghost_rook_square");
    }

    if (is_king_checked_square(position)) {
        classes.push("king_in_check_square");
    }

    if (is_queen_animation_square(position)) {
        classes.push("queen_arrival_square");
    }

    if (
        is_royal_guard_source_square(position) ||
        is_royal_guard_target_square(position)
    ) {
        classes.push("royal_guard_arrival_square");
    }

    if (is_extra_top_row(position)) {
        classes.push("incoming_row_square");
    }

    if (is_extra_bottom_row(position)) {
        classes.push("trailing_row_square");
    }

    if (is_opening_king_square(position)) {
        classes.push("opening_king_square");
    }

    if (
        is_opening_pawn_source_square(position) ||
        is_opening_pawn_target_square(position)
    ) {
        classes.push("opening_pawn_square");
    }

    if (is_pawn_wave_target_square(position)) {
        classes.push("pawn_wave_square");
    }

    if (is_ghost_piece_square(base_token, position)) {
        classes.push("ghost_piece_square");
    }

    if (is_normal_move_dot_square(position)) {
        classes.push("king_move_hint");
    }

    if (is_tutorial_rule_square(position)) {
        classes.push("tutorial_rule_square");
    }

    if (is_tutorial_move_hint_square(position)) {
        classes.push("king_move_hint");
    }

    if (is_tutorial_attack_square(position)) {
        classes.push("tutorial_attack_square");
    }

    if (is_tutorial_queen_attack_square(position)) {
        classes.push("tutorial_attack_square");
    }

    if (is_tutorial_eagle_vision_square(position)) {
        classes.push("tutorial_eagle_vision_square");
    }

    if (is_tutorial_capture_square(position)) {
        classes.push("tutorial_capture_square");
    }

    if (is_tutorial_defense_square(position)) {
        classes.push("tutorial_defense_square");
    }

    if (is_tutorial_arrow_square(position)) {
        classes.push("tutorial_arrow_square");
    }

    if (is_tutorial_royal_jump_square(position)) {
        classes.push("tutorial_royal_jump_square");
    }

    if (is_tutorial_demo_piece_square(position)) {
        classes.push("tutorial_demo_piece_square");
    }

    if (is_tutorial_placing_knight_square(position)) {
        classes.push("tutorial_placing_knight_square");
    }

    if (is_tutorial_placed_knight_square(position)) {
        classes.push("tutorial_placed_knight_square");
    }

    if (is_royal_jump_range_square(position)) {
        classes.push("royal_jump_hint");
    }

    if (is_queen_move_hint_square(position)) {
        classes.push("queen_move_hint");
    }

    if (is_queens_wrath_hint_square(position)) {
        classes.push("queens_wrath_hint");
    }

    if (should_show_eagle_vision(position)) {
        classes.push("eagle_vision_square");
    }

    if (is_attack_path_square(position)) {
        classes.push("attack_path_square");
    }

    if (is_attacking_piece(position)) {
        classes.push("attacking_piece");
    }

    if (is_tutorial_focus_square(position)) {
        classes.push("tutorial_focus_cell");
    }

    return classes.join(" ");
};

const alt_for_token = function (token, base_token, position) {
    if (is_king_checked_square(position)) {
        return "The king is in check";
    }

    if (is_tutorial_king_focus_square(position)) {
        return "Tutorial focus: Player 1, the escaping king";
    }

    if (is_tutorial_pawn_focus_square(position)) {
        return "Tutorial focus: Player 2 pawn wall";
    }

    if (is_tutorial_top_row_focus_square(position)) {
        return "Tutorial focus: enemy placement row";
    }

    if (is_tutorial_danger_focus_square(position)) {
        return "Tutorial focus: pawn wall danger";
    }

    if (is_tutorial_queen_goal_focus_square(position)) {
        return "Tutorial focus: queen duel escape area";
    }

    if (is_tutorial_stage_goal_square(position)) {
        return "Tutorial focus: king's route upward";
    }

    if (is_tutorial_demo_piece_square(position)) {
        return `Tutorial example: ${piece_labels[token].toLowerCase()}`;
    }

    if (is_queen_animation_square(position)) {
        return "The Grand Regent Queen removing a failed enemy piece";
    }

    if (is_ghost_king_square(position)) {
        return "Ghost preview: king move";
    }

    if (is_ghost_queen_square(base_token, position)) {
        return "Ghost preview: queen move";
    }

    if (is_ghost_rook_square(base_token, position)) {
        return "Ghost preview: Queen's Wrath rook";
    }

    if (is_ghost_piece_square(base_token, position)) {
        return `Ghost preview: ${piece_labels[token].toLowerCase()}`;
    }

    if (is_royal_jump_range_square(position)) {
        return "Royal Jump range";
    }

    return piece_labels[token];
};

const piece_name = function (piece) {
    if (piece === undefined) {
        return "the pawn wall";
    }

    if (piece.type === "pawn") {
        return "the pawn";
    }

    if (piece.type === "knight") {
        return "the knight";
    }

    if (piece.type === "bishop") {
        return "the bishop";
    }

    if (piece.type === "queen") {
        return "the Grand Regent Queen";
    }

    if (piece.type === "rook") {
        return "the Queen's Wrath rook";
    }

    return "an enemy piece";
};

const next_piece_name = function () {
    if (game.next_piece === "pawn") {
        return "Pawn";
    }

    if (game.next_piece === "knight") {
        return "Knight";
    }

    return "Bishop";
};

const update_turn_panels = function () {
    el("home_player").classList.remove("active_turn");
    el("away_player").classList.remove("active_turn");

    if (opening_active || game.result !== "playing") {
        return;
    }

    if (game.phase === "move_king") {
        el("home_player").classList.add("active_turn");
    }

    if (
        game.phase === "place_piece" ||
        game.phase === "royal_guard_arrival" ||
        game.phase === "queen_arrival" ||
        game.phase === "move_queen"
    ) {
        el("away_player").classList.add("active_turn");
    }
};

const update_eagle_vision_button = function () {
    const charge_percentage = (
        eagle_vision_charge / eagle_vision_max_charge * 100
    );

    const ready = (
        eagle_vision_charge >= eagle_vision_max_charge &&
        game.result === "playing" &&
        game.phase === "move_king" &&
        !input_locked
    );

    el("eagle_vision_fill").style.width = `${charge_percentage}%`;

    if (eagle_vision_active) {
        el("eagle_vision_status").textContent = "Active";
    } else if (eagle_vision_charge >= eagle_vision_max_charge) {
        el("eagle_vision_status").textContent = "Ready";
    } else {
        el("eagle_vision_status").textContent = (
            `${eagle_vision_charge}/${eagle_vision_max_charge}`
        );
    }

    eagle_vision_button.disabled = !ready || eagle_vision_active;
};

const update_royal_jump_button = function () {
    if (game.queen_active) {
        el("royal_jump_fill").style.width = "100%";
        el("royal_jump_status").textContent = "Infinite";
        royal_jump_button.disabled = true;
        return;
    }

    const charge_percentage = (
        royal_jump_charge / royal_jump_max_charge * 100
    );

    const ready = (
        royal_jump_charge >= royal_jump_max_charge &&
        game.result === "playing" &&
        game.phase === "move_king" &&
        !input_locked
    );

    el("royal_jump_fill").style.width = `${charge_percentage}%`;

    if (royal_jump_active) {
        el("royal_jump_status").textContent = "Active";
    } else if (royal_jump_charge >= royal_jump_max_charge) {
        el("royal_jump_status").textContent = "Ready";
    } else {
        el("royal_jump_status").textContent = (
            `${royal_jump_charge}/${royal_jump_max_charge}`
        );
    }

    royal_jump_button.disabled = !ready || royal_jump_active;
};

const update_queens_wrath_button = function () {
    const ready = is_player_two_queen_turn();

    if (queens_wrath_active) {
        el("queens_wrath_status").textContent = "Choose a square";
    } else if (ready) {
        el("queens_wrath_status").textContent = "Spawn rook";
    } else {
        el("queens_wrath_status").textContent = "Final duel";
    }

    queens_wrath_button.disabled = !ready;
};

const update_queen_progress = function () {
    const progress_percentage = Math.min(
        game.turn / game.target_turns * 100,
        100
    );

    el("queen_progress_fill").style.width = `${progress_percentage}%`;

    if (game.queen_active) {
        el("queen_progress_status").textContent = "Queen Active";
    } else if (game.phase === "royal_guard_arrival") {
        el("queen_progress_status").textContent = "Royal Guard";
    } else if (game.royal_guard_active) {
        el("queen_progress_status").textContent = "Guard Active";
    } else if (game.phase === "queen_arrival") {
        el("queen_progress_status").textContent = "Arriving...";
    } else {
        el("queen_progress_status").textContent = (
            `${game.turn}/${game.target_turns}`
        );
    }
};

const charge_abilities_after_king_move = function () {
    if (eagle_vision_charge < eagle_vision_max_charge) {
        eagle_vision_charge += 1;
    }

    if (royal_jump_charge < royal_jump_max_charge) {
        royal_jump_charge += 1;
    }

    eagle_vision_charge = Math.min(
        eagle_vision_charge,
        eagle_vision_max_charge
    );

    royal_jump_charge = Math.min(
        royal_jump_charge,
        royal_jump_max_charge
    );
};

const slot_cells = range(0, game.width).map(function (column_index) {
    const visual_height = (
        game.height +
        visual_extra_top_rows +
        visual_extra_bottom_rows
    );

    const column_div = document.createElement("div");

    column_div.className = "column";
    column_div.tabIndex = 0;
    column_div.setAttribute(
        "aria-label",
        `Column ${column_index + 1}. Press Enter to place the next enemy piece.`
    );

    column_div.onmouseenter = function () {
        hovered_column = column_index;
        redraw_board();
    };

    column_div.onmouseleave = function () {
        hovered_column = undefined;
        hovered_position = undefined;
        redraw_board();
    };

    column_div.onfocus = function () {
        hovered_column = column_index;
        redraw_board();
    };

    column_div.onblur = function () {
        hovered_column = undefined;
        hovered_position = undefined;
        redraw_board();
    };

    column_div.onclick = function () {
        if (input_locked || !is_player_two_piece_turn()) {
            return;
        }

        game = KingCrossing.place_piece(game, column_index);
        hovered_column = undefined;
        redraw_board();
    };

    game_board.append(column_div);

    return reverse(range(0, visual_height).map(function () {
        const cell = document.createElement("div");
        column_div.append(cell);
        return cell;
    }));
});

const move_queen_to_position = function (position) {
    if (!is_player_two_queen_turn() || !is_queen_move_hint_square(position)) {
        return;
    }

    hovered_position = undefined;
    queens_wrath_active = false;
    game = KingCrossing.move_queen_to(game, position);
    redraw_board();
};

const spawn_wrath_rook_at_position = function (position) {
    if (!is_queens_wrath_turn() || !is_queens_wrath_hint_square(position)) {
        return;
    }

    hovered_position = undefined;
    queens_wrath_active = false;
    game = KingCrossing.spawn_wrath_rook(game, position);
    redraw_board();
};

const start_pawn_wave_if_needed = function () {
    if (game.phase !== "scroll_world") {
        return;
    }

    input_locked = true;
    pawn_wave_active = true;
    pawn_wave_column = -1;

    pawn_wave_timer = setTimeout(
        continue_pawn_wave,
        pawn_wave_step_delay
    );
};

const move_king_to_position = function (position) {
    if (!is_player_one_turn() || !is_king_move_hint_square(position)) {
        return;
    }

    eagle_vision_active = false;
    royal_jump_active = false;
    hovered_position = undefined;

    const previous_phase = game.phase;
    const previous_turn = game.turn;

    game = KingCrossing.move_king_to(game, position);

    if (
        previous_phase === "move_king" &&
        (
            game.phase !== previous_phase ||
            game.turn !== previous_turn ||
            game.result !== "playing"
        )
    ) {
        charge_abilities_after_king_move();
    }

    redraw_board();
    start_pawn_wave_if_needed();
};

const attach_cell_handlers = function () {
    slot_cells.forEach(function (column, column_index) {
        column.forEach(function (cell, visual_row_index) {
            const position = {
                "column": column_index,
                "row": visual_row_index - visual_extra_bottom_rows
            };

            cell.onmouseenter = function () {
                hovered_position = position;
                hovered_column = column_index;
                redraw_board();
            };

            cell.onmouseleave = function () {
                hovered_position = undefined;
                redraw_board();
            };

            cell.onclick = function (event) {
                if (is_player_one_turn() && is_king_move_hint_square(position)) {
                    event.stopPropagation();
                    move_king_to_position(position);
                    return;
                }

                if (
                    is_player_two_queen_turn() &&
                    is_queen_move_hint_square(position)
                ) {
                    event.stopPropagation();
                    move_queen_to_position(position);
                    return;
                }

                if (
                    is_queens_wrath_turn() &&
                    is_queens_wrath_hint_square(position)
                ) {
                    event.stopPropagation();
                    spawn_wrath_rook_at_position(position);
                }
            };
        });
    });
};

const open_result_dialog = function () {
    result_pending = false;

    if (!KingCrossing.is_ended(game) || result_dialog.open) {
        return;
    }

    if (game.result === "won") {
        el("result_winner").textContent = "Player 1 Wins";
        el("result_message").textContent = (
            "The king reached the royal boundary and escaped the Grand Regent Queen."
        );
    }

    if (game.result === "sealed") {
        el("result_winner").textContent = "Player 2 Wins";
        el("result_message").textContent = (
            "The enemy court filled the road ahead. The king was trapped between the soldiers and the pawn wall."
        );
    }

    if (game.result === "lost") {
        el("result_winner").textContent = "Player 2 Wins";
        el("result_message").textContent = (
            `The king moved into a square controlled by ${piece_name(game.attacker)}.`
        );
    }

    result_dialog.showModal();
};

const show_result_if_needed = function () {
    if (!KingCrossing.is_ended(game)) {
        return;
    }

    if (result_dialog.open || result_pending) {
        return;
    }

    if (game.result === "won" || game.result === "sealed") {
        open_result_dialog();
        return;
    }

    result_pending = true;
    input_locked = true;

    result_timer = setTimeout(function () {
        open_result_dialog();
    }, defeat_reveal_delay);
};

const start_royal_guard_arrival_if_needed = function () {
    if (
        game.phase !== "royal_guard_arrival" ||
        royal_guard_arrival_started ||
        game.result !== "playing"
    ) {
        return;
    }

    royal_guard_arrival_started = true;
    royal_guard_arrival_active = true;
    royal_guard_column = -1;
    input_locked = true;

    royal_guard_timer = setTimeout(function continue_guard_wave() {
        royal_guard_column += 1;
        redraw_board();

        if (royal_guard_column < game.width - 1) {
            royal_guard_timer = setTimeout(
                continue_guard_wave,
                royal_guard_step_delay
            );
            return;
        }

        royal_guard_timer = setTimeout(function () {
            royal_guard_arrival_active = false;
            royal_guard_column = -1;
            game = KingCrossing.begin_queen_arrival(game);
            redraw_board();
        }, royal_guard_finish_delay);
    }, royal_guard_step_delay);
};

const start_queen_arrival_if_needed = function () {
    if (
        game.phase !== "queen_arrival" ||
        queen_arrival_started ||
        game.result !== "playing"
    ) {
        return;
    }

    queen_arrival_started = true;
    queen_arrival_active = true;
    queen_removed_positions = [];
    queen_animation_position = undefined;
    input_locked = true;

    queen_arrival_timer = setTimeout(function dispose_next_piece() {
        const next_piece = game.pieces[queen_removed_positions.length];

        if (next_piece !== undefined) {
            queen_removed_positions = queen_removed_positions.concat([{
                "column": next_piece.column,
                "row": next_piece.row
            }]);

            queen_animation_position = {
                "column": next_piece.column,
                "row": next_piece.row
            };

            redraw_board();

            queen_arrival_timer = setTimeout(
                dispose_next_piece,
                queen_disposal_step_delay
            );
            return;
        }

        queen_animation_position = queen_final_position();
        redraw_board();

        queen_arrival_timer = setTimeout(function () {
            queen_arrival_active = false;
            queen_animation_position = undefined;
            queen_removed_positions = [];
            game = KingCrossing.begin_queen_duel(game);
            royal_jump_active = false;
            royal_jump_charge = royal_jump_max_charge;
            queens_wrath_active = false;
            input_locked = false;
            redraw_board();
        }, queen_final_drop_delay);
    }, queen_disposal_step_delay);
};

const redraw_board = function () {
    document.body.classList.toggle(
        "tutorial_board_focus_mode",
        tutorial_active && tutorial_focus !== "none"
    );

    slot_cells.forEach(function (column, column_index) {
        column.forEach(function (cell, visual_row_index) {
            const position = {
                "column": column_index,
                "row": visual_row_index - visual_extra_bottom_rows
            };

            const base_token = (
                is_extra_top_row(position) || is_extra_bottom_row(position)
                ? 0
                : KingCrossing.cell_token(game, position)
            );

            const token = visual_token_for_position(base_token, position);

            cell.textContent = piece_symbols[token];
            cell.className = class_for_token(token, base_token, position);
            cell.setAttribute(
                "aria-label",
                alt_for_token(token, base_token, position)
            );
        });
    });

    if (tutorial_active && tutorial_phase === "rule_place_piece") {
        el("home_ready").textContent = "Player 1: wait for the enemy court.";
        el("away_ready").textContent = "Cycle: Pawn, Knight, Bishop.";
    } else if (tutorial_active && tutorial_focus === "king") {
        el("home_ready").textContent = "Player 1: the escaping king.";
        el("away_ready").textContent = "The enemy court waits.";
    } else if (tutorial_active && tutorial_focus === "pawns") {
        el("home_ready").textContent = "The king must keep moving.";
        el("away_ready").textContent = "The pawn wall is chasing.";
    } else if (opening_active) {
        if (opening_phase === "king") {
            el("home_ready").textContent = "The king enters the crossing...";
            el("away_ready").textContent = "The enemy court waits.";
        } else {
            el("home_ready").textContent = "The pawn wall surges into frame...";
            el("away_ready").textContent = "Prepare to place the first piece.";
        }
    } else if (game.phase === "royal_guard_arrival") {
        el("home_ready").textContent = "Player 1 has completed the crossing route.";
        el("away_ready").textContent = "Player 2 summons the royal guard.";
    } else if (game.phase === "queen_arrival") {
        el("home_ready").textContent = "Player 1: prepare for the final duel.";
        el("away_ready").textContent = (
            "The Grand Regent Queen removes the failed court."
        );
    } else if (game.phase === "move_queen") {
        el("home_ready").textContent = "Player 1: survive the queen.";
        if (queens_wrath_active) {
            el("away_ready").textContent = (
                "Queen's Wrath: place a rook that does not directly check " +
                "the king."
            );
        } else {
            el("away_ready").textContent = (
                "Player 2 Turn: move the Grand Regent Queen or use " +
                "Queen's Wrath."
            );
        }
    } else if (game.queen_active && game.result === "playing") {
        el("home_ready").textContent = (
            "Final Duel: reach the row beneath the royal guard."
        );
        el("away_ready").textContent = "The Grand Regent Queen controls the board.";
    } else if (game.phase === "place_piece" && game.result === "playing") {
        el("home_ready").textContent = "Player 1: wait for the enemy court.";
        el("away_ready").textContent = (
            `Player 2 Turn: place a ${next_piece_name()} on the top row.`
        );
    } else if (game.phase === "move_king" && game.result === "playing") {
        el("home_ready").textContent = (
            royal_jump_available()
            ? "Royal Jump: gold dots show range, not safety."
            : "Player 1 Turn: click a dot, or move with Q, W, E, A, S."
        );
        el("away_ready").textContent = (
            `Next enemy piece: ${next_piece_name()}.`
        );
    } else {
        el("home_ready").textContent = KingCrossing.status_message(game);
        el("away_ready").textContent = (
            `Turn ${game.turn} of ${game.target_turns}. ` +
            `Next piece: ${next_piece_name()}.`
        );
    }

    update_turn_panels();
    update_eagle_vision_button();
    update_royal_jump_button();
    update_queens_wrath_button();
    update_queen_progress();
    show_result_if_needed();
    start_royal_guard_arrival_if_needed();
    start_queen_arrival_if_needed();
};

const finish_opening_animation = function () {
    opening_active = false;
    opening_phase = "done";
    opening_pawn_column = -1;

    if (tutorial_active && tutorial_phase === "pawn_chase") {
        input_locked = true;
        redraw_board();
        return;
    }

    input_locked = false;
    redraw_board();
};

const continue_opening_pawn_wave = function () {
    opening_pawn_column += 1;
    redraw_board();

    if (opening_pawn_column < game.width - 1) {
        opening_timer = setTimeout(
            continue_opening_pawn_wave,
            opening_pawn_step_delay
        );
        return;
    }

    opening_timer = setTimeout(
        finish_opening_animation,
        opening_finish_delay
    );
};

const start_opening_pawn_wave = function () {
    opening_phase = "pawns";
    opening_pawn_column = -1;

    opening_timer = setTimeout(
        continue_opening_pawn_wave,
        opening_pawn_step_delay
    );
};

const continue_opening_king_run = function () {
    opening_king_row += 1;
    redraw_board();

    if (opening_king_row < game.king.row) {
        opening_timer = setTimeout(
            continue_opening_king_run,
            opening_king_step_delay
        );
        return;
    }

    if (tutorial_active && tutorial_phase === "king_opening") {
        opening_timer = setTimeout(
            show_player_one_spotlight,
            opening_finish_delay
        );
        return;
    }

    opening_timer = setTimeout(
        start_opening_pawn_wave,
        opening_finish_delay
    );
};

const start_opening_animation = function () {
    clearTimeout(opening_timer);

    opening_active = true;
    opening_phase = "king";
    opening_king_row = -1;
    opening_pawn_column = -1;
    input_locked = true;

    redraw_board();

    opening_timer = setTimeout(
        continue_opening_king_run,
        opening_king_step_delay
    );
};

const finish_board_scroll_animation = function () {
    game_board.classList.add("no_scroll_transition");
    game_board.classList.remove("board_scroll_animation");

    pawn_wave_active = false;
    pawn_wave_column = -1;

    game = KingCrossing.finish_forward_move(game);
    input_locked = false;
    redraw_board();

    game_board.offsetHeight;

    setTimeout(function () {
        game_board.classList.remove("no_scroll_transition");
    }, 0);
};

const start_board_scroll_animation = function () {
    game_board.classList.remove("no_scroll_transition");
    game_board.classList.add("board_scroll_animation");

    pawn_wave_timer = setTimeout(
        finish_board_scroll_animation,
        board_scroll_delay
    );
};

const continue_pawn_wave = function () {
    pawn_wave_column += 1;
    redraw_board();

    if (pawn_wave_column < game.width - 1) {
        pawn_wave_timer = setTimeout(
            continue_pawn_wave,
            pawn_wave_step_delay
        );
        return;
    }

    pawn_wave_timer = setTimeout(
        start_board_scroll_animation,
        pawn_wave_finish_delay
    );
};

const move_king = function (direction) {
    if (input_locked) {
        return;
    }

    const offset_map = {
        "up_left": {"column": -1, "row": 1},
        "up": {"column": 0, "row": 1},
        "up_right": {"column": 1, "row": 1},
        "left": {"column": -1, "row": 0},
        "right": {"column": 1, "row": 0},
        "down": {"column": 0, "row": -1}
    };
    const offset = offset_map[direction];

    if (offset === undefined) {
        return;
    }

    move_king_to_position({
        "column": game.king.column + offset.column,
        "row": game.king.row + offset.row
    });
};

eagle_vision_button.onclick = function () {
    if (
        input_locked ||
        eagle_vision_active ||
        eagle_vision_charge < eagle_vision_max_charge ||
        game.result !== "playing" ||
        game.phase !== "move_king"
    ) {
        return;
    }

    eagle_vision_active = true;
    eagle_vision_charge = 0;
    redraw_board();
};

royal_jump_button.onclick = function () {
    if (game.queen_active) {
        return;
    }

    if (
        input_locked ||
        royal_jump_active ||
        royal_jump_charge < royal_jump_max_charge ||
        game.result !== "playing" ||
        game.phase !== "move_king"
    ) {
        return;
    }

    royal_jump_active = true;
    royal_jump_charge = 0;
    redraw_board();
};

queens_wrath_button.onclick = function () {
    if (!is_player_two_queen_turn()) {
        return;
    }

    queens_wrath_active = !queens_wrath_active;
    hovered_position = undefined;
    redraw_board();
};

const close_instructions = function () {
    if (!instructions_dialog.open) {
        return;
    }

    instructions_dialog.close();
    input_locked = false;
    redraw_board();
};

const open_instructions = function () {
    if (instructions_dialog.open) {
        return;
    }

    input_locked = true;
    instructions_dialog.showModal();
    redraw_board();
};

instructions_button.onclick = open_instructions;
instructions_dialog.onclick = close_instructions;
instructions_dialog.onkeydown = close_instructions;

const reset_game = function () {
    reset_game_state();
    start_opening_animation();
};

result_dialog.onclick = reset_game;
result_dialog.onkeydown = reset_game;

document.onkeydown = function (event) {
    if (event.key === "q" || event.key === "Q") {
        move_king("up_left");
    }

    if (event.key === "w" || event.key === "W") {
        move_king("up");
    }

    if (event.key === "e" || event.key === "E") {
        move_king("up_right");
    }

    if (event.key === "a" || event.key === "A") {
        move_king("left");
    }

    if (event.key === "d" || event.key === "D") {
        move_king("right");
    }

    if (event.key === "s" || event.key === "S") {
        move_king("down");
    }
};

attach_cell_handlers();
game_board.firstChild.focus();
start_tutorial_title();
