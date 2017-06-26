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
                0,0,0,0,
                1,1,1,1,
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
                0,0,0,0,
                1,0,0,0,
                1,1,1,0,
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
                0,0,0,0,
                0,0,1,0,
                1,1,1,0,
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
                0,1,0,0,
                0,1,1,0,
                0,0,1,0,
                0,0,0,0,
            ],
            [
                0,0,0,0,
                0,1,1,0,
                1,1,0,0,
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
                0,0,0,0,
                0,1,0,0,
                1,1,1,0,
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
                0,0,1,0,
                0,1,1,0,
                0,1,0,0,
                0,0,0,0,
            ],
            [
                0,0,0,0,
                1,1,0,0,
                0,1,1,0,
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
        locking: false,
        // TODO: Consider liming extended moves (e.g. moves when touching the ground)
        // instead.
        floorKicksLeft: 3,
    };

    const piece = Object.create({
        rotate(order) {
            let transformsToTry = [
                { rotation: order },
                { rotation: order, x:  1 },
                { rotation: order, x: -1 },
                // A pattern matching detection system is too much work
                // and this feels accuate enough.
                { rotation: order, x:  0, y: -1 },
                { rotation: order, x:  1, y: -1 },
                { rotation: order, x: -1, y: -1 },

                { rotation: order, x:  0, y: -2 },
                { rotation: order, x:  1, y: -2 },
                { rotation: order, x: -1, y: -2 },
            ];

            for (let transform of transformsToTry) {
                let isFloorKick = transform.y < 0;
                if (isFloorKick && piece.floorKicksLeft <= 0) {
                    return;
                }
                if (piece.tryTransform(transform)) {
                    if (isFloorKick) {
                        --piece.floorKicksLeft;
                    }
                    if (!piece.collides({y: 1})) {
                        piece.resumeNormalMotion();
                    }
                    return;
                }
            }
        },
        tryTransform({x = 0, y = 0, rotation = 0}) {
            if (piece.collides({x, y, rotation})) {
                return false;
            }
            piece.x += x;
            piece.y += y;
            piece.rotation = modulo(piece.rotation + rotation, 4);
            return true;
        },
        move(dx) {
            if (piece.tryTransform({x: dx})) {
                if (!piece.collides({y: 1})) {
                    piece.resumeNormalMotion();
                }
            }
        },
        collides({x = 0, y = 0, rotation = 0} = {}) {
            let doesCollide = false;
            piece.eachTransformed({x, y, rotation}, (x, y) => {
                if (doesCollide) {
                    return;
                }
                if (y >= height) {
                    doesCollide = true;
                }
                else if (board[x + (y*width)] && board[x + (y*width)].color) {
                    doesCollide = true;
                }
                else if (x < 0) {
                    doesCollide = true;
                }
                else if (x >= width) {
                    doesCollide = true;
                }
            });
            return doesCollide;
        },
        advance(fromUserInput = false) {
            if (!piece.tryTransform({y: 1})) {
                if (!piece.locking) {
                    piece.waitForLock();
                } else if (fromUserInput) {
                    piece.place();
                }
            }
        },
        waitForLock() {
            piece.stopTimer();
            piece.locking = true;
            // even TGM3 isn't cruel enough to move lock delay below 250.
            let lockDelay = [500, 400, 300][Math.floor(game.level / 10)] || 250;
            piece.lockTimer = setTimeout(() => {
                piece.place();
            }, lockDelay);
        },
        resumeNormalMotion() {
            if (piece.locking) {
                clearTimeout(piece.lockTimer);
                piece.locking = false;
                piece.startTimer();
            }
        },
        place() {
            piece.locking = false;
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
            while (piece.tryTransform({y: 1})) {
                // intentionally empty
            }
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
        eachTransformed({x = 0, y = 0, rotation = 0}, callback) {
            let frame = piece.frames[modulo(piece.rotation + rotation, 4)]
            frame.forEach((d, i) => {
                if (d) {
                    const ix = i%4;
                    const iy = 0|i/4;
                    callback(ix + piece.x + x, iy + piece.y + y, i);
                }
            });
        },
        eachGhost(on, off) {
            let y = 0;
            while (!piece.collides({y: y + 1})) {
                y += 1;
            }
            piece.eachCell(on, off, 0, y);
        },
        // TODO: should this accept {x, y, rotation} transform as last arg? (atm not needed)
        eachCell(callbackOn, callbackOff, xOff = 0, yOff = 0) {
            board.forEach((point, i) => {

                const { element, color, x, y } = point;
                const pieceX = piece.x + xOff;
                const pieceY = piece.y + yOff;

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
            clearTimeout(piece.lockTimer);
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

// % is actually remainder. this does the right thing for negative a
const modulo = (a, b) => ((a % b) + b) % b;

module.exports = {
    getRandom,
};
