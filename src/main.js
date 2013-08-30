require.config({
	paths: {
	},
	baseUrl: 'src',
	shim: {
	},
	priority: [
	]
});

require([
	'app',
], function(app) {
	'use strict';
	app.init();
});

