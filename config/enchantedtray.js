
// Change to "local", "test" or "" to switch all endpoints together
const cluster = 
	'test';
	// 'local';
	// 'app'; // if you want production!

const protocol = (cluster === 'local') ? 'http' : 'https';

module.exports = {
	ServerIOOverrides: {
		APIBASE: `${protocol}://${cluster}.sogive.org`,
		ENDPOINT_NGO: `${protocol}://${cluster}.sogive.org`,		
	}
};
