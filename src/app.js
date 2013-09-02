define([
    'domReady!',
	'modules/driller',
    'modules/caller',
    'modules/simple-visualiser',
    'modules/control-panel',
    'modules/step-selector',
    'configs/tai-chi'
], function (doc, Driller, Caller, Visualiser, ControlPanel, StepSelector, taiChiConfig) {
	'use strict';
    return {
        init: function () {
            Driller.addDiscipline(taiChiConfig);
            
            var driller = new Driller({
                discipline: 'taiChi',
                disabledSteps: ['inside', 'outside']
            });

            if (window.location.hash !== '#silent') {
                var caller = new Caller(driller);
            }
            var controlPanel = new ControlPanel(driller, {
                fieldList: ['minTime','maxTime','areaWidth','areaLength','stepCount'],
                actionList: ['start', 'stop'],
                formId: 'onGuardControlPanel'
            });
            var stepSelector = new StepSelector(driller, 'stepSelector');
            var visualiser = new Visualiser(driller, 'visualiser');
        }
    };
});
