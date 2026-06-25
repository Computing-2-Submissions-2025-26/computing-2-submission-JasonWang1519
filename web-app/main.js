/*jslint browser: true */
import KingCrossing from "./KingCrossing.js?v=kings-crossing";

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
    "White king",
    "Black knight",
    "Pursuing pawn wall",
    "Black bishop",
    "Grand Regent Queen",
    "Royal guard pawn",
    "Queen's Wrath rook"
];

const player_types = {
    "1": "White Pieces",
    "2": "Black Pieces"
};

const visual_extra_top_rows = 2;
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

let play_mode = "multiplayer";
let human_side = "white";
let ai_turn_timer;

let pawn_wave_active = false;
let pawn_wave_column = -1;
let pawn_wave_rows = 1;
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
let queens_wrath_revealed = false;

let hovered_column = undefined;
let hovered_position = undefined;

let queen_notice_state = "hidden";
let queen_notice_timer;

let tutorial_mode = "practice";
let tutorial_active = true;
let tutorial_phase = "title";
let tutorial_focus = "none";
let tutorial_step_index = 0;
let tutorial_timer;
let tutorial_animation_timer;
let tutorial_fast_forward_timer;
let tutorial_notice_timer;
let tutorial_animation_start = 0;
let tutorial_countdown_turns = 0;
let tutorial_guided_square = undefined;
let tutorial_guided_kind = "none";
let tutorial_pointer_down = undefined;
let tutorial_click_suppressed_until = 0;

const tutorial_ability_cycle = 6400;
const tutorial_eagle_click_time = 1300;
const tutorial_jump_click_time = 3000;
const tutorial_move_click_time = 4700;
const tutorial_place_cycle = 4200;
const tutorial_knight_place_start_time = 0;
const tutorial_place_click_time = 3000;
const tutorial_king_move_cycle = 3600;
const tutorial_king_move_click_time = 1150;
const tutorial_bishop_cycle = 4300;
const tutorial_bishop_click_time = 1800;
const tutorial_queen_wrath_cycle = 5600;
const tutorial_queen_wrath_click_time = 1400;
const tutorial_queen_rook_click_time = 3300;
const tutorial_queen_vision_cycle = 4600;
const tutorial_queen_vision_click_time = 1500;

el("title").textContent = "King's Crossing";
el("home_player_type").textContent = player_types["1"];
el("away_player_type").textContent = player_types["2"];
el("home_ready").textContent = "The king enters the crossing...";
el("away_ready").textContent = "Black is waiting.";

const instructions_button = document.createElement("button");
instructions_button.id = "instructions_button";
instructions_button.type = "button";
instructions_button.textContent = "Instructions";
instructions_button.setAttribute("aria-label", "Open the game instructions");
document.body.append(instructions_button);

const single_player_button = document.createElement("button");
single_player_button.id = "single_player_button";
single_player_button.type = "button";
single_player_button.textContent = "Single Player";
single_player_button.setAttribute("aria-label", "Open single-player choices");
document.body.append(single_player_button);

const single_player_dialog = document.createElement("div");
single_player_dialog.id = "single_player_dialog";
single_player_dialog.className = "hidden";
single_player_dialog.setAttribute("role", "dialog");
single_player_dialog.setAttribute("aria-modal", "true");
single_player_dialog.setAttribute("aria-labelledby", "single_player_heading");
single_player_dialog.innerHTML = `
    <section id="single_player_card">
        <h2 id="single_player_heading">Single Player</h2>
        <p>Choose your side. The AI will play the other pieces.</p>
        <div id="single_player_choices">
            <button id="choose_white_pieces" data-side="white" type="button">
                Play White Pieces
            </button>
            <button id="choose_black_pieces" data-side="black" type="button">
                Play Black Pieces
            </button>
        </div>
    </section>
`;
document.body.append(single_player_dialog);

const eagle_vision_button = document.createElement("button");
eagle_vision_button.id = "eagle_vision_button";
eagle_vision_button.type = "button";
eagle_vision_button.setAttribute("aria-label", "Use Eagle Vision");
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
royal_jump_button.setAttribute("aria-label", "Use Royal Jump");
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
queens_wrath_button.setAttribute("aria-label", "Use Queen's Wrath");
queens_wrath_button.innerHTML = `
    <span id="queens_wrath_label">Queen's Wrath</span>
    <span id="queens_wrath_status">Final duel</span>
`;
document.body.append(queens_wrath_button);

const queen_progress_panel = document.createElement("section");
queen_progress_panel.id = "queen_progress_panel";
queen_progress_panel.setAttribute("aria-label", "Grand Regent Queen progress");
queen_progress_panel.innerHTML = `
    <span id="queen_progress_label">Grand Regent Queen</span>
    <span id="queen_progress_status" aria-live="polite">0/12</span>
    <span id="queen_progress_bar">
        <span id="queen_progress_fill"></span>
    </span>
`;
document.body.append(queen_progress_panel);

const queen_notice = document.createElement("div");
queen_notice.id = "queen_notice";
queen_notice.className = "hidden";
queen_notice.setAttribute("aria-live", "polite");
queen_notice.innerHTML = `
    <span id="queen_notice_icon">♛</span>
    <span id="queen_notice_text">
        Grand Regent Queen will arrive in 12 moves
    </span>
`;
document.body.append(queen_notice);

const instructions_dialog = document.createElement("dialog");
instructions_dialog.id = "instructions_dialog";
instructions_dialog.setAttribute("aria-labelledby", "instructions_heading");
instructions_dialog.innerHTML = `
    <section id="instructions_card">
        <h2 id="instructions_heading">How to Play</h2>
        <p><strong>White Pieces:</strong> guide the king upward and look for a clear route through the crossing.</p>
        <p><strong>Black Pieces:</strong> choose where new threats appear on the top row and try to close the route.</p>
        <p>You can play with the mouse by clicking a legal square.</p>
        <p>You can also play with the keyboard like a remote: move the selector, then press <strong>Space</strong> to confirm.</p>
        <p>White uses <strong>W A S D</strong> to choose the king's square. Black uses the <strong>Left</strong> and <strong>Right</strong> arrows when placing a new piece.</p>
        <p>In the queen duel, Black presses <strong>Tab</strong> to switch between the queen and Queen's Wrath, uses the arrow keys to choose a legal square, then presses <strong>Space</strong>.</p>
        <p><strong>Eagle Vision</strong> reveals danger. <strong>Royal Jump</strong> gives the king a longer leap when it is charged.</p>
        <p>White has the harder role because the king must keep finding safe routes while the wall and Black Pieces close in.</p>
        <p>The queen counter appears after Black's first move. When it fills, the Grand Regent Queen arrives.</p>
        <p>White wins by reaching the row beneath the royal guard. Black wins by trapping the king or sealing the crossing.</p>
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
            <span class="tutorial_player_label">Player 1: White Pieces</span>
        </span>
        <span class="tutorial_player_card">
            <span class="tutorial_black_pieces">♟ ♞ ♝ ♛ ♜</span>
            <span class="tutorial_player_label">Player 2: Black Pieces</span>
        </span>
    </span>
    <span id="tutorial_duel_hint">Click anywhere to begin.</span>
`;
document.body.append(tutorial_duel_screen);

const tutorial_control_button = document.createElement("button");
tutorial_control_button.id = "tutorial_control_button";
tutorial_control_button.type = "button";
tutorial_control_button.textContent = "Skip tutorial";
tutorial_control_button.setAttribute("aria-label", "Start or skip the tutorial");
document.body.append(tutorial_control_button);

const tutorial_slide_number = document.createElement("div");
tutorial_slide_number.id = "tutorial_slide_number";
document.body.append(tutorial_slide_number);

const tutorial_text = document.createElement("div");
tutorial_text.id = "tutorial_text";
tutorial_text.className = "hidden";
tutorial_text.setAttribute("aria-live", "polite");
document.body.append(tutorial_text);

const tutorial_notice = document.createElement("div");
tutorial_notice.id = "tutorial_notice";
tutorial_notice.className = "hidden";
tutorial_notice.setAttribute("aria-live", "assertive");
document.body.append(tutorial_notice);

const tutorial_queen_countdown = document.createElement("div");
tutorial_queen_countdown.id = "tutorial_queen_countdown";
tutorial_queen_countdown.className = "hidden";
tutorial_queen_countdown.innerHTML = `
    <span id="tutorial_queen_countdown_icon">♛</span>
    <span id="tutorial_queen_countdown_label">Grand Regent Queen</span>
    <span id="tutorial_queen_countdown_turns">0/12</span>
`;
document.body.append(tutorial_queen_countdown);

const tutorial_rule_steps = Object.freeze([
    Object.freeze({
        "phase": "rule_place_piece",
        "focus": "top_row",
        "text": (
            "Player 2 controls the Black Pieces. Black chooses a top-row " +
            "square for each new piece, using the mouse or the arrow keys " +
            "and Space."
        )
    }),
    Object.freeze({
        "phase": "rule_king_moves",
        "focus": "king",
        "text": (
            "Player 1 controls the White Pieces. White guides the king " +
            "upward by clicking a dot, or by using W, A, S, D and Space."
        )
    }),
    Object.freeze({
        "phase": "rule_pawn_wall",
        "focus": "danger_row",
        "text": (
            "The pawn wall keeps climbing. Stay off the wall and the row just " +
            "above it."
        )
    }),
    Object.freeze({
        "phase": "rule_bishop_capture",
        "focus": "enemy_attacks",
        "text": (
            "The king can capture a black piece when it is left undefended."
        )
    }),
    Object.freeze({
        "phase": "rule_bishop_defended",
        "focus": "enemy_attacks",
        "text": (
            "If another black piece protects it, that capture is no longer safe."
        )
    }),
    Object.freeze({
        "phase": "rule_stage_goal",
        "focus": "stage_goal",
        "text": (
            "Player 1 can use Eagle Vision to reveal danger, then Royal " +
            "Jump to give the king a longer leap when the path gets tight."
        )
    }),
    Object.freeze({
        "phase": "rule_queen_wrath",
        "focus": "queen_phase",
        "text": (
            "When the counter reaches 12, the Grand Regent Queen enters and " +
            "Queen's Wrath joins Player 2's Black Pieces."
        )
    }),
    Object.freeze({
        "phase": "rule_queen_goal",
        "focus": "queen_goal",
        "text": (
            "In the final duel, White must reach the highlighted row beneath " +
            "the royal guard."
        )
    })
]);

