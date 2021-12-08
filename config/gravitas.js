// Change to "local", "test" or "" to switch all endpoints together
const cluster = '';
const protocol = (cluster === 'local') ? 'http' : 'https';

const SOGIVE_SUBDOMAINS = { test: 'test', local: 'local', '': 'app' };

module.exports = {
	ServerIOOverrides: {
    APIBASE: `${protocol}://${SOGIVE_SUBDOMAINS[cluster]}.sogive.org`,
	}
};
