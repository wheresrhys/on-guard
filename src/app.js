define([
	'modules/driller'
], function (Driller) {
	'use strict';
    return {
        init: function () {
            var driller = new Driller();

            driller.start();

            setTimeout(function () {
                driller.stop();
                setTimeout(function () {
                   // driller.start();
                }, 5000);
            }, 4000);            
        }
    }

});
