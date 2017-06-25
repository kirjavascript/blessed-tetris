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
                bg: '#000',
            },
            bg: '#000',
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
            bg: '#000',
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
            bg: '#000',
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
        style: {
            bg: '#000',
        },
        tags: true,
        hidden: true,
        content: '(~˘▾˘)~',
        timer: void 0,
    });

    alertMessage.display = (screen, msg) => {
        alertMessage.setContent(`{bold}${msg}{/}`);
        alertMessage.show();
        alertMessage.timer && clearTimeout(alertMessage.timer);
        alertMessage.timer = setTimeout(() => {
            alertMessage.hide();
            screen.render();
        }, 2000)
    };

    return {
        alertMessage,
        holdBox,
        nextBox,
        statsBox,
    };

};

module.exports = {
    createStats,
};
