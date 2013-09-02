define(['domReady!'], function () {
    
    var ControlPanel = function (controller, conf) {
        this.fieldList = conf.fieldList;
        this.actionList = conf.actionList;
        this.controller = controller;
        this.form = document.getElementById(conf.formId);
        this.init();
    };

    ControlPanel.prototype = {
        init: function (controller, conf) {
            for(var i = 0, il = this.fieldList.length; i<il; i++) {
                this.bindField(this.fieldList[i]);
            }
            for(i = 0, il = this.actionList.length; i<il; i++) {
                this.bindAction(this.actionList[i]);
            }
        },

        bindField: function (fieldName) {
            var field = document.getElementById(fieldName),
                that = this;
            field.value = this.controller.conf[fieldName];
            field.addEventListener('change', function () {
                this.controller.conf[fieldName] = field.value;
                var data = {};
                data[fieldName] = field.value;
                this.controller.fire('configChange', data);
            });
        },
        bindAction: function (actionName) {
            var button = document.getElementById(actionName),
                that = this;
            button.addEventListener('click', function () {
                that.controller[actionName]();
            });
        }
    };
    
    return ControlPanel;

});