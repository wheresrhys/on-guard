define([
    'domReady!',
	'modules/driller',
    'modules/caller',
    'modules/simple-visualiser',
    'modules/control-panel',
    'configs/tai-chi'
], function (doc, Driller, Caller, Visualiser, ControlPanel, taiChiConfig) {
	'use strict';
    return {
        init: function () {
            Driller.addDiscipline(taiChiConfig);
            
            var driller = new Driller({
                discipline: 'taiChi'
            });

            //var caller = new Caller(driller);
            var controlPanel = new ControlPanel(driller, {
                fieldList: ['minTime','maxTime','areaWidth','areaLength','stepCount'],
                actionList: ['start', 'stop'],
                formId: 'onGuardControlPanel'
            });
            var visualiser = new Visualiser(driller, 'visualiser');
        }
    };
});
