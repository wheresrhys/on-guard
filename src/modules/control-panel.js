define(['domReady!'], function () {
    
    var bound,
        theDriller,
        form = document.getElementById('onGuardControlPanel'),
        fieldList = ['minTime','maxTime','areaWidth','areaLength','stepCount'],
        actionList = ['start', 'stop'],

        initOrUnbind = function (driller) {
            if (bound) {
                unbindFromDriller();
            }
            bindToDriller(driller);
        },

        bindToDriller = function (driller) {
        
            theDriller = driller;
            for(var i = 0, il = fieldList.length; i<il; i++) {
                bindField(fieldList[i]);
            }
            for(i = 0, il = actionList.length; i<il; i++) {
                bindAction(actionList[i]);
            }
            bound = true;

        },

        unbindFromDriller = function () {

        },

        bindField = function (fieldName) {
            var field = document.getElementById(fieldName),
                forcesRestart = !!field['data-restart'];
            field.value = theDriller.conf[fieldName];
            field.addEventListener('change', function () {
                theDriller.conf[fieldName] = field.value;
                if (forcesRestart) {
                    theDriller.stop(true);
                    theDriller.start(true);
                }
            });
        },
        bindAction = function (actionName) {
            var button = document.getElementById(actionName);
            button.addEventListener('click', function () {
                theDriller[actionName]();
            });
        };
    
    return {
        bindToDriller: initOrUnbind
    };

});