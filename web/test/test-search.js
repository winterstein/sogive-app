
// Assume jQuery, ReactTestUtils, and SJTest
// Assume the web-app has loaded

// fill in the search form
let $node = $('input#formq');
let node = $node[0];
$node.val('oxfam');
ReactTestUtils.Simulate.change(node);
ReactTestUtils.Simulate.submit(node);
// This works!

// release control
setTimeout(() => {
	
	// TODO assert the oxfam result is on the page
	const $result = $('div[data-id=oxfam]');
	console.error("result", $result);
	assert($result);

	// click TODO this fails! simulate click has no effect?!
	const btn = $('.read-more')[0];
	console.error("btn", btn);
	// ReactTestUtils.Simulate.click(btn); doesnt work
	window.location.hash = $(btn).attr('href'); // HACK

}, 500);
