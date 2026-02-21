import fs from 'fs';
import readline from 'readline';
import events from 'events';

const log = './sample.log';
let errors = [];
let warnings = [];
let info = [];
let others = [];

try {
    const rl = readline.createInterface({
        input: fs.createReadStream(log),
        crlfDelay: Infinity
    });

    rl.on('line', (line) => {
        if (line.includes('ERROR')) {
            errors.push(line);
        } else if (line.includes('WARN')) {
            warnings.push(line);
        } else if (line.includes('INFO')) {
            info.push(line);
        } else {
            others.push(line);
        }
    });

    await events.once(rl, 'close');

    // console.log('Errors:', errors);
    // console.log('Warnings:', warnings);
    // console.log('Info:', info);
    // console.log('Others:', others);
    console.log(`Errors found: ${errors.length}`);
    console.log(`Warnings found: ${warnings.length}`);
    console.log(`Info found: ${info.length}`);
    console.log(`Other lines found: ${others.length}`);
} catch (err) {
    console.error('Error reading log file:', err);
}
