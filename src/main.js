require.config({
	paths: {
		domReady: '../lib/requirejs-domready/domReady'
	},
	baseUrl: 'src',
	shim: {
	},
	priority: [
	]
});

require([
	'app',
], function (app) {
	'use strict';
	app.init();
});

