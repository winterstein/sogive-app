// Front-end configuration for `vdurkin-gl` (VD dev laptop)

// Change index to switch all endpoints together
const cluster = ['app', 'stage', 'test', 'local'][2];
const protocol = 'https';

export const ServerIOOverrides = {
	APIBASE: `${protocol}://${cluster}.sogive.org`
};
