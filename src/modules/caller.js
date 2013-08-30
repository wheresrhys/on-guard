define(['utils'], function (utils) {
    var L = 'Left',
        R = 'Right',
        N = 'North',
        S = 'South',
        E = 'East',
        W = 'West',
        compass = [N, E, S, W];

    var Caller = function (driller, conf) {
        // var discipline = (conf && conf.discipline) || Caller.defaults.discipline;
        // this.conf = utils.extendObj({}, Caller.defaults, Caller.disciplineConfigs[discipline], conf || {});
        this.driller = driller;
        this.init();
    };

    Caller.addDiscipline = function (config) {
        Caller.disciplineConfigs[config.name] = config;
        utils.defineProps(config.steps);
    };

    Caller.disciplineConfigs = {};

    Caller.prototype = {
        init: function () {
            //this.preloadAudio();
            this.speaker = document.createElement('audio');
            this.speaker.preload = 'auto';
            this.speaker.autoplay = false;
            document.getElementsByTagName('body')[0].appendChild(this.speaker);
            this.driller.on('step', this.callStep, this);
        },
        callStep: function (state) {
            this.speaker.src = 'assets/audio/' + utils.fromCamel(this.driller.discipline) + '/' + utils.fromCamel(state.lastStep) + '.ogg';
            this.speaker.play();
            console.log(utils.camelToSpaced(state.lastStep));
        },
        preloadAudio: function () {
            var steps = this.driller.conf.steps;
//getOwnPropertyNames
        }
    };

    return Caller;

    // Caller.defaults = {
    //     minTime: 2,
    //     maxTime: 4,
    //     avgTime: 3,
    //     avgWeight: 1
    // };

    // Caller.addDiscipline = function (config) {
    //     Caller.disciplineConfigs[config.name] = config;
    //     utils.defineProps(config.steps);
    // };

    // Caller.disciplineConfigs = {};

    // Caller.prototype = {
    //     init: function () {
    //         this.square = [0,0];
    //         this.frontFoot = null;
    //         this.direction = 0;
    //     },
    //     start: function (reset) {
    //         if (reset) {
    //             this.init();
    //         }
    //         this.fire('started');
    //         this.startSequence = this.conf.startSequence.slice();
    //         this.announceStep(this.startSequence.shift());
    //         this.takeStep();
    //     },
    //     announceStep: function (step) {
    //         this.fire('step', {
    //             direction: compass[this.direction],
    //             frontFoot: this.frontFoot,
    //             lastStep: step,
    //             square: this.square[0] + ':' + this.square[1]
    //         });
    //     },
    //     stop: function () {
    //         clearTimeout(this.timer);
    //         this.endSequence = this.conf.endSequence.slice();
    //         this.takeStep(true);
    //         this.fire('stopped');
    //     },
    //     takeStep: function (closing) {
    //         var that = this;
    //         var step = this.getNextStepName(closing);
    //         if (closing) {
    //             this.adjustPosition(step);
    //             if (this.endSequence.length) {
    //                 that.takeStep(closing);
    //             }
    //         } else {
    //             this.timer = setTimeout(function () {
    //                 that.adjustPosition(step);
    //                 that.takeStep();
    //                 // remember to do this on sound finish (maybe?)
    //             }, this.getTimeInterval());    
    //         }
    //     },
    //     getNextStepName: function (closing) {
    //         if (closing) {
    //             return this.endSequence.shift();
    //         } else if (this.startSequence.length) {
    //             return this.startSequence.shift();
    //         } else {
    //             return utils.pickRandomProperty(this.conf.steps);
    //         }
    //     },
    //     adjustPosition: function (step) {
    //         var moveMatrix,
    //             leftToRight,
    //             frontToBack;
    //         this.currentStep = this.conf.steps[step];
    //         this.direction = (this.direction + ((this.frontFoot === R ? 1 : -1) * this.currentStep.direction) + 4) % 4;
    
    //         leftToRight = this.currentStep.move[1] * (this.currentStep.frontFoot === L ? -1: 1);
    //         frontToBack = this.currentStep.move[0];

    //         if (this.currentStep.frontFoot) {

    //             this.frontFoot = this.currentStep.frontFoot === L ? L :
    //                             this.currentStep.frontFoot === R ? R :
    //                                 this.frontFoot === R ? L : R;
    //         }
            
    //         switch (this.direction) {
    //             case 0:
    //                 moveMatrix = [frontToBack, leftToRight];
    //                 break;
    //             case 1:
    //                 moveMatrix = [-leftToRight, frontToBack];
    //                 break;
    //             case 2:
    //                 moveMatrix = [-frontToBack, -leftToRight];
    //                 break;
    //             case 3:
    //                 moveMatrix = [leftToRight, -frontToBack];
    //                 break;

    //         }

    //         this.square = [this.square[0] + moveMatrix[0], this.square[1] + moveMatrix[1]];

    //         this.announceStep(step);
    //     },

    //     getTimeInterval: function () {
    //         var time = ((((this.conf.maxTime - this.conf.minTime) * Math.random())/(this.conf.avgWeight + 1)) + (this.conf.avgTime *(this.conf.avgWeight/(this.conf.avgWeight + 1)))) + this.conf.minTime;
    //         time = Math.max(Math.min(this.conf.maxTime, time), this.conf.minTime);
    //         //console.log(time);
    //         return 1000;
    //         // return time * 1000;
    //     },
    //     updateSettings: function (conf) {
    //         this.conf = utils.extendObj(this.conf, conf);
    //         this.start();
    //     },
    //     defineStep: function (name, conf) {
    //         this.steps[name] = conf;
    //     },
    //     undefineStep: function (name) {
    //         if (this.steps[name]) {
    //             delete this.steps[name];
    //         }
    //     }
    // };

    // eventEmitter.apply(Caller.prototype);

});