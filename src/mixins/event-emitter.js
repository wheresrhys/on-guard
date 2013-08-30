 define(function () {
    
    'use strict';

    var emitEvents = (function (undefined) { 

        var on = function (event, callback, context) {

                var callbacks = getCallbacks(this);
                // fetch the event's store of callbacks or create it if needed
                var store = callbacks[event] || (callbacks[event] = []);

                // store the callback for later use
                store.push({
                    callback: callback,
                    context: context || window || null
                });

                // also on to the context object's destroy event in order to off
                if (context.on !== on) {
                    emitEvents.apply(context);
                }
                context.on('silenceEvents', function () {
                    off.call(this, event, callback, context);
                }, this);
                
            },

            off = function (event, callback, context) {
                var callbacks = getCallbacks(this, true);
                if (!callbacks) {return false;}
                var store = callbacks[event],
                    i;

                if (!store) {return;}

                // fast loop
                for (i = store.length - 1; i>=0; i--) {
                    if (store[i].callback === callback && (!context || !(store[i].context) || store[i].context === context)) {

                        // I might have got the index wrong here - shoudl it be i-1. Obviously I'd check thoroughly in a real app
                        store.splice(i, 1);
                    }
                }
            },

            fire = function (event, result) {
                var callbacks = getCallbacks(this);
                var store = callbacks[event],
                    i = 0,
                    il;
                console.log('Event emitted', '\nemitter: ', this, '\nevent:', event, '\ndata: ', result);
                if (!store) {return;}

                // loop here must be in increasing order
                for (il = store.length; i<il; i++) {
                    store[i].callback.call(store[i].context, this, event, result);
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
            contexts = [];

        return function (config) { 

            this.on = on;
            this.off = off;
            this.fire = fire;

            return this;
        };

    })(undefined);

    return emitEvents;
});