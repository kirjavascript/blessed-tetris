const { Screen, Box, Message, Button } = require('blessed');

const createStats = ({width, height, zoom, screen}) => {

    const statsBox = new Box({
        parent: screen,
        width: (width*zoom+2),
        height: `100%-${(height*(zoom/2))+2+4}`,
        border: 'line',
        style: {
            border: {
                fg: '#06A',
            },
        },
        left: 'center',
        top: 4,
        tags: true,
        padding: {
            left: 2,
            right: 2,
            top: 1,
            bottom: 1,
        },
    });

    const nextBox = new Box({
        parent: statsBox,
        width: 'shrink',
        height: `shrink`,
        style: {
        },
        top: 0,
        right: 0,
        tags: true,
    });

    const holdBox = new Box({
        parent: statsBox,
        width: 'shrink',
        height: `shrink`,
        style: {
        },
        top: 0,
        right: 12,
        tags: true,
    });

    const alertMessage = new Box({
        parent: statsBox,
        width: 'shrink',
        left: 'center',
        top: 6,
        tags: true,
        hidden: true,
        content: '(~˘▾˘)~',
        timer: void 0,
    });

    // const aboutButton = new Button({
    //     parent: statsBox,
    //     width: 'shrink',
    //     left: 0,
    //     bottom: 0,
    //     tags: true,
    //     mouse: true,
    //     content: 'About',
    //     style: {
    //         bg: '#06A',
    //         fg: '#000',
    //     },
    // });

    // aboutButton.on('press', () => {
    //     process.exit();
    // });

    alertMessage.display = (msg) => {
        alertMessage.setContent(`{bold}${msg}{/}`);
        alertMessage.show();
        alertMessage.timer && clearTimeout(alertMessage.timer);
        alertMessage.timer = setTimeout(() => {
            alertMessage.hide();
        }, 2000)
    };

    const restartMessage = new Box({
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
        content: 'Game Over!\n\n Press enter key to restart',
        hidden: true,
    });



//     restartMessage.display = (callback) => {
//         restartMessage.show();
//         restartMessage.focus();
//         function restart () {
//             restartMessage.hide();

//             callback();
//         };
//         restartMessage.key('enter', restart);
//         screen.render();
//     };

    return {
        alertMessage,
        restartMessage,
        holdBox,
        nextBox,
        statsBox,
    };

};

module.exports = {
    createStats,
};
