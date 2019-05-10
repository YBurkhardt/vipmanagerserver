const fs = require('fs');
const EVENT_SERVERSTART=1;

const log = ( msg ) => {
    typeof msg === 'string' 
        ? logWrite(msg) 
        : typeof msg === 'number' 
            ? logEvent(msg)
            : logWrite('Unable to write to Logfile')
};

const logWrite = (msg) => {
    const currentDate = new Date();
    const logMessage = `${currentDate.toLocaleString('de')} => ${msg}\n`;
    console.log(currentDate);
    fs.appendFile('log.txt',logMessage, (err) => {
    });
};

const logEvent = (event) => {
    event === EVENT_SERVERSTART 
        ? logWrite('[SERVER START]')
        : logWrite('Logevent '+event+ 'is unknown!')
};

module.exports.EVENT_SERVERSTART = EVENT_SERVERSTART;
module.exports.log = log;
module.exports.logWrite = logWrite;
module.exports.logEvent = logEvent;