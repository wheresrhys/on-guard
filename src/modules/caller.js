'use strict';

var utils = require('../utils'),
    L = 'Left',
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
        this.sources = {};
        var self = this;
        this.srcTypes = 'mp3,ogg,wav,aiff'.split(',');

        this.srcTypes.forEach(function (format) {
            var source = self.sources[format] = document.createElement('source');
            source.type = 'audio/' + (format === 'mp3' ? 'mpeg' : (format === 'aiff' ? 'x-aiff' : format));
            self.speaker.appendChild(source);
        });

        document.getElementsByTagName('body')[0].appendChild(this.speaker);
        this.driller.on('step', this.callStep, this);
    },
    callStep: function (state) {
        var self = this;
        this.srcTypes.forEach(function (format) {
            self.sources[format].src = 'assets/audio/' + utils.toDashed(self.driller.discipline) + '/' + utils.toDashed(state.lastStep) + '.' + format;
        });
        this.speaker.load();
        this.speaker.play();
    }//,
//         preloadAudio: function () {
//             var steps = this.driller.conf.steps;
// //getOwnPropertyNames
//         }
};

module.exports = Caller;