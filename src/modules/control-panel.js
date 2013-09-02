define(['domReady!'], function () {
    
    var ControlPanel = function (controller, conf) {
        if (!controller.on) {
            throw('controller must implement event emitter pattern');
        }
        this.fieldList = conf.fieldList;
        this.actionList = conf.actionList;
        this.controller = controller;
        this.form = document.getElementById(conf.formId);
        this.init();
    };

    ControlPanel.prototype = {
        init: function () {
            var i, il;
            if (this.fieldList) {
                for(i = 0, il = this.fieldList.length; i<il; i++) {
                    this.bindField(this.fieldList[i]);
                }
            }
            if (this.actionList) {
                for(i = 0, il = this.actionList.length; i<il; i++) {
                    this.bindAction(this.actionList[i]);
                }
            }
        },

        bindField: function (fieldName) {
            var field = document.getElementById(fieldName),
                that = this;

            if (!field) {
                console.warn('missing field in control panel: ' + fieldName);
                return;
            }
            field.value = this.controller.conf[fieldName];
            field.addEventListener('change', function () {
                that.controller.conf[fieldName] = field.value;
                var data = {};
                data[fieldName] = field.value;
                that.controller.fire('configChange', data);
            });
        },
        bindAction: function (actionName) {
            var button = document.getElementById(actionName),
                that = this;
            if (!button) {
                console.warn('missing button on control panel: ' + actionName);
                return;
            }
            button.addEventListener('click', function () {
                that.controller[actionName]();
            });
        }
    };
    
    return ControlPanel;

});