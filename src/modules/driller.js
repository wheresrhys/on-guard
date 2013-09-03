define(['mixins/event-emitter', 'utils'], function (eventEmitter, utils) {
    
    var L = 'Left',
        R = 'Right',
        N = 'North',
        S = 'South',
        E = 'East',
        W = 'West',
        compass = [N, E, S, W];

    var Driller = function (conf) {
        this.discipline = (conf && conf.discipline) || Driller.defaults.discipline;
        this.conf = utils.extendObj({}, Driller.defaults, Driller.disciplineConfigs[this.discipline], conf || {});
        this.init();
    };

    Driller.defaults = {
        discipline: 'taiChi',
        disabledSteps: [],
        minTime: 1,
        maxTime: 2,
        // avgTime: 3,
        // avgWeight: 1,
        areaWidth: 4,
        areaLength: 4,
        stepCount: -1 // -1 for infinite
    };

    Driller.addDiscipline = function (config) {
        if (!config.name) {
            throw('name must be defined for any discipline config');
        }
        Driller.disciplineConfigs[config.name] = config;
        utils.defineProps(config.steps);
    };

    Driller.disciplineConfigs = {};

    Driller.prototype = {
        init: function (dontStart) {
            var startPos = this.conf.startPosition || {},
                that = this;
            this.disabledSteps = {};
            this.conf.disabledSteps.map(function (item) {
                that.disabledSteps[item] = true;
            });
            this.coords = (this.conf.preservePosition ? this.coords : startPos.coords) || [0,0];
            this.frontFoot = startPos.frontFoot || null;
            // if ('direction' in this) {

            // }
            this.direction = (this.conf.preservePosition ? this.direction : startPos.direction);
            this.direction = typeof this.direction === 'undefined' ? 0 : this.direction;
            this.longDirection = compass[this.direction];
            //this.direction = startPos.direction || 0;
            this.stepCount = this.conf.stepCount;
            this.conf.minTime = Math.max(this.conf.minTime, 0.5);
            this.conf.maxTime = Math.max(this.conf.maxTime, this.conf.minTime);
            this.fire('initialised');
            if (this.conf.autoplay && !dontStart) {
                this.start();
            }
        },
        _start: function (reset) {
            
            this.fire('started');
            this.running = true;
            this.startSequence = this.conf.startSequence.slice();
            this.announceStep(this.startSequence.shift());
            this.takeStep();
        },
        start: function (reset) {
            var that = this;
            if (reset) {
                this.init(true);
            } else if (this.running === true) {
                return;
            }
            if (this.conf.delay) {
                setTimeout(function () {
                    that._start(reset);
                }, this.conf.delay * 1000);
            } else {
                this._start(reset);
            }
        },
        resetAndStart: function () {
            this.stop(true);
            this.start(true);
        },
        announceStep: function (step) {
            if (!this.conf.steps[step]) {
                throw('invalid step name: ' + step);
            }
            this.fire('step', {
                direction: compass[this.direction],
                frontFoot: this.frontFoot,
                lastStep: step,
                coords: this.coords.slice()
            });
        },
        stop: function (abort) {
            if (this.running === true) {
                clearTimeout(this.timer);
                if (!abort) {
                    this.endSequence = this.conf.endSequence.slice();
                    this.takeStep(true);
                }
                this.fire('stopped');
                this.running = false;
            }
        },
        takeStep: function (closing) {
            var that = this,
                step;
            
            if (!this.stepCount && !closing && !this.startSequence.length) {
                return this.stop();
            }
            if (this.stepCount && !this.startSequence.length) {
                this.stepCount--;
            }
            
            step = this.getNextStepName(closing);
            
            
            if (closing) {
                if (step) {
                    this.adjustPosition(step);
                    if (this.endSequence.length) {
                        that.takeStep(closing);
                    }
                }
            } else {
                this.timer = setTimeout(function () {
                    that.adjustPosition(step);
                    that.takeStep();
                    // remember to do this on sound finish (maybe?)
                }, this.getTimeInterval());
            }
        },
        getNextStepName: function (closing) {
            var step;
            if (closing) {
                step = this.endSequence.length ? this.endSequence.shift(): undefined;
            } else if (this.startSequence.length) {
                step = this.startSequence.shift();
            } else {
                step = this.getRandomStep();
            }
            if (!step) {
                return;
            }
            return this.validateStep(step) ? step : this.getNextStepName(closing);
        },
        getRandomStep: function () {
            return utils.pickRandomProperty(this.conf.steps);
        },
        validateStep: function (step) {
            if (this.disabledSteps[step]) {
                return false;
            }
            var newPosition = this.adjustPosition(step, true);
            return (newPosition[0] >= 0 && newPosition[1] >= 0 && newPosition[1] < this.conf.areaWidth && newPosition[0] < this.conf.areaLength);
        },
        adjustPosition: function (step, dummy) {
            var moveMatrix,
                leftToRight,
                frontToBack,
                coords,
                currentStep,
                direction,
                longDirection, 
                frontFoot;

            currentStep = this.conf.steps[step];
            if (!currentStep) {
                // if (dummy) {
                //     return [1000000000, 1000000000];
                // } else {
                throw('invalid step name: ' + step);
                // }
            }
            direction = (this.direction + ((this.frontFoot === L ? 1 : -1) * currentStep.direction) + 4) % 4;
            longDirection = compass[direction];
            leftToRight = currentStep.move[1] * (this.frontFoot === L ? 1: -1);
            frontToBack = currentStep.move[0];

            frontFoot =    currentStep.frontFoot === L ? L :
                            currentStep.frontFoot === R ? R :
                            currentStep.frontFoot === 1 ? (this.frontFoot === R ? L : R) :
                            this.frontFoot;
            
            switch (direction) {
            
            case 0:
                moveMatrix = [frontToBack, leftToRight];
                break;
            case 1:
                moveMatrix = [-leftToRight, frontToBack];
                break;
            case 2:
                moveMatrix = [-frontToBack, -leftToRight];
                break;
            case 3:
                moveMatrix = [leftToRight, -frontToBack];
                break;

            }

            coords = [this.coords[0] + moveMatrix[0], this.coords[1] + moveMatrix[1]];

            if (dummy) {
                return coords;
            } else {
                this.coords = coords;
                this.currentStep = currentStep;
                this.direction = direction;
                this.longDirection = longDirection;
                this.frontFoot = frontFoot;
                this.announceStep(step);    
            }
            
        },

        getTimeInterval: function () {
            var min = 2,
                availableInterval = this.conf.maxTime - this.conf.minTime;

            var time = (min + (availableInterval * Math.random()));
            time = Math.max(Math.min(this.conf.maxTime, time), this.conf.minTime);
            return time * 1000;


            // var time = (((availableInterval * Math.random())/(this.conf.avgWeight + 1)) + (this.conf.avgTime *(this.conf.avgWeight/(this.conf.avgWeight + 1)))) + this.conf.minTime;

        },
        enableStep: function (step) {
            
            var stepIndex = this.conf.disabledSteps.indexOf(step);
            this.disabledSteps[step] = false;
            if (stepIndex > -1) {
                this.conf.disabledSteps.splice(stepIndex, 1);
                // or could just fire 'stepDisabled'
                this.fire('configChange', {
                    disabledSteps: this.conf.disabledSteps
                });  
            }
        },
        disableStep: function (step) {
            var stepIndex = this.conf.disabledSteps.indexOf(step);
            this.disabledSteps[step] = true;
            if (stepIndex === -1) {
                this.conf.disabledSteps.push(step);
                this.fire('configChange', {
                    disabledSteps: this.conf.disabledSteps
                });
            }
        },


        // ???NEED TO WRITE TESTS FOR this
        //             it('should be affected by live changes to the config', function () {

        //     });
        updateSettings: function (conf) {
            this.conf = utils.extendObj(this.conf, conf);
            
        // defineStep: function (name, conf) {
        //     this.steps[name] = conf;
        // },
        // undefineStep: function (name) {
        //     if (this.steps[name]) {
        //         delete this.steps[name];
        //     }
        }
    };

    eventEmitter.apply(Driller.prototype);

    return Driller;
});