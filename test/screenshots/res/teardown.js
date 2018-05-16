const chalk = require('chalk');
const puppeteer = require('puppeteer');
const {takeScreenshot} = require('./UtilityFunctions');

//This actually seems to be the place to setup screenshotting. 
//Still have access to the browser object via the temporary directory
//Very interesting technique. Can this be used to pass objects around in general?
//No. Specific WebSocket-related thing
module.exports = async function() {
  console.log(global || '没什么');   
  // const __BROWSER__ = window.__BROWSER__;
  // const pages = await __BROWSER__.pages();

  // //forEach is apparently unreliable when used with await
  // for(let i=0; i<pages.length; i++) {
  //   let page = pages[i];
  //   await takeScreenshot(page);    
  // }
  // await __BROWSER__.close();
};
