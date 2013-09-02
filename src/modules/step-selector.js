define(['utils', 'domReady!'], function (utils) {
    var StepSelector = function (driller, domNodeId) {
        this.driller = driller;
        this.domNode = document.getElementById(domNodeId);
        this.init();
    };

    StepSelector.prototype = {
        init: function () {
            var heading = document.createElement('p');
            heading.textContent = 'Choose which steps to include in your drill',
            this.domNode.appendChild(heading);
            this.createInputs();
        },
        createInputs: function () {
            var label,
                input;
            for (var key in this.driller.conf.steps) {
                label = document.createElement('label');
                label['for'] = key;
                label.textContent = utils.camelToSpaced(key);
                input = document.createElement('input');
                input.id = key;
                input.name = 'stepSelector';
                input.type = 'checkbox';
                this.domNode.appendChild(input);
                this.domNode.appendChild(label);
                this.bindInputToDriller(key, input);
            }
        },
        bindInputToDriller: function (step, input) {
            var that = this;
            input.checked = this.driller.conf.disabledSteps.indexOf(step) === -1;
            input.addEventListener('change', function () {
                var stepIndex;
                if (input.checked) {
                    that.driller.enableStep(step); 
                    stepIndex = that.driller.conf.disabledSteps.indexOf(step);

                    if (stepIndex > -1) {
                        that.driller.conf.disabledSteps.splice(stepIndex, 1);
                        // or could just fire 'stepDisabled'
                        that.driller.fire('configChange', {
                            disabledSteps: that.driller.conf.disabledSteps
                        });  
                    } else {
                        that.driller.fire('configChange', {});    
                    }
                    
                } else {
                    that.driller.disableStep(step);
                    that.driller.conf.disabledSteps.push(step);
                    that.driller.fire('configChange', {
                        disabledSteps: that.driller.conf.disabledSteps
                    }); 
                }
            });
        }
    };

    return StepSelector;
});