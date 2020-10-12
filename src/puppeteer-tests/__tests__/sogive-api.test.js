
const { targetServers } = require('../testConfig');
const {getConfig, doLogin, fetch} = require('../test-base/UtilityFunctions');
const server = targetServers[getConfig().site];

describe("API-Tests", () => {

	// Journey: requesting a list of charities
	// Result: at least one charity
	test('Fetch charity list', async () => {
		let res = await fetch(server+'/charity/_list.json');
		let jobj = JSON.parse(res);
		let item0 = jobj.cargo.hits[0];
		if ( ! item0) {
			throw new Error("Fetch list failed: "+res);
		}
	});

});
