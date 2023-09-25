// Front-end configuration for `sickgamingrig` (WW dev desktop)

// Change index to switch all endpoints together
const cluster = ['app', 'stage', 'test', 'local'][0];
const protocol = 'https';

export const ServerIOOverrides = {
	APIBASE: `${protocol}://${cluster}.sogive.org`
};
