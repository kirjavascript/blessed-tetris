const { Screen, Box, Log, Message } = require('blessed');
const { getRandom, } = require('./pieces');

const screen = new Screen({
    fastCSR: true,
    dockBorders: true,
});

screen.key(['escape'], () => {
    process.exit();
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
    content: '╔╦╗┌─┐┌┬┐┬─┐┬┌─┐\n ║ ├┤  │ ├┬┘│└─┐\n ╩ └─┘ ┴ ┴└─┴└─┘',
    left: '50%-10',
    top: 0,
});

const stats = new Box({
    parent: screen,
    width: (width*zoom+2),
    height: `100%-${(height*(zoom/2))+2+3}`,
    border: 'line',
    style: {
        border: {
            fg: '#06A',
        },
    },
    left: 'center',
    top: 3,
});


const restartMessage = new Message({
    parent: screen,
    width: 'shrink',
    height: `shrink`,
    border: 'line',
    style: {
        border: {
            fg: '#06A',
        },
    },
    left: 'center',
    top: '60%',
    hidden: true,
});

const board = Array.from({length: width*height}, (_, i) => {
    const point = Object.create({
    });

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

// point.element.style.transparent = true;

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
    nextPiece: () => {
        activePiece = getRandom(game);
        if (activePiece.checkPlace()) {
            game.stop();
        }
    },
    addScore(n) {
        game.score += n;
    },
    addLines(n) {
        game.lines += n;
    },
    render() {
        activePiece.eachCell(
            (point) => {
                point.element.style.bg = activePiece.color;
            },
            (point) => {
                point.element.style.bg = point.color;
            },
        );

        stats.setContent(`Score: ${game.score}\nLines: ${game.lines}\nLevel: ${game.level}`);

        screen.render();
    },
    start() {
        game.running = true;
        game.nextPiece();
        timer = setInterval(() => {
            game.render();
        }, 14)
    },
    stop() {
        activePiece.stopTimer();
        clearInterval(timer);
        game.render();
        game.running = false;
        restartMessage.display('Game Over!\n\n Press any key to continue', 0, (answer) => {
            setTimeout(() => {
                game.reset();
            });
        });
    },
    reset() {
        game.score = 0;
        game.lines = 0;
        board.forEach(point => {
            point.color = void 0;
        });
        game.start();
    },
};

const input = [
    {
        keys: ['z',','],
        action: () => {
            activePiece.rotate(-1);
        },
    },
    {
        keys: ['x', '.'],
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
            activePiece.advance();
        },
    },
    {
        keys: ['space', '/', 'c', 'k', 'w', 'up'],
        action: () => {
            activePiece.drop();
        },
    },
];


input.forEach(({keys, action}) => {
    screen.key(keys, () => {
        if (game.running) {
            action();
        }
    });
});

game.start();
