const { Screen, Box, Message, Button } = require('blessed');

const messageBase = {
    width: `shrink`,
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
};

const buttonBase = {
    width: 'shrink',
    height: 1,
    tags: true,
    mouse: true,
    style: {
        bg: '#06A',
        fg: '#000',
    },
};

const createMenu = ({screen}) => {
    const menuBox = new Box({
        parent: screen,
        width: 'shrink',
        height: 1,
        top: 3,
        left: 'center',
    });

    const restartMessage = new Box(Object.assign({},
        messageBase, {
            parent: screen,
            content: 'Game Over!\n\n Press enter key to restart',
            width: 32,
        })
    );

    const aboutButton = new Button(Object.assign({},
        buttonBase, {
            parent: menuBox,
            content: ' About ',
            left: 0,
            bottom: 0,
        })
    );

    const aboutMessage = new Message(Object.assign({},
        messageBase, {
            parent: screen,
            tags: true,
            width: 52,
        })
    );

    const aboutMessageCloseButton = new Button(Object.assign({},
        buttonBase, {
            parent: aboutMessage,
            content: ' X ',
            right: 0,
            top: 0,
        })
    );

    aboutMessageCloseButton.on('click', () => {
        aboutMessage.hide();
        screen.render();
    });

    aboutButton.on('press', () => {
        aboutMessage.display([
            '{yellow-fg}{bold}★{/} Issues / Source',
            'https://github.com/kirjavascript/blessed-tetris',
        ].join`\n\n`, 0, () => {
            aboutMessage.focus();
        });
    });


    return {
        menuBox,
        restartMessage,
    };
};

module.exports = {
    createMenu,
};

