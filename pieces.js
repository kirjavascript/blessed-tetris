const pieces = [
    {
        name: 'I',
        color: 'cyan',
        frames: [
            [
                0,1,0,0,
                0,1,0,0,
                0,1,0,0,
                0,1,0,0,
            ],
            [
                0,0,0,0,
                1,1,1,1,
                0,0,0,0,
                0,0,0,0,
            ],
            [
                0,0,1,0,
                0,0,1,0,
                0,0,1,0,
                0,0,1,0,
            ],
            [
                0,0,0,0,
                0,0,0,0,
                1,1,1,1,
                0,0,0,0,
            ],
        ],
    },
    {
        name: 'J',
        color: 'blue',
        frames: [
            [
                0,1,0,0,
                0,1,0,0,
                1,1,0,0,
                0,0,0,0,
            ],
            [
                1,0,0,0,
                1,1,1,0,
                0,0,0,0,
                0,0,0,0,
            ],
            [
                0,1,1,0,
                0,1,0,0,
                0,1,0,0,
                0,0,0,0,
            ],
            [
                0,0,0,0,
                1,1,1,0,
                0,0,1,0,
                0,0,0,0,
            ],
        ],
    },
    {
        name: 'L',
        color: '#FF4500',
        frames: [
            [
                0,1,0,0,
                0,1,0,0,
                0,1,1,0,
                0,0,0,0,
            ],
            [
                0,0,0,0,
                1,1,1,0,
                1,0,0,0,
                0,0,0,0,
            ],
            [
                1,1,0,0,
                0,1,0,0,
                0,1,0,0,
                0,0,0,0,
            ],
            [
                0,0,1,0,
                1,1,1,0,
                0,0,0,0,
                0,0,0,0,
            ],
        ],
    },
    {
        name: 'O',
        color: '#Fa0',
        frames: new Array(4)
            .fill([
                0,0,0,0,
                0,1,1,0,
                0,1,1,0,
                0,0,0,0,
            ]),
    },
    {
        name: 'S',
        color: 'green',
        frames: [
            [
                0,0,0,0,
                0,1,1,0,
                1,1,0,0,
                0,0,0,0,
            ],
            [
                1,0,0,0,
                1,1,0,0,
                0,1,0,0,
                0,0,0,0,
            ],
            [
                0,1,1,0,
                1,1,0,0,
                0,0,0,0,
                0,0,0,0,
            ],
            [
                0,1,0,0,
                0,1,1,0,
                0,0,1,0,
                0,0,0,0,
            ],
        ],
    },
    {
        name: 'T',
        color: '#551a8b',
        frames: [
            [
                0,0,0,0,
                1,1,1,0,
                0,1,0,0,
                0,0,0,0,
            ],
            [
                0,1,0,0,
                1,1,0,0,
                0,1,0,0,
                0,0,0,0,
            ],
            [
                0,1,0,0,
                1,1,1,0,
                0,0,0,0,
                0,0,0,0,
            ],
            [
                0,1,0,0,
                0,1,1,0,
                0,1,0,0,
                0,0,0,0,
            ],
        ],
    },
    {
        name: 'Z',
        color: 'red',
        frames: [
            [
                0,0,0,0,
                1,1,0,0,
                0,1,1,0,
                0,0,0,0,
            ],
            [
                0,1,0,0,
                1,1,0,0,
                1,0,0,0,
                0,0,0,0,
            ],
            [
                1,1,0,0,
                0,1,1,0,
                0,0,0,0,
                0,0,0,0,
            ],
            [
                0,0,1,0,
                0,1,1,0,
                0,1,0,0,
                0,0,0,0,
            ],
        ],
    },
];


let queue = [];

