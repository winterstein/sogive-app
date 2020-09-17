/**
 * This safety test should be copied into each project's __tests__
 */

 // NB: this config boilerplate can't go in UtilityFunctions as the ../ path would fail behind a symlink
const { targetServers } = require('../testConfig');
const { getConfig, serverSafetyCheck } = require('../test-base/UtilityFunctions');
const config = getConfig();
const server = targetServers[config.site];

// Unfortunately tests run in parallel, so this isn't first, and it can't stop the others.
// But at least you'll know.
describe('a-safety-test', () => {
	
	// Journey: visit the web-app	
	test('smoke test site', async () => {
		if ( ! server) throw new Error("No server url specified");
		await page.goto(server);
		// no smoke :)
	});

	// Journey: visit the web-app, check APIBASE is test or local
	test('Dont point the API at production in a test', async () => {
		if ( ! server) throw new Error("No server url specified");
		await serverSafetyCheck(page, server);		
		// OK :)
	});
	
});
