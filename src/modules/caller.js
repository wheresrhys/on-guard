define(['utils'], function (utils) {
    'use strict';

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
});