const getRandom = (game) => {
    const {board, width, height } = game;

    if (queue.length == 0) {
        queue = shuffle(Array.from({length: pieces.length}, (_, i) => i));
    }

    const nextIndex = queue.pop();
    const initialState = {
        x: (width/2)-2,
        y: -2,
        rotation: 0|Math.random()*4,
    };

    const piece = Object.create({
        rotate(order) {
            piece.rotation += order;
            if (piece.rotation < 0) {
                piece.rotation += 4;
            }

            if (piece.checkPlace()) {
                piece.rotation -= order;
            }
            else {
                let bounds = piece.checkBounds();
                if (bounds) {
                    piece.x -= bounds;
                    if (piece.checkPlace()) {
                        piece.x += bounds;
                        piece.rotation -= order;
                    }
                }
            }
        },
        move(dx) {
            piece.x += dx;
            if (piece.checkBounds() || piece.checkPlace()) {
                piece.x -= dx;
            }
        },
        checkBounds() {
            let doesCollide = 0;
            piece.each((x, y) => {
                if (x < 0) {
                    doesCollide = Math.min(doesCollide, x);
                }
                else if (x >= width) {
                    doesCollide = Math.max(doesCollide, x-width+1);
                }
            });
            return doesCollide;
        },
        checkPlace() {
            let doesCollide = false;
            piece.each((x, y) => {
                if (y >= height) {
                    doesCollide = true;
                }
                else if (board[x + (y*width)] && board[x + (y*width)].color) {
                    doesCollide = true;
                }
            });
            return doesCollide;
        },
        advance() {
            piece.y++;
            if (piece.checkPlace()) {
                piece.y--;
                piece.place();
            }
        },
        place() {
            piece.eachCell((point) => {
                point.color = piece.color;
            });

            // remove lines
            let lineQty = 0;

            for (let i = 0; i < height; i++) {
                let line = board.slice(i * width, (i*width) + width);
                if (line.filter(d => d.color).length == width) {
                    for (let j = i; j > 0; j--) {
                        for (let k = 0; k < width; k++) {
                            board[(j*width)+k].color = board[((j-1)*width)+k].color;
                        }
                    }
                    lineQty++;
                }
            }

            piece.stopTimer();

            if (lineQty) {
                game.addLines(lineQty);
                game.addScore([40, 100, 300, 1200][lineQty-1] * game.level);
            }
            else {
                game.addScore(10);
            }
            game.nextPiece();
        },
        drop() {
            while (!piece.checkPlace()) {
                piece.y++;
            }
            piece.y--;
            piece.place();
        },
        getShape() {
            return piece.frames[piece.rotation % 4];
        },
        viewShape() {
            return `{${piece.color}-fg}` + piece.getShape().join``.match(/..../g).join`\n`.replace(/0|1/g, m => {
                return m == '1' ? '██' : '  ';
            }) + '{/}';
        },
        each(callback) {
            piece.getShape().forEach((d, i) => {
                if (d) {
                    const x = i%4;
                    const y = 0|i/4;
                    callback(x + piece.x, y + piece.y, i);
                }
            });
        },
        eachGhost(on, off) {
            let savedY = piece.y;

            while (!piece.checkPlace()) {
                piece.y++;
            }
            piece.y--;
            piece.eachCell(on, off);
            piece.y = savedY;
        },
        eachCell(callbackOn, callbackOff) {
            board.forEach((point, i) => {

                const { element, color, x, y } = point;
                const { x: pieceX, y: pieceY } = piece;

                let drawColor = color;

                let [dx, dy] = [
                    x - pieceX,
                    y - pieceY,
                ];

                if (x >= pieceX && Math.abs(dx) < 4 && Math.abs(dy) < 4) {
                    let shape = piece.getShape();
                    if (shape[dx + (dy*4)]) {
                        drawColor = piece.color;
                        return callbackOn && callbackOn(point);
                    }
                }

                callbackOff && callbackOff(point);

            });
        },
        startTimer() {
            piece.timer = setInterval(() => {
                piece.advance();
                game.render();
            }, [500, 450, 400, 350, 300, 250, 200, 150, 100][game.level - 1] || 50);
        },
        stopTimer() {
            clearInterval(piece.timer);
        },
        clone() {
            let newObj = Object.create(piece);
            return Object.assign(newObj, piece);
        },
        hold() {
            this.stopTimer();
            Object.assign(this, initialState);
        }
    });

    Object.assign(piece, pieces[nextIndex], initialState);

    return piece;
};


const shuffle = (array) => {
    var m = array.length, t, i;
    while (m) {
        i = Math.floor(Math.random() * m--);
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }
    return array;
}

module.exports = {
    getRandom,
};
