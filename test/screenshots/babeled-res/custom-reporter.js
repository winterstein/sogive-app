'use strict';

const fs = require('fs');

class CustomReporter {
    constructor(globalConfig, options) {
        this._globalConfig = globalConfig;
        this._options = options;
        //this.__SCREENSHOT_FOLDER_BASE__ = 'test-screenshots';
    }

    //Seems to run after test suite is completed rather than
    //after each individual test
    onTestResult(test, testResult, aggregatedTestResult) {
        //Error message seems to be in testResult.failureMessage
        //Not sure this is a suitable place to screenshot
        //Would have to pass browser object in.
        //Could always take the screenshot during test.
        //Bit more faff for tester to set-up though
        //Also know 100% that code in here will be called regardless of success/failure
        //Still need to somehow access browser object from in here for this to work

        //const folderPath = `${this.__SCREENSHOT_FOLDER_BASE__}/${new Date().toISOString().slice(0, 10)} : ${testName}`;
        //Could check for failures either in 'aggregatedTestResult.numFailedTests'
        //or iterate over testResult.testResults
        // const date = new Date().toISOString();
        // console.log(this);
        // //Start at 1 to skip over chrome home page
        // for(let i=1; i<pages.length; i++) {
        //     await takeScreenshot({page: pages[i], date});
        //     await writeToLog({
        //         string: '',
        //         date
        //     });
        // }
    }

    onRunComplete(contexts, results) {}
    // console.log(contexts);
    // console.log(results);
    // console.log(this._globalConfig.testFailureExitCode);


    // async writeToLog({string, folderPath}) {
    //   fs.appendFileSync(`${this.__SCREENSHOT_FOLDER_BASE__}/${date.slice(0,10)} : ${window.__TESTNAME__ || 'UnknownTest'}/${date}.txt`, string);
    // }
}

module.exports = CustomReporter;
