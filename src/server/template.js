export default (html) => `
	<!DOCTYPE html>
	<html>
	<head>
			<title>test app</title>
			<meta charset="utf-8">
			<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" />
	</head>
	<body>
			<div id="mainDiv">${html}</div>
			<script src="/build/js/bundle.js"></script>
	</body>
	</html>
`;