const fs = require('fs');

/**Currently want to take screenshot and take a note of any errors */
//Any circumstance under which call to process.arg[1] would return something bad?
//Probably will discontinue use of this function. Lot of functionality needed on success as well as failure.
async function onFail({error, page}) {
    await takeScreenshot(page);
}

//Maybe save screenshots to directory named after test run?
//Going to be quite difficult figuring out what's what in there
async function takeScreenshot(page) {
    const folderPath = `test-screenshots`;

    try {
        await page.screenshot({path: `${folderPath}/${new Date().toISOString()}.png`});
    }
    catch(e) {
        //dir not found
        //Shouldn't give infinite loop: mkdirSync throws error if directory can't be created
        if (e.code === 'ENOENT') {
            fs.mkdirSync(folderPath);
            await takeScreenshot(page);
        }
        else{
            console.log('Screenshot failed: ' + e.message);
        }
    }
}

function writeToLog() {
    
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
    onFail, 
    timeout,
    takeScreenshot
};
