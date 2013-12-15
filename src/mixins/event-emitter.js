'use strict';

var eventEmitter = (function (undefined) {

    var doOn = function (callbacks, event, callback, context) {

            // fetch the event's store of callbacks or create it if needed
            var store = callbacks[event] || (callbacks[event] = []);

            // store the callback for later use
            store.push({
                callback: callback,
                context: context || window || null
            });

            // also on to the context object's destroy event in order to off
            if (context) {
                if (context.on !== on) {
                    eventEmitter.apply(context);
                }
                if (event !== 'silenceEvents') {
                    context.on('silenceEvents', function () {
                        off.call(this, event, callback, context);
                    }, this);
                        
                }
            }
        },
        doOff = function (callbacks, event, callback, context) {
            var store = callbacks[event],
                i;

            if (!store) {return;}

            if (!callback && !context) {
                store.length = [];
            }

            // fast loop
            for (i = store.length - 1; i>=0; i--) {
                if ((!callback && store[i].context === context) || (store[i].callback === callback && (!context || !(store[i].context) || store[i].context === context))) {

                    // I might have got the index wrong here - shoudl it be i-1. Obviously I'd check thoroughly in a real app
                    store.splice(i, 1);
                }
            }
        },
        doFire = function (callbacks, event, result) {
            var store = callbacks[event],
                i = 0,
                il;
            //console.log('Event emitted', '\nemitter: ', this, '\nevent:', event, '\ndata: ', result);
            if (!store) {return;}

            // loop here must be in increasing order
            for (il = store.length; i<il; i++) {
                store[i].callback.call(store[i].context, result, event, this);
            }
        },
        on = function (event, callback, context) {
            if (typeof event !== 'string') {
                throw('provide a string name for the event to subscribe to');
            }
            if (typeof callback !== 'function') {
                throw('provide a callback for the event to subscribe to');
            }

            var callbacks = getCallbacks(this),
                events = event.split(' ');

            for (var i = 0, il = events.length; i<il; i++) {
                doOn.call(this, callbacks, events[i], callback, context);
            }
        },

        off = function (event, callback, context) {
            if (typeof event !== 'string') {
                throw('provide a string name for the event to unsubscribe from');
            }
            var callbacks = getCallbacks(this, true),
                events = event.split(' ');

            
            if (!callbacks) {return false;}
            
            for (var i = 0, il = events.length; i<il; i++) {
                doOff.call(this, callbacks, events[i], callback, context);
            }
        },

        fire = function (event, result) {
            var callbacks = getCallbacks(this),
                events = event.split(' ');

            for (var i = 0, il = events.length; i<il; i++) {
                doFire.call(this, callbacks, events[i], result);
            }
        },

        getCallbacks = function (obj, dontSet) {
            for (var i = 0, il = contexts.length; i < il; i++) {
                if (contexts[i] === obj) {
                    return callbacks[i];
                }
            }
            if (!dontSet) {
                contexts.push(obj);
                callbacks.push([]);
                return callbacks[callbacks.length - 1];
            } else {
                return undefined;
            }
        },

        callbacks = [],
        contexts = [],
        
        mixin = function () {

            this.on = on;
            this.off = off;
            this.fire = fire;

            return this;
        };

    mixin.cleanUp = function () {
        callbacks = [];
        contexts = [];
    };

    return mixin;

})();

module.exports = eventEmitter;