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
        minTime: 2,
        maxTime: 4,
        avgTime: 3,
        avgWeight: 1,
        stepCount: 20 // -1 for infinite
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
            var startPos = this.conf.startPosition || {};
            this.coords = startPos.coords || [0,0];
            this.frontFoot = startPos.frontFoot || null;
            this.direction = startPos.direction || 0;
            this.stepCount = this.conf.stepCount;
            if (this.conf.autoplay && !dontStart) {
                this.start();
            }
        },
        start: function (reset) {
            if (reset) {
                this.init(true);
            }
            this.fire('started');
            this.startSequence = this.conf.startSequence.slice();
            this.announceStep(this.startSequence.shift());
            this.takeStep();
        },
        announceStep: function (step) {
            if (!this.conf.steps[step]) {
                throw('invalid step name: ' + step);
            }
            this.fire('step', {
                direction: compass[this.direction],
                frontFoot: this.frontFoot,
                lastStep: step,
                coords: this.coords[0] + ':' + this.coords[1]
            });
        },
        stop: function () {
            clearTimeout(this.timer);
            this.endSequence = this.conf.endSequence.slice();
            this.takeStep(true);
            this.fire('stopped');
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
            if (closing) {
                return this.endSequence.length ? this.endSequence.shift(): undefined;
            } else if (this.startSequence.length) {
                return this.startSequence.shift();
            } else {
                return this.getValidStep();
            }
        },
        getValidStep: function () {
            return utils.pickRandomProperty(this.conf.steps);
        },
        adjustPosition: function (step) {
            var moveMatrix,
                leftToRight,
                frontToBack;

            this.currentStep = this.conf.steps[step];
            if (!this.currentStep) {
                throw('invalid step name: ' + step);
            }
            this.direction = (this.direction + ((this.frontFoot === L ? 1 : -1) * this.currentStep.direction) + 4) % 4;
    
            leftToRight = this.currentStep.move[1] * (this.frontFoot === L ? 1: -1);
            frontToBack = this.currentStep.move[0];

            if (this.currentStep.frontFoot) {

                this.frontFoot =    this.currentStep.frontFoot === L ? L :
                                    this.currentStep.frontFoot === R ? R :
                                    this.frontFoot === R ? L : R;
            }
            
            switch (this.direction) {
            
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

            this.coords = [this.coords[0] + moveMatrix[0], this.coords[1] + moveMatrix[1]];

            this.announceStep(step);
        },

        getTimeInterval: function () {
            var time = ((((this.conf.maxTime - this.conf.minTime) * Math.random())/(this.conf.avgWeight + 1)) + (this.conf.avgTime *(this.conf.avgWeight/(this.conf.avgWeight + 1)))) + this.conf.minTime;
            time = Math.max(Math.min(this.conf.maxTime, time), this.conf.minTime);
            //console.log(time);
            return 1000;
            // return time * 1000;
        },
        updateSettings: function (conf) {
            this.conf = utils.extendObj(this.conf, conf);
            this.start();
        },
        defineStep: function (name, conf) {
            this.steps[name] = conf;
        },
        undefineStep: function (name) {
            if (this.steps[name]) {
                delete this.steps[name];
            }
        }
    };

    eventEmitter.apply(Driller.prototype);

    return Driller;
});