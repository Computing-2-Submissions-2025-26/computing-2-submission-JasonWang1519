const by_id = function (document_ref, id) {
    return document_ref.getElementById(id);
};

const append_button = function (document_ref, id, text, label) {
    const button = document_ref.createElement("button");

    button.id = id;
    button.type = "button";
    button.textContent = text;
    button.setAttribute("aria-label", label);
    document_ref.body.append(button);

    return button;
};

const create_single_player_dialog = function (document_ref) {
    const dialog = document_ref.createElement("div");

    dialog.id = "single_player_dialog";
    dialog.className = "hidden";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", "single_player_heading");
    dialog.innerHTML = `
        <section id="single_player_card">
            <h2 id="single_player_heading">Single Player</h2>
            <p>Choose your side. The AI will play the other pieces.</p>
            <div id="single_player_choices">
                <button
                    id="choose_white_pieces"
                    data-side="white"
                    type="button"
                >
                    Play White Pieces
                </button>
                <button
                    id="choose_black_pieces"
                    data-side="black"
                    type="button"
                >
                    Play Black Pieces
                </button>
            </div>
        </section>
    `;
    document_ref.body.append(dialog);

    return dialog;
};

const create_ability_button = function (document_ref, id, label, status) {
    const button = document_ref.createElement("button");

    button.id = id;
    button.type = "button";
    button.setAttribute("aria-label", `Use ${label}`);
    button.innerHTML = `
        <span id="${id.replace("_button", "_label")}">${label}</span>
        <span id="${id.replace("_button", "_status")}">${status}</span>
        <span id="${id.replace("_button", "_bar")}">
            <span id="${id.replace("_button", "_fill")}"></span>
        </span>
    `;
    document_ref.body.append(button);

    return button;
};

const create_queens_wrath_button = function (document_ref) {
    const button = document_ref.createElement("button");

    button.id = "queens_wrath_button";
    button.type = "button";
    button.setAttribute("aria-label", "Use Queen's Wrath");
    button.innerHTML = `
        <span id="queens_wrath_label">Queen's Wrath</span>
        <span id="queens_wrath_status">Final duel</span>
    `;
    document_ref.body.append(button);

    return button;
};

const create_queen_progress_panel = function (document_ref) {
    const panel = document_ref.createElement("section");

    panel.id = "queen_progress_panel";
    panel.setAttribute("aria-label", "Grand Regent Queen progress");
    panel.innerHTML = `
        <span id="queen_progress_label">Grand Regent Queen</span>
        <span id="queen_progress_status" aria-live="polite">0/12</span>
        <span id="queen_progress_bar">
            <span id="queen_progress_fill"></span>
        </span>
    `;
    document_ref.body.append(panel);

    return panel;
};

const create_queen_notice = function (document_ref) {
    const notice = document_ref.createElement("div");

    notice.id = "queen_notice";
    notice.className = "hidden";
    notice.setAttribute("aria-live", "polite");
    notice.innerHTML = `
        <span id="queen_notice_icon">♛</span>
        <span id="queen_notice_text">
            Grand Regent Queen will arrive in 12 moves
        </span>
    `;
    document_ref.body.append(notice);

    return notice;
};

const create_instructions_dialog = function (document_ref) {
    const dialog = document_ref.createElement("dialog");

    dialog.id = "instructions_dialog";
    dialog.setAttribute("aria-labelledby", "instructions_heading");
    dialog.innerHTML = `
        <section id="instructions_card">
            <h2 id="instructions_heading">How to Play</h2>
            <p>
                <strong>White Pieces:</strong> guide the king upward and look
                for a clear route through the crossing.
            </p>
            <p>
                <strong>Black Pieces:</strong> choose where new threats appear
                on the top row and try to close the route.
            </p>
            <p>You can play with the mouse by clicking a legal square.</p>
            <p>
                You can also play with the keyboard like a remote: move the
                selector, then press <strong>Space</strong> to confirm.
            </p>
            <p>
                White uses <strong>W A S D</strong> to choose the king's square.
                Black uses the <strong>Left</strong> and
                <strong>Right</strong> arrows when placing a new piece.
            </p>
            <p>
                In the queen duel, Black presses <strong>Tab</strong> to switch
                between the queen and Queen's Wrath, uses the arrow keys to
                choose a legal square, then presses <strong>Space</strong>.
            </p>
            <p>
                <strong>Eagle Vision</strong> reveals danger.
                <strong>Royal Jump</strong> gives the king a longer leap when it
                is charged.
            </p>
            <p>
                White has the harder role because the king must keep finding
                safe routes while the wall and Black Pieces close in.
            </p>
            <p>
                The queen counter appears after Black's first move. When it
                fills, the Grand Regent Queen arrives.
            </p>
            <p>
                White wins by reaching the row beneath the royal guard. Black
                wins by trapping the king or sealing the crossing.
            </p>
            <p class="click_hint">Click anywhere to close.</p>
        </section>
    `;
    document_ref.body.append(dialog);

    return dialog;
};

const create_tutorial_title_screen = function (document_ref) {
    const screen = document_ref.createElement("div");

    screen.id = "tutorial_title_screen";
    screen.innerHTML = `
        <span id="tutorial_title_text">King's Crossing</span>
        <span id="tutorial_title_hint">Click anywhere to proceed.</span>
    `;
    document_ref.body.append(screen);

    return screen;
};

