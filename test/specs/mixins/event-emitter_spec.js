/*global describe:false, jasmine:false, beforeEach:false, afterEach:false,runs:false,waits:false,expect:false,it:false,spyOn:false */
describe('mixins/event-emitter', function () {

    'use strict';

    var eventEmitter = require('theapp/mixins/event-emitter'),
        emitter1,
        subscriber1,
        emitter2,
        subscriber2;
    
    beforeEach(function() {
        emitter1 = eventEmitter.apply({});
        emitter2 = eventEmitter.apply({});
    });

    afterEach(function () {
        eventEmitter.cleanUp();
    });

    describe('utilities', function () {
        it('should be possible to clear all subscriptions', function () {
            var spy = jasmine.createSpy();
            emitter1.on('event', spy);
            eventEmitter.cleanUp();
            emitter1.fire('event');
            expect(spy).not.toHaveBeenCalled();
        });
        
    });

    describe('subscribing (the \'on\' method)', function () {
        it('should expect an event name', function () {
            expect(function () {
                emitter1.on(function () {}, function () {}, {});
                emitter1.on(undefined, function () {}, {});
            }).toThrow();
        });

        it('should allow several event names to be subscribed to at once', function () {
            var spy = jasmine.createSpy();
            emitter1.on('event1 event2', spy);
            emitter1.fire('event1');
            emitter1.fire('event2');
            expect(spy.calls.length).toBe(2);
        });

        it('should allow several event names for one emitter', function () {
            var spy1 = jasmine.createSpy(),
                spy2 = jasmine.createSpy();
            
            emitter1.on('event1', spy1);
            emitter1.on('event2', spy2);

            emitter1.fire('event1');
            expect(spy1).toHaveBeenCalled();
            expect(spy2).not.toHaveBeenCalled();
        });

        it('should expect a callback', function () {
            expect(function () {
                emitter1.on('event', undefined, {});
                emitter1.on('event', {}, {});
            }).toThrow();
        });

        it('should use a context when provided', function () {
            var givenContext = {},
                usedContext,
                callback = function () {
                    usedContext = this;
                };
            emitter1.on('event', callback, givenContext);
            emitter1.fire('event');
            expect(usedContext).toBe(givenContext);
        });

        it('should allow several callbacks & contexts for a single event', function () {
            var cb1 = jasmine.createSpy().andCallFake(function () {
                    contextRecord.push(this);
                }),
                cb2 = jasmine.createSpy(),
                c1 = {},
                c2 = {},
                contextRecord = [];

            emitter1.on('event', cb1);
            emitter1.on('event', cb1, c1);
            emitter1.on('event', cb1, c2);
            emitter1.on('event', cb2);
            emitter1.fire('event');
            expect(cb1.calls.length).toBe(3);
            expect(cb2.calls.length).toBe(1);
            expect(contextRecord).toEqual([window, c1, c2]);
        });

        it('should allow events with same name on differnent emitters', function () {
            var spy1 = jasmine.createSpy(),
                spy2 = jasmine.createSpy();
            
            emitter1.on('event', spy1);
            emitter2.on('event', spy2);
            emitter1.fire('event');
            expect(spy1).toHaveBeenCalled();
            expect(spy2).not.toHaveBeenCalled();
            emitter2.fire('event');
            expect(spy2).toHaveBeenCalled();
            expect(spy1.calls.length).toBe(1);
        });

        describe('garbage collection of callback list', function () {
            it('should allow the listening context to silence all its subscribtions when it is an event emiiter already', function () {
                var spy = jasmine.createSpy();
                emitter1.on('event', spy, emitter2);
                emitter2.fire('silenceEvents');
                emitter1.fire('event');
                expect(spy).not.toHaveBeenCalled();
            });

            it('should make the listening context an eventEmitter first if need be', function () {
                var context = {};
                emitter1.on('event', function () {}, context);
                expect(context.on).toBe(emitter1.on);
            });
        });

    });

    describe('unsubscribing (the \'off\' method)', function() {
        var spy1,
            spy2,
            c1,
            c2,
            contextRecord1,
            contextRecord2;

        beforeEach(function () {
            spy1 = jasmine.createSpy().andCallFake(function () {
                contextRecord1.push(this);
            }),
            spy2 = jasmine.createSpy().andCallFake(function () {
                contextRecord2.push(this);
            }),
            c1 = {},
            c2 = {},
            contextRecord1 = [],
            contextRecord2 = [];

            emitter1.on('event', spy1);
            emitter1.on('event', spy2);
            emitter1.on('event', spy1, c1);
            emitter1.on('event', spy1, c2);
            
        });

        it('should expect an event name', function () {
            expect(function () {
                emitter1.off(function () {});
                emitter1.off(undefined);
            }).toThrow();
        });
        it('should allow several event names to be unsubscribed from at once', function () {
            emitter2.on('event1 event2', spy1);
            emitter2.off('event1 event2');
            emitter2.fire('event1');
            emitter2.fire('event2');
            expect(spy1).not.toHaveBeenCalled();
        });

        it('should unsubscribe all callbacks when no callback or context specified', function () {
            emitter1.off('event');
            emitter1.fire('event');
            expect(spy1).not.toHaveBeenCalled();
            expect(spy2).not.toHaveBeenCalled();
        });
        it('should unsubscribe only callbacks matching a specified callback', function () {
            emitter1.off('event', spy1);
            emitter1.fire('event');
            expect(spy1).not.toHaveBeenCalled();
            expect(spy2).toHaveBeenCalled();
        });
        it('should unsubscribe only callbacks matching a specified context', function () {
            emitter1.off('event', undefined, c1);
            emitter1.fire('event');
            expect(spy1).toHaveBeenCalled();
            expect(spy1.calls.length).toBe(2);
            expect(contextRecord1).toEqual([window, c2]);
        });
        it('should unsubscribe only callbacks for the given emitter', function () {
            emitter2.on('event', spy2);
            emitter1.off('event');
            emitter2.fire('event');
            expect(spy2).toHaveBeenCalled();
        });
        it('should cope well with non-existent events', function () {
            expect(function () {
                emitter1.off('nonEvent');
            }).not.toThrow();
            emitter1.fire('event');
            expect(spy1).toHaveBeenCalled();
        });
        it('should cope well with so far unused emitters', function () {
            expect(function () {
                emitter2.off('event');
            }).not.toThrow();
            emitter2.on('event', spy1);
            emitter2.fire('event');
            expect(spy1).toHaveBeenCalled();
        });
    });

    describe('publishing (the \'fire\' method)', function () {
        var spy1,
            spy2,
            c1;

        beforeEach(function () {
            spy1 = jasmine.createSpy(),
            spy2 = jasmine.createSpy(),
            c1 = {};

            emitter1.on('event', spy1, c1);
            emitter2.on('event', spy2);
        });


        it('should only fire for the given emitter', function () {
            emitter1.fire('event');
            expect(spy1).toHaveBeenCalled();
            expect(spy2).not.toHaveBeenCalled();
        });

        it('should allow firing several events at once', function () {
            emitter1.on('event1 event2', spy1);
            emitter1.fire('event1 event2');
            expect(spy1.calls.length).toBe(2);
        });

        it('should pass data, event name and context to the callback', function () {
            var data = {};
            emitter1.fire('event', data);
            
            expect(spy1.mostRecentCall.args[0]).toBe(data);
            expect(spy1.mostRecentCall.args[1]).toBe('event');
            expect(spy1.mostRecentCall.args[2]).toBe(emitter1);
        });

        it('should call callbacks with specified contexts', function () {
            emitter1.fire('event');
            expect(spy1.mostRecentCall.object).toBe(c1);
        });

    });
});