const fs = require('fs');

const readState = (func) => {
    fs.readFile(".database",(err,data) => {
        if(!err) {
            let readContent = data.toString();
            if(readContent) {
                let splitState = readContent.split('%|');
                func(splitState[0],JSON.parse(splitState[1]));
            }
        }
    });
};

const writeState = (uuid,state) => {
    fs.writeFile(".database", uuid+"%|"+JSON.stringify(state), function(err) {
        if(!err) {
        }
    }); 
};

module.exports.readState = readState;
module.exports.writeState = writeState;