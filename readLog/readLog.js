import fs from 'fs';
import readline from 'readline';
import events from 'events';

const log = './sample.log';
let errors = [];
let warnings = [];
let info = [];
let others = [];

async function readLogFile(log) {
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
        return [...errors, ...warnings, ...info, ...others];
    } catch (err) {
        console.error('Error reading log file:', err);
        return [];
    }
};

async function outputJSON(logData) {
    const output = {
        errors: [],
        warnings: [],
        info: [],
        others: []
    };

    const errors = logData.filter(line => line.includes('ERROR'));
    errors.forEach(line => {
        const timestamp = line.split(' ')[0]; // Assuming the timestamp is the first part of the line
        const message = line.split(' ').slice(1).join(' '); // The rest of the line is the message
        output.errors.push({ timestamp, message });
    });
    const warnings = logData.filter(line => line.includes('WARN'));
    warnings.forEach(line => {
        const timestamp = line.split(' ')[0];
        const message = line.split(' ').slice(1).join(' ');
        output.warnings.push({ timestamp, message });
    });
    const info = logData.filter(line => line.includes('INFO'));
    info.forEach(line => {
        const timestamp = line.split(' ')[0];
        const message = line.split(' ').slice(1).join(' ');
        output.info.push({ timestamp, message });
    });
    const others = logData.filter(line => !line.includes('ERROR') && !line.includes('WARN') && !line.includes('INFO'));
    others.forEach(line => {
        const timestamp = line.split(' ')[0];
        const message = line.split(' ').slice(1).join(' ');
        output.others.push({ timestamp, message });
    });

    console.log(output);
};

const logData = await readLogFile(log);
await outputJSON(logData);