const tutorial_practice_steps = Object.freeze([
    Object.freeze({
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
    Object.freeze({
        "phase": "practice_place_pawn",
        "focus": "top_row",
        "action": "place_piece",
        "text": (
            "Player 2 moves first as the Black Pieces. Their pieces enter " +
            "from the top row, starting the repeating cycle of pawn, knight, " +
            "bishop. Place the opening pawn."
        )
    }),
    Object.freeze({
        "phase": "practice_move_king",
        "focus": "king",
        "action": "move_king",
        "text": (
            "Player 1 answers as the White Pieces. Choose a safe dot for " +
            "the king and keep climbing toward the top of the board."
        )
    }),
    Object.freeze({
        "phase": "practice_place_knight",
        "focus": "top_row",
        "action": "place_piece",
        "text": (
            "Player 2 continues the Black Pieces cycle. After the pawn " +
            "comes the knight. A knight protects L-shaped squares, so the " +
            "outlined file lets it defend the pawn from a distance."
        )
    }),
    Object.freeze({
        "phase": "practice_eagle_vision",
        "focus": "stage_goal",
        "action": "eagle_vision",
        "text": (
            "When the board starts to feel crowded, White can call Eagle " +
            "Vision. Use it now to reveal the danger squares in blue."
        )
    }),
    Object.freeze({
        "phase": "practice_move_after_vision",
        "focus": "king",
        "action": "move_king",
        "text": (
            "Now use what Eagle Vision showed you. Move the king to a safe " +
            "dot that avoids the blue danger."
        )
    }),
    Object.freeze({
        "phase": "practice_place_bishop",
        "focus": "top_row",
        "action": "place_piece",
        "text": (
            "The third Player 2 piece is the bishop. The strongest bishop is " +
            "not just nearby: it works with the knight's L-shape so Black's " +
            "pieces protect each other."
        )
    }),
    Object.freeze({
        "phase": "practice_royal_jump",
        "focus": "stage_goal",
        "action": "royal_jump",
        "text": (
            "White also has Royal Jump for tight moments. Use it now and the " +
            "king's normal dots will open into a wider gold jump range."
        )
    }),
    Object.freeze({
        "phase": "practice_use_jump",
        "focus": "king",
        "action": "move_king",
        "text": (
            "Royal Jump only lasts for this move. Choose one of the gold dots " +
            "and leap before Black closes in."
        )
    }),
    Object.freeze({
        "phase": "practice_queen_countdown_intro",
        "focus": "queen_meter",
        "action": "continue",
        "text": (
            "Those turns build toward the Grand Regent Queen. After 12 " +
            "turns, the board enters the final duel. Click when you are " +
            "ready to watch the route speed up from here."
        )
    }),
    Object.freeze({
        "phase": "practice_queen_countdown",
        "focus": "queen_meter",
        "action": "watch_queen_countdown",
        "setup": "queen_countdown",
        "text": (
            "The route now accelerates toward turn 12. White keeps climbing " +
            "and uses abilities when the path gets tight."
        )
    }),
    Object.freeze({
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
    Object.freeze({
        "phase": "practice_queens_wrath",
        "focus": "queen_phase",
        "action": "queens_wrath",
        "text": (
            "In the final duel, Player 2's Black Pieces gain Queen's " +
            "Wrath. Use it to call a rook onto the board and tighten the " +
            "net around the king."
        )
    }),
    Object.freeze({
        "phase": "practice_place_rook",
        "focus": "queen_phase",
        "action": "spawn_wrath_rook",
        "text": (
            "Call the rook onto the outlined square. It helps Black close " +
            "space while the queen still keeps watch."
        )
    }),
    Object.freeze({
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

const same_position = function (first, second) {
    return (
        first !== undefined &&
        second !== undefined &&
        first.column === second.column &&
        first.row === second.row
    );
};

const current_practice_step = function () {
    if (!tutorial_active || tutorial_mode !== "practice") {
        return undefined;
    }

    return tutorial_practice_steps[tutorial_step_index];
};

const tutorial_allows_action = function (action) {
    const step = current_practice_step();

    return step === undefined || step.action === action;
};

const set_tutorial_guided_square = function (position, kind = "suggested") {
    tutorial_guided_square = (
        position === undefined
        ? undefined
        : {
            "column": position.column,
            "row": position.row
        }
    );
    tutorial_guided_kind = (
        tutorial_guided_square === undefined
        ? "none"
        : kind
    );
};

const clear_tutorial_guided_square = function () {
    set_tutorial_guided_square(undefined);
};

const hide_tutorial_notice = function () {
    clearTimeout(tutorial_notice_timer);
    tutorial_notice.classList.add("hidden");
};

const show_tutorial_notice = function (message, duration = 1800) {
    clearTimeout(tutorial_notice_timer);
    tutorial_notice.textContent = message;
    tutorial_notice.classList.remove("hidden");

    if (duration === 0) {
        return;
    }

    tutorial_notice_timer = setTimeout(function () {
        tutorial_notice.classList.add("hidden");
    }, duration);
};

const square_colour_class = function (position) {
    if ((position.column + position.row + game.turn) % 2 === 0) {
        return "light_square";
    }

    return "dark_square";
};

const tutorial_slide_number_for_phase = function () {
    if (tutorial_phase === "title") {
        return 1;
    }

    if (tutorial_phase === "duel_intro") {
        return 2;
    }

    if (
        tutorial_phase === "king_opening" ||
        tutorial_phase === "player_one" ||
        tutorial_phase === "pawn_chase"
    ) {
        return 3;
    }

    const rule_index = tutorial_rule_steps.findIndex(function (step) {
        return step.phase === tutorial_phase;
    });

    if (rule_index >= 0) {
        return rule_index + 4;
    }

    const practice_index = tutorial_practice_steps.findIndex(function (step) {
        return step.phase === tutorial_phase;
    });

    if (practice_index >= 0) {
        return practice_index + 3;
    }

    if (tutorial_phase === "practice_complete") {
        return tutorial_practice_steps.length + 3;
    }

    return "";
};

const update_tutorial_slide_number = function () {
    if (!tutorial_active || tutorial_phase === "completed") {
        tutorial_slide_number.classList.add("hidden");
        return;
    }

    tutorial_slide_number.textContent = tutorial_slide_number_for_phase();
    tutorial_slide_number.classList.remove("hidden");
};

const clear_all_timers = function () {
    clearTimeout(pawn_wave_timer);
    clearTimeout(opening_timer);
    clearTimeout(result_timer);
    clearTimeout(royal_guard_timer);
    clearTimeout(queen_arrival_timer);
    clearTimeout(tutorial_timer);
    clearTimeout(tutorial_notice_timer);
    clearTimeout(queen_notice_timer);
    clearTimeout(ai_turn_timer);
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
    pawn_wave_rows = 1;

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
    queens_wrath_revealed = false;
    queen_notice_state = "hidden";
    queen_notice.classList.add("hidden");
    queen_notice.classList.remove("queen_notice_fly");
    hide_tutorial_notice();

    hovered_column = undefined;
    hovered_position = undefined;
    clear_tutorial_guided_square();

    if (result_dialog.open) {
        result_dialog.close();
    }

    single_player_dialog.classList.add("hidden");

    game_board.offsetHeight;

    setTimeout(function () {
        game_board.classList.remove("no_scroll_transition");
    }, 0);
};

const tutorial_uses_click_to_advance = function () {
    const step = current_practice_step();

    return (
        tutorial_mode === "classic" ||
        tutorial_phase === "title" ||
        tutorial_phase === "duel_intro" ||
        (
            tutorial_mode === "practice" &&
            step !== undefined &&
            step.action === "continue"
        )
    );
};

const hide_tutorial_layers = function () {
    tutorial_title_screen.classList.add("hidden");
    tutorial_duel_screen.classList.add("hidden");
    tutorial_text.classList.add("hidden");
    tutorial_notice.classList.add("hidden");
    tutorial_queen_countdown.classList.add("hidden");
    tutorial_slide_number.classList.add("hidden");
    document.body.classList.remove("tutorial_start_mode");
    document.body.classList.remove("tutorial_board_focus_mode");
    document.body.classList.remove("tutorial_countdown_mode");
    document.body.classList.remove("tutorial_continue_mode");
    document.body.classList.remove("tutorial_focus_abilities");
    document.body.classList.remove("tutorial_focus_queen_meter");
    document.body.classList.remove("tutorial_focus_queens_wrath");
    document.body.classList.remove("tutorial_practice_mode");
    tutorial_focus = "none";
    tutorial_step_index = 0;
    clear_tutorial_guided_square();
    clearInterval(tutorial_animation_timer);
    clearTimeout(tutorial_fast_forward_timer);
    clearTimeout(tutorial_notice_timer);
};

const update_tutorial_focus_class = function () {
    document.body.classList.toggle(
        "tutorial_focus_abilities",
        tutorial_focus === "stage_goal" ||
        tutorial_phase === "practice_eagle_vision" ||
        tutorial_phase === "practice_royal_jump" ||
        tutorial_focus === "queen_phase" ||
        tutorial_focus === "queen_goal"
    );
    document.body.classList.toggle(
        "tutorial_focus_queen_meter",
        tutorial_focus === "queen_meter" ||
        tutorial_focus === "queen_phase" ||
        tutorial_focus === "queen_goal"
    );
    document.body.classList.toggle(
        "tutorial_focus_queens_wrath",
        tutorial_focus === "queen_phase"
    );
};

const complete_tutorial = function () {
    clearTimeout(tutorial_timer);

    tutorial_active = false;
    tutorial_mode = "practice";
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
    tutorial_mode = "practice";
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
    tutorial_mode = "practice";
    tutorial_phase = "title";
    tutorial_focus = "none";
    tutorial_step_index = 0;

    tutorial_control_button.textContent = "Skip tutorial";

    tutorial_title_screen.classList.remove("hidden");
    tutorial_duel_screen.classList.add("hidden");
    tutorial_text.classList.add("hidden");
    document.body.classList.add("tutorial_start_mode");
    document.body.classList.remove("tutorial_board_focus_mode");
    update_tutorial_slide_number();

    input_locked = true;
    redraw_board();
};

const start_tutorial_at_duel_intro = function (mode = "practice") {
    reset_game_state();

    tutorial_active = true;
    tutorial_mode = mode;
    tutorial_phase = "duel_intro";
    tutorial_focus = "none";
    tutorial_step_index = 0;

    tutorial_control_button.textContent = "Skip tutorial";

    tutorial_title_screen.classList.add("hidden");
    tutorial_duel_screen.classList.remove("hidden");
    tutorial_text.classList.add("hidden");
    document.body.classList.add("tutorial_start_mode");
    document.body.classList.remove("tutorial_board_focus_mode");
    update_tutorial_slide_number();

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
    update_tutorial_slide_number();
};

const start_tutorial_king_opening = function () {
    tutorial_phase = "king_opening";

    tutorial_duel_screen.classList.add("hidden");
    tutorial_text.classList.add("hidden");
    document.body.classList.remove("tutorial_start_mode");
    document.body.classList.remove("tutorial_board_focus_mode");
    update_tutorial_slide_number();

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
        "Black's pawn wall keeps climbing behind the king."
    );
    tutorial_text.classList.remove("hidden");
    document.body.classList.add("tutorial_board_focus_mode");
    update_tutorial_slide_number();

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

    tutorial_mode = "classic";
    hide_tutorial_notice();
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
    update_tutorial_slide_number();

    if (
        tutorial_phase === "rule_place_piece" ||
        tutorial_phase === "rule_king_moves" ||
        tutorial_phase === "rule_bishop_capture" ||
        tutorial_phase === "rule_bishop_defended" ||
        tutorial_phase === "rule_stage_goal" ||
        tutorial_phase === "rule_queen_wrath" ||
        tutorial_phase === "rule_queen_goal"
    ) {
        tutorial_animation_start = Date.now();
        tutorial_animation_timer = setInterval(redraw_board, 80);
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

const prepare_practice_queen_duel = function () {
    clearTimeout(pawn_wave_timer);
    clearTimeout(opening_timer);
    clearTimeout(royal_guard_timer);
    clearTimeout(queen_arrival_timer);

    pawn_wave_active = false;
    pawn_wave_column = -1;
    pawn_wave_rows = 1;
    opening_active = false;
    opening_phase = "none";
    royal_guard_arrival_active = false;
    royal_guard_arrival_started = false;
    royal_guard_column = -1;
    queen_arrival_active = false;
    queen_arrival_started = false;
    queen_removed_positions = [];
    queen_animation_position = undefined;

    game = KingCrossing.begin_queen_duel(
        KingCrossing.begin_queen_arrival(game)
    );

    input_locked = false;
    eagle_vision_active = false;
    royal_jump_active = false;
    royal_jump_charge = royal_jump_max_charge;
    queens_wrath_active = false;
    queens_wrath_revealed = true;
    hovered_column = undefined;
    hovered_position = undefined;
    clear_tutorial_guided_square();
};

const update_tutorial_queen_countdown = function () {
    el("tutorial_queen_countdown_turns").textContent = (
        `${Math.min(tutorial_countdown_turns, game.target_turns)}/` +
        `${game.target_turns}`
    );
};

const finish_tutorial_queen_countdown = function () {
    clearTimeout(tutorial_fast_forward_timer);
    tutorial_fast_forward_timer = undefined;
    input_locked = true;
    clear_tutorial_guided_square();
    eagle_vision_active = false;
    royal_jump_active = false;

    game = KingCrossing.begin_queen_arrival(game);
    update_tutorial_queen_countdown();
    redraw_board();

    tutorial_timer = setTimeout(function () {
        tutorial_queen_countdown.classList.add("hidden");
        document.body.classList.remove("tutorial_countdown_mode");
        tutorial_step_index += 1;
        show_current_practice_step();
    }, 850);
};

const tutorial_fast_forward_delay = function () {
    const progress = tutorial_countdown_turns / game.target_turns;

    return Math.max(70, Math.round(420 - (progress * 330)));
};

const schedule_tutorial_fast_forward_turn = function () {
    clearTimeout(tutorial_fast_forward_timer);

    tutorial_fast_forward_timer = setTimeout(function () {
        play_one_tutorial_fast_forward_turn();

        if (
            tutorial_active &&
            tutorial_phase === "practice_queen_countdown" &&
            (
                tutorial_countdown_turns >= game.target_turns ||
                game.phase === "royal_guard_arrival"
            )
        ) {
            finish_tutorial_queen_countdown();
            return;
        }

        if (
            tutorial_active &&
            tutorial_phase === "practice_queen_countdown"
        ) {
            schedule_tutorial_fast_forward_turn();
        }
    }, tutorial_fast_forward_delay());
};

const play_one_tutorial_fast_forward_turn = function () {
    if (
        !tutorial_active ||
        tutorial_phase !== "practice_queen_countdown" ||
        game.result !== "playing"
    ) {
        return;
    }

    if (
        tutorial_countdown_turns >= game.target_turns ||
        game.phase === "royal_guard_arrival"
    ) {
        finish_tutorial_queen_countdown();
        return;
    }

    const previous_turn = game.turn;
    eagle_vision_active = false;
    royal_jump_active = false;

    if (game.phase === "place_piece") {
        const placement = KingCrossing.choose_countdown_piece_placement(game);

        if (placement !== undefined) {
            set_tutorial_guided_square({
                "column": placement.column,
                "row": game.height - 1
            }, "black");
            game = KingCrossing.place_piece(game, placement.column);
        }
    } else if (game.phase === "move_king") {
        const move = KingCrossing.choose_countdown_king_move(game);

        if (move !== undefined) {
            eagle_vision_active = (
                tutorial_countdown_turns === 2 ||
                tutorial_countdown_turns === 7
            );
            royal_jump_active = move.royal_jump === true;
            set_tutorial_guided_square(
                move.position,
                move.royal_jump === true ? "royal_jump" : "white"
            );
            game = KingCrossing.move_king_to(
                game,
                move.position,
                move.royal_jump === true
            );
        }

        if (game.phase === "scroll_world") {
            game = KingCrossing.finish_forward_move(game);
        }
    }

    if (game.result !== "playing") {
        tutorial_countdown_turns = game.target_turns;
        finish_tutorial_queen_countdown();
        return;
    }

    if (game.turn > previous_turn) {
        tutorial_countdown_turns = game.turn;
    }

    tutorial_countdown_turns = Math.min(
        tutorial_countdown_turns,
        game.target_turns
    );

    update_tutorial_queen_countdown();
    redraw_board();
};

const prepare_practice_queen_countdown = function () {
    clearTimeout(tutorial_fast_forward_timer);
    clearTimeout(tutorial_timer);
    clearTimeout(pawn_wave_timer);
    clearTimeout(opening_timer);
    clearTimeout(royal_guard_timer);
    clearTimeout(queen_arrival_timer);

    input_locked = true;
    pawn_wave_active = false;
    pawn_wave_column = -1;
    pawn_wave_rows = 1;
    opening_active = false;
    opening_phase = "none";
    royal_guard_arrival_active = false;
    royal_guard_arrival_started = false;
    queen_arrival_active = false;
    queen_arrival_started = false;
    hovered_column = undefined;
    hovered_position = undefined;
    queen_notice_state = "panel";
    clear_tutorial_guided_square();

    eagle_vision_active = false;
    royal_jump_active = false;
    queens_wrath_active = false;

    if (game.phase === "scroll_world") {
        game = KingCrossing.finish_forward_move(game);
    }

    tutorial_countdown_turns = Math.min(game.turn, game.target_turns);

    tutorial_queen_countdown.classList.remove("hidden");
    document.body.classList.add("tutorial_countdown_mode");
    update_tutorial_queen_countdown();

    tutorial_timer = setTimeout(function () {
        schedule_tutorial_fast_forward_turn();
    }, 2200);
};

const apply_practice_step_setup = function (step) {
    if (step.setup === "crossing_story") {
        start_opening_animation();
    } else {
        clearTimeout(opening_timer);
        opening_active = false;
        opening_phase = "none";
        opening_king_row = -1;
        opening_pawn_column = -1;
    }

    if (step.setup === "queen_countdown") {
        prepare_practice_queen_countdown();
    }

    if (step.setup === "queen_duel") {
        prepare_practice_queen_duel();
    }

    if (step.setup === "complete_notice") {
        tutorial_text.classList.add("hidden");
        show_tutorial_notice(
            "Tutorial complete. Congratulations. Click anywhere to begin.",
            0
        );
    }

    if (step.action === "place_piece" || step.action === "spawn_wrath_rook") {
        hovered_column = undefined;
        hovered_position = undefined;
    }
};

const show_current_practice_step = function () {
    const step = tutorial_practice_steps[tutorial_step_index];

    hide_tutorial_notice();
    clearInterval(tutorial_animation_timer);
    clearTimeout(tutorial_fast_forward_timer);
    clearTimeout(tutorial_timer);
    tutorial_animation_start = Date.now();
    tutorial_queen_countdown.classList.add("hidden");
    document.body.classList.remove("tutorial_countdown_mode");
    document.body.classList.remove("tutorial_continue_mode");

    if (step === undefined) {
        skip_tutorial_to_game();
        return;
    }

    tutorial_phase = step.phase;
    tutorial_focus = step.focus;
    tutorial_text.textContent = step.text;
    tutorial_text.classList.remove("hidden");
    tutorial_control_button.textContent = "Skip tutorial";
    document.body.classList.remove("tutorial_start_mode");
    document.body.classList.add("tutorial_board_focus_mode");
    document.body.classList.add("tutorial_practice_mode");
    document.body.classList.toggle("tutorial_continue_mode", step.action === "continue");
    update_tutorial_focus_class();
    apply_practice_step_setup(step);
    update_tutorial_slide_number();
    input_locked = (
        step.action === "watch_queen_countdown" ||
        step.action === "continue"
    );
    redraw_board();
};

const start_practice_tutorial = function () {
    reset_game_state();

    play_mode = "multiplayer";
    human_side = "white";
    update_player_names_for_mode();

    tutorial_active = true;
    tutorial_mode = "practice";
    tutorial_step_index = 0;

    tutorial_title_screen.classList.add("hidden");
    tutorial_duel_screen.classList.add("hidden");

    show_current_practice_step();
};

const practice_step_accepts_action = function (step, details) {
    if (
        (
            step.phase === "practice_move_king" ||
            step.phase === "practice_move_after_vision"
        ) &&
        (details === undefined || details.forward !== true)
    ) {
        return false;
    }

    return true;
};

const advance_practice_after_action = function (action, details) {
    const step = tutorial_practice_steps[tutorial_step_index];

    if (
        !tutorial_active ||
        tutorial_mode !== "practice" ||
        step === undefined ||
        step.action !== action ||
        !practice_step_accepts_action(step, details)
    ) {
        return;
    }

    tutorial_step_index += 1;
    show_current_practice_step();
};

const show_player_one_spotlight = function () {
    if (!tutorial_active) {
        return;
    }

    tutorial_phase = "player_one";
    tutorial_focus = "king";

    tutorial_text.textContent = (
        "White guides the king upward through the crossing."
    );
    tutorial_text.classList.remove("hidden");
    document.body.classList.add("tutorial_board_focus_mode");
    update_tutorial_slide_number();

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
        if (tutorial_mode === "practice") {
            start_practice_tutorial();
            return;
        }

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
        return;
    }

    if (
        tutorial_mode === "practice" &&
        current_practice_step() !== undefined &&
        current_practice_step().action === "continue"
    ) {
        advance_practice_after_action("continue");
    }
};

const is_click_on_tutorial_control = function (event) {
    return (
        event.target === tutorial_control_button ||
        tutorial_control_button.contains(event.target) ||
        event.target === single_player_button ||
        single_player_button.contains(event.target)
    );
};

const suppress_tutorial_followup_click = function () {
    tutorial_click_suppressed_until = Date.now() + 350;
};

const update_player_names_for_mode = function () {
    if (play_mode === "multiplayer") {
        el("home_name").value = "Player 1";
        el("away_name").value = "Player 2";
        single_player_button.textContent = "Single Player";
        return;
    }

    single_player_button.textContent = "Multiplayer";

    if (human_side === "white") {
        el("home_name").value = "Player 1";
        el("away_name").value = "AI";
        return;
    }

    el("home_name").value = "AI";
    el("away_name").value = "Player 1";
};

const restart_match = function () {
    update_player_names_for_mode();
    reset_game_state();
    update_player_names_for_mode();
    tutorial_active = false;
    tutorial_phase = "completed";
    tutorial_focus = "none";
    hide_tutorial_layers();
    start_opening_animation();
};

const start_single_player = function (side) {
    play_mode = "single_player";
    human_side = side;
    single_player_dialog.classList.add("hidden");
    restart_match();
};

const return_to_multiplayer = function () {
    play_mode = "multiplayer";
    human_side = "white";
    restart_match();
};

const consume_tutorial_followup_click = function (event) {
    if (Date.now() > tutorial_click_suppressed_until) {
        return false;
    }

    tutorial_click_suppressed_until = 0;
    event.preventDefault();
    event.stopPropagation();

    return true;
};

tutorial_control_button.onclick = function (event) {
    event.preventDefault();
    event.stopPropagation();

    if (
        tutorial_active &&
        tutorial_mode === "practice" &&
        tutorial_phase === "practice_complete"
    ) {
        skip_tutorial_to_game();
        return;
    }

    if (tutorial_active) {
        skip_tutorial_to_game();
        return;
    }

    start_tutorial_at_duel_intro();
};

single_player_button.onclick = function () {
    if (play_mode === "single_player") {
        return_to_multiplayer();
        return;
    }

    single_player_dialog.classList.remove("hidden");
};

single_player_dialog.addEventListener("click", function (event) {
    const choice_button = event.target.closest("[data-side]");

    if (choice_button !== null) {
        start_single_player(choice_button.dataset.side);
        return;
    }

    if (event.target === single_player_dialog) {
        single_player_dialog.classList.add("hidden");
    }
});

document.addEventListener("pointerdown", function (event) {
    if (!tutorial_active || !tutorial_uses_click_to_advance()) {
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

    if (
        !tutorial_active ||
        !tutorial_uses_click_to_advance() ||
        pointer_down === undefined
    ) {
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
    event.stopPropagation();
    suppress_tutorial_followup_click();
    tutorial_click();
});

document.addEventListener("click", function (event) {
    if (single_player_dialog.contains(event.target)) {
        return;
    }

    consume_tutorial_followup_click(event);
}, true);

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
        position.row === pawn_wave_rows &&
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
        (
            tutorial_focus === "top_row" ||
            tutorial_focus === "crossing_story"
        ) &&
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

const is_tutorial_pawn_wall_danger_square = function (position) {
    return (
        tutorial_active &&
        tutorial_focus === "danger_row" &&
        position.row === 1
    );
};

const is_tutorial_queen_goal_focus_square = function (position) {
    return (
        tutorial_active &&
        (
            (
                tutorial_phase === "rule_queen_goal" &&
                tutorial_queen_vision_revealed()
            ) ||
            tutorial_phase === "practice_endgame_goal"
        ) &&
        position.row === game.height - 2
    );
};

const is_tutorial_stage_goal_square = function (position) {
    return (
        tutorial_active &&
        tutorial_focus === "crossing_story" &&
        position.column === game.king.column &&
        position.row > game.king.row &&
        position.row < game.height - 1
    );
};

const tutorial_knight_position = function () {
    return {"column": 1, "row": game.height - 1};
};

const tutorial_placing_column = function (elapsed, start, end, columns) {
    const progress = Math.min(Math.max((elapsed - start) / (end - start), 0), 1);
    const index = Math.min(
        Math.floor(progress * columns.length),
        columns.length - 1
    );

    return columns[index];
};

const tutorial_placing_pawn_position = function () {
    return undefined;
};

const tutorial_placing_knight_column = function () {
    const elapsed = tutorial_place_elapsed();

    if (elapsed < tutorial_knight_place_start_time) {
        return undefined;
    }

    if (elapsed >= tutorial_place_click_time) {
        return 2;
    }

    const travel = elapsed - tutorial_knight_place_start_time;
    const first_leg = 1450;
    const second_leg = tutorial_place_click_time - tutorial_knight_place_start_time - first_leg;

    if (travel < first_leg) {
        return 2 + 4 * (travel / first_leg);
    }

    return 6 - 4 * ((travel - first_leg) / second_leg);
};

const tutorial_placing_knight_position = function () {
    const column = tutorial_placing_knight_column();

    if (column === undefined) {
        return undefined;
    }

    return {
        "column": Math.round(Math.min(Math.max(column, 0), 7)),
        "row": game.height - 1
    };
};

const tutorial_place_elapsed = function () {
    return (Date.now() - tutorial_animation_start) % tutorial_place_cycle;
};

const tutorial_king_move_elapsed = function () {
    return (Date.now() - tutorial_animation_start) % tutorial_king_move_cycle;
};

const tutorial_king_move_target = function () {
    return {"column": game.king.column, "row": game.king.row + 1};
};

const tutorial_king_move_position = function () {
    if (tutorial_king_move_elapsed() < tutorial_king_move_click_time) {
        return game.king;
    }

    return tutorial_king_move_target();
};

const tutorial_bishop_elapsed = function () {
    return (Date.now() - tutorial_animation_start) % tutorial_bishop_cycle;
};

const tutorial_bishop_capture_used = function () {
    return tutorial_bishop_elapsed() >= tutorial_bishop_click_time;
};

const tutorial_bishop_position = function () {
    return {"column": 2, "row": 6};
};

const tutorial_capture_king_position = function () {
    return {"column": 2, "row": 5};
};

const tutorial_bishop_demo_king_position = function () {
    if (tutorial_bishop_capture_used()) {
        return tutorial_bishop_position();
    }

    return tutorial_capture_king_position();
};

const tutorial_queen_position = function () {
    return {"column": 4, "row": 6};
};

const tutorial_rook_position = function () {
    return {"column": 1, "row": 5};
};

const tutorial_queen_wrath_elapsed = function () {
    return (Date.now() - tutorial_animation_start) % tutorial_queen_wrath_cycle;
};

const tutorial_queen_vision_elapsed = function () {
    return (Date.now() - tutorial_animation_start) % tutorial_queen_vision_cycle;
};

const tutorial_queen_wrath_armed = function () {
    return tutorial_queen_wrath_elapsed() >= tutorial_queen_wrath_click_time;
};

const tutorial_queen_rook_placed = function () {
    return tutorial_queen_wrath_elapsed() >= tutorial_queen_rook_click_time;
};

const tutorial_queen_vision_revealed = function () {
    return tutorial_queen_vision_elapsed() >= tutorial_queen_vision_click_time;
};

const tutorial_stage_bishop_position = function () {
    return {"column": game.king.column + 2, "row": 6};
};

const tutorial_stage_knight_position = function () {
    return {"column": game.king.column - 2, "row": 6};
};

const tutorial_stage_move_target = function () {
    return {"column": game.king.column + 2, "row": game.king.row + 2};
};

const tutorial_stage_elapsed = function () {
    return (Date.now() - tutorial_animation_start) % tutorial_ability_cycle;
};

const tutorial_stage_eagle_revealed = function () {
    const elapsed = tutorial_stage_elapsed();

    return (
        elapsed >= tutorial_eagle_click_time &&
        elapsed < tutorial_move_click_time
    );
};

const tutorial_stage_jump_revealed = function () {
    const elapsed = tutorial_stage_elapsed();

    return (
        elapsed >= tutorial_jump_click_time &&
        elapsed < tutorial_move_click_time
    );
};

const tutorial_stage_king_position = function () {
    if (tutorial_stage_elapsed() < tutorial_move_click_time) {
        return game.king;
    }

    return tutorial_stage_move_target();
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

const tutorial_knight_attacks_from = function (knight) {
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

const tutorial_knight_attack_squares = function () {
    return tutorial_knight_attacks_from(tutorial_knight_position());
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
    ]).concat(tutorial_knight_attacks_from(tutorial_stage_knight_position()));
};

const tutorial_demo_token_at = function (position) {
    if (!tutorial_active || tutorial_phase.indexOf("rule_") !== 0) {
        return undefined;
    }

    if (
        tutorial_phase === "rule_place_piece" &&
        same_position(position, tutorial_placing_pawn_position())
    ) {
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
        same_position(position, tutorial_bishop_demo_king_position())
    ) {
        return 1;
    }

    if (
        (
            tutorial_phase === "rule_bishop_capture" ||
            tutorial_phase === "rule_bishop_defended"
        ) &&
        !tutorial_bishop_capture_used() &&
        same_position(position, tutorial_bishop_position())
    ) {
        return 4;
    }

    if (
        tutorial_phase === "rule_king_moves" &&
        same_position(position, tutorial_king_move_position())
    ) {
        return 1;
    }

    if (
        tutorial_phase === "rule_stage_goal" &&
        same_position(position, tutorial_stage_king_position())
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
        (
            tutorial_phase === "rule_queen_wrath" ||
            tutorial_phase === "rule_queen_goal"
        ) &&
        same_position(position, tutorial_queen_position())
    ) {
        return 5;
    }

    if (
        (
            (
                tutorial_phase === "rule_queen_wrath" &&
                tutorial_queen_rook_placed()
            ) ||
            tutorial_phase === "rule_queen_goal"
        ) &&
        same_position(position, tutorial_rook_position())
    ) {
        return 7;
    }

    if (
        (
            tutorial_phase === "rule_queen_wrath" ||
            tutorial_phase === "rule_queen_goal"
        ) &&
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
        same_position(position, tutorial_placing_knight_position()) &&
        tutorial_place_elapsed() < tutorial_place_click_time
    );
};

const is_tutorial_placed_knight_square = function (position) {
    return (
        tutorial_active &&
        tutorial_phase === "rule_place_piece" &&
        same_position(position, tutorial_placing_knight_position()) &&
        tutorial_place_elapsed() >= tutorial_place_click_time
    );
};

const is_tutorial_placing_pawn_square = function (position) {
    return false;
};

const is_tutorial_placed_pawn_square = function (position) {
    return false;
};

const is_tutorial_move_hint_square = function (position) {
    return (
        tutorial_active &&
        tutorial_phase === "rule_king_moves" &&
        tutorial_king_move_elapsed() < tutorial_king_move_click_time &&
        Math.abs(position.column - game.king.column) <= 1 &&
        Math.abs(position.row - game.king.row) <= 1 &&
        !same_position(position, game.king) &&
        position.row > 0
    );
};

const is_tutorial_attack_square = function (position) {
    return false;
};

const is_tutorial_capture_square = function (position) {
    return (
        tutorial_active &&
        (
            tutorial_phase === "rule_bishop_capture" ||
            tutorial_phase === "rule_bishop_defended"
        ) &&
        !tutorial_bishop_capture_used() &&
        same_position(position, tutorial_bishop_position())
    );
};

const is_tutorial_self_check_square = function (position) {
    return (
        tutorial_active &&
        tutorial_phase === "rule_bishop_defended" &&
        tutorial_bishop_capture_used() &&
        (
            same_position(position, tutorial_bishop_position()) ||
            same_position(position, tutorial_knight_position())
        )
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
    if (
        !tutorial_active ||
        tutorial_phase !== "rule_queen_goal" ||
        !tutorial_queen_vision_revealed()
    ) {
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
        (
            tutorial_phase === "player_one" ||
            tutorial_focus === "crossing_story"
        ) &&
        tutorial_positions_include([
            {"column": game.king.column, "row": game.king.row + 1},
            {"column": game.king.column, "row": game.king.row + 2}
        ], position)
    ) {
        return true;
    }

    return false;
};

const is_tutorial_stage_normal_move_square = function (position) {
    return (
        tutorial_active &&
        tutorial_phase === "rule_stage_goal" &&
        !tutorial_stage_jump_revealed() &&
        tutorial_stage_elapsed() < tutorial_move_click_time &&
        Math.abs(position.column - game.king.column) <= 1 &&
        Math.abs(position.row - game.king.row) <= 1 &&
        !same_position(position, game.king) &&
        is_inside_board(position) &&
        !KingCrossing.is_pawn_wall(game, position)
    );
};

const is_tutorial_royal_jump_square = function (position) {
    return (
        tutorial_active &&
        tutorial_phase === "rule_stage_goal" &&
        tutorial_stage_jump_revealed() &&
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
        tutorial_stage_eagle_revealed() &&
        tutorial_positions_include(tutorial_stage_attack_squares(), position)
    );
};

const is_tutorial_jump_target_square = function (position) {
    return (
        tutorial_active &&
        tutorial_phase === "rule_stage_goal" &&
        tutorial_stage_jump_revealed() &&
        same_position(position, tutorial_stage_move_target())
    );
};

const is_tutorial_rule_square = function (position) {
    return (
        is_tutorial_move_hint_square(position) ||
        is_tutorial_stage_normal_move_square(position) ||
        (
            tutorial_active &&
            tutorial_phase === "rule_place_piece" &&
            position.row === game.height - 1
        )
    );
};

const preferred_tutorial_column = function (columns, preferred_column) {
    if (columns.indexOf(preferred_column) >= 0) {
        return preferred_column;
    }

    return columns[Math.floor(columns.length / 2)];
};

const tutorial_recommended_placement_square = function (step) {
    const columns = legal_black_placement_columns();

    if (columns.length === 0) {
        return undefined;
    }

    if (step.phase === "practice_place_pawn") {
        return {
            "column": preferred_tutorial_column(columns, 4),
            "row": game.height - 1
        };
    }

    if (step.phase === "practice_place_knight") {
        return {
            "column": preferred_tutorial_column(columns, 2),
            "row": game.height - 1
        };
    }

    if (step.phase === "practice_place_bishop") {
        return {
            "column": preferred_tutorial_column(columns, 4),
            "row": game.height - 1
        };
    }

    return {
        "column": preferred_tutorial_column(columns, columns[0]),
        "row": game.height - 1
    };
};

const king_square_distance = function (position) {
    return Math.max(
        Math.abs(position.column - game.king.column),
        Math.abs(position.row - game.king.row)
    );
};

const king_file_distance = function (position) {
    return Math.abs(position.column - game.king.column);
};

const tutorial_recommended_king_square = function () {
    const positions = legal_king_positions();
    const jump_choices = positions.filter(function (position) {
        return royal_jump_active && king_square_distance(position) === 2;
    });

    if (jump_choices.length > 0) {
        return jump_choices.sort(function (first, second) {
            return (
                (second.row - first.row) ||
                (king_file_distance(first) - king_file_distance(second))
            );
        })[0];
    }

    const forward_position = {
        "column": game.king.column,
        "row": game.king.row + 1
    };

    if (
        positions.some(function (position) {
            return same_position(position, forward_position);
        })
    ) {
        return forward_position;
    }

    return first_legal_position(positions);
};

const tutorial_recommended_square = function () {
    const step = current_practice_step();

    if (tutorial_guided_square !== undefined) {
        return tutorial_guided_square;
    }

    if (step === undefined) {
        return undefined;
    }

    if (step.action === "place_piece") {
        return tutorial_recommended_placement_square(step);
    }

    if (step.action === "move_king") {
        return tutorial_recommended_king_square();
    }

    if (step.action === "spawn_wrath_rook") {
        return first_legal_position(legal_wrath_positions());
    }

    return undefined;
};

const is_tutorial_guided_square = function (position) {
    return (
        tutorial_active &&
        same_position(position, tutorial_recommended_square())
    );
};

const tutorial_requires_guided_square = function (action) {
    const step = current_practice_step();

    return (
        tutorial_active &&
        tutorial_mode === "practice" &&
        step !== undefined &&
        step.action === action &&
        (
            action === "place_piece" ||
            action === "move_king" ||
            action === "spawn_wrath_rook"
        )
    );
};

const tutorial_accepts_guided_square = function (action, position) {
    if (!tutorial_requires_guided_square(action)) {
        return true;
    }

    return same_position(position, tutorial_recommended_square());
};

const remind_guided_square = function () {
    show_tutorial_notice(
        "For this tutorial, use the outlined square first."
    );
};

const tutorial_guided_square_kind = function () {
    const step = current_practice_step();

    if (tutorial_guided_square !== undefined) {
        return tutorial_guided_kind;
    }

    if (step === undefined) {
        return "none";
    }

    if (step.action === "place_piece" || step.action === "spawn_wrath_rook") {
        return "black";
    }

    if (step.action === "move_king" && royal_jump_active) {
        return "royal_jump";
    }

    if (step.action === "move_king") {
        return "white";
    }

    return "suggested";
};

const is_tutorial_focus_square = function (position) {
    return (
        is_tutorial_demo_piece_square(position) ||
        is_tutorial_guided_square(position) ||
        is_tutorial_king_focus_square(position) ||
        is_tutorial_pawn_focus_square(position) ||
        is_tutorial_top_row_focus_square(position) ||
        is_tutorial_danger_focus_square(position) ||
        is_tutorial_pawn_wall_danger_square(position) ||
        is_tutorial_queen_goal_focus_square(position) ||
        is_tutorial_rule_square(position) ||
        is_tutorial_attack_square(position) ||
        is_tutorial_capture_square(position) ||
        is_tutorial_self_check_square(position) ||
        is_tutorial_queen_attack_square(position) ||
        is_tutorial_stage_goal_square(position) ||
        is_tutorial_arrow_square(position) ||
        is_tutorial_royal_jump_square(position) ||
        is_tutorial_eagle_vision_square(position) ||
        is_tutorial_jump_target_square(position) ||
        is_tutorial_defense_square(position)
    );
};

const is_human_side = function (side) {
    return play_mode === "multiplayer" || human_side === side;
};

const is_ai_side = function (side) {
    return play_mode === "single_player" && human_side !== side;
};

const is_player_one_turn = function () {
    return (
        tutorial_allows_action("move_king") &&
        is_human_side("white") &&
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
        tutorial_allows_action("place_piece") &&
        is_human_side("black") &&
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
        (
            tutorial_allows_action("queens_wrath") ||
            tutorial_allows_action("spawn_wrath_rook")
        ) &&
        is_human_side("black") &&
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

const is_ai_ready_to_move = function () {
    return (
        play_mode === "single_player" &&
        game.result === "playing" &&
        !tutorial_active &&
        !opening_active &&
        !pawn_wave_active &&
        !royal_guard_arrival_active &&
        !queen_arrival_active &&
        !input_locked &&
        (
            (
                is_ai_side("white") &&
                game.phase === "move_king"
            ) ||
            (
                is_ai_side("black") &&
                (
                    game.phase === "place_piece" ||
                    game.phase === "move_queen"
                )
            )
        )
    );
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

const is_tutorial_countdown_king_turn = function () {
    return (
        tutorial_active &&
        tutorial_phase === "practice_queen_countdown" &&
        game.phase === "move_king"
    );
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
    if (!is_player_one_turn() && !is_tutorial_countdown_king_turn()) {
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
        tutorial_allows_action("move_queen") &&
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
            tutorial_phase === "rule_bishop_defended" ||
            tutorial_phase === "rule_king_moves" ||
            tutorial_phase === "rule_stage_goal"
        ) &&
        base_token === 1
    ) {
        return 0;
    }

    if (
        tutorial_active &&
        tutorial_phase === "rule_place_piece" &&
        base_token === 3 &&
        KingCrossing.is_pawn_wall(game, position)
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
        classes.push("black_piece");
        classes.push("knight_square");
    }

    if (token === 3) {
        classes.push("pawn_wall_square");
    }

    if (token === 4) {
        classes.push("black_piece");
        classes.push("bishop_square");
    }

    if (token === 5 && !is_ghost_queen_square(base_token, position)) {
        classes.push("black_piece");
        classes.push("queen_square");
    }

    if (token === 5 && is_ghost_queen_square(base_token, position)) {
        classes.push("ghost_queen_square");
    }

    if (token === 6) {
        classes.push("royal_guard_square");
    }

    if (token === 7 && !is_ghost_rook_square(base_token, position)) {
        classes.push("black_piece");
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

    if (position.row === game.height - 1) {
        classes.push("top_row_square");
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

    if (
        is_tutorial_move_hint_square(position) ||
        is_tutorial_stage_normal_move_square(position)
    ) {
        classes.push("king_move_hint");
    }

    if (is_tutorial_attack_square(position)) {
        classes.push("tutorial_attack_square");
    }

    if (is_tutorial_queen_attack_square(position)) {
        classes.push("tutorial_eagle_vision_square");
    }

    if (is_tutorial_pawn_wall_danger_square(position)) {
        classes.push("tutorial_pawn_wall_danger_square");
    }

    if (is_tutorial_eagle_vision_square(position)) {
        classes.push("tutorial_eagle_vision_square");
    }

    if (is_tutorial_capture_square(position)) {
        classes.push("tutorial_capture_square");
    }

    if (is_tutorial_self_check_square(position)) {
        classes.push("tutorial_self_check_square");
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

    if (is_tutorial_jump_target_square(position)) {
        classes.push("tutorial_jump_target_square");
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

    if (is_tutorial_placing_pawn_square(position)) {
        classes.push("tutorial_placing_piece_square");
    }

    if (is_tutorial_placed_pawn_square(position)) {
        classes.push("tutorial_placed_piece_square");
    }

    if (is_tutorial_guided_square(position)) {
        classes.push("tutorial_guided_square");
        classes.push(`tutorial_guided_${tutorial_guided_square_kind()}`);
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
        return "Tutorial focus: White Pieces king";
    }

    if (is_tutorial_pawn_focus_square(position)) {
        return "Tutorial focus: Player 2 pawn wall";
    }

    if (is_tutorial_top_row_focus_square(position)) {
        return "Tutorial focus: Black Pieces placement row";
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

    if (is_tutorial_guided_square(position)) {
        return "Tutorial suggested square";
    }

    if (is_tutorial_demo_piece_square(position)) {
        return `Tutorial piece: ${piece_labels[token].toLowerCase()}`;
    }

    if (is_queen_animation_square(position)) {
        return "The Grand Regent Queen removing a black piece";
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

    return "a black piece";
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

const is_tutorial_click_pulse = function (time) {
    const elapsed = tutorial_stage_elapsed();

    return elapsed >= time && elapsed < time + 240;
};

const is_tutorial_queen_wrath_click_pulse = function () {
    const elapsed = tutorial_queen_wrath_elapsed();

    return (
        (
            elapsed >= tutorial_queen_wrath_click_time &&
            elapsed < tutorial_queen_wrath_click_time + 260
        ) ||
        (
            elapsed >= tutorial_queen_rook_click_time &&
            elapsed < tutorial_queen_rook_click_time + 260
        )
    );
};

const is_tutorial_queen_vision_click_pulse = function () {
    const elapsed = tutorial_queen_vision_elapsed();

    return (
        elapsed >= tutorial_queen_vision_click_time &&
        elapsed < tutorial_queen_vision_click_time + 260
    );
};

const update_tutorial_ability_demo = function () {
    const stage_active = tutorial_active && tutorial_phase === "rule_stage_goal";
    const queen_wrath_active = (
        tutorial_active && tutorial_phase === "rule_queen_wrath"
    );
    const queen_goal_active = (
        tutorial_active && tutorial_phase === "rule_queen_goal"
    );
    const queen_notice_active = tutorial_shows_queen_notice();

    eagle_vision_button.classList.toggle(
        "tutorial_ability_clicked",
        (
            stage_active &&
            is_tutorial_click_pulse(tutorial_eagle_click_time)
        ) ||
            (
                queen_goal_active &&
                is_tutorial_queen_vision_click_pulse()
            )
    );
    royal_jump_button.classList.toggle(
        "tutorial_ability_clicked",
        stage_active && is_tutorial_click_pulse(tutorial_jump_click_time)
    );
    queens_wrath_button.classList.toggle(
        "tutorial_ability_clicked",
        queen_wrath_active && is_tutorial_queen_wrath_click_pulse()
    );
    queens_wrath_button.classList.toggle(
        "queen_ability_arrival",
        queen_wrath_active && tutorial_queen_wrath_elapsed() < 1500
    );

    if (tutorial_active) {
        queen_notice.classList.toggle("hidden", !queen_notice_active);
        queen_notice.classList.toggle("queen_notice_fly", queen_notice_active);
    }

    if (!stage_active && !queen_wrath_active && !queen_goal_active) {
        if (
            tutorial_active &&
            tutorial_phase === "rule_place_piece" &&
            tutorial_place_elapsed() >= tutorial_place_click_time + 1800
        ) {
            el("queen_progress_status").textContent = `1/${game.target_turns}`;
            el("queen_progress_fill").style.width = `${100 / game.target_turns}%`;
        }

        return;
    }

    if (stage_active && tutorial_stage_eagle_revealed()) {
        el("eagle_vision_status").textContent = "Active";
        el("eagle_vision_fill").style.width = "100%";
    }

    if (stage_active && tutorial_stage_jump_revealed()) {
        el("royal_jump_status").textContent = "Active";
        el("royal_jump_fill").style.width = "100%";
    }

    if (queen_wrath_active || queen_goal_active) {
        el("queen_progress_status").textContent = "Queen Active";
        el("queen_progress_fill").style.width = "100%";
    }

    if (queen_wrath_active) {
        el("queens_wrath_status").textContent = (
            tutorial_queen_wrath_armed()
            ? "Choose a square"
            : "Spawn rook"
        );
    }

    if (queen_goal_active && tutorial_queen_vision_revealed()) {
        el("eagle_vision_status").textContent = "Active";
        el("eagle_vision_fill").style.width = "100%";
    }

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

const tutorial_shows_queen_meter = function () {
    if (
        tutorial_active &&
        tutorial_phase === "rule_place_piece" &&
        tutorial_place_elapsed() >= tutorial_place_click_time + 1800
    ) {
        return true;
    }

    return (
        tutorial_active &&
        (
            tutorial_phase === "practice_queen_countdown" ||
            tutorial_phase === "rule_queen_wrath" ||
            tutorial_phase === "rule_queen_goal"
        )
    );
};

const tutorial_shows_queens_wrath = function () {
    return (
        tutorial_active &&
        (
            tutorial_phase === "rule_queen_wrath" ||
            tutorial_phase === "rule_queen_goal"
        )
    );
};

const tutorial_shows_queen_notice = function () {
    const elapsed = tutorial_place_elapsed();

    return (
        tutorial_active &&
        tutorial_phase === "rule_place_piece" &&
        elapsed >= tutorial_place_click_time &&
        elapsed < tutorial_place_cycle - 150
    );
};

const reveal_queen_meter_after_first_piece = function () {
    if (
        tutorial_active ||
        queen_notice_state !== "hidden" ||
        game.pieces.length === 0
    ) {
        return;
    }

    queen_notice_state = "intro";
    queen_notice.classList.remove("hidden");
    queen_notice.classList.add("queen_notice_fly");
    queen_notice_timer = setTimeout(function () {
        queen_notice_state = "panel";
        queen_notice.classList.add("hidden");
        queen_notice.classList.remove("queen_notice_fly");
        redraw_board();
    }, 2600);
};

const update_eagle_vision_button = function () {
    const charge_percentage = (
        eagle_vision_charge / eagle_vision_max_charge * 100
    );

    const ready = (
        eagle_vision_charge >= eagle_vision_max_charge &&
        game.result === "playing" &&
        game.phase === "move_king" &&
        !input_locked &&
        is_human_side("white") &&
        tutorial_allows_action("eagle_vision")
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
        !input_locked &&
        is_human_side("white") &&
        tutorial_allows_action("royal_jump")
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
    const ready = (
        is_player_two_queen_turn() &&
        tutorial_allows_action("queens_wrath")
    );
    const visible = game.queen_active || tutorial_shows_queens_wrath();

    if (queens_wrath_active) {
        el("queens_wrath_status").textContent = "Choose a square";
    } else if (ready) {
        el("queens_wrath_status").textContent = "Spawn rook";
    } else {
        el("queens_wrath_status").textContent = "Final duel";
    }

    queens_wrath_button.classList.toggle("hidden", !visible);

    if (game.queen_active && !queens_wrath_revealed) {
        queens_wrath_button.classList.add("queen_ability_arrival");
        queens_wrath_revealed = true;
    } else if (!game.queen_active) {
        queens_wrath_button.classList.remove("queen_ability_arrival");
    }

    queens_wrath_button.disabled = !ready;
};

const update_queen_progress = function () {
    const visible = (
        queen_notice_state === "panel" ||
        game.queen_active ||
        game.royal_guard_active ||
        game.phase === "royal_guard_arrival" ||
        game.phase === "queen_arrival" ||
        tutorial_shows_queen_meter()
    );
    const progress_turns = (
        tutorial_active && tutorial_phase === "practice_queen_countdown"
        ? tutorial_countdown_turns
        : game.turn
    );
    const progress_percentage = Math.min(
        progress_turns / game.target_turns * 100,
        100
    );

    queen_progress_panel.classList.toggle("hidden", !visible);
    el("queen_progress_fill").style.width = `${progress_percentage}%`;

    if (tutorial_active && tutorial_phase === "practice_queen_countdown") {
        el("queen_progress_status").textContent = (
            `${Math.min(progress_turns, game.target_turns)}/${game.target_turns}`
        );
    } else if (game.queen_active) {
        el("queen_progress_status").textContent = "Queen Active";
    } else if (game.phase === "royal_guard_arrival") {
        el("queen_progress_status").textContent = "Royal Guard";
    } else if (game.royal_guard_active) {
        el("queen_progress_status").textContent = "Guard Active";
    } else if (game.phase === "queen_arrival") {
        el("queen_progress_status").textContent = "Arriving...";
    } else {
        el("queen_progress_status").textContent = (
            `${Math.min(progress_turns, game.target_turns)}/${game.target_turns}`
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

const apply_ai_king_move = function () {
    const choice = KingCrossing.choose_ai_king_move(game);

    if (choice === undefined) {
        return;
    }

    const previous_phase = game.phase;
    const previous_turn = game.turn;

    game = KingCrossing.move_king_to(game, choice.position);

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
};

const apply_ai_black_move = function () {
    if (game.phase === "place_piece") {
        const placement_choice = KingCrossing.choose_ai_piece_placement(game);

        if (placement_choice !== undefined) {
            game = KingCrossing.place_piece(game, placement_choice.column);
            reveal_queen_meter_after_first_piece();
        }
        return;
    }

    if (game.phase === "move_queen") {
        const queen_choice = KingCrossing.choose_ai_queen_action(game);

        if (queen_choice === undefined) {
            return;
        }

        if (queen_choice.type === "spawn_wrath_rook") {
            game = KingCrossing.spawn_wrath_rook(game, queen_choice.position);
            return;
        }

        game = KingCrossing.move_queen_to(game, queen_choice.position);
    }
};

const perform_ai_turn = function () {
    ai_turn_timer = undefined;

    if (!is_ai_ready_to_move()) {
        return;
    }

    input_locked = true;
    hovered_column = undefined;
    hovered_position = undefined;

    if (is_ai_side("white") && game.phase === "move_king") {
        apply_ai_king_move();
    } else {
        apply_ai_black_move();
    }

    input_locked = false;
    redraw_board();
    start_pawn_wave_if_needed();
};

const schedule_ai_turn_if_needed = function () {
    if (!is_ai_ready_to_move() || ai_turn_timer !== undefined) {
        return;
    }

    ai_turn_timer = setTimeout(perform_ai_turn, 650);
};

const board_cells = range(0, game.width).map(function (column_index) {
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
        `Column ${column_index + 1}. Press Space to place the next black piece.`
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

    column_div.onclick = function (event) {
        if (consume_tutorial_followup_click(event)) {
            return;
        }

        if (input_locked || !is_player_two_piece_turn()) {
            return;
        }

        const selected_position = {
            "column": column_index,
            "row": game.height - 1
        };

        if (!tutorial_accepts_guided_square("place_piece", selected_position)) {
            remind_guided_square();
            redraw_board();
            return;
        }

        const previous_game = game;

        game = KingCrossing.place_piece(game, column_index);
        reveal_queen_meter_after_first_piece();
        hovered_column = undefined;
        redraw_board();

        if (game !== previous_game) {
            advance_practice_after_action("place_piece");
        }
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

    if (!tutorial_accepts_guided_square("spawn_wrath_rook", position)) {
        remind_guided_square();
        redraw_board();
        return;
    }

    const previous_game = game;

    hovered_position = undefined;
    queens_wrath_active = false;
    game = KingCrossing.spawn_wrath_rook(game, position);
    redraw_board();

    if (game !== previous_game) {
        advance_practice_after_action("spawn_wrath_rook");
    }
};

const start_pawn_wave_if_needed = function () {
    if (game.phase !== "scroll_world") {
        return;
    }

    input_locked = true;
    pawn_wave_active = true;
    pawn_wave_column = -1;
    pawn_wave_rows = KingCrossing.pending_scroll_rows(game);

    pawn_wave_timer = setTimeout(
        continue_pawn_wave,
        pawn_wave_step_delay
    );
};

const move_king_to_position = function (position) {
    if (!is_player_one_turn() || !is_king_move_hint_square(position)) {
        return;
    }

    if (!tutorial_accepts_guided_square("move_king", position)) {
        remind_guided_square();
        redraw_board();
        return;
    }

    const previous_king = {
        "column": game.king.column,
        "row": game.king.row
    };
    const using_royal_jump = royal_jump_active;

    eagle_vision_active = false;
    royal_jump_active = false;
    hovered_position = undefined;

    const previous_phase = game.phase;
    const previous_turn = game.turn;
    const previous_game = game;

    game = KingCrossing.move_king_to(game, position, using_royal_jump);

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

    if (game !== previous_game) {
        advance_practice_after_action("move_king", {
            "forward": position.row > previous_king.row
        });
    }
};

const attach_cell_handlers = function () {
    board_cells.forEach(function (column, column_index) {
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
                if (consume_tutorial_followup_click(event)) {
                    return;
                }

                if (
                    (
                        tutorial_requires_guided_square("move_king") ||
                        tutorial_requires_guided_square("spawn_wrath_rook")
                    ) &&
                    !tutorial_accepts_guided_square(
                        current_practice_step().action,
                        position
                    )
                ) {
                    event.stopPropagation();
                    remind_guided_square();
                    redraw_board();
                    return;
                }

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
        el("result_winner").textContent = "Player 1 wins";
        el("result_message").textContent = (
            "The king reached the royal boundary and escaped the Grand Regent Queen."
        );
    }

    if (game.result === "sealed") {
        el("result_winner").textContent = "Player 2 wins";
        el("result_message").textContent = (
            "The black pieces filled the road ahead. The king was trapped between the soldiers and the pawn wall."
        );
    }

    if (game.result === "lost") {
        el("result_winner").textContent = "Player 2 wins";
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
    update_player_names_for_mode();
    tutorial_control_button.textContent = (
        tutorial_active
        ? "Skip tutorial"
        : "Tutorial"
    );

    document.body.classList.toggle(
        "tutorial_board_focus_mode",
        tutorial_active && tutorial_focus !== "none"
    );

    board_cells.forEach(function (column, column_index) {
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
            cell.dataset.column = String(position.column);
            cell.dataset.row = String(position.row);
            cell.setAttribute(
                "aria-label",
                alt_for_token(token, base_token, position)
            );
        });
    });

    if (tutorial_active && tutorial_phase === "rule_place_piece") {
        el("home_ready").textContent = "White Pieces: wait for Black.";
        el("away_ready").textContent = "Black Pieces cycle: Pawn, Knight, Bishop.";
    } else if (tutorial_active && tutorial_focus === "king") {
        el("home_ready").textContent = "White Pieces: guide the king.";
        el("away_ready").textContent = "Black Pieces wait.";
    } else if (tutorial_active && tutorial_focus === "pawns") {
        el("home_ready").textContent = "The king must keep moving.";
        el("away_ready").textContent = "The pawn wall is chasing.";
    } else if (opening_active) {
        if (opening_phase === "king") {
            el("home_ready").textContent = "The king enters the crossing...";
            el("away_ready").textContent = "Black Pieces wait.";
        } else {
            el("home_ready").textContent = "The pawn wall surges into frame...";
            el("away_ready").textContent = "Prepare to place the first piece.";
        }
    } else if (game.phase === "royal_guard_arrival") {
        el("home_ready").textContent = "White Pieces reached the royal boundary.";
        el("away_ready").textContent = "Black Pieces summon the royal guard.";
    } else if (game.phase === "queen_arrival") {
        el("home_ready").textContent = "White Pieces: prepare for the final duel.";
        el("away_ready").textContent = (
            "The Grand Regent Queen clears the road."
        );
    } else if (game.phase === "move_queen") {
        el("home_ready").textContent = "White Pieces: survive the queen.";
        if (queens_wrath_active) {
            el("away_ready").textContent = (
                "Queen's Wrath: call a rook onto an open safe square."
            );
        } else if (is_ai_side("black")) {
            el("away_ready").textContent = "AI is choosing a Black move.";
        } else {
            el("away_ready").textContent = (
                "Black Pieces: move the queen, or press Tab for Queen's Wrath."
            );
        }
    } else if (game.queen_active && game.result === "playing") {
        el("home_ready").textContent = (
            "Final Duel: reach the row beneath the royal guard."
        );
        el("away_ready").textContent = "The Grand Regent Queen controls the board.";
    } else if (game.phase === "place_piece" && game.result === "playing") {
        el("home_ready").textContent = (
            is_ai_side("black")
            ? "White Pieces: wait for AI."
            : "White Pieces: wait for Black."
        );
        el("away_ready").textContent = (
            is_ai_side("black")
            ? `AI is placing a ${next_piece_name()}.`
            : `Black Pieces: place a ${next_piece_name()} on the top row.`
        );
    } else if (game.phase === "move_king" && game.result === "playing") {
        el("home_ready").textContent = (
            is_ai_side("white")
            ? "AI is guiding the king."
            :
            royal_jump_available()
            ? "Royal Jump: gold dots show range, not safety."
            : "White Pieces: choose a dot, then press Space."
        );
        el("away_ready").textContent = (
            `Next Black piece: ${next_piece_name()}.`
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
    update_tutorial_ability_demo();
    show_result_if_needed();
    start_royal_guard_arrival_if_needed();
    start_queen_arrival_if_needed();
    schedule_ai_turn_if_needed();
};

const finish_opening_animation = function () {
    opening_active = false;
    opening_phase = "done";
    opening_pawn_column = -1;

    if (
        tutorial_active &&
        (
            tutorial_phase === "pawn_chase" ||
            tutorial_phase === "practice_crossing_story"
        )
    ) {
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
    game_board.style.setProperty(
        "--board-scroll-end",
        "var(--board-resting-offset)"
    );

    pawn_wave_active = false;
    pawn_wave_column = -1;
    pawn_wave_rows = 1;

    game = KingCrossing.finish_forward_move(game);
    input_locked = false;
    redraw_board();

    game_board.offsetHeight;

    setTimeout(function () {
        game_board.classList.remove("no_scroll_transition");
    }, 0);
};

const start_board_scroll_animation = function () {
    const row_count = (
        game.height +
        visual_extra_top_rows +
        visual_extra_bottom_rows
    );
    const scroll_rows = KingCrossing.pending_scroll_rows(game);
    const scroll_end_percent = (
        (scroll_rows - visual_extra_top_rows) * 100
    ) / row_count;

    game_board.classList.remove("no_scroll_transition");
    game_board.style.setProperty(
        "--board-scroll-end",
        `${scroll_end_percent}%`
    );
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

const all_board_positions = function () {
    return range(0, game.width).reduce(function (positions, column) {
        return positions.concat(range(0, game.height).map(function (row) {
            return {
                "column": column,
                "row": row
            };
        }));
    }, []);
};

const legal_king_positions = function () {
    return all_board_positions().filter(is_king_move_hint_square);
};

const legal_queen_positions = function () {
    return all_board_positions().filter(is_queen_move_hint_square);
};

const legal_wrath_positions = function () {
    return all_board_positions().filter(is_queens_wrath_hint_square);
};

const legal_black_placement_columns = function () {
    return range(0, game.width).filter(function (column) {
        return KingCrossing.can_place_piece(game, column);
    });
};

const first_legal_position = function (positions) {
    return positions.slice().sort(function (first, second) {
        if (first.row !== second.row) {
            return second.row - first.row;
        }

        return first.column - second.column;
    })[0];
};

const distance_between = function (first, second) {
    return (
        Math.abs(first.column - second.column) +
        Math.abs(first.row - second.row)
    );
};

const directional_candidates = function (origin, positions, offset) {
    return positions.filter(function (position) {
        if (offset.column < 0 && position.column >= origin.column) {
            return false;
        }

        if (offset.column > 0 && position.column <= origin.column) {
            return false;
        }

        if (offset.row < 0 && position.row >= origin.row) {
            return false;
        }

        if (offset.row > 0 && position.row <= origin.row) {
            return false;
        }

        if (offset.column === 0 && position.column !== origin.column) {
            return false;
        }

        if (offset.row === 0 && position.row !== origin.row) {
            return false;
        }

        return true;
    });
};

const nearest_position = function (origin, positions) {
    return positions.slice().sort(function (first, second) {
        const distance_difference = (
            distance_between(origin, first) - distance_between(origin, second)
        );

        if (distance_difference !== 0) {
            return distance_difference;
        }

        if (first.row !== second.row) {
            return second.row - first.row;
        }

        return first.column - second.column;
    })[0];
};

const select_position_by_direction = function (origin, positions, offset) {
    const directional = directional_candidates(origin, positions, offset);

    if (directional.length > 0) {
        return nearest_position(origin, directional);
    }

    return nearest_position(origin, positions);
};

const move_king_selector = function (offset) {
    if (!is_player_one_turn()) {
        return;
    }

    const positions = legal_king_positions();
    const origin = (
        hovered_position !== undefined &&
        positions.some(function (position) {
            return same_position(position, hovered_position);
        })
        ? hovered_position
        : game.king
    );
    const candidate = {
        "column": origin.column + offset.column,
        "row": origin.row + offset.row
    };

    if (
        positions.some(function (position) {
            return same_position(position, candidate);
        })
    ) {
        hovered_position = candidate;
    } else {
        hovered_position = select_position_by_direction(
            origin,
            positions,
            offset
        );
    }

    redraw_board();
};

const confirm_king_selector = function () {
    if (
        is_player_one_turn() &&
        hovered_position !== undefined &&
        is_king_move_hint_square(hovered_position)
    ) {
        move_king_to_position(hovered_position);
    }
};

const move_black_piece_selector = function (direction) {
    if (!is_player_two_piece_turn()) {
        return;
    }

    const columns = legal_black_placement_columns();

    if (columns.length === 0) {
        return;
    }

    const current_index = columns.indexOf(hovered_column);
    const next_index = (
        current_index < 0
        ? 0
        : (current_index + direction + columns.length) % columns.length
    );

    hovered_column = columns[next_index];
    hovered_position = undefined;
    redraw_board();
};

const confirm_black_piece_selector = function () {
    if (
        is_player_two_piece_turn() &&
        hovered_column !== undefined &&
        KingCrossing.can_place_piece(game, hovered_column)
    ) {
        const selected_position = {
            "column": hovered_column,
            "row": game.height - 1
        };

        if (!tutorial_accepts_guided_square("place_piece", selected_position)) {
            remind_guided_square();
            redraw_board();
            return;
        }

        const previous_game = game;

        game = KingCrossing.place_piece(game, hovered_column);
        reveal_queen_meter_after_first_piece();
        hovered_column = undefined;
        hovered_position = undefined;
        redraw_board();

        if (game !== previous_game) {
            advance_practice_after_action("place_piece");
        }
    }
};

const active_black_duel_positions = function () {
    if (queens_wrath_active) {
        return legal_wrath_positions();
    }

    return legal_queen_positions();
};

const move_black_duel_selector = function (offset) {
    if (!is_player_two_queen_turn()) {
        return;
    }

    const positions = active_black_duel_positions();

    if (positions.length === 0) {
        return;
    }

    const origin = (
        hovered_position !== undefined &&
        positions.some(function (position) {
            return same_position(position, hovered_position);
        })
        ? hovered_position
        : (
            game.queen !== undefined && !queens_wrath_active
            ? game.queen
            : first_legal_position(positions)
        )
    );

    hovered_position = select_position_by_direction(origin, positions, offset);
    hovered_column = hovered_position.column;
    redraw_board();
};

const confirm_black_duel_selector = function () {
    if (!is_player_two_queen_turn() || hovered_position === undefined) {
        return;
    }

    if (queens_wrath_active) {
        spawn_wrath_rook_at_position(hovered_position);
        return;
    }

    move_queen_to_position(hovered_position);
};

const toggle_black_duel_tool = function () {
    if (!is_player_two_queen_turn()) {
        return;
    }

    queens_wrath_active = !queens_wrath_active;
    hovered_position = first_legal_position(active_black_duel_positions());
    hovered_column = (
        hovered_position === undefined
        ? undefined
        : hovered_position.column
    );
    redraw_board();

    if (queens_wrath_active) {
        advance_practice_after_action("queens_wrath");
    }
};

eagle_vision_button.onclick = function () {
    if (
        input_locked ||
        !tutorial_allows_action("eagle_vision") ||
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
    advance_practice_after_action("eagle_vision");
};

royal_jump_button.onclick = function () {
    if (game.queen_active) {
        return;
    }

    if (
        input_locked ||
        !tutorial_allows_action("royal_jump") ||
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
    advance_practice_after_action("royal_jump");
};

queens_wrath_button.onclick = function () {
    if (!is_player_two_queen_turn() || !tutorial_allows_action("queens_wrath")) {
        return;
    }

    toggle_black_duel_tool();
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
    restart_match();
};

result_dialog.onclick = reset_game;
result_dialog.onkeydown = reset_game;

const is_native_control_target = function (target) {
    return (
        target !== null &&
        target.closest !== undefined &&
        target.closest("button, input, textarea, select") !== null
    );
};

document.onkeydown = function (event) {
    if (instructions_dialog.open || result_dialog.open) {
        return;
    }

    if (is_native_control_target(event.target)) {
        return;
    }

    if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        confirm_king_selector();
        confirm_black_piece_selector();
        confirm_black_duel_selector();
        return;
    }

    if (event.key === "Tab" && is_player_two_queen_turn()) {
        event.preventDefault();
        toggle_black_duel_tool();
        return;
    }

    if (is_player_one_turn()) {
        if (event.key === "w" || event.key === "W") {
            event.preventDefault();
            move_king_selector({"column": 0, "row": 1});
            return;
        }

        if (event.key === "a" || event.key === "A") {
            event.preventDefault();
            move_king_selector({"column": -1, "row": 0});
            return;
        }

        if (event.key === "s" || event.key === "S") {
            event.preventDefault();
            move_king_selector({"column": 0, "row": -1});
            return;
        }

        if (event.key === "d" || event.key === "D") {
            event.preventDefault();
            move_king_selector({"column": 1, "row": 0});
            return;
        }
    }

    if (is_player_two_piece_turn()) {
        if (event.key === "ArrowLeft") {
            event.preventDefault();
            move_black_piece_selector(-1);
            return;
        }

        if (event.key === "ArrowRight") {
            event.preventDefault();
            move_black_piece_selector(1);
            return;
        }
    }

    if (is_player_two_queen_turn()) {
        if (event.key === "ArrowUp") {
            event.preventDefault();
            move_black_duel_selector({"column": 0, "row": 1});
            return;
        }

        if (event.key === "ArrowDown") {
            event.preventDefault();
            move_black_duel_selector({"column": 0, "row": -1});
            return;
        }

        if (event.key === "ArrowLeft") {
            event.preventDefault();
            move_black_duel_selector({"column": -1, "row": 0});
            return;
        }

        if (event.key === "ArrowRight") {
            event.preventDefault();
            move_black_duel_selector({"column": 1, "row": 0});
        }
    }
};

attach_cell_handlers();
game_board.firstChild.focus();
start_tutorial_title();
