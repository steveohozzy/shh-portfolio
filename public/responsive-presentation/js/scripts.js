jQuery(function($) {
	$('.step').on('impress:stepenter', function() {
		if (console.clear) { console.clear(); }
		console.log($(this).find('.console-title').text());
		console.log($(this).find('.console-text').text());
	});
});