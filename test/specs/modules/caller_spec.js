/*global xdescribe: false, xit: false, describe:false, jasmine:false, beforeEach:false, afterEach:false,runs:false,waits:false,expect:false,it:false,spyOn:false */

xdescribe('modules/caller', function () {
    
    'use strict';

    var Caller = require('theapp/modules/caller'),
        eventEmitter = require('theapp/mixins/event-emitter'),
        caller;
    afterEach(function () {
        var audioTag = document.getElementsByTagName('audio')[0];
        if (audioTag) {
            audioTag.parentNode.removeChild(audioTag);    
        }
        
    });
    describe('initialisation', function () {
        it('should expect to be passed a suitable event emitter', function () {
            expect(function () {
                new Caller({});
            }).toThrow();
        });

        it('should add a html5 audio tag to the page', function () {
            new Caller(eventEmitter.apply({}));
            expect(document.getElementsByTagName('audio').length).toBe(1);
        });
    });

    describe('calling out steps', function () {
        it('should listen to the step event on the driller', function () {
            spyOn(Caller.prototype, 'callStep');

            var driller = eventEmitter.apply({}),
                caller = new Caller(driller);

            driller.fire('step');

            expect(caller.callStep).toHaveBeenCalled();
        });

        it('should play the correct audio', function () {
            var audioTag = document.createElement('audio');
            if (typeof audioTag.play === 'function') {
                caller = new Caller(eventEmitter.apply({
                    discipline: 'hongKong'
                }));
                caller.callStep({
                    direction: 'North',
                    frontFoot: 'Left',
                    lastStep: 'testStep',
                    coords: '0:0'
                });
                expect(document.getElementsByTagName('audio')[0].getAttribute('src')).toBe('assets/audio/hong-kong/test-step.ogg');
            }
        });
    });
});