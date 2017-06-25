const telnet = require('telnet2');
const newGame = require('./game');

const serve = process.argv.includes('--serve');
const serveDev = process.argv.includes('--serve-dev');

if (serve || serveDev) {
    telnet({ tty: true }, function(client) {
        client.on('size', function(width, height) {
            client.columns = width;
            client.rows = height;
            client.emit('resize');
        });
        client.on('close', function() {
            if (!screen.destroyed) {
                screen.destroy();
            }
        });

        const { screen, game } = newGame(client);

        screen.on('destroy', function() {
            if (client.writable) {
              client.destroy();
            }
        });

    }).listen(serveDev ? 2300 : 23);
}
else {
    newGame();
}
