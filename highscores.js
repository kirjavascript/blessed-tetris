const fs = require('fs');
const { Prompt } = require('blessed');
const filePath = './scores.json';

const highscores = [];

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
        const prompt = new Prompt({
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
            hidden: true,
            padding: 1,
            draggable: true,
        });

        prompt.readInput('New highscore! Enter a name...', '', () => {
            prompt.destroy();
            screen.render();
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
