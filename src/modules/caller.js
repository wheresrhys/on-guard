define(['utils'], function (utils) {
    'use strict';

    var L = 'Left',
        R = 'Right',
        N = 'North',
        S = 'South',
        E = 'East',
        W = 'West',
        compass = [N, E, S, W];

    var Caller = function (driller) {
        if (!driller.on) {
            throw('driller must implement event emitter');
        }
        this.driller = driller;
        this.init();
    };

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
            this.speaker.src = 'assets/audio/' + utils.toDashed(this.driller.discipline) + '/' + utils.toDashed(state.lastStep) + '.ogg';
            this.speaker.play();
            console.log(utils.camelToSpaced(state.lastStep));
        }//,
//         preloadAudio: function () {
//             var steps = this.driller.conf.steps;
// //getOwnPropertyNames
//         }
    };

    return Caller;
});