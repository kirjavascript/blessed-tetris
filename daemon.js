~function() {

    const args = '--harmony index.js'.split` `;

    const reload = process.argv.includes('--reload');

    const proc = require('child_process')
        .spawn('node', args, {
            stdio: 'inherit',
        });

    const rip = () => {
        if (reload) {
            arguments.callee();
        }
        else {
            process.exit();
        }
    };

    proc.on('exit', rip);

    require('chokidar')
        .watch('**/*', {ignored: /[\/\\]\./})
        .on('change', () => {
            proc.removeListener('exit', rip);
            proc.on('exit', arguments.callee);
            proc.kill('SIGINT');
        });

} ();