const create_tutorial_duel_screen = function (document_ref) {
    const screen = document_ref.createElement("div");

    screen.id = "tutorial_duel_screen";
    screen.className = "hidden";
    screen.innerHTML = `
        <span id="tutorial_duel_heading">A Two Player Game</span>
        <span id="tutorial_duel_layout">
            <span class="tutorial_player_card">
                <span class="tutorial_white_piece">♔</span>
                <span class="tutorial_player_label">
                    Player 1: White Pieces
                </span>
            </span>
            <span class="tutorial_player_card">
                <span class="tutorial_black_pieces">♟ ♞ ♝ ♛ ♜</span>
                <span class="tutorial_player_label">
                    Player 2: Black Pieces
                </span>
            </span>
        </span>
        <span id="tutorial_duel_hint">Click anywhere to begin.</span>
    `;
    document_ref.body.append(screen);

    return screen;
};

const create_tutorial_slide_number = function (document_ref) {
    const slide_number = document_ref.createElement("div");

    slide_number.id = "tutorial_slide_number";
    document_ref.body.append(slide_number);

    return slide_number;
};

const create_tutorial_text = function (document_ref) {
    const text = document_ref.createElement("div");

    text.id = "tutorial_text";
    text.className = "hidden";
    text.setAttribute("aria-live", "polite");
    document_ref.body.append(text);

    return text;
};

const create_tutorial_notice = function (document_ref) {
    const notice = document_ref.createElement("div");

    notice.id = "tutorial_notice";
    notice.className = "hidden";
    notice.setAttribute("aria-live", "assertive");
    document_ref.body.append(notice);

    return notice;
};

const create_tutorial_queen_countdown = function (document_ref) {
    const countdown = document_ref.createElement("div");

    countdown.id = "tutorial_queen_countdown";
    countdown.className = "hidden";
    countdown.innerHTML = `
        <span id="tutorial_queen_countdown_icon">♛</span>
        <span id="tutorial_queen_countdown_label">Grand Regent Queen</span>
        <span id="tutorial_queen_countdown_turns">0/12</span>
    `;
    document_ref.body.append(countdown);

    return countdown;
};

const create_ui_elements = function (document_ref) {
    by_id(document_ref, "title").textContent = "King's Crossing";
    by_id(document_ref, "home_player_type").textContent = "White Pieces";
    by_id(document_ref, "away_player_type").textContent = "Black Pieces";
    by_id(document_ref, "home_ready").textContent = (
        "The king enters the crossing..."
    );
    by_id(document_ref, "away_ready").textContent = "Black is waiting.";

    const instructions_button = append_button(
        document_ref,
        "instructions_button",
        "Instructions",
        "Open the game instructions"
    );
    const single_player_button = append_button(
        document_ref,
        "single_player_button",
        "Single Player",
        "Open single-player choices"
    );
    const single_player_dialog = create_single_player_dialog(document_ref);
    const eagle_vision_button = create_ability_button(
        document_ref,
        "eagle_vision_button",
        "Eagle Vision",
        "Ready"
    );
    const royal_jump_button = create_ability_button(
        document_ref,
        "royal_jump_button",
        "Royal Jump",
        "Ready"
    );
    const queens_wrath_button = create_queens_wrath_button(document_ref);
    const queen_progress_panel = create_queen_progress_panel(document_ref);
    const queen_notice = create_queen_notice(document_ref);
    const instructions_dialog = create_instructions_dialog(document_ref);
    const tutorial_title_screen = create_tutorial_title_screen(document_ref);
    const tutorial_duel_screen = create_tutorial_duel_screen(document_ref);
    const tutorial_control_button = append_button(
        document_ref,
        "tutorial_control_button",
        "Skip tutorial",
        "Start or skip the tutorial"
    );
    const tutorial_slide_number = create_tutorial_slide_number(document_ref);
    const tutorial_text = create_tutorial_text(document_ref);
    const tutorial_notice = create_tutorial_notice(document_ref);
    const tutorial_queen_countdown = create_tutorial_queen_countdown(
        document_ref
    );

    return Object.freeze({
        "eagle_vision_button": eagle_vision_button,
        "game_board": by_id(document_ref, "game_board"),
        "instructions_button": instructions_button,
        "instructions_dialog": instructions_dialog,
        "queen_notice": queen_notice,
        "queen_progress_panel": queen_progress_panel,
        "queens_wrath_button": queens_wrath_button,
        "result_dialog": by_id(document_ref, "result_dialog"),
        "royal_jump_button": royal_jump_button,
        "single_player_button": single_player_button,
        "single_player_dialog": single_player_dialog,
        "tutorial_control_button": tutorial_control_button,
        "tutorial_duel_screen": tutorial_duel_screen,
        "tutorial_notice": tutorial_notice,
        "tutorial_queen_countdown": tutorial_queen_countdown,
        "tutorial_slide_number": tutorial_slide_number,
        "tutorial_text": tutorial_text,
        "tutorial_title_screen": tutorial_title_screen
    });
};

export default create_ui_elements;
