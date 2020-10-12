const runtestConfig = {
    appURL: "app.sogive.org",
	testHostname: "baker", // Name of test server
	// The possible values for `site` are defined in testConfig.js, targetServers
	site: 'local',
	unsafe: false,
	vert: '',
	// Used by jest-puppeteer.config.js to launch an actual browser for debugging
	head: false,
    chrome: false,
    gitlogPath: "/build/gitlog.txt"
};

module.exports = {
	config: {...runtestConfig} // return copy of object to preserve original config
};
