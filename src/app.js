'use strict';

var	Driller = require('./modules/driller'),
    Caller = require('./modules/caller'),
    Visualiser = require('./modules/simple-visualiser'),
    ControlPanel = require('./modules/control-panel'),
    StepSelector = require('./modules/step-selector'),
    taiChiConfig = require('./configs/tai-chi');

module.exports = {
    init: function () {
        Driller.addDiscipline(taiChiConfig);
        
        var driller = new Driller({
            discipline: 'taiChi',
            disabledSteps: ['turn', 'inside', 'outside'],
            delay: 2
        });

        if (window.location.hash !== '#silent') {
            var caller = new Caller(driller);
        }
        var controlPanel = new ControlPanel(driller, {
            fieldList: ['minTime','maxTime','areaWidth','areaLength','stepCount', 'delay', 'preservePosition'],
            actionList: ['resetAndStart', 'stop'],
            formId: 'onGuardControlPanel'
        });
        var stepSelector = new StepSelector(driller, 'disabledSteps');
        var visualiser = new Visualiser(driller, 'visualiser');
    }
};