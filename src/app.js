define([
    'domReady!',
	'modules/driller',
    'modules/caller',
    'modules/simple-visualiser',
    'modules/control-panel',
    'configs/tai-chi'
], function (doc, Driller, Caller, Visualiser, controlPanel, taiChiConfig) {
	'use strict';
    return {
        init: function () {
            Driller.addDiscipline(taiChiConfig);
            
            var driller = new Driller({
                discipline: 'taiChi'
            });

            var caller = new Caller(driller);
            controlPanel.bindToDriller(driller);
            var visualiser = new Visualiser(driller, 'visualiser');
        }
    };
});
