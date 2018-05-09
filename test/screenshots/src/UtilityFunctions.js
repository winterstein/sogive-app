const fs = require('fs');

/**Currently want to take screenshot and take a note of any errors */
//Any circumstance under which call to process.arg[1] would return something bad?
async function onFail({error, page, caller = process.argv[1].split("/").pop()}) {
    const folderPath = `test/${caller}`;

    try {
        await page.screenshot({path: `${folderPath}/${new Date().toISOString()}.png`});
    }
    catch(e) {
        //dir not found
        //Shouldn't give infinite loop: mkdirSync throws error if directory can't be created
        if (e.code === 'ENOENT') {
            fs.mkdirSync(folderPath);
            await onFail({error, page, caller});
        }
        else{
            console.log('Screenshot failed: ' + e.message);
        }
        //TODO write to log
        //Possible to get chromium console output?
    }
}

function writeToLog() {
    
}

module.exports = {onFail};
