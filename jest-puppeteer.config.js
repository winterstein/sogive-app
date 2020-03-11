const config = JSON.parse(process.env.__CONFIGURATION);
console.log(config.head);

module.exports = {
	launch: {
		headless: config.head
	}
};
