const config = JSON.parse(process.env.__CONFIGURATION);
console.log(config);

module.exports = {
	launch: {
		headless: config.head
	}
};
