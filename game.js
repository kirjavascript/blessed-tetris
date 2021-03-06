const { Screen, Box, Button, Message } = require('blessed');
const { getRandom } = require('./pieces');
const { createStats } = require('./stats');
const { createMenu } = require('./menu');
const { checkHighscore } = require('./highscores');

module.exports = (client) => {

    const screen = new Screen({
        fastCSR: true,
        dockBorders: true,
        input: client,
        output: client,
        terminal: 'xterm-256color'
    });

    const width = 10;
    const height = 20;
    const zoom = 4;

    const display = new Box({
        parent: screen,
        width: width*zoom+2,
        height: (height*zoom/2)+2,
        border: 'line',
        style: {
            border: {
                fg: '#06A',
            },
        },
        bottom: 0,
        left: 'center',
    });

    const title = new Box({
        parent: screen,
        width: 'shrink',
        height: 3,
        content: '',
        style: {
            fg: '#06A',
        },
        content: '╔╦╗╔═╗╔╦╗╦═╗╦╔═╗\n ║ ║╣  ║ ╠╦╝║╚═╗\n ╩ ╚═╝ ╩ ╩╚═╩╚═╝',
        left: '50%-9',
        top: 0,
    });

    const {
        restartMessage,
        menuBox,
    } = createMenu({ screen });

    const {
        alertMessage,
        holdBox,
        nextBox,
        statsBox,
    } = createStats({ width, height, zoom, screen });

    const board = Array.from({length: width*height}, (_, i) => {
        const point = Object.create(null);

        const color = void 0;
        const x = i % width;
        const y = (0| i / width);
        const element = new Box({
            width: zoom,
            height: zoom/2,
            parent: display,
            left: x * zoom,
            top: y * zoom / 2,
            style: { bg: color },
        });

        return Object.assign(point, {
            color,
            x, y,
            element,
        });
    });


    let activePiece, pendingPiece, timer;
    let heldPiece, justHeld;

    const game = {
        score: 0,
        lines: 0,
        get level() {
            return (0|game.lines/10) + 1;
        },
        board,
        display,
        width,
        height,
        zoom,
        running: false,
        startTime: 0,
        stopTime: 0,
        nextPiece() {
            justHeld = false;
            activePiece = pendingPiece;
            activePiece.startTimer();
            pendingPiece = getRandom(game);
            if (activePiece.collides()) {
                game.stop();
            }
        },
        hold() {
            if (justHeld) {
                return;
            }
            activePiece.hold();
            let toPlace = heldPiece;
            heldPiece = activePiece;
            if (!toPlace) {
                game.nextPiece();
            } else {
                // should dedupe
                activePiece = toPlace;
                toPlace.startTimer();
                if (activePiece.collides()) {
                    game.stop();
                }
            }
            justHeld = true;
        },
        addScore(n) {
            game.score += n;
        },
        addLines(n) {
            game.lines += n;
            alertMessage.display(screen, n == 4 ? 'Tetris!' : `${n} Lines!`);
        },
        render() {
            activePiece.eachCell(
                (point) => {
                    point.element.style.bg = activePiece.color;
                    // point.element.style.fg = "#000";
                    // point.element.content = '╭──╮╰──╯'
                },
                (point) => {
                    point.element.style.bg = point.color;
                    // point.element.content = '';
                },
            );

            activePiece.eachGhost(
                (point) => {
                    point.element.style.transparent = !point.element.style.bg;
                    point.element.style.bg = activePiece.color;
                },
                (point) => {
                    point.element.style.transparent = false;
                    point.element.style.bg = point.element.style.bg;
                },
            );
            let stats = {
                Score: game.score,
                Lines: game.lines,
                Level: game.level,
                LPM: game.linesPerMinute(),
            };

            statsBox.setContent(
                Object
                    .entries(stats)
                    .map(([name, val]) => `${name}: {bold}${val}{/}`)
                    .join`\n`
            );

            nextBox.setContent(` Next\n\n${pendingPiece.viewShape()}`);

            holdBox.setContent(` Hold\n\n${heldPiece ? heldPiece.viewShape() : ''}`)

            screen.render();
        },
        linesPerMinute() {
            let minutesPlaying = Math.max(game.timePlaying(), 1) / 1000 / 60;
            return (game.lines / minutesPlaying).toFixed(2);
        },
        timePlaying() {
            return (game.stopTime || Date.now()) - game.startTime
        },
        start() {
            game.running = true;
            game.startTime = Date.now();
            game.stopTime = 0;
            pendingPiece = getRandom(game);
            game.nextPiece();
            game.render();
        },
        stop() {
            activePiece.stopTimer();
            clearInterval(timer);
            game.stopTime = Date.now();
            game.render();
            game.running = false;
            checkHighscore({ game, screen });
            restartMessage.show();
            screen.render();
        },
        reset() {
            game.score = 0;
            game.lines = 0;
            board.forEach(point => {
                point.color = void 0;
            });
            restartMessage.hide();
            game.start();
        },
    };

    // keyboard input

    screen.key(['escape', 'C-c'], () => {
        screen.destroy();
        !client && process.exit();
    });

    screen.key('enter', () => {
        if (!game.running) {
            game.reset();
        }
    });

    const input = [
        {
            keys: ['z',','],
            action: () => {
                activePiece.rotate(-1);
            },
        },
        {
            keys: ['x', '.', 'up'],
            action: () => {
                activePiece.rotate(1);
            },
        },
        {
            keys: ['a', 'h', 'left'],
            action: () => {
                activePiece.move(-1);
            },
        },
        {
            keys: ['d', 'l', 'right'],
            action: () => {
                activePiece.move(1);
            },
        },
        {
            keys: ['s', 'down', 'j'],
            action: () => {
                activePiece.advance(true);
            },
        },
        {
            keys: ['space', '/', 'c', 'k', 'w'],
            action: () => {
                activePiece.drop();
            },
        },
        {
            keys: ['tab', 'v', 'm', '\\'],
            action: () => {
                game.hold();
            },
        },
    ];


    input.forEach(({keys, action}) => {
        screen.key(keys, () => {
            if (game.running) {
                action();
                game.render();
            }
        });
    });

    game.start();

    return {
        screen,
        game,
    };
};


