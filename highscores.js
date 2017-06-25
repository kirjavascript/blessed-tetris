const fs = require('fs');
const { Box, Textbox, Button } = require('blessed');
const filePath = './scores.json';

let highscores = [];

if (fs.existsSync(filePath)) {
    try {
        highscores = JSON.parse(fs.readFileSync(filePath));
    }
    catch (e) {
        console.error(e);
    }
}

function checkHighscore({ game, screen }) {
    const lowestScore = highscores.reduce((a, b) => Math.min(a, b.score), Infinity);

    if (highscores.length < 10 || game.score > lowestScore) {
        const prompt = new Box({
            parent: screen,
            width: 40,
            height: `shrink`,
            border: 'line',
            style: {
                border: {
                    fg: '#06A',
                },
            },
            left: 'center',
            top: '50%',
            padding: 1,
            content: 'New highscore! Enter a name...',
            draggable: true,
        });

        const input = new Textbox({
            parent: prompt,
            height: 2,
            top: 2,
            left: 0,
            width: 30,
            style: {
            },
            inputOnFocus: true,
            mouse: true,
        });

        const save = new Button({
            parent: prompt,
            width: 'shrink',
            height: 1,
            mouse: true,
            content: ' Save ',
            style: {
                bg: '#06A',
                fg: '#000',
            },
            bottom: 0,
            right: 0,
        });

        input.focus();

        save.on('click', () => {
            if (input.value.trim()) {
                (highscores.length >= 10) && highscores.pop();

                highscores.push({
                    name: input.value.trim(),
                    score: game.score,
                    lines: game.lines,
                    LPM: game.linesPerMinute(),
                });

                highscores.sort((a, b) => a.score < b.score);
                fs.writeFile(filePath, JSON.stringify(highscores), (err) => {
                    err && console.error(err);
                });

                save.destroy();
                input.destroy();
                prompt.destroy();
                screen.render();
            }
        });


    }
}

function getHighscores() {
    return highscores;
}

module.exports = {
    checkHighscore,
    getHighscores,
};
