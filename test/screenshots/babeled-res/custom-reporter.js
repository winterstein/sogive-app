"use strict";

class CustomReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options;
  }

  onTestResult(test, testResult, aggregatedTestResult) {
    //Error message seems to be in testResult.failureMessage
    //Not sure this is a suitable place to screenshot
    //Would have to pass browser object in.
    //Could always take the screenshot during test.

    //Bit more faff for tester to set-up though
    //Also know 100% that code in here will be called regardless of success/failure
    //Still need to somehow access browser object from in here for this to work
    // console.warn("Test", test);
    // console.warn("TestResult", testResult);
    // console.warn("AggregatedTestResult", aggregatedTestResult);
  }

  onRunComplete(contexts, results) {
    //   console.log('Custom reporter output:');
    //   console.log('GlobalConfig: ', this._globalConfig);
    //   console.log('Options: ', this._options);
  }
}

module.exports = CustomReporter;
