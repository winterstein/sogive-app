const config = JSON.parse(process.env.__CONFIGURATION);
console.log(config)

module.exports = {
	launch: {
		headless: config.head,
        slowMo: process.env.SLOWMO ? process.env.SLOWMO : 0,
		executablePath: config.chrome ? '/usr/bin/google-chrome-stable' : ''
	}
};
