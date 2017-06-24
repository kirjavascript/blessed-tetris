const { Screen, Box, Log } = require('blessed');
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

// const debug = new Log({
//     parent: screen,
//     width: '100%',
//     height: 8,
//     border: 'line',
//     style: {
//         border: {
//             fg: '#06A',
//         },
//     },
//     bottom: 0,
//     top: 'center',
//     left: 'center',
// });

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
    nextPiece: () => {
        activePiece = getRandom(game);
        if (activePiece.checkPlace()) {
            // process.exit();
        }
    },
    addScore(n) {
        game.score += n;
    },
    addLines(n) {
        if (!n) return;
        game.lines += n;
        game.addScore([40, 100, 300, 1200][n-1] * game.level);
    },
    start() {
        timer = setInterval(() => {
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
        }, 14)
    },
};

// point.element.style.transparent = true;

activePiece = getRandom(game);

screen.key(['z',','], () => {
    activePiece.rotate(-1);
});

screen.key(['x', '.'], () => {
    activePiece.rotate(1);
});

screen.key(['a', 'h', 'left'], () => {
    activePiece.move(-1);
});

screen.key(['d', 'l', 'right'], () => {
    activePiece.move(1);
});

screen.key(['s', 'down', 'j'], () => {
   activePiece.advance();
});

screen.key(['space', '/', 'c', 'k', 'w', 'up'], () => {
    activePiece.drop();
});

game.start();
