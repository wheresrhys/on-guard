define([
	'modules/driller',
    'modules/caller',
    'configs/tai-chi'
], function (Driller, Caller, taiChiConfig) {
	'use strict';
    return {
        init: function () {
            Driller.addDiscipline(taiChiConfig);
            
            var driller = new Driller({
                discipline: 'taiChi'
            });

            var caller = new Caller(driller);

            driller.start();

            setTimeout(function () {
                driller.stop();
                setTimeout(function () {
                   // driller.start();
                }, 5000);
            }, 20000);
        }
    };
});
