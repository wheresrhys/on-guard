;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

module.exports = {
    name: 'taiChi',
    steps: {
        step: {
            frontFoot: 1,
            move: [1, 0],
            direction: 0
        },
        back: {
            frontFoot: 1,
            move: [-1, 0],
            direction: 0
        },
        shift: {
            frontFoot: 1,
            move: [0, 0],
            direction: 1
        },
        'switch': {
            frontFoot: 1,
            move: [0, 0],
            direction: 0
        },
        inside: {
            frontFoot: 0,
            move: [0, 1],
            direction: 0
        },
        outside: {
            frontFoot: 1,
            move: [0, -1],
            direction: 0
        },
        turn: {
            frontFoot: 0,
            move: [0, -1],
            direction: 1
        },
        onGuard: {
            _propertyDefinition: true,
            enumerable: false,
            value: {
                frontFoot: 'Left',
                move: [0, 0],
                direction: 0
            }
        },
        wuChi: {
            _propertyDefinition: true,
            enumerable: false,
            value: {
                frontFoot: null,
                move: [0, 0],
                direction: 0
            }
        }
    },
    startSequence: ['wuChi', 'onGuard'],
    endSequence: ['wuChi']
};

},{}],2:[function(require,module,exports){
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
},{}],3:[function(require,module,exports){
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
        document.getElementsByTagName('body')[0].appendChild(this.speaker);
        this.driller.on('step', this.callStep, this);
    },
    callStep: function (state) {
        this.speaker.src = 'assets/audio/' + utils.toDashed(this.driller.discipline) + '/' + utils.toDashed(state.lastStep) + '.ogg';
        this.speaker.play();
    }//,
//         preloadAudio: function () {
//             var steps = this.driller.conf.steps;
// //getOwnPropertyNames
//         }
};

module.exports = Caller;
},{"../utils":7}],4:[function(require,module,exports){
'use strict';

var ControlPanel = function (controller, conf) {
    if (!controller.on) {
        throw('controller must implement event emitter pattern');
    }
    this.fieldList = conf.fieldList;
    this.actionList = conf.actionList;
    this.controller = controller;
    this.form = document.getElementById(conf.formId);
    this.init();
};

ControlPanel.prototype = {
    init: function () {
        var i, il;
        if (this.fieldList) {
            for(i = 0, il = this.fieldList.length; i<il; i++) {
                this.bindField(this.fieldList[i]);
            }
        }
        if (this.actionList) {
            for(i = 0, il = this.actionList.length; i<il; i++) {
                this.bindAction(this.actionList[i]);
            }
        }
    },

    bindField: function (fieldName) {
        var field = document.getElementById(fieldName),
            that = this,
            valProp;

        if (!field) {
            console.warn('missing field in control panel: ' + fieldName);
            return;
        }
        valProp = ['checkbox', 'radio'].indexOf(field.type) > -1 ? 'checked' : 'value';
        field[valProp] = this.controller.conf[fieldName];
        field.addEventListener('change', function () {
            var value = field[valProp];
            that.controller.conf[fieldName] = value;
            var data = {};
            data[fieldName] = value;
            that.controller.fire('configChange', data);
        });
    },
    bindAction: function (actionName) {
        var button = document.getElementById(actionName),
            that = this;
        if (!button) {
            console.warn('missing button on control panel: ' + actionName);
            return;
        }
        button.addEventListener('click', function () {
            that.controller[actionName]();
        });
    }
};

module.exports = ControlPanel;
},{}],5:[function(require,module,exports){
'use strict';

var eventEmitter = require('../mixins/event-emitter'),
    utils = require('../utils'),
    L = 'Left',
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
        leftToRight = currentStep.move[1] * (this.frontFoot !== R ? 1: -1);
        frontToBack = currentStep.move[0];

        frontFoot =    currentStep.frontFoot === L ? L :
                        currentStep.frontFoot === R ? R :
                        currentStep.frontFoot === null ? null :
                        currentStep.frontFoot === 1 ? (this.frontFoot === R ? L : R) :
                        this.frontFoot;
        
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

module.exports = Driller;
},{"../mixins/event-emitter":2,"../utils":7}],6:[function(require,module,exports){
'use strict';

var utils = require('../utils');

var StepSelector = function (driller, domNodeId) {
    this.driller = driller;
    this.domNode = document.getElementById(domNodeId);
    this.init();
};

StepSelector.prototype = {
    init: function () {
        var heading = document.createElement('p');
        heading.textContent = 'Choose which steps to include in your drill',
        this.domNode.appendChild(heading);
        this.createInputs();
    },
    createInputs: function () {
        var label,
            input;
        for (var key in this.driller.conf.steps) {
            label = document.createElement('label');
            label['for'] = key;
            label.textContent = utils.camelToSpaced(key);
            input = document.createElement('input');
            input.id = key;
            input.name = 'stepSelector';
            input.type = 'checkbox';
            this.domNode.appendChild(input);
            this.domNode.appendChild(label);
            this.bindInputToDriller(key, input);
        }
    },
    bindInputToDriller: function (step, input) {
        var that = this;
        input.checked = this.driller.conf.disabledSteps.indexOf(step) === -1;
        input.addEventListener('change', function () {
            var stepIndex;
            if (input.checked) {
                that.driller.enableStep(step); 
            } else {
                that.driller.disableStep(step);
            }
        });
    }
};

module.exports = StepSelector;
},{"../utils":7}],7:[function(require,module,exports){
var pickRandomProperty = function (obj) {
        var result;
        var count = 0;
        for (var prop in obj) {
            if (Math.random() < 1 / ++count) {
                result = prop;
            }
        }
               
        return result;
    },

    defineProps = function (obj) {
        var prop;
        for (var key in obj) {
            prop = obj[key];
            if (prop._propertyDefinition) {
                delete obj[key];
                Object.defineProperty(obj, key, prop);
            }
        }
        return obj;
    },

    extendObj = function (base) {
        var extenders = Array.prototype.slice.call(arguments, 1),
            extender;

        if (!extenders.length) {
            return base;
        }

        if (extenders.length > 1) {
            extender = extenders.pop();
            base = extendObj.apply(this, Array.prototype.concat.apply([base], extenders));
        } else {
            extender = extenders[0];
        }

        for (var key in extender) {
            base[key] = extender[key];
        }

        return base;
    },
    toCamel = function (text) {
        return text.replace(/\-\w/g, function ($0) {
            return $0.charAt(1).toUpperCase();
        });
    },
    toDashed = function(text) {
        return text.replace(/[^A-Z][A-Z]/g, function ($0) {
            return $0.charAt(0) + '-' + $0.charAt(1).toLowerCase();
        });
    },
    dashedToSpaced = function (text) {
        return text.replace(/-/g, ' ');
    },
    camelToSpaced = function (text) {
        return dashedToSpaced(toDashed(text));
    };

module.exports = {
    pickRandomProperty: pickRandomProperty,
    defineProps: defineProps,
    extendObj: extendObj,
    toCamel: toCamel,
    toDashed: toDashed,
    dashedToSpaced: dashedToSpaced,
    camelToSpaced: camelToSpaced
};
},{}],8:[function(require,module,exports){
window.TestHelpers = {
    fakes: {
        'Math': {
            random: function (callback) {
                return function () {
                    var ranNum = Math.random();
                    callback(ranNum);
                    return ranNum;
                };
            }
        }
    },
    fireEvent: function (el, event) {
        var evt = document.createEvent('HTMLEvents');
        evt.initEvent(event, false, true);
        el.dispatchEvent(evt);
    }
};
},{}],9:[function(require,module,exports){

},{}],10:[function(require,module,exports){
/*global describe:false, jasmine:false, beforeEach:false, afterEach:false,runs:false,waits:false,expect:false,it:false,spyOn:false */
describe('configs/tai-chi', function () {
    var Driller = require('../../../src/modules/driller'),
        taiChiConfig = require('../../../src/configs/tai-chi'),
        driller;
    function checkEnumerable(prop, obj) {
        for (var key in obj) {
            if (key === prop) {
                return true;
            }
        }
        return false;
    }

    beforeEach(function () {
        Driller.addDiscipline(taiChiConfig);
        driller = new Driller({
            discipline: 'taiChi',
            startPosition: {
                coords: [1, 1],
                frontFoot: 'Left'
            }
        });
        spyOn(driller, 'fire');
    });


    it('should correctly define a step move', function () {
        expect(checkEnumerable('step', driller.conf.steps)).toBeTruthy();
        driller.adjustPosition('step');
        expect(driller.fire).toHaveBeenCalledWith('step', {
            direction: 'North',
            frontFoot: 'Right',
            lastStep: 'step',
            coords: [2, 1]
        });
    });

    it('should correctly define a back move', function () {
        expect(checkEnumerable('back', driller.conf.steps)).toBeTruthy();
        driller.adjustPosition('back');
        expect(driller.fire).toHaveBeenCalledWith('step', {
            direction: 'North',
            frontFoot: 'Right',
            lastStep: 'back',
            coords: [0, 1]
        });
    });

    it('should correctly define a shift move', function () {
        expect(checkEnumerable('shift', driller.conf.steps)).toBeTruthy();
        driller.adjustPosition('shift');
        expect(driller.fire).toHaveBeenCalledWith('step', {
            direction: 'East',
            frontFoot: 'Right',
            lastStep: 'shift',
            coords: [1, 1]
        });
    });

    it('should correctly define a switch move', function () {
        expect(checkEnumerable('switch', driller.conf.steps)).toBeTruthy();
        driller.adjustPosition('switch');
        expect(driller.fire).toHaveBeenCalledWith('step', {
            direction: 'North',
            frontFoot: 'Right',
            lastStep: 'switch',
            coords: [1, 1]
        });
    });

    it('should correctly define a inside move', function () {
        driller.adjustPosition('inside');
        expect(driller.fire).toHaveBeenCalledWith('step', {
            direction: 'North',
            frontFoot: 'Left',
            lastStep: 'inside',
            coords: [1, 2]
        });
    });

    it('should correctly define a outside move', function () {
        expect(checkEnumerable('outside', driller.conf.steps)).toBeTruthy();
        driller.adjustPosition('outside');
        expect(driller.fire).toHaveBeenCalledWith('step', {
            direction: 'North',
            frontFoot: 'Right',
            lastStep: 'outside',
            coords: [1, 0]
        });
    });

    it('should correctly define a turn move', function () {
        expect(checkEnumerable('turn', driller.conf.steps)).toBeTruthy();
        driller.adjustPosition('turn');
        expect(driller.fire).toHaveBeenCalledWith('step', {
            direction: 'East',
            frontFoot: 'Left',
            lastStep: 'turn',
            coords: [1, 0]
        });
    });

    it('should correctly define a onGuard move', function () {
        expect(checkEnumerable('onGuard', driller.conf.steps)).toBeFalsy();
        driller.adjustPosition('onGuard');
        expect(driller.fire).toHaveBeenCalledWith('step', {
            direction: 'North',
            frontFoot: 'Left',
            lastStep: 'onGuard',
            coords: [1, 1]
        });
    });

    it('should correctly define a wuChi move', function () {
        expect(checkEnumerable('wuChi', driller.conf.steps)).toBeFalsy();
        driller.adjustPosition('wuChi');

        expect(driller.fire).toHaveBeenCalledWith('step', {
            direction: 'North',
            frontFoot: null,
            lastStep: 'wuChi',
            coords: [1, 1]
        });
    });

});
},{"../../../src/configs/tai-chi":1,"../../../src/modules/driller":5}],11:[function(require,module,exports){
module.exports=require(9)
},{}],12:[function(require,module,exports){
/*global describe:false, jasmine:false, beforeEach:false, afterEach:false,runs:false,waits:false,expect:false,it:false,spyOn:false */
describe('mixins/event-emitter', function () {

    'use strict';

    var eventEmitter = require('../../../src/mixins/event-emitter'),
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
},{"../../../src/mixins/event-emitter":2}],13:[function(require,module,exports){
/*global xdescribe: false, xit: false, describe:false, jasmine:false, beforeEach:false, afterEach:false,runs:false,waits:false,expect:false,it:false,spyOn:false */

xdescribe('modules/caller', function () {
    
    'use strict';

    var Caller = require('../../../src/modules/caller'),
        eventEmitter = require('../../../src/mixins/event-emitter'),
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
},{"../../../src/mixins/event-emitter":2,"../../../src/modules/caller":3}],14:[function(require,module,exports){
/*global TestHelpers:false, describe:false, jasmine:false, beforeEach:false, afterEach:false,runs:false,waits:false,expect:false,it:false,spyOn:false */
describe('modules/control-panel', function () {
    var ControlPanel = require('../../../src/modules/control-panel'),
        eventEmitter = require('../../../src/mixins/event-emitter'),
        controlPanel;
        
    describe('initialisation', function () {
        it('should require an event emitter as a controller', function () {
            expect(function () {
                new ControlPanel(undefined, {});
            }).toThrow();
            expect(function () {
                new ControlPanel({}, {});
            }).toThrow();
        });
    });
    
    describe('bindings', function () {

        var form,
            field1,
            field2,
            button1,
            button2,
            initiallyTrue,
            initiallyFalse;

        beforeEach(function () {
            form = document.createElement('form');
            field1 = document.createElement('input');
            button1 = field1.cloneNode();
            field1.id = 'field1';
            button1.id = 'action1';
            form.appendChild(field1);
            form.appendChild(button1);
            field2 = field1.cloneNode();
            button2 = button1.cloneNode();
            field2.id = 'field2';
            button2.id = 'action2';
            form.appendChild(field2);
            form.appendChild(button2);
            initiallyTrue = field1.cloneNode();
            initiallyTrue.id = 'initiallyTrue';
            initiallyTrue.type = 'checkbox';
            form.appendChild(initiallyTrue);
            initiallyFalse = initiallyTrue.cloneNode();
            initiallyFalse.id = 'initiallyFalse';
            form.appendChild(initiallyFalse);
            document.getElementsByTagName('body')[0].appendChild(form);
        });

        afterEach(function () {
            form.parentNode.removeChild(form);
        });

        describe('updating properties', function () {
            var controller;

            beforeEach(function () {
                controller = eventEmitter.apply({
                    conf: {
                        field1: 'val1',
                        field2: 'val2',
                        initiallyTrue: true,
                        initiallyFalse: false
                    },
                    action1: jasmine.createSpy(),
                    action2: jasmine.createSpy()
                });
            });

            it('should cope well with missing fields', function () {
                expect(function () {
                    new ControlPanel(controller, {
                        fieldList: ['field3']
                    });
                }).not.toThrow();
            });
            
            it('should set values from controller', function () {
                new ControlPanel(controller, {
                    fieldList: ['field1', 'field2', 'initiallyTrue', 'initiallyFalse']
                });
                expect(field1.value).toBe('val1');
                expect(field2.value).toBe('val2');
                expect(initiallyTrue.checked).toBeTruthy();
                expect(initiallyFalse.checked).toBeFalsy();
            });

            it('should alert the controller of changes to bound value fields', function () {
                new ControlPanel(controller, {
                    fieldList: ['field1', 'field2']
                });
                spyOn(controller, 'fire');

                field1.value = 'newVal1',
                TestHelpers.fireEvent(field1, 'change');
                expect(controller.fire.calls.length).toBe(1);
                expect(controller.fire).toHaveBeenCalledWith('configChange', {
                    field1: 'newVal1'
                });
                expect(controller.conf.field1).toBe('newVal1');
                expect(controller.conf.field2).toBe('val2');
                field2.value = 'newVal2';
                TestHelpers.fireEvent(field2, 'change');
                expect(controller.fire.calls.length).toBe(2);
                expect(controller.fire).toHaveBeenCalledWith('configChange', {
                    field2: 'newVal2'
                });
                expect(controller.conf.field2).toBe('newVal2');
            });
            it('should alert the controller of changes to boolean fields', function () {
                new ControlPanel(controller, {
                    fieldList: ['initiallyFalse']
                });
                spyOn(controller, 'fire');

                initiallyFalse.checked = true;
                TestHelpers.fireEvent(initiallyFalse, 'change');
                expect(controller.fire.calls.length).toBe(1);
                expect(controller.fire).toHaveBeenCalledWith('configChange', {
                    initiallyFalse: true
                });
                expect(controller.conf.initiallyFalse).toBe(true);
                initiallyFalse.checked = false;
                TestHelpers.fireEvent(initiallyFalse, 'change');
                expect(controller.fire.calls.length).toBe(2);
                expect(controller.fire).toHaveBeenCalledWith('configChange', {
                    initiallyFalse: false
                });
                expect(controller.conf.initiallyFalse).toBe(false);
            });
        });

        describe('calling methods', function () {
            var controller;

            beforeEach(function () {
                controller = eventEmitter.apply({
                    action1: 'val1',
                    action2: 'val2'
                });
            });

            it('should cope well with missing actions', function () {
                expect(function () {
                    new ControlPanel(controller, {
                        actionList: ['action3']
                    });
                }).not.toThrow();
            });

            it('should call the method when clicked', function () {
                new ControlPanel(controller, {
                    actionList: ['action1', 'action2']
                });
                spyOn(controller, 'action1');
                spyOn(controller, 'action2');

                
                TestHelpers.fireEvent(button1, 'click');
                expect(controller.action1).toHaveBeenCalled();
                expect(controller.action2).not.toHaveBeenCalled();

                TestHelpers.fireEvent(button2, 'click');
                expect(controller.action2).toHaveBeenCalled();
            });

        });
    });

    
});
},{"../../../src/mixins/event-emitter":2,"../../../src/modules/control-panel":4}],15:[function(require,module,exports){
/*global waitsFor:false,describe:false, jasmine:false, beforeEach:false, afterEach:false,runs:false,waits:false,expect:false,it:false,spyOn:false */
describe('modules/driller', function () {
    
    var Driller = require('../../../src/modules/driller'),
        driller,
        testConf = {
            name: 'testDiscipline',
            steps: {
                noChange: {
                    frontFoot: 0,
                    move: [0, 0],
                    direction: 0
                },
                step: {
                    frontFoot: 1,
                    move: [1, 0],
                    direction: 0
                },
                rotateOut: {
                    frontFoot: 0,
                    move: [0, 0],
                    direction: 1
                },
                rotateIn: {
                    frontFoot: 0,
                    move: [0, 0],
                    direction: -1
                },
                back: {
                    frontFoot: 1,
                    move: [-1, 0],
                    direction: 0 
                },
                out: {
                    frontFoot: 0,
                    move: [0, 1],
                    direction: 0 
                },
                'in': {
                    frontFoot: 0,
                    move: [0, -1],
                    direction: 0 
                },
                specialStep1: {
                    _propertyDefinition: true,
                    enumerable: false,
                    value: {
                        frontFoot: 'Left',
                        move: [0, 0],
                        direction: 0
                    }
                },
                specialStep2: {
                    _propertyDefinition: true,
                    enumerable: false,
                    value: {
                        frontFoot: 'Right',
                        move: [0, 0],
                        direction: 0
                    }
                }
            },
            startSequence: ['step'],
            endSequence: ['noChange']
        };

    Driller.addDiscipline(testConf);
    Driller.defaults.discipline = 'testDiscipline';


    describe('static methods', function () {
        describe('adding configuration sets', function () {
            it('should expect a name for the discipline', function () {
                expect(function () {
                    Driller.addDiscipline({});
                }).toThrow();
            });

            it('should allow adding multiple configs', function () {
                Driller.addDiscipline({
                    name: 'discipline1'
                });
                Driller.addDiscipline({
                    name: 'discipline2'
                });
                expect(Driller.disciplineConfigs.discipline1).toBeDefined();
                expect(Driller.disciplineConfigs.discipline2).toBeDefined();
            });



            // it('should be able to retrieve any config'
        });
    });
    
    describe('instances', function () {

        describe('initialisation', function () {

            it('should use default settings', function () {
                Driller.defaults.testProp = 'test';
                driller = new Driller();
                expect(driller.conf.testProp).toBe('test');
            });

            it('should overwrite default settings with any provided', function () {
                Driller.defaults.testProp = 'fail';
                var driller = new Driller({
                    testProp: 'test'
                });
                expect(driller.conf.testProp).toBe('test');
            });

            it('should add steps from an already defined config', function () {
                driller = new Driller();
                expect(driller.conf.steps.step).toBeDefined();
            });

            it('should add steps from config object passed in if defined', function () {
                var driller = new Driller({
                    steps: {
                        newStep: {}
                    }
                });
                expect(driller.conf.steps.newStep).toBeDefined();
            });

            it('should make special steps non-enumerable', function () {
                driller = new Driller();

                var foundProp = false;
                for (var key in driller.conf.steps) {
                    if (key === 'specialStep1') {
                        foundProp = true;
                    }
                }
                expect(foundProp).toBeFalsy();
            });

            it('should use the default start position', function () {
                driller = new Driller();
                expect(driller.coords).toEqual([0, 0]);
                expect(driller.frontFoot).toBeNull();
                expect(driller.direction).toBe(0);
            });

            it('should allow defining a start position', function () {
                driller = new Driller({
                    startPosition: {
                        coords: [5, 5],
                        frontFoot: 'testFoot',
                        direction: 'testDirection'
                    }
                });
                expect(driller.coords).toEqual([5, 5]);
                expect(driller.frontFoot).toBe('testFoot');
                expect(driller.direction).toBe('testDirection');
            });

            it('should autoplay if specified', function () {
                var startSpy = spyOn(Driller.prototype, 'start');
                driller = new Driller({
                    autoplay: true
                });
                expect(startSpy).toHaveBeenCalled();
            });

            it('should use default max step count', function () {
                driller = new Driller();
                expect(driller.stepCount).toBe(Driller.defaults.stepCount);
            });

            it('should override default max step count if specified', function () {
                driller = new Driller({
                    stepCount: 5
                });
                expect(driller.stepCount).toBe(5);
            });

            describe('multiple instances', function () {
                it('should not share one config object between instances', function () {
                    driller = new Driller();
                    driller.conf.discipline = 'otherDiscipline';
                    driller = new Driller();
                    expect(driller.conf.discipline).not.toBe('otherDiscipline');
                });
            });
        });
        
        describe('starting', function () {

            beforeEach(function () {
                driller = new Driller({
                    stepCount: 0
                });
                
            });

            afterEach(function () {
                driller.stop();
            });

            var timeoutSpy = function () {
                spyOn(window, 'setTimeout').andCallFake(function (callback, delay) {
                    callback();
                });
            };
            
            it('should allow resetting to initial position', function () {
                timeoutSpy();
                spyOn(driller, 'init').andCallThrough();
                driller.direction = 'test';
                driller.conf.startSequence = ['noChange'];
                driller.start(true);
                expect(driller.init).toHaveBeenCalled();
                expect(driller.direction).toBe(0);
            });

            it('should allow restarting while running', function () {
                timeoutSpy();
                driller = new Driller({
                    stepCount: 0
                });
                driller.start();
                spyOn(driller, 'init').andCallThrough();
                spyOn(driller, 'takeStep').andCallThrough();
                spyOn(driller, 'start').andCallThrough();
                
                driller.resetAndStart();
                
                expect(driller.takeStep.calls[0].args[0]).toBeFalsy();
                expect(driller.start).toHaveBeenCalled();
                expect(driller.init).toHaveBeenCalled();

            });

            it('should allow a delay for starting to be specified', function () {
                var started;
                runs(function () {
                    driller = new Driller({
                        stepCount: 0,
                        minTime: 1,
                        maxTime: 1,
                        delay: 0.1
                    });
                    spyOn(driller, '_start').andCallThrough();
                    setTimeout(function () {
                        started = true;
                    }, 101);
                    driller.start();
                    expect(driller._start).not.toHaveBeenCalled();
                });
                waitsFor(function () {
                    return started;
                });
                runs(function () {
                    expect(driller._start).toHaveBeenCalled();
                });
            });

            it('should allow start position to be preserved when restarting', function () {
                timeoutSpy();
                driller = new Driller({
                    stepCount: 0,
                    preservePosition: true
                });
                driller.coords = [2,3];
                driller.direction = 2;
                driller.resetAndStart();
                expect(driller.coords).toEqual([2,3]);
                expect(driller.direction).toEqual(2);
            });

            it('should fire the start event', function () {
                timeoutSpy();
                var started = false;
                driller.on('started', function () {
                    started = true;
                });
                driller.start();
                expect(started).toBeTruthy();
            });

            it('should leave the start sequence in conf unchanged', function () {
                timeoutSpy();
                driller.start();
                expect(driller.conf.startSequence).toEqual(['step']);
            });

            describe('first steps', function () {
                var steps;
                beforeEach(function () {
                    steps = [];
                    spyOn(driller, 'announceStep').andCallFake(function (step) {
                        steps.push(step);
                    });
                    driller.conf.startSequence = ['noChange', 'step', 'specialStep1'];
                    driller.conf.endSequence = [];
                });

                it('should perform the starting sequence', function () {
                    timeoutSpy();
                    driller.start();
                    expect(steps).toEqual(['noChange', 'step', 'specialStep1']);
                });

                it('should continue with more steps after starting sequence completed', function () {
                    timeoutSpy();
                    driller.stepCount = 2;
                    driller.start();
                    expect(steps.length).toBe(5);
                });
            });

            describe('invalid start sequences', function () {
                beforeEach(function () {
                    spyOn(driller, 'announceStep').andCallThrough();
                });
                it('shouldn\'t allow invalid first step name', function () {
                    timeoutSpy();
                    driller.conf.startSequence = ['notAStep'];
                    expect(function () {
                        driller.start();
                    }).toThrow();
                });

                it('shouldn\'t allow invalid subsequent step names', function () {
                    timeoutSpy();
                    driller.conf.startSequence = ['noChange', 'notAStep'];
                    expect(function () {
                        driller.start();
                    }).toThrow();
                });
            });

        });

        describe('stopping', function () {

            var driller;

            beforeEach(function () {
                jasmine.Clock.useMock();
                spyOn(window, 'clearTimeout');

                driller = new Driller({
                    stepCount: -1,
                    autoplay: true,
                    startSequence: ['noChange']
                });

            });

            it('should stop the timer', function () {
                var timer = driller.timer;
                driller.stop();
                expect(window.clearTimeout).toHaveBeenCalledWith(timer);
            });

            it('should fire the stop event', function () {
                var stopped = false;
                driller.on('stopped', function () {
                    stopped = true;
                });
                driller.stop();
                expect(stopped).toBeTruthy();
            });

            describe('closing steps', function () {

                var steps;
                beforeEach(function () {
                    steps = [];
                    spyOn(driller, 'announceStep').andCallFake(function (step) {
                        steps.push(step);
                    });
                    driller.conf.endSequence = ['noChange', 'step', 'specialStep1'];
                });

                it('should perform the closing sequence', function () {
                    driller.stop();
                    expect(steps).toEqual(['noChange', 'step', 'specialStep1']);
                });
            });

        });

        describe('moving around', function () {
            beforeEach(function () {
                jasmine.Clock.useMock();

                driller = new Driller({
                    stepCount: 0,
                    startSequence: ['noChange'],
                    startPosition: { 
                        coords: [2, 2]
                    }
                });

            });

            it('should move forwards and backwards relative to the given direction', function () {
                driller.direction = 0;
                driller.adjustPosition('step');
                expect(driller.coords).toEqual([3,2]);
                driller.direction = 1;
                driller.adjustPosition('step');
                expect(driller.coords).toEqual([3,3]);
                driller.direction = 2;
                driller.adjustPosition('step');
                expect(driller.coords).toEqual([2, 3]);
                driller.direction = 3;
                driller.adjustPosition('step');
                expect(driller.coords).toEqual([2,2]);

                driller.direction = 0;
                driller.adjustPosition('back');
                expect(driller.coords).toEqual([1,2]);
                driller.direction = 1;
                driller.adjustPosition('back');
                expect(driller.coords).toEqual([1,1]);
                driller.direction = 2;
                driller.adjustPosition('back');
                expect(driller.coords).toEqual([2, 1]);
                driller.direction = 3;
                driller.adjustPosition('back');
                expect(driller.coords).toEqual([2,2]);

            });

            it('should change the front foot when step specifies', function () {
                driller.frontFoot = 'Left';
                driller.adjustPosition('noChange');
                expect(driller.frontFoot).toEqual('Left');
                driller.adjustPosition('step');
                expect(driller.frontFoot).toEqual('Right');
            });

            it('should take front foot into account when choosing direction change', function () {
                driller.frontFoot = 'Left';
                driller.adjustPosition('rotateOut');
                expect(driller.direction).toEqual(1);
                driller.frontFoot = 'Right';
                driller.adjustPosition('rotateOut');
                expect(driller.direction).toEqual(0);
                driller.adjustPosition('rotateIn');
                expect(driller.direction).toEqual(1);
                driller.frontFoot = 'Left';
                driller.adjustPosition('rotateIn');
                expect(driller.direction).toEqual(0);
            });

            it('should choose move sideways based on frontFoot and current direction', function () {
                driller.frontFoot = 'Left';
                driller.adjustPosition('out');
                expect(driller.coords).toEqual([2,3]);
                driller.frontFoot = 'Right';
                driller.adjustPosition('out');
                expect(driller.coords).toEqual([2,2]);
                 
                driller.frontFoot = 'Left';
                driller.adjustPosition('in');
                expect(driller.coords).toEqual([2,1]);
                driller.frontFoot = 'Right';
                driller.adjustPosition('in');
                expect(driller.coords).toEqual([2,2]);

                driller.direction = 1;
                driller.frontFoot = 'Left';
                driller.adjustPosition('in');
                expect(driller.coords).toEqual([3,2]);
            });

            it('should fire an event on every movement', function () {
                var spy = jasmine.createSpy();
                driller.on('step', spy);
                driller.adjustPosition('step');
                expect(spy).toHaveBeenCalled();
                expect(spy.mostRecentCall.args[0]).toEqual({
                    direction: 'North',
                    frontFoot: 'Right',
                    lastStep: 'step',
                    coords: [3, 2]
                });
            });


        });

        describe('step selection' , function () {
            describe('bursts', function () {

            });
            describe('disabling and enabling steps', function () {
                Driller.addDiscipline({
                    name: 'testDisabling',
                    steps: {
                        step1: {
                            frontFoot: 0,
                            move: [0, 0],
                            direction: 0
                        },
                        step2: {
                            frontFoot: 0,
                            move: [0, 0],
                            direction: 0
                        }
                    },
                    startSequence: ['step1'],
                    endSequence: ['step1']
                });
                it('should be possible to disable steps from config', function () {
                    driller = new Driller({
                        discipline: 'testDisabling',
                        disabledSteps: ['step1']
                    });
                    expect(driller.validateStep('step1')).toBeFalsy();
                    expect(driller.validateStep('step2')).toBeTruthy();
                });
                it('should be possible to enable and disable steps manually', function () {
                    driller = new Driller({
                        discipline: 'testDisabling'
                    });
                    expect(driller.validateStep('step1')).toBeTruthy();
                    driller.disableStep('step1');
                    expect(driller.validateStep('step1')).toBeFalsy();
                    driller.enableStep('step1');
                    expect(driller.validateStep('step1')).toBeTruthy();
                });
            });
            describe('moving in a limited space', function () {
                it('should not allow stepping outside the parade ground', function () {
                    Driller.addDiscipline({
                        name: 'testMoving',
                        steps: {
                            noChange: {
                                frontFoot: 0,
                                move: [0, 0],
                                direction: 0
                            },
                            stepForward: {
                                frontFoot: 'Left',
                                move: [1, 0],
                                direction: 0
                            },
                            stepSideways: {
                                frontFoot: 'Left',
                                move: [0, 1],
                                direction: 0
                            }
                        },
                        startSequence: ['noChange'],
                        endSequence: ['noChange']
                    });
                    driller = new Driller({
                        areaLength: 1,
                        areaWidth: 1,
                        discipline: 'testMoving'
                    });

                    expect(driller.validateStep('stepForward')).toBeFalsy();
                    expect(driller.validateStep('stepSideways')).toBeFalsy();
                    expect(driller.validateStep('noChange')).toBeTruthy();
                });
                
            });
        });

        describe('timings', function () {
            beforeEach(function () {
                driller = new Driller({
                    startSequence: ['noChange'],
                    minTime: 2,
                    maxTime: 4,
                    avgTime: 3
                });
            });
            it('should not exceed maximum time allowed', function () {
                spyOn(Math, 'random').andCallFake(function () {
                    return 6;
                });
                expect(driller.getTimeInterval()).toBe(4000);
            });

            it('should not be less than minimum time allowed', function () {
                spyOn(Math, 'random').andCallFake(function () {
                    return -6;
                });
                expect(driller.getTimeInterval()).toBe(2000);
            });

            it('should gradually speed up when specified', function () {

            });

        });

    });

});
},{"../../../src/modules/driller":5}],16:[function(require,module,exports){
/*global TestHelpers:false, describe:false, jasmine:false, beforeEach:false, afterEach:false,runs:false,waits:false,expect:false,it:false,spyOn:false */
describe('modules/step-selector', function () {
    var StepSelector = require('../../../src/modules/step-selector'),
        eventEmitter = require('../../../src/mixins/event-emitter'),
        Driller = require('../../../src/modules/driller'),
        stepSelector,
        domNode,
        getDriller = function () {
            return new Driller({
                discipline: 'testDisabler',
                disabledSteps: ['disabledStep']
            });
        };
        
    Driller.addDiscipline({
        name: 'testDisabler',
        steps: {
            disabledStep: {
                frontFoot: 0,
                move: [0, 0],
                direction: 0
            },
            enabledStep: {
                frontFoot: 0,
                move: [0, 0],
                direction: 0
            }
        },
        startSequence: ['disabledStep'],
        endSequence: ['disabledStep']
    });

    beforeEach(function () {
        domNode = document.createElement('div');
        domNode.id = 'domNode';
        document.getElementsByTagName('body')[0].appendChild(domNode);
    });

    afterEach(function () {
        domNode.parentNode.removeChild(domNode);
    });

    describe('initialisation', function () {
        it('should require a driller', function () {
            expect(function () {
                new StepSelector(undefined, 'domNode');
            }).toThrow();
            expect(function () {
                new StepSelector({}, 'domNode');
            }).toThrow();
        });

        it('should require an existing dom node', function () {
            expect(function () {
                new StepSelector(getDriller());
            }).toThrow();
            expect(function () {
                new StepSelector(getDriller(), 'domNode2');
            }).toThrow();
        });

        it('should add an input for each step which reflects whether it\'s enabled or not', function () {
            new StepSelector(getDriller(), 'domNode');
            var inputs = document.querySelectorAll('[name="stepSelector"]');
            expect(inputs.length).toBe(2);
            expect(inputs[0].checked).toBeFalsy();
            expect(inputs[1].checked).toBeTruthy();
        });
    });

    describe('updating disabled steps', function () {
        
        it('should disable/enable steps based on user interaction', function () {
            var driller = getDriller();
            spyOn(driller, 'disableStep');
            spyOn(driller, 'enableStep');
            new StepSelector(driller, 'domNode');
            var disabledStep = document.getElementById('disabledStep'),
                enabledStep = document.getElementById('enabledStep');
            
            // note that the change event doesn't change the value so firing change on an enabled step is the 
            // same as the user changing the value to enabled on a disabled step, so this test reads a little counterintuitively
            TestHelpers.fireEvent(enabledStep, 'change');
            expect(driller.enableStep).toHaveBeenCalled();
            expect(driller.disableStep).not.toHaveBeenCalled();

            TestHelpers.fireEvent(disabledStep, 'change');
            expect(driller.disableStep).toHaveBeenCalled();
            expect(driller.disableStep.calls.length).toBe(1);
            expect(driller.enableStep.calls.length).toBe(1);
        });

        it('should be able to disable steps when no others disabled in config', function () {
            var driller = new Driller({
                discipline: 'testDisabler'
            });

            spyOn(driller, 'disableStep');
            new StepSelector(driller, 'domNode');
            var disabledStep = document.getElementById('disabledStep');
            disabledStep.checked = false;
            TestHelpers.fireEvent(disabledStep, 'change');
            expect(driller.disableStep).toHaveBeenCalled();

        });

        it('should persist the change when driller is restarted', function () {

        });
    });

});
},{"../../../src/mixins/event-emitter":2,"../../../src/modules/driller":5,"../../../src/modules/step-selector":6}],17:[function(require,module,exports){
/*global describe:false, jasmine:false, beforeEach:false, afterEach:false,runs:false,waits:false,expect:false,it:false,spyOn:false */
describe('utils', function () {
    var utils = require('../../src/utils');

    describe('pickRandomProperty', function () {
        it('should return undefined when passed an empty object', function () {
            expect(utils.pickRandomProperty({})).toBeUndefined();
        });
        it('should pick a random property', function () {
           // how to test?
        });
    });

    describe('extendObj', function () {
        var extendObj = utils.extendObj;

        it('should return the original object when no extenders specified', function () {
            var obj = {
                prop: 'test'
            };
            var testObj = extendObj(obj);
            expect(testObj).toBe(obj);
            expect(testObj).toEqual({
                prop: 'test'
            });

        });

        it('should overwrite with props from extending object hierarchically', function () {
            var obj1 = {
                    prop1: 11,
                    prop2: 21,
                    prop3: 31,
                    prop4: 41
                },
                obj2 = {
                    prop2: 22,
                    prop3: 32,
                    prop4: 42
                },
                obj3 = {
                    prop3: 33,
                    prop4: 43
                },
                obj4 = {
                    prop4: 44
                };

            var testObj = extendObj(obj1, obj2, obj3, obj4);
            expect(testObj).toBe(obj1);
            expect(testObj).toEqual({
                prop1: 11,
                prop2: 22,
                prop3: 33,
                prop4: 44
            });

        });

        it('should not alter any of the original objects except the base object', function () {
            var obj1 = {
                    prop1: 11,
                    prop2: 21,
                    prop3: 31,
                    prop4: 41
                },
                obj2 = {
                    prop2: 22,
                    prop3: 32,
                    prop4: 42
                },
                obj3 = {
                    prop3: 33,
                    prop4: 43
                },
                obj4 = {
                    prop4: 44
                };

            extendObj(obj1, obj2, obj3, obj4);

            expect(obj2).toEqual({
                prop2: 22,
                prop3: 32,
                prop4: 42
            });
            expect(obj3).toEqual({
                prop3: 33,
                prop4: 43
            });
            expect(obj4).toEqual({
                prop4: 44
            });

        });

    });

    describe('toCamel', function () {
        it('should change dashes in string to camel-casing', function () {
            expect(utils.toCamel('ab-cd-_$%-ef')).toEqual('abCd_$%Ef');
        });
    });

    describe('toDashed', function () {
        it('should change caps in string to dashes', function () {
            expect(utils.toDashed('abCd_$%Ef')).toEqual('ab-cd_$%-ef');
        });
    });

    describe('dashedToSpaced', function () {
        it('should change dashes in string to spaces', function () {
            expect(utils.dashedToSpaced('ab-cd-_$%-ef')).toEqual('ab cd _$% ef');
        });
    });

    describe('camelToSpaced', function () {
        it('should change caps in string to spaces', function () {
            expect(utils.camelToSpaced('abCd_$%Ef')).toEqual('ab cd_$% ef');
        });
    });

});
},{"../../src/utils":7}]},{},[8,9,10,11,12,13,14,15,16,17])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvd2hlcmVzcmh5cy9TaXRlcy9vbi1ndWFyZC9zcmMvY29uZmlncy90YWktY2hpLmpzIiwiL1VzZXJzL3doZXJlc3JoeXMvU2l0ZXMvb24tZ3VhcmQvc3JjL21peGlucy9ldmVudC1lbWl0dGVyLmpzIiwiL1VzZXJzL3doZXJlc3JoeXMvU2l0ZXMvb24tZ3VhcmQvc3JjL21vZHVsZXMvY2FsbGVyLmpzIiwiL1VzZXJzL3doZXJlc3JoeXMvU2l0ZXMvb24tZ3VhcmQvc3JjL21vZHVsZXMvY29udHJvbC1wYW5lbC5qcyIsIi9Vc2Vycy93aGVyZXNyaHlzL1NpdGVzL29uLWd1YXJkL3NyYy9tb2R1bGVzL2RyaWxsZXIuanMiLCIvVXNlcnMvd2hlcmVzcmh5cy9TaXRlcy9vbi1ndWFyZC9zcmMvbW9kdWxlcy9zdGVwLXNlbGVjdG9yLmpzIiwiL1VzZXJzL3doZXJlc3JoeXMvU2l0ZXMvb24tZ3VhcmQvc3JjL3V0aWxzLmpzIiwiL1VzZXJzL3doZXJlc3JoeXMvU2l0ZXMvb24tZ3VhcmQvdGVzdC9oZWxwZXJzL2hlbHBlcnMuanMiLCIvVXNlcnMvd2hlcmVzcmh5cy9TaXRlcy9vbi1ndWFyZC90ZXN0L3NwZWNzL2FwcF9zcGVjLmpzIiwiL1VzZXJzL3doZXJlc3JoeXMvU2l0ZXMvb24tZ3VhcmQvdGVzdC9zcGVjcy9jb25maWdzL3RhaS1jaGlfc3BlYy5qcyIsIi9Vc2Vycy93aGVyZXNyaHlzL1NpdGVzL29uLWd1YXJkL3Rlc3Qvc3BlY3MvbWl4aW5zL2V2ZW50LWVtaXR0ZXJfc3BlYy5qcyIsIi9Vc2Vycy93aGVyZXNyaHlzL1NpdGVzL29uLWd1YXJkL3Rlc3Qvc3BlY3MvbW9kdWxlcy9jYWxsZXJfc3BlYy5qcyIsIi9Vc2Vycy93aGVyZXNyaHlzL1NpdGVzL29uLWd1YXJkL3Rlc3Qvc3BlY3MvbW9kdWxlcy9jb250cm9sLXBhbmVsX3NwZWMuanMiLCIvVXNlcnMvd2hlcmVzcmh5cy9TaXRlcy9vbi1ndWFyZC90ZXN0L3NwZWNzL21vZHVsZXMvZHJpbGxlcl9zcGVjLmpzIiwiL1VzZXJzL3doZXJlc3JoeXMvU2l0ZXMvb24tZ3VhcmQvdGVzdC9zcGVjcy9tb2R1bGVzL3N0ZXAtc2VsZWN0b3Jfc3BlYy5qcyIsIi9Vc2Vycy93aGVyZXNyaHlzL1NpdGVzL29uLWd1YXJkL3Rlc3Qvc3BlY3MvdXRpbHNfc3BlYy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDOUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdmxCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBuYW1lOiAndGFpQ2hpJyxcbiAgICBzdGVwczoge1xuICAgICAgICBzdGVwOiB7XG4gICAgICAgICAgICBmcm9udEZvb3Q6IDEsXG4gICAgICAgICAgICBtb3ZlOiBbMSwgMF0sXG4gICAgICAgICAgICBkaXJlY3Rpb246IDBcbiAgICAgICAgfSxcbiAgICAgICAgYmFjazoge1xuICAgICAgICAgICAgZnJvbnRGb290OiAxLFxuICAgICAgICAgICAgbW92ZTogWy0xLCAwXSxcbiAgICAgICAgICAgIGRpcmVjdGlvbjogMFxuICAgICAgICB9LFxuICAgICAgICBzaGlmdDoge1xuICAgICAgICAgICAgZnJvbnRGb290OiAxLFxuICAgICAgICAgICAgbW92ZTogWzAsIDBdLFxuICAgICAgICAgICAgZGlyZWN0aW9uOiAxXG4gICAgICAgIH0sXG4gICAgICAgICdzd2l0Y2gnOiB7XG4gICAgICAgICAgICBmcm9udEZvb3Q6IDEsXG4gICAgICAgICAgICBtb3ZlOiBbMCwgMF0sXG4gICAgICAgICAgICBkaXJlY3Rpb246IDBcbiAgICAgICAgfSxcbiAgICAgICAgaW5zaWRlOiB7XG4gICAgICAgICAgICBmcm9udEZvb3Q6IDAsXG4gICAgICAgICAgICBtb3ZlOiBbMCwgMV0sXG4gICAgICAgICAgICBkaXJlY3Rpb246IDBcbiAgICAgICAgfSxcbiAgICAgICAgb3V0c2lkZToge1xuICAgICAgICAgICAgZnJvbnRGb290OiAxLFxuICAgICAgICAgICAgbW92ZTogWzAsIC0xXSxcbiAgICAgICAgICAgIGRpcmVjdGlvbjogMFxuICAgICAgICB9LFxuICAgICAgICB0dXJuOiB7XG4gICAgICAgICAgICBmcm9udEZvb3Q6IDAsXG4gICAgICAgICAgICBtb3ZlOiBbMCwgLTFdLFxuICAgICAgICAgICAgZGlyZWN0aW9uOiAxXG4gICAgICAgIH0sXG4gICAgICAgIG9uR3VhcmQ6IHtcbiAgICAgICAgICAgIF9wcm9wZXJ0eURlZmluaXRpb246IHRydWUsXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICAgICAgZnJvbnRGb290OiAnTGVmdCcsXG4gICAgICAgICAgICAgICAgbW92ZTogWzAsIDBdLFxuICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogMFxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB3dUNoaToge1xuICAgICAgICAgICAgX3Byb3BlcnR5RGVmaW5pdGlvbjogdHJ1ZSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgICAgICBmcm9udEZvb3Q6IG51bGwsXG4gICAgICAgICAgICAgICAgbW92ZTogWzAsIDBdLFxuICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogMFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBzdGFydFNlcXVlbmNlOiBbJ3d1Q2hpJywgJ29uR3VhcmQnXSxcbiAgICBlbmRTZXF1ZW5jZTogWyd3dUNoaSddXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZXZlbnRFbWl0dGVyID0gKGZ1bmN0aW9uICh1bmRlZmluZWQpIHtcblxuICAgIHZhciBkb09uID0gZnVuY3Rpb24gKGNhbGxiYWNrcywgZXZlbnQsIGNhbGxiYWNrLCBjb250ZXh0KSB7XG5cbiAgICAgICAgICAgIC8vIGZldGNoIHRoZSBldmVudCdzIHN0b3JlIG9mIGNhbGxiYWNrcyBvciBjcmVhdGUgaXQgaWYgbmVlZGVkXG4gICAgICAgICAgICB2YXIgc3RvcmUgPSBjYWxsYmFja3NbZXZlbnRdIHx8IChjYWxsYmFja3NbZXZlbnRdID0gW10pO1xuXG4gICAgICAgICAgICAvLyBzdG9yZSB0aGUgY2FsbGJhY2sgZm9yIGxhdGVyIHVzZVxuICAgICAgICAgICAgc3RvcmUucHVzaCh7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2s6IGNhbGxiYWNrLFxuICAgICAgICAgICAgICAgIGNvbnRleHQ6IGNvbnRleHQgfHwgd2luZG93IHx8IG51bGxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBhbHNvIG9uIHRvIHRoZSBjb250ZXh0IG9iamVjdCdzIGRlc3Ryb3kgZXZlbnQgaW4gb3JkZXIgdG8gb2ZmXG4gICAgICAgICAgICBpZiAoY29udGV4dCkge1xuICAgICAgICAgICAgICAgIGlmIChjb250ZXh0Lm9uICE9PSBvbikge1xuICAgICAgICAgICAgICAgICAgICBldmVudEVtaXR0ZXIuYXBwbHkoY29udGV4dCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChldmVudCAhPT0gJ3NpbGVuY2VFdmVudHMnKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQub24oJ3NpbGVuY2VFdmVudHMnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvZmYuY2FsbCh0aGlzLCBldmVudCwgY2FsbGJhY2ssIGNvbnRleHQpO1xuICAgICAgICAgICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZG9PZmYgPSBmdW5jdGlvbiAoY2FsbGJhY2tzLCBldmVudCwgY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgICAgICAgICAgIHZhciBzdG9yZSA9IGNhbGxiYWNrc1tldmVudF0sXG4gICAgICAgICAgICAgICAgaTtcblxuICAgICAgICAgICAgaWYgKCFzdG9yZSkge3JldHVybjt9XG5cbiAgICAgICAgICAgIGlmICghY2FsbGJhY2sgJiYgIWNvbnRleHQpIHtcbiAgICAgICAgICAgICAgICBzdG9yZS5sZW5ndGggPSBbXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gZmFzdCBsb29wXG4gICAgICAgICAgICBmb3IgKGkgPSBzdG9yZS5sZW5ndGggLSAxOyBpPj0wOyBpLS0pIHtcbiAgICAgICAgICAgICAgICBpZiAoKCFjYWxsYmFjayAmJiBzdG9yZVtpXS5jb250ZXh0ID09PSBjb250ZXh0KSB8fCAoc3RvcmVbaV0uY2FsbGJhY2sgPT09IGNhbGxiYWNrICYmICghY29udGV4dCB8fCAhKHN0b3JlW2ldLmNvbnRleHQpIHx8IHN0b3JlW2ldLmNvbnRleHQgPT09IGNvbnRleHQpKSkge1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIEkgbWlnaHQgaGF2ZSBnb3QgdGhlIGluZGV4IHdyb25nIGhlcmUgLSBzaG91ZGwgaXQgYmUgaS0xLiBPYnZpb3VzbHkgSSdkIGNoZWNrIHRob3JvdWdobHkgaW4gYSByZWFsIGFwcFxuICAgICAgICAgICAgICAgICAgICBzdG9yZS5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBkb0ZpcmUgPSBmdW5jdGlvbiAoY2FsbGJhY2tzLCBldmVudCwgcmVzdWx0KSB7XG4gICAgICAgICAgICB2YXIgc3RvcmUgPSBjYWxsYmFja3NbZXZlbnRdLFxuICAgICAgICAgICAgICAgIGkgPSAwLFxuICAgICAgICAgICAgICAgIGlsO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnRXZlbnQgZW1pdHRlZCcsICdcXG5lbWl0dGVyOiAnLCB0aGlzLCAnXFxuZXZlbnQ6JywgZXZlbnQsICdcXG5kYXRhOiAnLCByZXN1bHQpO1xuICAgICAgICAgICAgaWYgKCFzdG9yZSkge3JldHVybjt9XG5cbiAgICAgICAgICAgIC8vIGxvb3AgaGVyZSBtdXN0IGJlIGluIGluY3JlYXNpbmcgb3JkZXJcbiAgICAgICAgICAgIGZvciAoaWwgPSBzdG9yZS5sZW5ndGg7IGk8aWw7IGkrKykge1xuICAgICAgICAgICAgICAgIHN0b3JlW2ldLmNhbGxiYWNrLmNhbGwoc3RvcmVbaV0uY29udGV4dCwgcmVzdWx0LCBldmVudCwgdGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIG9uID0gZnVuY3Rpb24gKGV2ZW50LCBjYWxsYmFjaywgY29udGV4dCkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBldmVudCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICB0aHJvdygncHJvdmlkZSBhIHN0cmluZyBuYW1lIGZvciB0aGUgZXZlbnQgdG8gc3Vic2NyaWJlIHRvJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgdGhyb3coJ3Byb3ZpZGUgYSBjYWxsYmFjayBmb3IgdGhlIGV2ZW50IHRvIHN1YnNjcmliZSB0bycpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgY2FsbGJhY2tzID0gZ2V0Q2FsbGJhY2tzKHRoaXMpLFxuICAgICAgICAgICAgICAgIGV2ZW50cyA9IGV2ZW50LnNwbGl0KCcgJyk7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBpbCA9IGV2ZW50cy5sZW5ndGg7IGk8aWw7IGkrKykge1xuICAgICAgICAgICAgICAgIGRvT24uY2FsbCh0aGlzLCBjYWxsYmFja3MsIGV2ZW50c1tpXSwgY2FsbGJhY2ssIGNvbnRleHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIG9mZiA9IGZ1bmN0aW9uIChldmVudCwgY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZXZlbnQgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgdGhyb3coJ3Byb3ZpZGUgYSBzdHJpbmcgbmFtZSBmb3IgdGhlIGV2ZW50IHRvIHVuc3Vic2NyaWJlIGZyb20nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBjYWxsYmFja3MgPSBnZXRDYWxsYmFja3ModGhpcywgdHJ1ZSksXG4gICAgICAgICAgICAgICAgZXZlbnRzID0gZXZlbnQuc3BsaXQoJyAnKTtcblxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoIWNhbGxiYWNrcykge3JldHVybiBmYWxzZTt9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBpbCA9IGV2ZW50cy5sZW5ndGg7IGk8aWw7IGkrKykge1xuICAgICAgICAgICAgICAgIGRvT2ZmLmNhbGwodGhpcywgY2FsbGJhY2tzLCBldmVudHNbaV0sIGNhbGxiYWNrLCBjb250ZXh0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBmaXJlID0gZnVuY3Rpb24gKGV2ZW50LCByZXN1bHQpIHtcbiAgICAgICAgICAgIHZhciBjYWxsYmFja3MgPSBnZXRDYWxsYmFja3ModGhpcyksXG4gICAgICAgICAgICAgICAgZXZlbnRzID0gZXZlbnQuc3BsaXQoJyAnKTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGlsID0gZXZlbnRzLmxlbmd0aDsgaTxpbDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgZG9GaXJlLmNhbGwodGhpcywgY2FsbGJhY2tzLCBldmVudHNbaV0sIHJlc3VsdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0Q2FsbGJhY2tzID0gZnVuY3Rpb24gKG9iaiwgZG9udFNldCkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGlsID0gY29udGV4dHMubGVuZ3RoOyBpIDwgaWw7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChjb250ZXh0c1tpXSA9PT0gb2JqKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFja3NbaV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFkb250U2V0KSB7XG4gICAgICAgICAgICAgICAgY29udGV4dHMucHVzaChvYmopO1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrcy5wdXNoKFtdKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2tzW2NhbGxiYWNrcy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBjYWxsYmFja3MgPSBbXSxcbiAgICAgICAgY29udGV4dHMgPSBbXSxcbiAgICAgICAgXG4gICAgICAgIG1peGluID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICB0aGlzLm9uID0gb247XG4gICAgICAgICAgICB0aGlzLm9mZiA9IG9mZjtcbiAgICAgICAgICAgIHRoaXMuZmlyZSA9IGZpcmU7XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9O1xuXG4gICAgbWl4aW4uY2xlYW5VcCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY2FsbGJhY2tzID0gW107XG4gICAgICAgIGNvbnRleHRzID0gW107XG4gICAgfTtcblxuICAgIHJldHVybiBtaXhpbjtcblxufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBldmVudEVtaXR0ZXI7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpLFxuICAgIEwgPSAnTGVmdCcsXG4gICAgUiA9ICdSaWdodCcsXG4gICAgTiA9ICdOb3J0aCcsXG4gICAgUyA9ICdTb3V0aCcsXG4gICAgRSA9ICdFYXN0JyxcbiAgICBXID0gJ1dlc3QnLFxuICAgIGNvbXBhc3MgPSBbTiwgRSwgUywgV107XG5cbnZhciBDYWxsZXIgPSBmdW5jdGlvbiAoZHJpbGxlcikge1xuICAgIGlmICghZHJpbGxlci5vbikge1xuICAgICAgICB0aHJvdygnZHJpbGxlciBtdXN0IGltcGxlbWVudCBldmVudCBlbWl0dGVyJyk7XG4gICAgfVxuICAgIHRoaXMuZHJpbGxlciA9IGRyaWxsZXI7XG4gICAgdGhpcy5pbml0KCk7XG59O1xuXG5DYWxsZXIucHJvdG90eXBlID0ge1xuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy90aGlzLnByZWxvYWRBdWRpbygpO1xuICAgICAgICB0aGlzLnNwZWFrZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhdWRpbycpO1xuICAgICAgICB0aGlzLnNwZWFrZXIucHJlbG9hZCA9ICdhdXRvJztcbiAgICAgICAgdGhpcy5zcGVha2VyLmF1dG9wbGF5ID0gZmFsc2U7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdib2R5JylbMF0uYXBwZW5kQ2hpbGQodGhpcy5zcGVha2VyKTtcbiAgICAgICAgdGhpcy5kcmlsbGVyLm9uKCdzdGVwJywgdGhpcy5jYWxsU3RlcCwgdGhpcyk7XG4gICAgfSxcbiAgICBjYWxsU3RlcDogZnVuY3Rpb24gKHN0YXRlKSB7XG4gICAgICAgIHRoaXMuc3BlYWtlci5zcmMgPSAnYXNzZXRzL2F1ZGlvLycgKyB1dGlscy50b0Rhc2hlZCh0aGlzLmRyaWxsZXIuZGlzY2lwbGluZSkgKyAnLycgKyB1dGlscy50b0Rhc2hlZChzdGF0ZS5sYXN0U3RlcCkgKyAnLm9nZyc7XG4gICAgICAgIHRoaXMuc3BlYWtlci5wbGF5KCk7XG4gICAgfS8vLFxuLy8gICAgICAgICBwcmVsb2FkQXVkaW86IGZ1bmN0aW9uICgpIHtcbi8vICAgICAgICAgICAgIHZhciBzdGVwcyA9IHRoaXMuZHJpbGxlci5jb25mLnN0ZXBzO1xuLy8gLy9nZXRPd25Qcm9wZXJ0eU5hbWVzXG4vLyAgICAgICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FsbGVyOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIENvbnRyb2xQYW5lbCA9IGZ1bmN0aW9uIChjb250cm9sbGVyLCBjb25mKSB7XG4gICAgaWYgKCFjb250cm9sbGVyLm9uKSB7XG4gICAgICAgIHRocm93KCdjb250cm9sbGVyIG11c3QgaW1wbGVtZW50IGV2ZW50IGVtaXR0ZXIgcGF0dGVybicpO1xuICAgIH1cbiAgICB0aGlzLmZpZWxkTGlzdCA9IGNvbmYuZmllbGRMaXN0O1xuICAgIHRoaXMuYWN0aW9uTGlzdCA9IGNvbmYuYWN0aW9uTGlzdDtcbiAgICB0aGlzLmNvbnRyb2xsZXIgPSBjb250cm9sbGVyO1xuICAgIHRoaXMuZm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbmYuZm9ybUlkKTtcbiAgICB0aGlzLmluaXQoKTtcbn07XG5cbkNvbnRyb2xQYW5lbC5wcm90b3R5cGUgPSB7XG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgaSwgaWw7XG4gICAgICAgIGlmICh0aGlzLmZpZWxkTGlzdCkge1xuICAgICAgICAgICAgZm9yKGkgPSAwLCBpbCA9IHRoaXMuZmllbGRMaXN0Lmxlbmd0aDsgaTxpbDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5iaW5kRmllbGQodGhpcy5maWVsZExpc3RbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmFjdGlvbkxpc3QpIHtcbiAgICAgICAgICAgIGZvcihpID0gMCwgaWwgPSB0aGlzLmFjdGlvbkxpc3QubGVuZ3RoOyBpPGlsOyBpKyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLmJpbmRBY3Rpb24odGhpcy5hY3Rpb25MaXN0W2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBiaW5kRmllbGQ6IGZ1bmN0aW9uIChmaWVsZE5hbWUpIHtcbiAgICAgICAgdmFyIGZpZWxkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZmllbGROYW1lKSxcbiAgICAgICAgICAgIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgdmFsUHJvcDtcblxuICAgICAgICBpZiAoIWZpZWxkKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ21pc3NpbmcgZmllbGQgaW4gY29udHJvbCBwYW5lbDogJyArIGZpZWxkTmFtZSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmFsUHJvcCA9IFsnY2hlY2tib3gnLCAncmFkaW8nXS5pbmRleE9mKGZpZWxkLnR5cGUpID4gLTEgPyAnY2hlY2tlZCcgOiAndmFsdWUnO1xuICAgICAgICBmaWVsZFt2YWxQcm9wXSA9IHRoaXMuY29udHJvbGxlci5jb25mW2ZpZWxkTmFtZV07XG4gICAgICAgIGZpZWxkLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IGZpZWxkW3ZhbFByb3BdO1xuICAgICAgICAgICAgdGhhdC5jb250cm9sbGVyLmNvbmZbZmllbGROYW1lXSA9IHZhbHVlO1xuICAgICAgICAgICAgdmFyIGRhdGEgPSB7fTtcbiAgICAgICAgICAgIGRhdGFbZmllbGROYW1lXSA9IHZhbHVlO1xuICAgICAgICAgICAgdGhhdC5jb250cm9sbGVyLmZpcmUoJ2NvbmZpZ0NoYW5nZScsIGRhdGEpO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIGJpbmRBY3Rpb246IGZ1bmN0aW9uIChhY3Rpb25OYW1lKSB7XG4gICAgICAgIHZhciBidXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChhY3Rpb25OYW1lKSxcbiAgICAgICAgICAgIHRoYXQgPSB0aGlzO1xuICAgICAgICBpZiAoIWJ1dHRvbikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdtaXNzaW5nIGJ1dHRvbiBvbiBjb250cm9sIHBhbmVsOiAnICsgYWN0aW9uTmFtZSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhhdC5jb250cm9sbGVyW2FjdGlvbk5hbWVdKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ29udHJvbFBhbmVsOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJy4uL21peGlucy9ldmVudC1lbWl0dGVyJyksXG4gICAgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpLFxuICAgIEwgPSAnTGVmdCcsXG4gICAgUiA9ICdSaWdodCcsXG4gICAgTiA9ICdOb3J0aCcsXG4gICAgUyA9ICdTb3V0aCcsXG4gICAgRSA9ICdFYXN0JyxcbiAgICBXID0gJ1dlc3QnLFxuICAgIGNvbXBhc3MgPSBbTiwgRSwgUywgV107XG5cbnZhciBEcmlsbGVyID0gZnVuY3Rpb24gKGNvbmYpIHtcbiAgICB0aGlzLmRpc2NpcGxpbmUgPSAoY29uZiAmJiBjb25mLmRpc2NpcGxpbmUpIHx8IERyaWxsZXIuZGVmYXVsdHMuZGlzY2lwbGluZTtcbiAgICB0aGlzLmNvbmYgPSB1dGlscy5leHRlbmRPYmooe30sIERyaWxsZXIuZGVmYXVsdHMsIERyaWxsZXIuZGlzY2lwbGluZUNvbmZpZ3NbdGhpcy5kaXNjaXBsaW5lXSwgY29uZiB8fCB7fSk7XG4gICAgdGhpcy5pbml0KCk7XG59O1xuXG5EcmlsbGVyLmRlZmF1bHRzID0ge1xuICAgIGRpc2NpcGxpbmU6ICd0YWlDaGknLFxuICAgIGRpc2FibGVkU3RlcHM6IFtdLFxuICAgIG1pblRpbWU6IDEsXG4gICAgbWF4VGltZTogMixcbiAgICAvLyBhdmdUaW1lOiAzLFxuICAgIC8vIGF2Z1dlaWdodDogMSxcbiAgICBhcmVhV2lkdGg6IDQsXG4gICAgYXJlYUxlbmd0aDogNCxcbiAgICBzdGVwQ291bnQ6IC0xIC8vIC0xIGZvciBpbmZpbml0ZVxufTtcblxuRHJpbGxlci5hZGREaXNjaXBsaW5lID0gZnVuY3Rpb24gKGNvbmZpZykge1xuICAgIGlmICghY29uZmlnLm5hbWUpIHtcbiAgICAgICAgdGhyb3coJ25hbWUgbXVzdCBiZSBkZWZpbmVkIGZvciBhbnkgZGlzY2lwbGluZSBjb25maWcnKTtcbiAgICB9XG4gICAgRHJpbGxlci5kaXNjaXBsaW5lQ29uZmlnc1tjb25maWcubmFtZV0gPSBjb25maWc7XG4gICAgdXRpbHMuZGVmaW5lUHJvcHMoY29uZmlnLnN0ZXBzKTtcbn07XG5cbkRyaWxsZXIuZGlzY2lwbGluZUNvbmZpZ3MgPSB7fTtcblxuRHJpbGxlci5wcm90b3R5cGUgPSB7XG4gICAgaW5pdDogZnVuY3Rpb24gKGRvbnRTdGFydCkge1xuICAgICAgICB2YXIgc3RhcnRQb3MgPSB0aGlzLmNvbmYuc3RhcnRQb3NpdGlvbiB8fCB7fSxcbiAgICAgICAgICAgIHRoYXQgPSB0aGlzO1xuICAgICAgICB0aGlzLmRpc2FibGVkU3RlcHMgPSB7fTtcbiAgICAgICAgdGhpcy5jb25mLmRpc2FibGVkU3RlcHMubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICB0aGF0LmRpc2FibGVkU3RlcHNbaXRlbV0gPSB0cnVlO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5jb29yZHMgPSAodGhpcy5jb25mLnByZXNlcnZlUG9zaXRpb24gPyB0aGlzLmNvb3JkcyA6IHN0YXJ0UG9zLmNvb3JkcykgfHwgWzAsMF07XG4gICAgICAgIHRoaXMuZnJvbnRGb290ID0gc3RhcnRQb3MuZnJvbnRGb290IHx8IG51bGw7XG4gICAgICAgIC8vIGlmICgnZGlyZWN0aW9uJyBpbiB0aGlzKSB7XG5cbiAgICAgICAgLy8gfVxuICAgICAgICB0aGlzLmRpcmVjdGlvbiA9ICh0aGlzLmNvbmYucHJlc2VydmVQb3NpdGlvbiA/IHRoaXMuZGlyZWN0aW9uIDogc3RhcnRQb3MuZGlyZWN0aW9uKTtcbiAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSB0eXBlb2YgdGhpcy5kaXJlY3Rpb24gPT09ICd1bmRlZmluZWQnID8gMCA6IHRoaXMuZGlyZWN0aW9uO1xuICAgICAgICB0aGlzLmxvbmdEaXJlY3Rpb24gPSBjb21wYXNzW3RoaXMuZGlyZWN0aW9uXTtcbiAgICAgICAgLy90aGlzLmRpcmVjdGlvbiA9IHN0YXJ0UG9zLmRpcmVjdGlvbiB8fCAwO1xuICAgICAgICB0aGlzLnN0ZXBDb3VudCA9IHRoaXMuY29uZi5zdGVwQ291bnQ7XG4gICAgICAgIHRoaXMuY29uZi5taW5UaW1lID0gTWF0aC5tYXgodGhpcy5jb25mLm1pblRpbWUsIDAuNSk7XG4gICAgICAgIHRoaXMuY29uZi5tYXhUaW1lID0gTWF0aC5tYXgodGhpcy5jb25mLm1heFRpbWUsIHRoaXMuY29uZi5taW5UaW1lKTtcbiAgICAgICAgdGhpcy5maXJlKCdpbml0aWFsaXNlZCcpO1xuICAgICAgICBpZiAodGhpcy5jb25mLmF1dG9wbGF5ICYmICFkb250U3RhcnQpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhcnQoKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgX3N0YXJ0OiBmdW5jdGlvbiAocmVzZXQpIHtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuZmlyZSgnc3RhcnRlZCcpO1xuICAgICAgICB0aGlzLnJ1bm5pbmcgPSB0cnVlO1xuICAgICAgICB0aGlzLnN0YXJ0U2VxdWVuY2UgPSB0aGlzLmNvbmYuc3RhcnRTZXF1ZW5jZS5zbGljZSgpO1xuICAgICAgICB0aGlzLmFubm91bmNlU3RlcCh0aGlzLnN0YXJ0U2VxdWVuY2Uuc2hpZnQoKSk7XG4gICAgICAgIHRoaXMudGFrZVN0ZXAoKTtcbiAgICB9LFxuICAgIHN0YXJ0OiBmdW5jdGlvbiAocmVzZXQpIHtcbiAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICBpZiAocmVzZXQpIHtcbiAgICAgICAgICAgIHRoaXMuaW5pdCh0cnVlKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnJ1bm5pbmcgPT09IHRydWUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5jb25mLmRlbGF5KSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aGF0Ll9zdGFydChyZXNldCk7XG4gICAgICAgICAgICB9LCB0aGlzLmNvbmYuZGVsYXkgKiAxMDAwKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX3N0YXJ0KHJlc2V0KTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgcmVzZXRBbmRTdGFydDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnN0b3AodHJ1ZSk7XG4gICAgICAgIHRoaXMuc3RhcnQodHJ1ZSk7XG4gICAgfSxcbiAgICBhbm5vdW5jZVN0ZXA6IGZ1bmN0aW9uIChzdGVwKSB7XG4gICAgICAgIGlmICghdGhpcy5jb25mLnN0ZXBzW3N0ZXBdKSB7XG4gICAgICAgICAgICB0aHJvdygnaW52YWxpZCBzdGVwIG5hbWU6ICcgKyBzdGVwKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmZpcmUoJ3N0ZXAnLCB7XG4gICAgICAgICAgICBkaXJlY3Rpb246IGNvbXBhc3NbdGhpcy5kaXJlY3Rpb25dLFxuICAgICAgICAgICAgZnJvbnRGb290OiB0aGlzLmZyb250Rm9vdCxcbiAgICAgICAgICAgIGxhc3RTdGVwOiBzdGVwLFxuICAgICAgICAgICAgY29vcmRzOiB0aGlzLmNvb3Jkcy5zbGljZSgpXG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgc3RvcDogZnVuY3Rpb24gKGFib3J0KSB7XG4gICAgICAgIGlmICh0aGlzLnJ1bm5pbmcgPT09IHRydWUpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVyKTtcbiAgICAgICAgICAgIGlmICghYWJvcnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVuZFNlcXVlbmNlID0gdGhpcy5jb25mLmVuZFNlcXVlbmNlLnNsaWNlKCk7XG4gICAgICAgICAgICAgICAgdGhpcy50YWtlU3RlcCh0cnVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuZmlyZSgnc3RvcHBlZCcpO1xuICAgICAgICAgICAgdGhpcy5ydW5uaW5nID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHRha2VTdGVwOiBmdW5jdGlvbiAoY2xvc2luZykge1xuICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICBzdGVwO1xuICAgICAgICBcbiAgICAgICAgaWYgKCF0aGlzLnN0ZXBDb3VudCAmJiAhY2xvc2luZyAmJiAhdGhpcy5zdGFydFNlcXVlbmNlLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RvcCgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnN0ZXBDb3VudCAmJiAhdGhpcy5zdGFydFNlcXVlbmNlLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy5zdGVwQ291bnQtLTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgc3RlcCA9IHRoaXMuZ2V0TmV4dFN0ZXBOYW1lKGNsb3NpbmcpO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIGlmIChjbG9zaW5nKSB7XG4gICAgICAgICAgICBpZiAoc3RlcCkge1xuICAgICAgICAgICAgICAgIHRoaXMuYWRqdXN0UG9zaXRpb24oc3RlcCk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZW5kU2VxdWVuY2UubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQudGFrZVN0ZXAoY2xvc2luZyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy50aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRoYXQuYWRqdXN0UG9zaXRpb24oc3RlcCk7XG4gICAgICAgICAgICAgICAgdGhhdC50YWtlU3RlcCgpO1xuICAgICAgICAgICAgICAgIC8vIHJlbWVtYmVyIHRvIGRvIHRoaXMgb24gc291bmQgZmluaXNoIChtYXliZT8pXG4gICAgICAgICAgICB9LCB0aGlzLmdldFRpbWVJbnRlcnZhbCgpKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgZ2V0TmV4dFN0ZXBOYW1lOiBmdW5jdGlvbiAoY2xvc2luZykge1xuICAgICAgICB2YXIgc3RlcDtcbiAgICAgICAgaWYgKGNsb3NpbmcpIHtcbiAgICAgICAgICAgIHN0ZXAgPSB0aGlzLmVuZFNlcXVlbmNlLmxlbmd0aCA/IHRoaXMuZW5kU2VxdWVuY2Uuc2hpZnQoKTogdW5kZWZpbmVkO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhcnRTZXF1ZW5jZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHN0ZXAgPSB0aGlzLnN0YXJ0U2VxdWVuY2Uuc2hpZnQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0ZXAgPSB0aGlzLmdldFJhbmRvbVN0ZXAoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXN0ZXApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy52YWxpZGF0ZVN0ZXAoc3RlcCkgPyBzdGVwIDogdGhpcy5nZXROZXh0U3RlcE5hbWUoY2xvc2luZyk7XG4gICAgfSxcbiAgICBnZXRSYW5kb21TdGVwOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB1dGlscy5waWNrUmFuZG9tUHJvcGVydHkodGhpcy5jb25mLnN0ZXBzKTtcbiAgICB9LFxuICAgIHZhbGlkYXRlU3RlcDogZnVuY3Rpb24gKHN0ZXApIHtcbiAgICAgICAgaWYgKHRoaXMuZGlzYWJsZWRTdGVwc1tzdGVwXSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHZhciBuZXdQb3NpdGlvbiA9IHRoaXMuYWRqdXN0UG9zaXRpb24oc3RlcCwgdHJ1ZSk7XG4gICAgICAgIHJldHVybiAobmV3UG9zaXRpb25bMF0gPj0gMCAmJiBuZXdQb3NpdGlvblsxXSA+PSAwICYmIG5ld1Bvc2l0aW9uWzFdIDwgdGhpcy5jb25mLmFyZWFXaWR0aCAmJiBuZXdQb3NpdGlvblswXSA8IHRoaXMuY29uZi5hcmVhTGVuZ3RoKTtcbiAgICB9LFxuICAgIGFkanVzdFBvc2l0aW9uOiBmdW5jdGlvbiAoc3RlcCwgZHVtbXkpIHtcbiAgICAgICAgdmFyIG1vdmVNYXRyaXgsXG4gICAgICAgICAgICBsZWZ0VG9SaWdodCxcbiAgICAgICAgICAgIGZyb250VG9CYWNrLFxuICAgICAgICAgICAgY29vcmRzLFxuICAgICAgICAgICAgY3VycmVudFN0ZXAsXG4gICAgICAgICAgICBkaXJlY3Rpb24sXG4gICAgICAgICAgICBsb25nRGlyZWN0aW9uLCBcbiAgICAgICAgICAgIGZyb250Rm9vdDtcblxuICAgICAgICBjdXJyZW50U3RlcCA9IHRoaXMuY29uZi5zdGVwc1tzdGVwXTtcbiAgICAgICAgaWYgKCFjdXJyZW50U3RlcCkge1xuICAgICAgICAgICAgLy8gaWYgKGR1bW15KSB7XG4gICAgICAgICAgICAvLyAgICAgcmV0dXJuIFsxMDAwMDAwMDAwLCAxMDAwMDAwMDAwXTtcbiAgICAgICAgICAgIC8vIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdygnaW52YWxpZCBzdGVwIG5hbWU6ICcgKyBzdGVwKTtcbiAgICAgICAgICAgIC8vIH1cbiAgICAgICAgfVxuICAgICAgICBkaXJlY3Rpb24gPSAodGhpcy5kaXJlY3Rpb24gKyAoKHRoaXMuZnJvbnRGb290ID09PSBMID8gMSA6IC0xKSAqIGN1cnJlbnRTdGVwLmRpcmVjdGlvbikgKyA0KSAlIDQ7XG4gICAgICAgIGxvbmdEaXJlY3Rpb24gPSBjb21wYXNzW2RpcmVjdGlvbl07XG4gICAgICAgIGxlZnRUb1JpZ2h0ID0gY3VycmVudFN0ZXAubW92ZVsxXSAqICh0aGlzLmZyb250Rm9vdCAhPT0gUiA/IDE6IC0xKTtcbiAgICAgICAgZnJvbnRUb0JhY2sgPSBjdXJyZW50U3RlcC5tb3ZlWzBdO1xuXG4gICAgICAgIGZyb250Rm9vdCA9ICAgIGN1cnJlbnRTdGVwLmZyb250Rm9vdCA9PT0gTCA/IEwgOlxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFN0ZXAuZnJvbnRGb290ID09PSBSID8gUiA6XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50U3RlcC5mcm9udEZvb3QgPT09IG51bGwgPyBudWxsIDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRTdGVwLmZyb250Rm9vdCA9PT0gMSA/ICh0aGlzLmZyb250Rm9vdCA9PT0gUiA/IEwgOiBSKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZyb250Rm9vdDtcbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCAodGhpcy5kaXJlY3Rpb24pIHtcbiAgICAgICAgXG4gICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgIG1vdmVNYXRyaXggPSBbZnJvbnRUb0JhY2ssIGxlZnRUb1JpZ2h0XTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICBtb3ZlTWF0cml4ID0gWy1sZWZ0VG9SaWdodCwgZnJvbnRUb0JhY2tdO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIG1vdmVNYXRyaXggPSBbLWZyb250VG9CYWNrLCAtbGVmdFRvUmlnaHRdO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIG1vdmVNYXRyaXggPSBbbGVmdFRvUmlnaHQsIC1mcm9udFRvQmFja107XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICB9XG5cbiAgICAgICAgY29vcmRzID0gW3RoaXMuY29vcmRzWzBdICsgbW92ZU1hdHJpeFswXSwgdGhpcy5jb29yZHNbMV0gKyBtb3ZlTWF0cml4WzFdXTtcblxuICAgICAgICBpZiAoZHVtbXkpIHtcbiAgICAgICAgICAgIHJldHVybiBjb29yZHM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmNvb3JkcyA9IGNvb3JkcztcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFN0ZXAgPSBjdXJyZW50U3RlcDtcbiAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uID0gZGlyZWN0aW9uO1xuICAgICAgICAgICAgdGhpcy5sb25nRGlyZWN0aW9uID0gbG9uZ0RpcmVjdGlvbjtcbiAgICAgICAgICAgIHRoaXMuZnJvbnRGb290ID0gZnJvbnRGb290O1xuICAgICAgICAgICAgdGhpcy5hbm5vdW5jZVN0ZXAoc3RlcCk7ICAgIFxuICAgICAgICB9XG4gICAgICAgIFxuICAgIH0sXG5cbiAgICBnZXRUaW1lSW50ZXJ2YWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG1pbiA9IDIsXG4gICAgICAgICAgICBhdmFpbGFibGVJbnRlcnZhbCA9IHRoaXMuY29uZi5tYXhUaW1lIC0gdGhpcy5jb25mLm1pblRpbWU7XG5cbiAgICAgICAgdmFyIHRpbWUgPSAobWluICsgKGF2YWlsYWJsZUludGVydmFsICogTWF0aC5yYW5kb20oKSkpO1xuICAgICAgICB0aW1lID0gTWF0aC5tYXgoTWF0aC5taW4odGhpcy5jb25mLm1heFRpbWUsIHRpbWUpLCB0aGlzLmNvbmYubWluVGltZSk7XG4gICAgICAgIHJldHVybiB0aW1lICogMTAwMDtcblxuXG4gICAgICAgIC8vIHZhciB0aW1lID0gKCgoYXZhaWxhYmxlSW50ZXJ2YWwgKiBNYXRoLnJhbmRvbSgpKS8odGhpcy5jb25mLmF2Z1dlaWdodCArIDEpKSArICh0aGlzLmNvbmYuYXZnVGltZSAqKHRoaXMuY29uZi5hdmdXZWlnaHQvKHRoaXMuY29uZi5hdmdXZWlnaHQgKyAxKSkpKSArIHRoaXMuY29uZi5taW5UaW1lO1xuXG4gICAgfSxcbiAgICBlbmFibGVTdGVwOiBmdW5jdGlvbiAoc3RlcCkge1xuICAgICAgICBcbiAgICAgICAgdmFyIHN0ZXBJbmRleCA9IHRoaXMuY29uZi5kaXNhYmxlZFN0ZXBzLmluZGV4T2Yoc3RlcCk7XG4gICAgICAgIHRoaXMuZGlzYWJsZWRTdGVwc1tzdGVwXSA9IGZhbHNlO1xuICAgICAgICBpZiAoc3RlcEluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZi5kaXNhYmxlZFN0ZXBzLnNwbGljZShzdGVwSW5kZXgsIDEpO1xuICAgICAgICAgICAgLy8gb3IgY291bGQganVzdCBmaXJlICdzdGVwRGlzYWJsZWQnXG4gICAgICAgICAgICB0aGlzLmZpcmUoJ2NvbmZpZ0NoYW5nZScsIHtcbiAgICAgICAgICAgICAgICBkaXNhYmxlZFN0ZXBzOiB0aGlzLmNvbmYuZGlzYWJsZWRTdGVwc1xuICAgICAgICAgICAgfSk7ICBcbiAgICAgICAgfVxuICAgIH0sXG4gICAgZGlzYWJsZVN0ZXA6IGZ1bmN0aW9uIChzdGVwKSB7XG4gICAgICAgIHZhciBzdGVwSW5kZXggPSB0aGlzLmNvbmYuZGlzYWJsZWRTdGVwcy5pbmRleE9mKHN0ZXApO1xuICAgICAgICB0aGlzLmRpc2FibGVkU3RlcHNbc3RlcF0gPSB0cnVlO1xuICAgICAgICBpZiAoc3RlcEluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgdGhpcy5jb25mLmRpc2FibGVkU3RlcHMucHVzaChzdGVwKTtcbiAgICAgICAgICAgIHRoaXMuZmlyZSgnY29uZmlnQ2hhbmdlJywge1xuICAgICAgICAgICAgICAgIGRpc2FibGVkU3RlcHM6IHRoaXMuY29uZi5kaXNhYmxlZFN0ZXBzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sXG5cblxuICAgIC8vID8/P05FRUQgVE8gV1JJVEUgVEVTVFMgRk9SIHRoaXNcbiAgICAvLyAgICAgICAgICAgICBpdCgnc2hvdWxkIGJlIGFmZmVjdGVkIGJ5IGxpdmUgY2hhbmdlcyB0byB0aGUgY29uZmlnJywgZnVuY3Rpb24gKCkge1xuXG4gICAgLy8gICAgIH0pO1xuICAgIHVwZGF0ZVNldHRpbmdzOiBmdW5jdGlvbiAoY29uZikge1xuICAgICAgICB0aGlzLmNvbmYgPSB1dGlscy5leHRlbmRPYmoodGhpcy5jb25mLCBjb25mKTtcbiAgICAgICAgXG4gICAgLy8gZGVmaW5lU3RlcDogZnVuY3Rpb24gKG5hbWUsIGNvbmYpIHtcbiAgICAvLyAgICAgdGhpcy5zdGVwc1tuYW1lXSA9IGNvbmY7XG4gICAgLy8gfSxcbiAgICAvLyB1bmRlZmluZVN0ZXA6IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgLy8gICAgIGlmICh0aGlzLnN0ZXBzW25hbWVdKSB7XG4gICAgLy8gICAgICAgICBkZWxldGUgdGhpcy5zdGVwc1tuYW1lXTtcbiAgICAvLyAgICAgfVxuICAgIH1cbn07XG5cbmV2ZW50RW1pdHRlci5hcHBseShEcmlsbGVyLnByb3RvdHlwZSk7XG5cbm1vZHVsZS5leHBvcnRzID0gRHJpbGxlcjsiLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbnZhciBTdGVwU2VsZWN0b3IgPSBmdW5jdGlvbiAoZHJpbGxlciwgZG9tTm9kZUlkKSB7XG4gICAgdGhpcy5kcmlsbGVyID0gZHJpbGxlcjtcbiAgICB0aGlzLmRvbU5vZGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChkb21Ob2RlSWQpO1xuICAgIHRoaXMuaW5pdCgpO1xufTtcblxuU3RlcFNlbGVjdG9yLnByb3RvdHlwZSA9IHtcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBoZWFkaW5nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xuICAgICAgICBoZWFkaW5nLnRleHRDb250ZW50ID0gJ0Nob29zZSB3aGljaCBzdGVwcyB0byBpbmNsdWRlIGluIHlvdXIgZHJpbGwnLFxuICAgICAgICB0aGlzLmRvbU5vZGUuYXBwZW5kQ2hpbGQoaGVhZGluZyk7XG4gICAgICAgIHRoaXMuY3JlYXRlSW5wdXRzKCk7XG4gICAgfSxcbiAgICBjcmVhdGVJbnB1dHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGxhYmVsLFxuICAgICAgICAgICAgaW5wdXQ7XG4gICAgICAgIGZvciAodmFyIGtleSBpbiB0aGlzLmRyaWxsZXIuY29uZi5zdGVwcykge1xuICAgICAgICAgICAgbGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsYWJlbCcpO1xuICAgICAgICAgICAgbGFiZWxbJ2ZvciddID0ga2V5O1xuICAgICAgICAgICAgbGFiZWwudGV4dENvbnRlbnQgPSB1dGlscy5jYW1lbFRvU3BhY2VkKGtleSk7XG4gICAgICAgICAgICBpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG4gICAgICAgICAgICBpbnB1dC5pZCA9IGtleTtcbiAgICAgICAgICAgIGlucHV0Lm5hbWUgPSAnc3RlcFNlbGVjdG9yJztcbiAgICAgICAgICAgIGlucHV0LnR5cGUgPSAnY2hlY2tib3gnO1xuICAgICAgICAgICAgdGhpcy5kb21Ob2RlLmFwcGVuZENoaWxkKGlucHV0KTtcbiAgICAgICAgICAgIHRoaXMuZG9tTm9kZS5hcHBlbmRDaGlsZChsYWJlbCk7XG4gICAgICAgICAgICB0aGlzLmJpbmRJbnB1dFRvRHJpbGxlcihrZXksIGlucHV0KTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgYmluZElucHV0VG9EcmlsbGVyOiBmdW5jdGlvbiAoc3RlcCwgaW5wdXQpIHtcbiAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICBpbnB1dC5jaGVja2VkID0gdGhpcy5kcmlsbGVyLmNvbmYuZGlzYWJsZWRTdGVwcy5pbmRleE9mKHN0ZXApID09PSAtMTtcbiAgICAgICAgaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHN0ZXBJbmRleDtcbiAgICAgICAgICAgIGlmIChpbnB1dC5jaGVja2VkKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5kcmlsbGVyLmVuYWJsZVN0ZXAoc3RlcCk7IFxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGF0LmRyaWxsZXIuZGlzYWJsZVN0ZXAoc3RlcCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU3RlcFNlbGVjdG9yOyIsInZhciBwaWNrUmFuZG9tUHJvcGVydHkgPSBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgIHZhciBjb3VudCA9IDA7XG4gICAgICAgIGZvciAodmFyIHByb3AgaW4gb2JqKSB7XG4gICAgICAgICAgICBpZiAoTWF0aC5yYW5kb20oKSA8IDEgLyArK2NvdW50KSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gcHJvcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIGRlZmluZVByb3BzID0gZnVuY3Rpb24gKG9iaikge1xuICAgICAgICB2YXIgcHJvcDtcbiAgICAgICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgICAgICAgcHJvcCA9IG9ialtrZXldO1xuICAgICAgICAgICAgaWYgKHByb3AuX3Byb3BlcnR5RGVmaW5pdGlvbikge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBvYmpba2V5XTtcbiAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHByb3ApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgfSxcblxuICAgIGV4dGVuZE9iaiA9IGZ1bmN0aW9uIChiYXNlKSB7XG4gICAgICAgIHZhciBleHRlbmRlcnMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpLFxuICAgICAgICAgICAgZXh0ZW5kZXI7XG5cbiAgICAgICAgaWYgKCFleHRlbmRlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gYmFzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChleHRlbmRlcnMubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgZXh0ZW5kZXIgPSBleHRlbmRlcnMucG9wKCk7XG4gICAgICAgICAgICBiYXNlID0gZXh0ZW5kT2JqLmFwcGx5KHRoaXMsIEFycmF5LnByb3RvdHlwZS5jb25jYXQuYXBwbHkoW2Jhc2VdLCBleHRlbmRlcnMpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGV4dGVuZGVyID0gZXh0ZW5kZXJzWzBdO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yICh2YXIga2V5IGluIGV4dGVuZGVyKSB7XG4gICAgICAgICAgICBiYXNlW2tleV0gPSBleHRlbmRlcltrZXldO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGJhc2U7XG4gICAgfSxcbiAgICB0b0NhbWVsID0gZnVuY3Rpb24gKHRleHQpIHtcbiAgICAgICAgcmV0dXJuIHRleHQucmVwbGFjZSgvXFwtXFx3L2csIGZ1bmN0aW9uICgkMCkge1xuICAgICAgICAgICAgcmV0dXJuICQwLmNoYXJBdCgxKS50b1VwcGVyQ2FzZSgpO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIHRvRGFzaGVkID0gZnVuY3Rpb24odGV4dCkge1xuICAgICAgICByZXR1cm4gdGV4dC5yZXBsYWNlKC9bXkEtWl1bQS1aXS9nLCBmdW5jdGlvbiAoJDApIHtcbiAgICAgICAgICAgIHJldHVybiAkMC5jaGFyQXQoMCkgKyAnLScgKyAkMC5jaGFyQXQoMSkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBkYXNoZWRUb1NwYWNlZCA9IGZ1bmN0aW9uICh0ZXh0KSB7XG4gICAgICAgIHJldHVybiB0ZXh0LnJlcGxhY2UoLy0vZywgJyAnKTtcbiAgICB9LFxuICAgIGNhbWVsVG9TcGFjZWQgPSBmdW5jdGlvbiAodGV4dCkge1xuICAgICAgICByZXR1cm4gZGFzaGVkVG9TcGFjZWQodG9EYXNoZWQodGV4dCkpO1xuICAgIH07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHBpY2tSYW5kb21Qcm9wZXJ0eTogcGlja1JhbmRvbVByb3BlcnR5LFxuICAgIGRlZmluZVByb3BzOiBkZWZpbmVQcm9wcyxcbiAgICBleHRlbmRPYmo6IGV4dGVuZE9iaixcbiAgICB0b0NhbWVsOiB0b0NhbWVsLFxuICAgIHRvRGFzaGVkOiB0b0Rhc2hlZCxcbiAgICBkYXNoZWRUb1NwYWNlZDogZGFzaGVkVG9TcGFjZWQsXG4gICAgY2FtZWxUb1NwYWNlZDogY2FtZWxUb1NwYWNlZFxufTsiLCJ3aW5kb3cuVGVzdEhlbHBlcnMgPSB7XG4gICAgZmFrZXM6IHtcbiAgICAgICAgJ01hdGgnOiB7XG4gICAgICAgICAgICByYW5kb206IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciByYW5OdW0gPSBNYXRoLnJhbmRvbSgpO1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhyYW5OdW0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmFuTnVtO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGZpcmVFdmVudDogZnVuY3Rpb24gKGVsLCBldmVudCkge1xuICAgICAgICB2YXIgZXZ0ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0hUTUxFdmVudHMnKTtcbiAgICAgICAgZXZ0LmluaXRFdmVudChldmVudCwgZmFsc2UsIHRydWUpO1xuICAgICAgICBlbC5kaXNwYXRjaEV2ZW50KGV2dCk7XG4gICAgfVxufTsiLG51bGwsIi8qZ2xvYmFsIGRlc2NyaWJlOmZhbHNlLCBqYXNtaW5lOmZhbHNlLCBiZWZvcmVFYWNoOmZhbHNlLCBhZnRlckVhY2g6ZmFsc2UscnVuczpmYWxzZSx3YWl0czpmYWxzZSxleHBlY3Q6ZmFsc2UsaXQ6ZmFsc2Usc3B5T246ZmFsc2UgKi9cbmRlc2NyaWJlKCdjb25maWdzL3RhaS1jaGknLCBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIERyaWxsZXIgPSByZXF1aXJlKCcuLi8uLi8uLi9zcmMvbW9kdWxlcy9kcmlsbGVyJyksXG4gICAgICAgIHRhaUNoaUNvbmZpZyA9IHJlcXVpcmUoJy4uLy4uLy4uL3NyYy9jb25maWdzL3RhaS1jaGknKSxcbiAgICAgICAgZHJpbGxlcjtcbiAgICBmdW5jdGlvbiBjaGVja0VudW1lcmFibGUocHJvcCwgb2JqKSB7XG4gICAgICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgICAgICAgIGlmIChrZXkgPT09IHByb3ApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgYmVmb3JlRWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgIERyaWxsZXIuYWRkRGlzY2lwbGluZSh0YWlDaGlDb25maWcpO1xuICAgICAgICBkcmlsbGVyID0gbmV3IERyaWxsZXIoe1xuICAgICAgICAgICAgZGlzY2lwbGluZTogJ3RhaUNoaScsXG4gICAgICAgICAgICBzdGFydFBvc2l0aW9uOiB7XG4gICAgICAgICAgICAgICAgY29vcmRzOiBbMSwgMV0sXG4gICAgICAgICAgICAgICAgZnJvbnRGb290OiAnTGVmdCdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHNweU9uKGRyaWxsZXIsICdmaXJlJyk7XG4gICAgfSk7XG5cblxuICAgIGl0KCdzaG91bGQgY29ycmVjdGx5IGRlZmluZSBhIHN0ZXAgbW92ZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZXhwZWN0KGNoZWNrRW51bWVyYWJsZSgnc3RlcCcsIGRyaWxsZXIuY29uZi5zdGVwcykpLnRvQmVUcnV0aHkoKTtcbiAgICAgICAgZHJpbGxlci5hZGp1c3RQb3NpdGlvbignc3RlcCcpO1xuICAgICAgICBleHBlY3QoZHJpbGxlci5maXJlKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCgnc3RlcCcsIHtcbiAgICAgICAgICAgIGRpcmVjdGlvbjogJ05vcnRoJyxcbiAgICAgICAgICAgIGZyb250Rm9vdDogJ1JpZ2h0JyxcbiAgICAgICAgICAgIGxhc3RTdGVwOiAnc3RlcCcsXG4gICAgICAgICAgICBjb29yZHM6IFsyLCAxXVxuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgY29ycmVjdGx5IGRlZmluZSBhIGJhY2sgbW92ZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZXhwZWN0KGNoZWNrRW51bWVyYWJsZSgnYmFjaycsIGRyaWxsZXIuY29uZi5zdGVwcykpLnRvQmVUcnV0aHkoKTtcbiAgICAgICAgZHJpbGxlci5hZGp1c3RQb3NpdGlvbignYmFjaycpO1xuICAgICAgICBleHBlY3QoZHJpbGxlci5maXJlKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCgnc3RlcCcsIHtcbiAgICAgICAgICAgIGRpcmVjdGlvbjogJ05vcnRoJyxcbiAgICAgICAgICAgIGZyb250Rm9vdDogJ1JpZ2h0JyxcbiAgICAgICAgICAgIGxhc3RTdGVwOiAnYmFjaycsXG4gICAgICAgICAgICBjb29yZHM6IFswLCAxXVxuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgY29ycmVjdGx5IGRlZmluZSBhIHNoaWZ0IG1vdmUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGV4cGVjdChjaGVja0VudW1lcmFibGUoJ3NoaWZ0JywgZHJpbGxlci5jb25mLnN0ZXBzKSkudG9CZVRydXRoeSgpO1xuICAgICAgICBkcmlsbGVyLmFkanVzdFBvc2l0aW9uKCdzaGlmdCcpO1xuICAgICAgICBleHBlY3QoZHJpbGxlci5maXJlKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCgnc3RlcCcsIHtcbiAgICAgICAgICAgIGRpcmVjdGlvbjogJ0Vhc3QnLFxuICAgICAgICAgICAgZnJvbnRGb290OiAnUmlnaHQnLFxuICAgICAgICAgICAgbGFzdFN0ZXA6ICdzaGlmdCcsXG4gICAgICAgICAgICBjb29yZHM6IFsxLCAxXVxuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgY29ycmVjdGx5IGRlZmluZSBhIHN3aXRjaCBtb3ZlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICBleHBlY3QoY2hlY2tFbnVtZXJhYmxlKCdzd2l0Y2gnLCBkcmlsbGVyLmNvbmYuc3RlcHMpKS50b0JlVHJ1dGh5KCk7XG4gICAgICAgIGRyaWxsZXIuYWRqdXN0UG9zaXRpb24oJ3N3aXRjaCcpO1xuICAgICAgICBleHBlY3QoZHJpbGxlci5maXJlKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCgnc3RlcCcsIHtcbiAgICAgICAgICAgIGRpcmVjdGlvbjogJ05vcnRoJyxcbiAgICAgICAgICAgIGZyb250Rm9vdDogJ1JpZ2h0JyxcbiAgICAgICAgICAgIGxhc3RTdGVwOiAnc3dpdGNoJyxcbiAgICAgICAgICAgIGNvb3JkczogWzEsIDFdXG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBjb3JyZWN0bHkgZGVmaW5lIGEgaW5zaWRlIG1vdmUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGRyaWxsZXIuYWRqdXN0UG9zaXRpb24oJ2luc2lkZScpO1xuICAgICAgICBleHBlY3QoZHJpbGxlci5maXJlKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCgnc3RlcCcsIHtcbiAgICAgICAgICAgIGRpcmVjdGlvbjogJ05vcnRoJyxcbiAgICAgICAgICAgIGZyb250Rm9vdDogJ0xlZnQnLFxuICAgICAgICAgICAgbGFzdFN0ZXA6ICdpbnNpZGUnLFxuICAgICAgICAgICAgY29vcmRzOiBbMSwgMl1cbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGNvcnJlY3RseSBkZWZpbmUgYSBvdXRzaWRlIG1vdmUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGV4cGVjdChjaGVja0VudW1lcmFibGUoJ291dHNpZGUnLCBkcmlsbGVyLmNvbmYuc3RlcHMpKS50b0JlVHJ1dGh5KCk7XG4gICAgICAgIGRyaWxsZXIuYWRqdXN0UG9zaXRpb24oJ291dHNpZGUnKTtcbiAgICAgICAgZXhwZWN0KGRyaWxsZXIuZmlyZSkudG9IYXZlQmVlbkNhbGxlZFdpdGgoJ3N0ZXAnLCB7XG4gICAgICAgICAgICBkaXJlY3Rpb246ICdOb3J0aCcsXG4gICAgICAgICAgICBmcm9udEZvb3Q6ICdSaWdodCcsXG4gICAgICAgICAgICBsYXN0U3RlcDogJ291dHNpZGUnLFxuICAgICAgICAgICAgY29vcmRzOiBbMSwgMF1cbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGNvcnJlY3RseSBkZWZpbmUgYSB0dXJuIG1vdmUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGV4cGVjdChjaGVja0VudW1lcmFibGUoJ3R1cm4nLCBkcmlsbGVyLmNvbmYuc3RlcHMpKS50b0JlVHJ1dGh5KCk7XG4gICAgICAgIGRyaWxsZXIuYWRqdXN0UG9zaXRpb24oJ3R1cm4nKTtcbiAgICAgICAgZXhwZWN0KGRyaWxsZXIuZmlyZSkudG9IYXZlQmVlbkNhbGxlZFdpdGgoJ3N0ZXAnLCB7XG4gICAgICAgICAgICBkaXJlY3Rpb246ICdFYXN0JyxcbiAgICAgICAgICAgIGZyb250Rm9vdDogJ0xlZnQnLFxuICAgICAgICAgICAgbGFzdFN0ZXA6ICd0dXJuJyxcbiAgICAgICAgICAgIGNvb3JkczogWzEsIDBdXG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBjb3JyZWN0bHkgZGVmaW5lIGEgb25HdWFyZCBtb3ZlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICBleHBlY3QoY2hlY2tFbnVtZXJhYmxlKCdvbkd1YXJkJywgZHJpbGxlci5jb25mLnN0ZXBzKSkudG9CZUZhbHN5KCk7XG4gICAgICAgIGRyaWxsZXIuYWRqdXN0UG9zaXRpb24oJ29uR3VhcmQnKTtcbiAgICAgICAgZXhwZWN0KGRyaWxsZXIuZmlyZSkudG9IYXZlQmVlbkNhbGxlZFdpdGgoJ3N0ZXAnLCB7XG4gICAgICAgICAgICBkaXJlY3Rpb246ICdOb3J0aCcsXG4gICAgICAgICAgICBmcm9udEZvb3Q6ICdMZWZ0JyxcbiAgICAgICAgICAgIGxhc3RTdGVwOiAnb25HdWFyZCcsXG4gICAgICAgICAgICBjb29yZHM6IFsxLCAxXVxuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgY29ycmVjdGx5IGRlZmluZSBhIHd1Q2hpIG1vdmUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGV4cGVjdChjaGVja0VudW1lcmFibGUoJ3d1Q2hpJywgZHJpbGxlci5jb25mLnN0ZXBzKSkudG9CZUZhbHN5KCk7XG4gICAgICAgIGRyaWxsZXIuYWRqdXN0UG9zaXRpb24oJ3d1Q2hpJyk7XG5cbiAgICAgICAgZXhwZWN0KGRyaWxsZXIuZmlyZSkudG9IYXZlQmVlbkNhbGxlZFdpdGgoJ3N0ZXAnLCB7XG4gICAgICAgICAgICBkaXJlY3Rpb246ICdOb3J0aCcsXG4gICAgICAgICAgICBmcm9udEZvb3Q6IG51bGwsXG4gICAgICAgICAgICBsYXN0U3RlcDogJ3d1Q2hpJyxcbiAgICAgICAgICAgIGNvb3JkczogWzEsIDFdXG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG59KTsiLCIvKmdsb2JhbCBkZXNjcmliZTpmYWxzZSwgamFzbWluZTpmYWxzZSwgYmVmb3JlRWFjaDpmYWxzZSwgYWZ0ZXJFYWNoOmZhbHNlLHJ1bnM6ZmFsc2Usd2FpdHM6ZmFsc2UsZXhwZWN0OmZhbHNlLGl0OmZhbHNlLHNweU9uOmZhbHNlICovXG5kZXNjcmliZSgnbWl4aW5zL2V2ZW50LWVtaXR0ZXInLCBmdW5jdGlvbiAoKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgZXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnLi4vLi4vLi4vc3JjL21peGlucy9ldmVudC1lbWl0dGVyJyksXG4gICAgICAgIGVtaXR0ZXIxLFxuICAgICAgICBzdWJzY3JpYmVyMSxcbiAgICAgICAgZW1pdHRlcjIsXG4gICAgICAgIHN1YnNjcmliZXIyO1xuICAgIFxuICAgIGJlZm9yZUVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgIGVtaXR0ZXIxID0gZXZlbnRFbWl0dGVyLmFwcGx5KHt9KTtcbiAgICAgICAgZW1pdHRlcjIgPSBldmVudEVtaXR0ZXIuYXBwbHkoe30pO1xuICAgIH0pO1xuXG4gICAgYWZ0ZXJFYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZXZlbnRFbWl0dGVyLmNsZWFuVXAoKTtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKCd1dGlsaXRpZXMnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGl0KCdzaG91bGQgYmUgcG9zc2libGUgdG8gY2xlYXIgYWxsIHN1YnNjcmlwdGlvbnMnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgc3B5ID0gamFzbWluZS5jcmVhdGVTcHkoKTtcbiAgICAgICAgICAgIGVtaXR0ZXIxLm9uKCdldmVudCcsIHNweSk7XG4gICAgICAgICAgICBldmVudEVtaXR0ZXIuY2xlYW5VcCgpO1xuICAgICAgICAgICAgZW1pdHRlcjEuZmlyZSgnZXZlbnQnKTtcbiAgICAgICAgICAgIGV4cGVjdChzcHkpLm5vdC50b0hhdmVCZWVuQ2FsbGVkKCk7XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKCdzdWJzY3JpYmluZyAodGhlIFxcJ29uXFwnIG1ldGhvZCknLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGl0KCdzaG91bGQgZXhwZWN0IGFuIGV2ZW50IG5hbWUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBleHBlY3QoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGVtaXR0ZXIxLm9uKGZ1bmN0aW9uICgpIHt9LCBmdW5jdGlvbiAoKSB7fSwge30pO1xuICAgICAgICAgICAgICAgIGVtaXR0ZXIxLm9uKHVuZGVmaW5lZCwgZnVuY3Rpb24gKCkge30sIHt9KTtcbiAgICAgICAgICAgIH0pLnRvVGhyb3coKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3Nob3VsZCBhbGxvdyBzZXZlcmFsIGV2ZW50IG5hbWVzIHRvIGJlIHN1YnNjcmliZWQgdG8gYXQgb25jZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBzcHkgPSBqYXNtaW5lLmNyZWF0ZVNweSgpO1xuICAgICAgICAgICAgZW1pdHRlcjEub24oJ2V2ZW50MSBldmVudDInLCBzcHkpO1xuICAgICAgICAgICAgZW1pdHRlcjEuZmlyZSgnZXZlbnQxJyk7XG4gICAgICAgICAgICBlbWl0dGVyMS5maXJlKCdldmVudDInKTtcbiAgICAgICAgICAgIGV4cGVjdChzcHkuY2FsbHMubGVuZ3RoKS50b0JlKDIpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnc2hvdWxkIGFsbG93IHNldmVyYWwgZXZlbnQgbmFtZXMgZm9yIG9uZSBlbWl0dGVyJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHNweTEgPSBqYXNtaW5lLmNyZWF0ZVNweSgpLFxuICAgICAgICAgICAgICAgIHNweTIgPSBqYXNtaW5lLmNyZWF0ZVNweSgpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBlbWl0dGVyMS5vbignZXZlbnQxJywgc3B5MSk7XG4gICAgICAgICAgICBlbWl0dGVyMS5vbignZXZlbnQyJywgc3B5Mik7XG5cbiAgICAgICAgICAgIGVtaXR0ZXIxLmZpcmUoJ2V2ZW50MScpO1xuICAgICAgICAgICAgZXhwZWN0KHNweTEpLnRvSGF2ZUJlZW5DYWxsZWQoKTtcbiAgICAgICAgICAgIGV4cGVjdChzcHkyKS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnc2hvdWxkIGV4cGVjdCBhIGNhbGxiYWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZXhwZWN0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBlbWl0dGVyMS5vbignZXZlbnQnLCB1bmRlZmluZWQsIHt9KTtcbiAgICAgICAgICAgICAgICBlbWl0dGVyMS5vbignZXZlbnQnLCB7fSwge30pO1xuICAgICAgICAgICAgfSkudG9UaHJvdygpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnc2hvdWxkIHVzZSBhIGNvbnRleHQgd2hlbiBwcm92aWRlZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBnaXZlbkNvbnRleHQgPSB7fSxcbiAgICAgICAgICAgICAgICB1c2VkQ29udGV4dCxcbiAgICAgICAgICAgICAgICBjYWxsYmFjayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgdXNlZENvbnRleHQgPSB0aGlzO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICBlbWl0dGVyMS5vbignZXZlbnQnLCBjYWxsYmFjaywgZ2l2ZW5Db250ZXh0KTtcbiAgICAgICAgICAgIGVtaXR0ZXIxLmZpcmUoJ2V2ZW50Jyk7XG4gICAgICAgICAgICBleHBlY3QodXNlZENvbnRleHQpLnRvQmUoZ2l2ZW5Db250ZXh0KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3Nob3VsZCBhbGxvdyBzZXZlcmFsIGNhbGxiYWNrcyAmIGNvbnRleHRzIGZvciBhIHNpbmdsZSBldmVudCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBjYjEgPSBqYXNtaW5lLmNyZWF0ZVNweSgpLmFuZENhbGxGYWtlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dFJlY29yZC5wdXNoKHRoaXMpO1xuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIGNiMiA9IGphc21pbmUuY3JlYXRlU3B5KCksXG4gICAgICAgICAgICAgICAgYzEgPSB7fSxcbiAgICAgICAgICAgICAgICBjMiA9IHt9LFxuICAgICAgICAgICAgICAgIGNvbnRleHRSZWNvcmQgPSBbXTtcblxuICAgICAgICAgICAgZW1pdHRlcjEub24oJ2V2ZW50JywgY2IxKTtcbiAgICAgICAgICAgIGVtaXR0ZXIxLm9uKCdldmVudCcsIGNiMSwgYzEpO1xuICAgICAgICAgICAgZW1pdHRlcjEub24oJ2V2ZW50JywgY2IxLCBjMik7XG4gICAgICAgICAgICBlbWl0dGVyMS5vbignZXZlbnQnLCBjYjIpO1xuICAgICAgICAgICAgZW1pdHRlcjEuZmlyZSgnZXZlbnQnKTtcbiAgICAgICAgICAgIGV4cGVjdChjYjEuY2FsbHMubGVuZ3RoKS50b0JlKDMpO1xuICAgICAgICAgICAgZXhwZWN0KGNiMi5jYWxscy5sZW5ndGgpLnRvQmUoMSk7XG4gICAgICAgICAgICBleHBlY3QoY29udGV4dFJlY29yZCkudG9FcXVhbChbd2luZG93LCBjMSwgYzJdKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3Nob3VsZCBhbGxvdyBldmVudHMgd2l0aCBzYW1lIG5hbWUgb24gZGlmZmVybmVudCBlbWl0dGVycycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBzcHkxID0gamFzbWluZS5jcmVhdGVTcHkoKSxcbiAgICAgICAgICAgICAgICBzcHkyID0gamFzbWluZS5jcmVhdGVTcHkoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZW1pdHRlcjEub24oJ2V2ZW50Jywgc3B5MSk7XG4gICAgICAgICAgICBlbWl0dGVyMi5vbignZXZlbnQnLCBzcHkyKTtcbiAgICAgICAgICAgIGVtaXR0ZXIxLmZpcmUoJ2V2ZW50Jyk7XG4gICAgICAgICAgICBleHBlY3Qoc3B5MSkudG9IYXZlQmVlbkNhbGxlZCgpO1xuICAgICAgICAgICAgZXhwZWN0KHNweTIpLm5vdC50b0hhdmVCZWVuQ2FsbGVkKCk7XG4gICAgICAgICAgICBlbWl0dGVyMi5maXJlKCdldmVudCcpO1xuICAgICAgICAgICAgZXhwZWN0KHNweTIpLnRvSGF2ZUJlZW5DYWxsZWQoKTtcbiAgICAgICAgICAgIGV4cGVjdChzcHkxLmNhbGxzLmxlbmd0aCkudG9CZSgxKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZGVzY3JpYmUoJ2dhcmJhZ2UgY29sbGVjdGlvbiBvZiBjYWxsYmFjayBsaXN0JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaXQoJ3Nob3VsZCBhbGxvdyB0aGUgbGlzdGVuaW5nIGNvbnRleHQgdG8gc2lsZW5jZSBhbGwgaXRzIHN1YnNjcmlidGlvbnMgd2hlbiBpdCBpcyBhbiBldmVudCBlbWlpdGVyIGFscmVhZHknLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIHNweSA9IGphc21pbmUuY3JlYXRlU3B5KCk7XG4gICAgICAgICAgICAgICAgZW1pdHRlcjEub24oJ2V2ZW50Jywgc3B5LCBlbWl0dGVyMik7XG4gICAgICAgICAgICAgICAgZW1pdHRlcjIuZmlyZSgnc2lsZW5jZUV2ZW50cycpO1xuICAgICAgICAgICAgICAgIGVtaXR0ZXIxLmZpcmUoJ2V2ZW50Jyk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHNweSkubm90LnRvSGF2ZUJlZW5DYWxsZWQoKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpdCgnc2hvdWxkIG1ha2UgdGhlIGxpc3RlbmluZyBjb250ZXh0IGFuIGV2ZW50RW1pdHRlciBmaXJzdCBpZiBuZWVkIGJlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBjb250ZXh0ID0ge307XG4gICAgICAgICAgICAgICAgZW1pdHRlcjEub24oJ2V2ZW50JywgZnVuY3Rpb24gKCkge30sIGNvbnRleHQpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChjb250ZXh0Lm9uKS50b0JlKGVtaXR0ZXIxLm9uKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJ3Vuc3Vic2NyaWJpbmcgKHRoZSBcXCdvZmZcXCcgbWV0aG9kKScsIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc3B5MSxcbiAgICAgICAgICAgIHNweTIsXG4gICAgICAgICAgICBjMSxcbiAgICAgICAgICAgIGMyLFxuICAgICAgICAgICAgY29udGV4dFJlY29yZDEsXG4gICAgICAgICAgICBjb250ZXh0UmVjb3JkMjtcblxuICAgICAgICBiZWZvcmVFYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNweTEgPSBqYXNtaW5lLmNyZWF0ZVNweSgpLmFuZENhbGxGYWtlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0UmVjb3JkMS5wdXNoKHRoaXMpO1xuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBzcHkyID0gamFzbWluZS5jcmVhdGVTcHkoKS5hbmRDYWxsRmFrZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgY29udGV4dFJlY29yZDIucHVzaCh0aGlzKTtcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgYzEgPSB7fSxcbiAgICAgICAgICAgIGMyID0ge30sXG4gICAgICAgICAgICBjb250ZXh0UmVjb3JkMSA9IFtdLFxuICAgICAgICAgICAgY29udGV4dFJlY29yZDIgPSBbXTtcblxuICAgICAgICAgICAgZW1pdHRlcjEub24oJ2V2ZW50Jywgc3B5MSk7XG4gICAgICAgICAgICBlbWl0dGVyMS5vbignZXZlbnQnLCBzcHkyKTtcbiAgICAgICAgICAgIGVtaXR0ZXIxLm9uKCdldmVudCcsIHNweTEsIGMxKTtcbiAgICAgICAgICAgIGVtaXR0ZXIxLm9uKCdldmVudCcsIHNweTEsIGMyKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnc2hvdWxkIGV4cGVjdCBhbiBldmVudCBuYW1lJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZXhwZWN0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBlbWl0dGVyMS5vZmYoZnVuY3Rpb24gKCkge30pO1xuICAgICAgICAgICAgICAgIGVtaXR0ZXIxLm9mZih1bmRlZmluZWQpO1xuICAgICAgICAgICAgfSkudG9UaHJvdygpO1xuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ3Nob3VsZCBhbGxvdyBzZXZlcmFsIGV2ZW50IG5hbWVzIHRvIGJlIHVuc3Vic2NyaWJlZCBmcm9tIGF0IG9uY2UnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBlbWl0dGVyMi5vbignZXZlbnQxIGV2ZW50MicsIHNweTEpO1xuICAgICAgICAgICAgZW1pdHRlcjIub2ZmKCdldmVudDEgZXZlbnQyJyk7XG4gICAgICAgICAgICBlbWl0dGVyMi5maXJlKCdldmVudDEnKTtcbiAgICAgICAgICAgIGVtaXR0ZXIyLmZpcmUoJ2V2ZW50MicpO1xuICAgICAgICAgICAgZXhwZWN0KHNweTEpLm5vdC50b0hhdmVCZWVuQ2FsbGVkKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdzaG91bGQgdW5zdWJzY3JpYmUgYWxsIGNhbGxiYWNrcyB3aGVuIG5vIGNhbGxiYWNrIG9yIGNvbnRleHQgc3BlY2lmaWVkJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZW1pdHRlcjEub2ZmKCdldmVudCcpO1xuICAgICAgICAgICAgZW1pdHRlcjEuZmlyZSgnZXZlbnQnKTtcbiAgICAgICAgICAgIGV4cGVjdChzcHkxKS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpO1xuICAgICAgICAgICAgZXhwZWN0KHNweTIpLm5vdC50b0hhdmVCZWVuQ2FsbGVkKCk7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgnc2hvdWxkIHVuc3Vic2NyaWJlIG9ubHkgY2FsbGJhY2tzIG1hdGNoaW5nIGEgc3BlY2lmaWVkIGNhbGxiYWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZW1pdHRlcjEub2ZmKCdldmVudCcsIHNweTEpO1xuICAgICAgICAgICAgZW1pdHRlcjEuZmlyZSgnZXZlbnQnKTtcbiAgICAgICAgICAgIGV4cGVjdChzcHkxKS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpO1xuICAgICAgICAgICAgZXhwZWN0KHNweTIpLnRvSGF2ZUJlZW5DYWxsZWQoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCdzaG91bGQgdW5zdWJzY3JpYmUgb25seSBjYWxsYmFja3MgbWF0Y2hpbmcgYSBzcGVjaWZpZWQgY29udGV4dCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGVtaXR0ZXIxLm9mZignZXZlbnQnLCB1bmRlZmluZWQsIGMxKTtcbiAgICAgICAgICAgIGVtaXR0ZXIxLmZpcmUoJ2V2ZW50Jyk7XG4gICAgICAgICAgICBleHBlY3Qoc3B5MSkudG9IYXZlQmVlbkNhbGxlZCgpO1xuICAgICAgICAgICAgZXhwZWN0KHNweTEuY2FsbHMubGVuZ3RoKS50b0JlKDIpO1xuICAgICAgICAgICAgZXhwZWN0KGNvbnRleHRSZWNvcmQxKS50b0VxdWFsKFt3aW5kb3csIGMyXSk7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgnc2hvdWxkIHVuc3Vic2NyaWJlIG9ubHkgY2FsbGJhY2tzIGZvciB0aGUgZ2l2ZW4gZW1pdHRlcicsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGVtaXR0ZXIyLm9uKCdldmVudCcsIHNweTIpO1xuICAgICAgICAgICAgZW1pdHRlcjEub2ZmKCdldmVudCcpO1xuICAgICAgICAgICAgZW1pdHRlcjIuZmlyZSgnZXZlbnQnKTtcbiAgICAgICAgICAgIGV4cGVjdChzcHkyKS50b0hhdmVCZWVuQ2FsbGVkKCk7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgnc2hvdWxkIGNvcGUgd2VsbCB3aXRoIG5vbi1leGlzdGVudCBldmVudHMnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBleHBlY3QoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGVtaXR0ZXIxLm9mZignbm9uRXZlbnQnKTtcbiAgICAgICAgICAgIH0pLm5vdC50b1Rocm93KCk7XG4gICAgICAgICAgICBlbWl0dGVyMS5maXJlKCdldmVudCcpO1xuICAgICAgICAgICAgZXhwZWN0KHNweTEpLnRvSGF2ZUJlZW5DYWxsZWQoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCdzaG91bGQgY29wZSB3ZWxsIHdpdGggc28gZmFyIHVudXNlZCBlbWl0dGVycycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGV4cGVjdChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgZW1pdHRlcjIub2ZmKCdldmVudCcpO1xuICAgICAgICAgICAgfSkubm90LnRvVGhyb3coKTtcbiAgICAgICAgICAgIGVtaXR0ZXIyLm9uKCdldmVudCcsIHNweTEpO1xuICAgICAgICAgICAgZW1pdHRlcjIuZmlyZSgnZXZlbnQnKTtcbiAgICAgICAgICAgIGV4cGVjdChzcHkxKS50b0hhdmVCZWVuQ2FsbGVkKCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJ3B1Ymxpc2hpbmcgKHRoZSBcXCdmaXJlXFwnIG1ldGhvZCknLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBzcHkxLFxuICAgICAgICAgICAgc3B5MixcbiAgICAgICAgICAgIGMxO1xuXG4gICAgICAgIGJlZm9yZUVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc3B5MSA9IGphc21pbmUuY3JlYXRlU3B5KCksXG4gICAgICAgICAgICBzcHkyID0gamFzbWluZS5jcmVhdGVTcHkoKSxcbiAgICAgICAgICAgIGMxID0ge307XG5cbiAgICAgICAgICAgIGVtaXR0ZXIxLm9uKCdldmVudCcsIHNweTEsIGMxKTtcbiAgICAgICAgICAgIGVtaXR0ZXIyLm9uKCdldmVudCcsIHNweTIpO1xuICAgICAgICB9KTtcblxuXG4gICAgICAgIGl0KCdzaG91bGQgb25seSBmaXJlIGZvciB0aGUgZ2l2ZW4gZW1pdHRlcicsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGVtaXR0ZXIxLmZpcmUoJ2V2ZW50Jyk7XG4gICAgICAgICAgICBleHBlY3Qoc3B5MSkudG9IYXZlQmVlbkNhbGxlZCgpO1xuICAgICAgICAgICAgZXhwZWN0KHNweTIpLm5vdC50b0hhdmVCZWVuQ2FsbGVkKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdzaG91bGQgYWxsb3cgZmlyaW5nIHNldmVyYWwgZXZlbnRzIGF0IG9uY2UnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBlbWl0dGVyMS5vbignZXZlbnQxIGV2ZW50MicsIHNweTEpO1xuICAgICAgICAgICAgZW1pdHRlcjEuZmlyZSgnZXZlbnQxIGV2ZW50MicpO1xuICAgICAgICAgICAgZXhwZWN0KHNweTEuY2FsbHMubGVuZ3RoKS50b0JlKDIpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnc2hvdWxkIHBhc3MgZGF0YSwgZXZlbnQgbmFtZSBhbmQgY29udGV4dCB0byB0aGUgY2FsbGJhY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IHt9O1xuICAgICAgICAgICAgZW1pdHRlcjEuZmlyZSgnZXZlbnQnLCBkYXRhKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0KHNweTEubW9zdFJlY2VudENhbGwuYXJnc1swXSkudG9CZShkYXRhKTtcbiAgICAgICAgICAgIGV4cGVjdChzcHkxLm1vc3RSZWNlbnRDYWxsLmFyZ3NbMV0pLnRvQmUoJ2V2ZW50Jyk7XG4gICAgICAgICAgICBleHBlY3Qoc3B5MS5tb3N0UmVjZW50Q2FsbC5hcmdzWzJdKS50b0JlKGVtaXR0ZXIxKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3Nob3VsZCBjYWxsIGNhbGxiYWNrcyB3aXRoIHNwZWNpZmllZCBjb250ZXh0cycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGVtaXR0ZXIxLmZpcmUoJ2V2ZW50Jyk7XG4gICAgICAgICAgICBleHBlY3Qoc3B5MS5tb3N0UmVjZW50Q2FsbC5vYmplY3QpLnRvQmUoYzEpO1xuICAgICAgICB9KTtcblxuICAgIH0pO1xufSk7IiwiLypnbG9iYWwgeGRlc2NyaWJlOiBmYWxzZSwgeGl0OiBmYWxzZSwgZGVzY3JpYmU6ZmFsc2UsIGphc21pbmU6ZmFsc2UsIGJlZm9yZUVhY2g6ZmFsc2UsIGFmdGVyRWFjaDpmYWxzZSxydW5zOmZhbHNlLHdhaXRzOmZhbHNlLGV4cGVjdDpmYWxzZSxpdDpmYWxzZSxzcHlPbjpmYWxzZSAqL1xuXG54ZGVzY3JpYmUoJ21vZHVsZXMvY2FsbGVyJywgZnVuY3Rpb24gKCkge1xuICAgIFxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBDYWxsZXIgPSByZXF1aXJlKCcuLi8uLi8uLi9zcmMvbW9kdWxlcy9jYWxsZXInKSxcbiAgICAgICAgZXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnLi4vLi4vLi4vc3JjL21peGlucy9ldmVudC1lbWl0dGVyJyksXG4gICAgICAgIGNhbGxlcjtcbiAgICBhZnRlckVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgYXVkaW9UYWcgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYXVkaW8nKVswXTtcbiAgICAgICAgaWYgKGF1ZGlvVGFnKSB7XG4gICAgICAgICAgICBhdWRpb1RhZy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGF1ZGlvVGFnKTsgICAgXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfSk7XG4gICAgZGVzY3JpYmUoJ2luaXRpYWxpc2F0aW9uJywgZnVuY3Rpb24gKCkge1xuICAgICAgICBpdCgnc2hvdWxkIGV4cGVjdCB0byBiZSBwYXNzZWQgYSBzdWl0YWJsZSBldmVudCBlbWl0dGVyJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZXhwZWN0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBuZXcgQ2FsbGVyKHt9KTtcbiAgICAgICAgICAgIH0pLnRvVGhyb3coKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3Nob3VsZCBhZGQgYSBodG1sNSBhdWRpbyB0YWcgdG8gdGhlIHBhZ2UnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBuZXcgQ2FsbGVyKGV2ZW50RW1pdHRlci5hcHBseSh7fSkpO1xuICAgICAgICAgICAgZXhwZWN0KGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdhdWRpbycpLmxlbmd0aCkudG9CZSgxKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgnY2FsbGluZyBvdXQgc3RlcHMnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGl0KCdzaG91bGQgbGlzdGVuIHRvIHRoZSBzdGVwIGV2ZW50IG9uIHRoZSBkcmlsbGVyJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc3B5T24oQ2FsbGVyLnByb3RvdHlwZSwgJ2NhbGxTdGVwJyk7XG5cbiAgICAgICAgICAgIHZhciBkcmlsbGVyID0gZXZlbnRFbWl0dGVyLmFwcGx5KHt9KSxcbiAgICAgICAgICAgICAgICBjYWxsZXIgPSBuZXcgQ2FsbGVyKGRyaWxsZXIpO1xuXG4gICAgICAgICAgICBkcmlsbGVyLmZpcmUoJ3N0ZXAnKTtcblxuICAgICAgICAgICAgZXhwZWN0KGNhbGxlci5jYWxsU3RlcCkudG9IYXZlQmVlbkNhbGxlZCgpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnc2hvdWxkIHBsYXkgdGhlIGNvcnJlY3QgYXVkaW8nLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYXVkaW9UYWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhdWRpbycpO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBhdWRpb1RhZy5wbGF5ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgY2FsbGVyID0gbmV3IENhbGxlcihldmVudEVtaXR0ZXIuYXBwbHkoe1xuICAgICAgICAgICAgICAgICAgICBkaXNjaXBsaW5lOiAnaG9uZ0tvbmcnXG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgIGNhbGxlci5jYWxsU3RlcCh7XG4gICAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogJ05vcnRoJyxcbiAgICAgICAgICAgICAgICAgICAgZnJvbnRGb290OiAnTGVmdCcsXG4gICAgICAgICAgICAgICAgICAgIGxhc3RTdGVwOiAndGVzdFN0ZXAnLFxuICAgICAgICAgICAgICAgICAgICBjb29yZHM6ICcwOjAnXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdhdWRpbycpWzBdLmdldEF0dHJpYnV0ZSgnc3JjJykpLnRvQmUoJ2Fzc2V0cy9hdWRpby9ob25nLWtvbmcvdGVzdC1zdGVwLm9nZycpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9KTtcbn0pOyIsIi8qZ2xvYmFsIFRlc3RIZWxwZXJzOmZhbHNlLCBkZXNjcmliZTpmYWxzZSwgamFzbWluZTpmYWxzZSwgYmVmb3JlRWFjaDpmYWxzZSwgYWZ0ZXJFYWNoOmZhbHNlLHJ1bnM6ZmFsc2Usd2FpdHM6ZmFsc2UsZXhwZWN0OmZhbHNlLGl0OmZhbHNlLHNweU9uOmZhbHNlICovXG5kZXNjcmliZSgnbW9kdWxlcy9jb250cm9sLXBhbmVsJywgZnVuY3Rpb24gKCkge1xuICAgIHZhciBDb250cm9sUGFuZWwgPSByZXF1aXJlKCcuLi8uLi8uLi9zcmMvbW9kdWxlcy9jb250cm9sLXBhbmVsJyksXG4gICAgICAgIGV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJy4uLy4uLy4uL3NyYy9taXhpbnMvZXZlbnQtZW1pdHRlcicpLFxuICAgICAgICBjb250cm9sUGFuZWw7XG4gICAgICAgIFxuICAgIGRlc2NyaWJlKCdpbml0aWFsaXNhdGlvbicsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaXQoJ3Nob3VsZCByZXF1aXJlIGFuIGV2ZW50IGVtaXR0ZXIgYXMgYSBjb250cm9sbGVyJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZXhwZWN0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBuZXcgQ29udHJvbFBhbmVsKHVuZGVmaW5lZCwge30pO1xuICAgICAgICAgICAgfSkudG9UaHJvdygpO1xuICAgICAgICAgICAgZXhwZWN0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBuZXcgQ29udHJvbFBhbmVsKHt9LCB7fSk7XG4gICAgICAgICAgICB9KS50b1Rocm93KCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuICAgIFxuICAgIGRlc2NyaWJlKCdiaW5kaW5ncycsIGZ1bmN0aW9uICgpIHtcblxuICAgICAgICB2YXIgZm9ybSxcbiAgICAgICAgICAgIGZpZWxkMSxcbiAgICAgICAgICAgIGZpZWxkMixcbiAgICAgICAgICAgIGJ1dHRvbjEsXG4gICAgICAgICAgICBidXR0b24yLFxuICAgICAgICAgICAgaW5pdGlhbGx5VHJ1ZSxcbiAgICAgICAgICAgIGluaXRpYWxseUZhbHNlO1xuXG4gICAgICAgIGJlZm9yZUVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZm9ybSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2Zvcm0nKTtcbiAgICAgICAgICAgIGZpZWxkMSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG4gICAgICAgICAgICBidXR0b24xID0gZmllbGQxLmNsb25lTm9kZSgpO1xuICAgICAgICAgICAgZmllbGQxLmlkID0gJ2ZpZWxkMSc7XG4gICAgICAgICAgICBidXR0b24xLmlkID0gJ2FjdGlvbjEnO1xuICAgICAgICAgICAgZm9ybS5hcHBlbmRDaGlsZChmaWVsZDEpO1xuICAgICAgICAgICAgZm9ybS5hcHBlbmRDaGlsZChidXR0b24xKTtcbiAgICAgICAgICAgIGZpZWxkMiA9IGZpZWxkMS5jbG9uZU5vZGUoKTtcbiAgICAgICAgICAgIGJ1dHRvbjIgPSBidXR0b24xLmNsb25lTm9kZSgpO1xuICAgICAgICAgICAgZmllbGQyLmlkID0gJ2ZpZWxkMic7XG4gICAgICAgICAgICBidXR0b24yLmlkID0gJ2FjdGlvbjInO1xuICAgICAgICAgICAgZm9ybS5hcHBlbmRDaGlsZChmaWVsZDIpO1xuICAgICAgICAgICAgZm9ybS5hcHBlbmRDaGlsZChidXR0b24yKTtcbiAgICAgICAgICAgIGluaXRpYWxseVRydWUgPSBmaWVsZDEuY2xvbmVOb2RlKCk7XG4gICAgICAgICAgICBpbml0aWFsbHlUcnVlLmlkID0gJ2luaXRpYWxseVRydWUnO1xuICAgICAgICAgICAgaW5pdGlhbGx5VHJ1ZS50eXBlID0gJ2NoZWNrYm94JztcbiAgICAgICAgICAgIGZvcm0uYXBwZW5kQ2hpbGQoaW5pdGlhbGx5VHJ1ZSk7XG4gICAgICAgICAgICBpbml0aWFsbHlGYWxzZSA9IGluaXRpYWxseVRydWUuY2xvbmVOb2RlKCk7XG4gICAgICAgICAgICBpbml0aWFsbHlGYWxzZS5pZCA9ICdpbml0aWFsbHlGYWxzZSc7XG4gICAgICAgICAgICBmb3JtLmFwcGVuZENoaWxkKGluaXRpYWxseUZhbHNlKTtcbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdib2R5JylbMF0uYXBwZW5kQ2hpbGQoZm9ybSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGFmdGVyRWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBmb3JtLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZm9ybSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGRlc2NyaWJlKCd1cGRhdGluZyBwcm9wZXJ0aWVzJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGNvbnRyb2xsZXI7XG5cbiAgICAgICAgICAgIGJlZm9yZUVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXIgPSBldmVudEVtaXR0ZXIuYXBwbHkoe1xuICAgICAgICAgICAgICAgICAgICBjb25mOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWVsZDE6ICd2YWwxJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpZWxkMjogJ3ZhbDInLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5pdGlhbGx5VHJ1ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGluaXRpYWxseUZhbHNlOiBmYWxzZVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBhY3Rpb24xOiBqYXNtaW5lLmNyZWF0ZVNweSgpLFxuICAgICAgICAgICAgICAgICAgICBhY3Rpb24yOiBqYXNtaW5lLmNyZWF0ZVNweSgpXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaXQoJ3Nob3VsZCBjb3BlIHdlbGwgd2l0aCBtaXNzaW5nIGZpZWxkcycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBleHBlY3QoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBuZXcgQ29udHJvbFBhbmVsKGNvbnRyb2xsZXIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpZWxkTGlzdDogWydmaWVsZDMnXVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KS5ub3QudG9UaHJvdygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGl0KCdzaG91bGQgc2V0IHZhbHVlcyBmcm9tIGNvbnRyb2xsZXInLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgbmV3IENvbnRyb2xQYW5lbChjb250cm9sbGVyLCB7XG4gICAgICAgICAgICAgICAgICAgIGZpZWxkTGlzdDogWydmaWVsZDEnLCAnZmllbGQyJywgJ2luaXRpYWxseVRydWUnLCAnaW5pdGlhbGx5RmFsc2UnXVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGV4cGVjdChmaWVsZDEudmFsdWUpLnRvQmUoJ3ZhbDEnKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoZmllbGQyLnZhbHVlKS50b0JlKCd2YWwyJyk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGluaXRpYWxseVRydWUuY2hlY2tlZCkudG9CZVRydXRoeSgpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChpbml0aWFsbHlGYWxzZS5jaGVja2VkKS50b0JlRmFsc3koKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpdCgnc2hvdWxkIGFsZXJ0IHRoZSBjb250cm9sbGVyIG9mIGNoYW5nZXMgdG8gYm91bmQgdmFsdWUgZmllbGRzJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIG5ldyBDb250cm9sUGFuZWwoY29udHJvbGxlciwge1xuICAgICAgICAgICAgICAgICAgICBmaWVsZExpc3Q6IFsnZmllbGQxJywgJ2ZpZWxkMiddXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgc3B5T24oY29udHJvbGxlciwgJ2ZpcmUnKTtcblxuICAgICAgICAgICAgICAgIGZpZWxkMS52YWx1ZSA9ICduZXdWYWwxJyxcbiAgICAgICAgICAgICAgICBUZXN0SGVscGVycy5maXJlRXZlbnQoZmllbGQxLCAnY2hhbmdlJyk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGNvbnRyb2xsZXIuZmlyZS5jYWxscy5sZW5ndGgpLnRvQmUoMSk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGNvbnRyb2xsZXIuZmlyZSkudG9IYXZlQmVlbkNhbGxlZFdpdGgoJ2NvbmZpZ0NoYW5nZScsIHtcbiAgICAgICAgICAgICAgICAgICAgZmllbGQxOiAnbmV3VmFsMSdcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBleHBlY3QoY29udHJvbGxlci5jb25mLmZpZWxkMSkudG9CZSgnbmV3VmFsMScpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChjb250cm9sbGVyLmNvbmYuZmllbGQyKS50b0JlKCd2YWwyJyk7XG4gICAgICAgICAgICAgICAgZmllbGQyLnZhbHVlID0gJ25ld1ZhbDInO1xuICAgICAgICAgICAgICAgIFRlc3RIZWxwZXJzLmZpcmVFdmVudChmaWVsZDIsICdjaGFuZ2UnKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoY29udHJvbGxlci5maXJlLmNhbGxzLmxlbmd0aCkudG9CZSgyKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoY29udHJvbGxlci5maXJlKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCgnY29uZmlnQ2hhbmdlJywge1xuICAgICAgICAgICAgICAgICAgICBmaWVsZDI6ICduZXdWYWwyJ1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGV4cGVjdChjb250cm9sbGVyLmNvbmYuZmllbGQyKS50b0JlKCduZXdWYWwyJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGl0KCdzaG91bGQgYWxlcnQgdGhlIGNvbnRyb2xsZXIgb2YgY2hhbmdlcyB0byBib29sZWFuIGZpZWxkcycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBuZXcgQ29udHJvbFBhbmVsKGNvbnRyb2xsZXIsIHtcbiAgICAgICAgICAgICAgICAgICAgZmllbGRMaXN0OiBbJ2luaXRpYWxseUZhbHNlJ11cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBzcHlPbihjb250cm9sbGVyLCAnZmlyZScpO1xuXG4gICAgICAgICAgICAgICAgaW5pdGlhbGx5RmFsc2UuY2hlY2tlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgVGVzdEhlbHBlcnMuZmlyZUV2ZW50KGluaXRpYWxseUZhbHNlLCAnY2hhbmdlJyk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGNvbnRyb2xsZXIuZmlyZS5jYWxscy5sZW5ndGgpLnRvQmUoMSk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGNvbnRyb2xsZXIuZmlyZSkudG9IYXZlQmVlbkNhbGxlZFdpdGgoJ2NvbmZpZ0NoYW5nZScsIHtcbiAgICAgICAgICAgICAgICAgICAgaW5pdGlhbGx5RmFsc2U6IHRydWVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBleHBlY3QoY29udHJvbGxlci5jb25mLmluaXRpYWxseUZhbHNlKS50b0JlKHRydWUpO1xuICAgICAgICAgICAgICAgIGluaXRpYWxseUZhbHNlLmNoZWNrZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBUZXN0SGVscGVycy5maXJlRXZlbnQoaW5pdGlhbGx5RmFsc2UsICdjaGFuZ2UnKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoY29udHJvbGxlci5maXJlLmNhbGxzLmxlbmd0aCkudG9CZSgyKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoY29udHJvbGxlci5maXJlKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCgnY29uZmlnQ2hhbmdlJywge1xuICAgICAgICAgICAgICAgICAgICBpbml0aWFsbHlGYWxzZTogZmFsc2VcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBleHBlY3QoY29udHJvbGxlci5jb25mLmluaXRpYWxseUZhbHNlKS50b0JlKGZhbHNlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBkZXNjcmliZSgnY2FsbGluZyBtZXRob2RzJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGNvbnRyb2xsZXI7XG5cbiAgICAgICAgICAgIGJlZm9yZUVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXIgPSBldmVudEVtaXR0ZXIuYXBwbHkoe1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb24xOiAndmFsMScsXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjI6ICd2YWwyJ1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGl0KCdzaG91bGQgY29wZSB3ZWxsIHdpdGggbWlzc2luZyBhY3Rpb25zJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGV4cGVjdChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIG5ldyBDb250cm9sUGFuZWwoY29udHJvbGxlciwge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uTGlzdDogWydhY3Rpb24zJ11cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSkubm90LnRvVGhyb3coKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpdCgnc2hvdWxkIGNhbGwgdGhlIG1ldGhvZCB3aGVuIGNsaWNrZWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgbmV3IENvbnRyb2xQYW5lbChjb250cm9sbGVyLCB7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbkxpc3Q6IFsnYWN0aW9uMScsICdhY3Rpb24yJ11cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBzcHlPbihjb250cm9sbGVyLCAnYWN0aW9uMScpO1xuICAgICAgICAgICAgICAgIHNweU9uKGNvbnRyb2xsZXIsICdhY3Rpb24yJyk7XG5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBUZXN0SGVscGVycy5maXJlRXZlbnQoYnV0dG9uMSwgJ2NsaWNrJyk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGNvbnRyb2xsZXIuYWN0aW9uMSkudG9IYXZlQmVlbkNhbGxlZCgpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChjb250cm9sbGVyLmFjdGlvbjIpLm5vdC50b0hhdmVCZWVuQ2FsbGVkKCk7XG5cbiAgICAgICAgICAgICAgICBUZXN0SGVscGVycy5maXJlRXZlbnQoYnV0dG9uMiwgJ2NsaWNrJyk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGNvbnRyb2xsZXIuYWN0aW9uMikudG9IYXZlQmVlbkNhbGxlZCgpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBcbn0pOyIsIi8qZ2xvYmFsIHdhaXRzRm9yOmZhbHNlLGRlc2NyaWJlOmZhbHNlLCBqYXNtaW5lOmZhbHNlLCBiZWZvcmVFYWNoOmZhbHNlLCBhZnRlckVhY2g6ZmFsc2UscnVuczpmYWxzZSx3YWl0czpmYWxzZSxleHBlY3Q6ZmFsc2UsaXQ6ZmFsc2Usc3B5T246ZmFsc2UgKi9cbmRlc2NyaWJlKCdtb2R1bGVzL2RyaWxsZXInLCBmdW5jdGlvbiAoKSB7XG4gICAgXG4gICAgdmFyIERyaWxsZXIgPSByZXF1aXJlKCcuLi8uLi8uLi9zcmMvbW9kdWxlcy9kcmlsbGVyJyksXG4gICAgICAgIGRyaWxsZXIsXG4gICAgICAgIHRlc3RDb25mID0ge1xuICAgICAgICAgICAgbmFtZTogJ3Rlc3REaXNjaXBsaW5lJyxcbiAgICAgICAgICAgIHN0ZXBzOiB7XG4gICAgICAgICAgICAgICAgbm9DaGFuZ2U6IHtcbiAgICAgICAgICAgICAgICAgICAgZnJvbnRGb290OiAwLFxuICAgICAgICAgICAgICAgICAgICBtb3ZlOiBbMCwgMF0sXG4gICAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogMFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc3RlcDoge1xuICAgICAgICAgICAgICAgICAgICBmcm9udEZvb3Q6IDEsXG4gICAgICAgICAgICAgICAgICAgIG1vdmU6IFsxLCAwXSxcbiAgICAgICAgICAgICAgICAgICAgZGlyZWN0aW9uOiAwXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICByb3RhdGVPdXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgZnJvbnRGb290OiAwLFxuICAgICAgICAgICAgICAgICAgICBtb3ZlOiBbMCwgMF0sXG4gICAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogMVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcm90YXRlSW46IHtcbiAgICAgICAgICAgICAgICAgICAgZnJvbnRGb290OiAwLFxuICAgICAgICAgICAgICAgICAgICBtb3ZlOiBbMCwgMF0sXG4gICAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogLTFcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGJhY2s6IHtcbiAgICAgICAgICAgICAgICAgICAgZnJvbnRGb290OiAxLFxuICAgICAgICAgICAgICAgICAgICBtb3ZlOiBbLTEsIDBdLFxuICAgICAgICAgICAgICAgICAgICBkaXJlY3Rpb246IDAgXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBvdXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgZnJvbnRGb290OiAwLFxuICAgICAgICAgICAgICAgICAgICBtb3ZlOiBbMCwgMV0sXG4gICAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogMCBcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICdpbic6IHtcbiAgICAgICAgICAgICAgICAgICAgZnJvbnRGb290OiAwLFxuICAgICAgICAgICAgICAgICAgICBtb3ZlOiBbMCwgLTFdLFxuICAgICAgICAgICAgICAgICAgICBkaXJlY3Rpb246IDAgXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzcGVjaWFsU3RlcDE6IHtcbiAgICAgICAgICAgICAgICAgICAgX3Byb3BlcnR5RGVmaW5pdGlvbjogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmcm9udEZvb3Q6ICdMZWZ0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vdmU6IFswLCAwXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogMFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzcGVjaWFsU3RlcDI6IHtcbiAgICAgICAgICAgICAgICAgICAgX3Byb3BlcnR5RGVmaW5pdGlvbjogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmcm9udEZvb3Q6ICdSaWdodCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtb3ZlOiBbMCwgMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3Rpb246IDBcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzdGFydFNlcXVlbmNlOiBbJ3N0ZXAnXSxcbiAgICAgICAgICAgIGVuZFNlcXVlbmNlOiBbJ25vQ2hhbmdlJ11cbiAgICAgICAgfTtcblxuICAgIERyaWxsZXIuYWRkRGlzY2lwbGluZSh0ZXN0Q29uZik7XG4gICAgRHJpbGxlci5kZWZhdWx0cy5kaXNjaXBsaW5lID0gJ3Rlc3REaXNjaXBsaW5lJztcblxuXG4gICAgZGVzY3JpYmUoJ3N0YXRpYyBtZXRob2RzJywgZnVuY3Rpb24gKCkge1xuICAgICAgICBkZXNjcmliZSgnYWRkaW5nIGNvbmZpZ3VyYXRpb24gc2V0cycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGl0KCdzaG91bGQgZXhwZWN0IGEgbmFtZSBmb3IgdGhlIGRpc2NpcGxpbmUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgRHJpbGxlci5hZGREaXNjaXBsaW5lKHt9KTtcbiAgICAgICAgICAgICAgICB9KS50b1Rocm93KCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaXQoJ3Nob3VsZCBhbGxvdyBhZGRpbmcgbXVsdGlwbGUgY29uZmlncycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBEcmlsbGVyLmFkZERpc2NpcGxpbmUoe1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnZGlzY2lwbGluZTEnXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgRHJpbGxlci5hZGREaXNjaXBsaW5lKHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ2Rpc2NpcGxpbmUyJ1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGV4cGVjdChEcmlsbGVyLmRpc2NpcGxpbmVDb25maWdzLmRpc2NpcGxpbmUxKS50b0JlRGVmaW5lZCgpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChEcmlsbGVyLmRpc2NpcGxpbmVDb25maWdzLmRpc2NpcGxpbmUyKS50b0JlRGVmaW5lZCgpO1xuICAgICAgICAgICAgfSk7XG5cblxuXG4gICAgICAgICAgICAvLyBpdCgnc2hvdWxkIGJlIGFibGUgdG8gcmV0cmlldmUgYW55IGNvbmZpZydcbiAgICAgICAgfSk7XG4gICAgfSk7XG4gICAgXG4gICAgZGVzY3JpYmUoJ2luc3RhbmNlcycsIGZ1bmN0aW9uICgpIHtcblxuICAgICAgICBkZXNjcmliZSgnaW5pdGlhbGlzYXRpb24nLCBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIGl0KCdzaG91bGQgdXNlIGRlZmF1bHQgc2V0dGluZ3MnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgRHJpbGxlci5kZWZhdWx0cy50ZXN0UHJvcCA9ICd0ZXN0JztcbiAgICAgICAgICAgICAgICBkcmlsbGVyID0gbmV3IERyaWxsZXIoKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoZHJpbGxlci5jb25mLnRlc3RQcm9wKS50b0JlKCd0ZXN0Jyk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaXQoJ3Nob3VsZCBvdmVyd3JpdGUgZGVmYXVsdCBzZXR0aW5ncyB3aXRoIGFueSBwcm92aWRlZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBEcmlsbGVyLmRlZmF1bHRzLnRlc3RQcm9wID0gJ2ZhaWwnO1xuICAgICAgICAgICAgICAgIHZhciBkcmlsbGVyID0gbmV3IERyaWxsZXIoe1xuICAgICAgICAgICAgICAgICAgICB0ZXN0UHJvcDogJ3Rlc3QnXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGRyaWxsZXIuY29uZi50ZXN0UHJvcCkudG9CZSgndGVzdCcpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGl0KCdzaG91bGQgYWRkIHN0ZXBzIGZyb20gYW4gYWxyZWFkeSBkZWZpbmVkIGNvbmZpZycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBkcmlsbGVyID0gbmV3IERyaWxsZXIoKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoZHJpbGxlci5jb25mLnN0ZXBzLnN0ZXApLnRvQmVEZWZpbmVkKCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaXQoJ3Nob3VsZCBhZGQgc3RlcHMgZnJvbSBjb25maWcgb2JqZWN0IHBhc3NlZCBpbiBpZiBkZWZpbmVkJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBkcmlsbGVyID0gbmV3IERyaWxsZXIoe1xuICAgICAgICAgICAgICAgICAgICBzdGVwczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3U3RlcDoge31cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGV4cGVjdChkcmlsbGVyLmNvbmYuc3RlcHMubmV3U3RlcCkudG9CZURlZmluZWQoKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpdCgnc2hvdWxkIG1ha2Ugc3BlY2lhbCBzdGVwcyBub24tZW51bWVyYWJsZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBkcmlsbGVyID0gbmV3IERyaWxsZXIoKTtcblxuICAgICAgICAgICAgICAgIHZhciBmb3VuZFByb3AgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBrZXkgaW4gZHJpbGxlci5jb25mLnN0ZXBzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChrZXkgPT09ICdzcGVjaWFsU3RlcDEnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3VuZFByb3AgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGV4cGVjdChmb3VuZFByb3ApLnRvQmVGYWxzeSgpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGl0KCdzaG91bGQgdXNlIHRoZSBkZWZhdWx0IHN0YXJ0IHBvc2l0aW9uJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGRyaWxsZXIgPSBuZXcgRHJpbGxlcigpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChkcmlsbGVyLmNvb3JkcykudG9FcXVhbChbMCwgMF0pO1xuICAgICAgICAgICAgICAgIGV4cGVjdChkcmlsbGVyLmZyb250Rm9vdCkudG9CZU51bGwoKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoZHJpbGxlci5kaXJlY3Rpb24pLnRvQmUoMCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaXQoJ3Nob3VsZCBhbGxvdyBkZWZpbmluZyBhIHN0YXJ0IHBvc2l0aW9uJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGRyaWxsZXIgPSBuZXcgRHJpbGxlcih7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0UG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvb3JkczogWzUsIDVdLFxuICAgICAgICAgICAgICAgICAgICAgICAgZnJvbnRGb290OiAndGVzdEZvb3QnLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0aW9uOiAndGVzdERpcmVjdGlvbidcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGV4cGVjdChkcmlsbGVyLmNvb3JkcykudG9FcXVhbChbNSwgNV0pO1xuICAgICAgICAgICAgICAgIGV4cGVjdChkcmlsbGVyLmZyb250Rm9vdCkudG9CZSgndGVzdEZvb3QnKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoZHJpbGxlci5kaXJlY3Rpb24pLnRvQmUoJ3Rlc3REaXJlY3Rpb24nKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpdCgnc2hvdWxkIGF1dG9wbGF5IGlmIHNwZWNpZmllZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3RhcnRTcHkgPSBzcHlPbihEcmlsbGVyLnByb3RvdHlwZSwgJ3N0YXJ0Jyk7XG4gICAgICAgICAgICAgICAgZHJpbGxlciA9IG5ldyBEcmlsbGVyKHtcbiAgICAgICAgICAgICAgICAgICAgYXV0b3BsYXk6IHRydWVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBleHBlY3Qoc3RhcnRTcHkpLnRvSGF2ZUJlZW5DYWxsZWQoKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpdCgnc2hvdWxkIHVzZSBkZWZhdWx0IG1heCBzdGVwIGNvdW50JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGRyaWxsZXIgPSBuZXcgRHJpbGxlcigpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChkcmlsbGVyLnN0ZXBDb3VudCkudG9CZShEcmlsbGVyLmRlZmF1bHRzLnN0ZXBDb3VudCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaXQoJ3Nob3VsZCBvdmVycmlkZSBkZWZhdWx0IG1heCBzdGVwIGNvdW50IGlmIHNwZWNpZmllZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBkcmlsbGVyID0gbmV3IERyaWxsZXIoe1xuICAgICAgICAgICAgICAgICAgICBzdGVwQ291bnQ6IDVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBleHBlY3QoZHJpbGxlci5zdGVwQ291bnQpLnRvQmUoNSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgZGVzY3JpYmUoJ211bHRpcGxlIGluc3RhbmNlcycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpdCgnc2hvdWxkIG5vdCBzaGFyZSBvbmUgY29uZmlnIG9iamVjdCBiZXR3ZWVuIGluc3RhbmNlcycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgZHJpbGxlciA9IG5ldyBEcmlsbGVyKCk7XG4gICAgICAgICAgICAgICAgICAgIGRyaWxsZXIuY29uZi5kaXNjaXBsaW5lID0gJ290aGVyRGlzY2lwbGluZSc7XG4gICAgICAgICAgICAgICAgICAgIGRyaWxsZXIgPSBuZXcgRHJpbGxlcigpO1xuICAgICAgICAgICAgICAgICAgICBleHBlY3QoZHJpbGxlci5jb25mLmRpc2NpcGxpbmUpLm5vdC50b0JlKCdvdGhlckRpc2NpcGxpbmUnKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIGRlc2NyaWJlKCdzdGFydGluZycsIGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgYmVmb3JlRWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgZHJpbGxlciA9IG5ldyBEcmlsbGVyKHtcbiAgICAgICAgICAgICAgICAgICAgc3RlcENvdW50OiAwXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgYWZ0ZXJFYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBkcmlsbGVyLnN0b3AoKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB2YXIgdGltZW91dFNweSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBzcHlPbih3aW5kb3csICdzZXRUaW1lb3V0JykuYW5kQ2FsbEZha2UoZnVuY3Rpb24gKGNhbGxiYWNrLCBkZWxheSkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaXQoJ3Nob3VsZCBhbGxvdyByZXNldHRpbmcgdG8gaW5pdGlhbCBwb3NpdGlvbicsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aW1lb3V0U3B5KCk7XG4gICAgICAgICAgICAgICAgc3B5T24oZHJpbGxlciwgJ2luaXQnKS5hbmRDYWxsVGhyb3VnaCgpO1xuICAgICAgICAgICAgICAgIGRyaWxsZXIuZGlyZWN0aW9uID0gJ3Rlc3QnO1xuICAgICAgICAgICAgICAgIGRyaWxsZXIuY29uZi5zdGFydFNlcXVlbmNlID0gWydub0NoYW5nZSddO1xuICAgICAgICAgICAgICAgIGRyaWxsZXIuc3RhcnQodHJ1ZSk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGRyaWxsZXIuaW5pdCkudG9IYXZlQmVlbkNhbGxlZCgpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChkcmlsbGVyLmRpcmVjdGlvbikudG9CZSgwKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpdCgnc2hvdWxkIGFsbG93IHJlc3RhcnRpbmcgd2hpbGUgcnVubmluZycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aW1lb3V0U3B5KCk7XG4gICAgICAgICAgICAgICAgZHJpbGxlciA9IG5ldyBEcmlsbGVyKHtcbiAgICAgICAgICAgICAgICAgICAgc3RlcENvdW50OiAwXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgZHJpbGxlci5zdGFydCgpO1xuICAgICAgICAgICAgICAgIHNweU9uKGRyaWxsZXIsICdpbml0JykuYW5kQ2FsbFRocm91Z2goKTtcbiAgICAgICAgICAgICAgICBzcHlPbihkcmlsbGVyLCAndGFrZVN0ZXAnKS5hbmRDYWxsVGhyb3VnaCgpO1xuICAgICAgICAgICAgICAgIHNweU9uKGRyaWxsZXIsICdzdGFydCcpLmFuZENhbGxUaHJvdWdoKCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZHJpbGxlci5yZXNldEFuZFN0YXJ0KCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZXhwZWN0KGRyaWxsZXIudGFrZVN0ZXAuY2FsbHNbMF0uYXJnc1swXSkudG9CZUZhbHN5KCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGRyaWxsZXIuc3RhcnQpLnRvSGF2ZUJlZW5DYWxsZWQoKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoZHJpbGxlci5pbml0KS50b0hhdmVCZWVuQ2FsbGVkKCk7XG5cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpdCgnc2hvdWxkIGFsbG93IGEgZGVsYXkgZm9yIHN0YXJ0aW5nIHRvIGJlIHNwZWNpZmllZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3RhcnRlZDtcbiAgICAgICAgICAgICAgICBydW5zKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgZHJpbGxlciA9IG5ldyBEcmlsbGVyKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0ZXBDb3VudDogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pblRpbWU6IDEsXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhUaW1lOiAxLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVsYXk6IDAuMVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3B5T24oZHJpbGxlciwgJ19zdGFydCcpLmFuZENhbGxUaHJvdWdoKCk7XG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH0sIDEwMSk7XG4gICAgICAgICAgICAgICAgICAgIGRyaWxsZXIuc3RhcnQoKTtcbiAgICAgICAgICAgICAgICAgICAgZXhwZWN0KGRyaWxsZXIuX3N0YXJ0KS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHdhaXRzRm9yKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0YXJ0ZWQ7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcnVucyhmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGV4cGVjdChkcmlsbGVyLl9zdGFydCkudG9IYXZlQmVlbkNhbGxlZCgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGl0KCdzaG91bGQgYWxsb3cgc3RhcnQgcG9zaXRpb24gdG8gYmUgcHJlc2VydmVkIHdoZW4gcmVzdGFydGluZycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aW1lb3V0U3B5KCk7XG4gICAgICAgICAgICAgICAgZHJpbGxlciA9IG5ldyBEcmlsbGVyKHtcbiAgICAgICAgICAgICAgICAgICAgc3RlcENvdW50OiAwLFxuICAgICAgICAgICAgICAgICAgICBwcmVzZXJ2ZVBvc2l0aW9uOiB0cnVlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgZHJpbGxlci5jb29yZHMgPSBbMiwzXTtcbiAgICAgICAgICAgICAgICBkcmlsbGVyLmRpcmVjdGlvbiA9IDI7XG4gICAgICAgICAgICAgICAgZHJpbGxlci5yZXNldEFuZFN0YXJ0KCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGRyaWxsZXIuY29vcmRzKS50b0VxdWFsKFsyLDNdKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoZHJpbGxlci5kaXJlY3Rpb24pLnRvRXF1YWwoMik7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaXQoJ3Nob3VsZCBmaXJlIHRoZSBzdGFydCBldmVudCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aW1lb3V0U3B5KCk7XG4gICAgICAgICAgICAgICAgdmFyIHN0YXJ0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBkcmlsbGVyLm9uKCdzdGFydGVkJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBzdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBkcmlsbGVyLnN0YXJ0KCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHN0YXJ0ZWQpLnRvQmVUcnV0aHkoKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpdCgnc2hvdWxkIGxlYXZlIHRoZSBzdGFydCBzZXF1ZW5jZSBpbiBjb25mIHVuY2hhbmdlZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aW1lb3V0U3B5KCk7XG4gICAgICAgICAgICAgICAgZHJpbGxlci5zdGFydCgpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChkcmlsbGVyLmNvbmYuc3RhcnRTZXF1ZW5jZSkudG9FcXVhbChbJ3N0ZXAnXSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgZGVzY3JpYmUoJ2ZpcnN0IHN0ZXBzJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBzdGVwcztcbiAgICAgICAgICAgICAgICBiZWZvcmVFYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgc3RlcHMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgc3B5T24oZHJpbGxlciwgJ2Fubm91bmNlU3RlcCcpLmFuZENhbGxGYWtlKGZ1bmN0aW9uIChzdGVwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGVwcy5wdXNoKHN0ZXApO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgZHJpbGxlci5jb25mLnN0YXJ0U2VxdWVuY2UgPSBbJ25vQ2hhbmdlJywgJ3N0ZXAnLCAnc3BlY2lhbFN0ZXAxJ107XG4gICAgICAgICAgICAgICAgICAgIGRyaWxsZXIuY29uZi5lbmRTZXF1ZW5jZSA9IFtdO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgaXQoJ3Nob3VsZCBwZXJmb3JtIHRoZSBzdGFydGluZyBzZXF1ZW5jZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgdGltZW91dFNweSgpO1xuICAgICAgICAgICAgICAgICAgICBkcmlsbGVyLnN0YXJ0KCk7XG4gICAgICAgICAgICAgICAgICAgIGV4cGVjdChzdGVwcykudG9FcXVhbChbJ25vQ2hhbmdlJywgJ3N0ZXAnLCAnc3BlY2lhbFN0ZXAxJ10pO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgaXQoJ3Nob3VsZCBjb250aW51ZSB3aXRoIG1vcmUgc3RlcHMgYWZ0ZXIgc3RhcnRpbmcgc2VxdWVuY2UgY29tcGxldGVkJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB0aW1lb3V0U3B5KCk7XG4gICAgICAgICAgICAgICAgICAgIGRyaWxsZXIuc3RlcENvdW50ID0gMjtcbiAgICAgICAgICAgICAgICAgICAgZHJpbGxlci5zdGFydCgpO1xuICAgICAgICAgICAgICAgICAgICBleHBlY3Qoc3RlcHMubGVuZ3RoKS50b0JlKDUpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGRlc2NyaWJlKCdpbnZhbGlkIHN0YXJ0IHNlcXVlbmNlcycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBiZWZvcmVFYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgc3B5T24oZHJpbGxlciwgJ2Fubm91bmNlU3RlcCcpLmFuZENhbGxUaHJvdWdoKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaXQoJ3Nob3VsZG5cXCd0IGFsbG93IGludmFsaWQgZmlyc3Qgc3RlcCBuYW1lJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB0aW1lb3V0U3B5KCk7XG4gICAgICAgICAgICAgICAgICAgIGRyaWxsZXIuY29uZi5zdGFydFNlcXVlbmNlID0gWydub3RBU3RlcCddO1xuICAgICAgICAgICAgICAgICAgICBleHBlY3QoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZHJpbGxlci5zdGFydCgpO1xuICAgICAgICAgICAgICAgICAgICB9KS50b1Rocm93KCk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBpdCgnc2hvdWxkblxcJ3QgYWxsb3cgaW52YWxpZCBzdWJzZXF1ZW50IHN0ZXAgbmFtZXMnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRpbWVvdXRTcHkoKTtcbiAgICAgICAgICAgICAgICAgICAgZHJpbGxlci5jb25mLnN0YXJ0U2VxdWVuY2UgPSBbJ25vQ2hhbmdlJywgJ25vdEFTdGVwJ107XG4gICAgICAgICAgICAgICAgICAgIGV4cGVjdChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkcmlsbGVyLnN0YXJ0KCk7XG4gICAgICAgICAgICAgICAgICAgIH0pLnRvVGhyb3coKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGRlc2NyaWJlKCdzdG9wcGluZycsIGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgdmFyIGRyaWxsZXI7XG5cbiAgICAgICAgICAgIGJlZm9yZUVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGphc21pbmUuQ2xvY2sudXNlTW9jaygpO1xuICAgICAgICAgICAgICAgIHNweU9uKHdpbmRvdywgJ2NsZWFyVGltZW91dCcpO1xuXG4gICAgICAgICAgICAgICAgZHJpbGxlciA9IG5ldyBEcmlsbGVyKHtcbiAgICAgICAgICAgICAgICAgICAgc3RlcENvdW50OiAtMSxcbiAgICAgICAgICAgICAgICAgICAgYXV0b3BsYXk6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0U2VxdWVuY2U6IFsnbm9DaGFuZ2UnXVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaXQoJ3Nob3VsZCBzdG9wIHRoZSB0aW1lcicsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgdGltZXIgPSBkcmlsbGVyLnRpbWVyO1xuICAgICAgICAgICAgICAgIGRyaWxsZXIuc3RvcCgpO1xuICAgICAgICAgICAgICAgIGV4cGVjdCh3aW5kb3cuY2xlYXJUaW1lb3V0KS50b0hhdmVCZWVuQ2FsbGVkV2l0aCh0aW1lcik7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaXQoJ3Nob3VsZCBmaXJlIHRoZSBzdG9wIGV2ZW50JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBzdG9wcGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgZHJpbGxlci5vbignc3RvcHBlZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgc3RvcHBlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgZHJpbGxlci5zdG9wKCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHN0b3BwZWQpLnRvQmVUcnV0aHkoKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBkZXNjcmliZSgnY2xvc2luZyBzdGVwcycsIGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgICAgIHZhciBzdGVwcztcbiAgICAgICAgICAgICAgICBiZWZvcmVFYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgc3RlcHMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgc3B5T24oZHJpbGxlciwgJ2Fubm91bmNlU3RlcCcpLmFuZENhbGxGYWtlKGZ1bmN0aW9uIChzdGVwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGVwcy5wdXNoKHN0ZXApO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgZHJpbGxlci5jb25mLmVuZFNlcXVlbmNlID0gWydub0NoYW5nZScsICdzdGVwJywgJ3NwZWNpYWxTdGVwMSddO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgaXQoJ3Nob3VsZCBwZXJmb3JtIHRoZSBjbG9zaW5nIHNlcXVlbmNlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBkcmlsbGVyLnN0b3AoKTtcbiAgICAgICAgICAgICAgICAgICAgZXhwZWN0KHN0ZXBzKS50b0VxdWFsKFsnbm9DaGFuZ2UnLCAnc3RlcCcsICdzcGVjaWFsU3RlcDEnXSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9KTtcblxuICAgICAgICBkZXNjcmliZSgnbW92aW5nIGFyb3VuZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGJlZm9yZUVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGphc21pbmUuQ2xvY2sudXNlTW9jaygpO1xuXG4gICAgICAgICAgICAgICAgZHJpbGxlciA9IG5ldyBEcmlsbGVyKHtcbiAgICAgICAgICAgICAgICAgICAgc3RlcENvdW50OiAwLFxuICAgICAgICAgICAgICAgICAgICBzdGFydFNlcXVlbmNlOiBbJ25vQ2hhbmdlJ10sXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0UG9zaXRpb246IHsgXG4gICAgICAgICAgICAgICAgICAgICAgICBjb29yZHM6IFsyLCAyXVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpdCgnc2hvdWxkIG1vdmUgZm9yd2FyZHMgYW5kIGJhY2t3YXJkcyByZWxhdGl2ZSB0byB0aGUgZ2l2ZW4gZGlyZWN0aW9uJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGRyaWxsZXIuZGlyZWN0aW9uID0gMDtcbiAgICAgICAgICAgICAgICBkcmlsbGVyLmFkanVzdFBvc2l0aW9uKCdzdGVwJyk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGRyaWxsZXIuY29vcmRzKS50b0VxdWFsKFszLDJdKTtcbiAgICAgICAgICAgICAgICBkcmlsbGVyLmRpcmVjdGlvbiA9IDE7XG4gICAgICAgICAgICAgICAgZHJpbGxlci5hZGp1c3RQb3NpdGlvbignc3RlcCcpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChkcmlsbGVyLmNvb3JkcykudG9FcXVhbChbMywzXSk7XG4gICAgICAgICAgICAgICAgZHJpbGxlci5kaXJlY3Rpb24gPSAyO1xuICAgICAgICAgICAgICAgIGRyaWxsZXIuYWRqdXN0UG9zaXRpb24oJ3N0ZXAnKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoZHJpbGxlci5jb29yZHMpLnRvRXF1YWwoWzIsIDNdKTtcbiAgICAgICAgICAgICAgICBkcmlsbGVyLmRpcmVjdGlvbiA9IDM7XG4gICAgICAgICAgICAgICAgZHJpbGxlci5hZGp1c3RQb3NpdGlvbignc3RlcCcpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChkcmlsbGVyLmNvb3JkcykudG9FcXVhbChbMiwyXSk7XG5cbiAgICAgICAgICAgICAgICBkcmlsbGVyLmRpcmVjdGlvbiA9IDA7XG4gICAgICAgICAgICAgICAgZHJpbGxlci5hZGp1c3RQb3NpdGlvbignYmFjaycpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChkcmlsbGVyLmNvb3JkcykudG9FcXVhbChbMSwyXSk7XG4gICAgICAgICAgICAgICAgZHJpbGxlci5kaXJlY3Rpb24gPSAxO1xuICAgICAgICAgICAgICAgIGRyaWxsZXIuYWRqdXN0UG9zaXRpb24oJ2JhY2snKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoZHJpbGxlci5jb29yZHMpLnRvRXF1YWwoWzEsMV0pO1xuICAgICAgICAgICAgICAgIGRyaWxsZXIuZGlyZWN0aW9uID0gMjtcbiAgICAgICAgICAgICAgICBkcmlsbGVyLmFkanVzdFBvc2l0aW9uKCdiYWNrJyk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGRyaWxsZXIuY29vcmRzKS50b0VxdWFsKFsyLCAxXSk7XG4gICAgICAgICAgICAgICAgZHJpbGxlci5kaXJlY3Rpb24gPSAzO1xuICAgICAgICAgICAgICAgIGRyaWxsZXIuYWRqdXN0UG9zaXRpb24oJ2JhY2snKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoZHJpbGxlci5jb29yZHMpLnRvRXF1YWwoWzIsMl0pO1xuXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaXQoJ3Nob3VsZCBjaGFuZ2UgdGhlIGZyb250IGZvb3Qgd2hlbiBzdGVwIHNwZWNpZmllcycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBkcmlsbGVyLmZyb250Rm9vdCA9ICdMZWZ0JztcbiAgICAgICAgICAgICAgICBkcmlsbGVyLmFkanVzdFBvc2l0aW9uKCdub0NoYW5nZScpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChkcmlsbGVyLmZyb250Rm9vdCkudG9FcXVhbCgnTGVmdCcpO1xuICAgICAgICAgICAgICAgIGRyaWxsZXIuYWRqdXN0UG9zaXRpb24oJ3N0ZXAnKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoZHJpbGxlci5mcm9udEZvb3QpLnRvRXF1YWwoJ1JpZ2h0Jyk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaXQoJ3Nob3VsZCB0YWtlIGZyb250IGZvb3QgaW50byBhY2NvdW50IHdoZW4gY2hvb3NpbmcgZGlyZWN0aW9uIGNoYW5nZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBkcmlsbGVyLmZyb250Rm9vdCA9ICdMZWZ0JztcbiAgICAgICAgICAgICAgICBkcmlsbGVyLmFkanVzdFBvc2l0aW9uKCdyb3RhdGVPdXQnKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoZHJpbGxlci5kaXJlY3Rpb24pLnRvRXF1YWwoMSk7XG4gICAgICAgICAgICAgICAgZHJpbGxlci5mcm9udEZvb3QgPSAnUmlnaHQnO1xuICAgICAgICAgICAgICAgIGRyaWxsZXIuYWRqdXN0UG9zaXRpb24oJ3JvdGF0ZU91dCcpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChkcmlsbGVyLmRpcmVjdGlvbikudG9FcXVhbCgwKTtcbiAgICAgICAgICAgICAgICBkcmlsbGVyLmFkanVzdFBvc2l0aW9uKCdyb3RhdGVJbicpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChkcmlsbGVyLmRpcmVjdGlvbikudG9FcXVhbCgxKTtcbiAgICAgICAgICAgICAgICBkcmlsbGVyLmZyb250Rm9vdCA9ICdMZWZ0JztcbiAgICAgICAgICAgICAgICBkcmlsbGVyLmFkanVzdFBvc2l0aW9uKCdyb3RhdGVJbicpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChkcmlsbGVyLmRpcmVjdGlvbikudG9FcXVhbCgwKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpdCgnc2hvdWxkIGNob29zZSBtb3ZlIHNpZGV3YXlzIGJhc2VkIG9uIGZyb250Rm9vdCBhbmQgY3VycmVudCBkaXJlY3Rpb24nLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgZHJpbGxlci5mcm9udEZvb3QgPSAnTGVmdCc7XG4gICAgICAgICAgICAgICAgZHJpbGxlci5hZGp1c3RQb3NpdGlvbignb3V0Jyk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGRyaWxsZXIuY29vcmRzKS50b0VxdWFsKFsyLDNdKTtcbiAgICAgICAgICAgICAgICBkcmlsbGVyLmZyb250Rm9vdCA9ICdSaWdodCc7XG4gICAgICAgICAgICAgICAgZHJpbGxlci5hZGp1c3RQb3NpdGlvbignb3V0Jyk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGRyaWxsZXIuY29vcmRzKS50b0VxdWFsKFsyLDJdKTtcbiAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZHJpbGxlci5mcm9udEZvb3QgPSAnTGVmdCc7XG4gICAgICAgICAgICAgICAgZHJpbGxlci5hZGp1c3RQb3NpdGlvbignaW4nKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoZHJpbGxlci5jb29yZHMpLnRvRXF1YWwoWzIsMV0pO1xuICAgICAgICAgICAgICAgIGRyaWxsZXIuZnJvbnRGb290ID0gJ1JpZ2h0JztcbiAgICAgICAgICAgICAgICBkcmlsbGVyLmFkanVzdFBvc2l0aW9uKCdpbicpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChkcmlsbGVyLmNvb3JkcykudG9FcXVhbChbMiwyXSk7XG5cbiAgICAgICAgICAgICAgICBkcmlsbGVyLmRpcmVjdGlvbiA9IDE7XG4gICAgICAgICAgICAgICAgZHJpbGxlci5mcm9udEZvb3QgPSAnTGVmdCc7XG4gICAgICAgICAgICAgICAgZHJpbGxlci5hZGp1c3RQb3NpdGlvbignaW4nKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoZHJpbGxlci5jb29yZHMpLnRvRXF1YWwoWzMsMl0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGl0KCdzaG91bGQgZmlyZSBhbiBldmVudCBvbiBldmVyeSBtb3ZlbWVudCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3B5ID0gamFzbWluZS5jcmVhdGVTcHkoKTtcbiAgICAgICAgICAgICAgICBkcmlsbGVyLm9uKCdzdGVwJywgc3B5KTtcbiAgICAgICAgICAgICAgICBkcmlsbGVyLmFkanVzdFBvc2l0aW9uKCdzdGVwJyk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHNweSkudG9IYXZlQmVlbkNhbGxlZCgpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChzcHkubW9zdFJlY2VudENhbGwuYXJnc1swXSkudG9FcXVhbCh7XG4gICAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogJ05vcnRoJyxcbiAgICAgICAgICAgICAgICAgICAgZnJvbnRGb290OiAnUmlnaHQnLFxuICAgICAgICAgICAgICAgICAgICBsYXN0U3RlcDogJ3N0ZXAnLFxuICAgICAgICAgICAgICAgICAgICBjb29yZHM6IFszLCAyXVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG5cblxuICAgICAgICB9KTtcblxuICAgICAgICBkZXNjcmliZSgnc3RlcCBzZWxlY3Rpb24nICwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZGVzY3JpYmUoJ2J1cnN0cycsIGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBkZXNjcmliZSgnZGlzYWJsaW5nIGFuZCBlbmFibGluZyBzdGVwcycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBEcmlsbGVyLmFkZERpc2NpcGxpbmUoe1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiAndGVzdERpc2FibGluZycsXG4gICAgICAgICAgICAgICAgICAgIHN0ZXBzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGVwMToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyb250Rm9vdDogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb3ZlOiBbMCwgMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0aW9uOiAwXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RlcDI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcm9udEZvb3Q6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbW92ZTogWzAsIDBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogMFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBzdGFydFNlcXVlbmNlOiBbJ3N0ZXAxJ10sXG4gICAgICAgICAgICAgICAgICAgIGVuZFNlcXVlbmNlOiBbJ3N0ZXAxJ11cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpdCgnc2hvdWxkIGJlIHBvc3NpYmxlIHRvIGRpc2FibGUgc3RlcHMgZnJvbSBjb25maWcnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGRyaWxsZXIgPSBuZXcgRHJpbGxlcih7XG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNjaXBsaW5lOiAndGVzdERpc2FibGluZycsXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZFN0ZXBzOiBbJ3N0ZXAxJ11cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGV4cGVjdChkcmlsbGVyLnZhbGlkYXRlU3RlcCgnc3RlcDEnKSkudG9CZUZhbHN5KCk7XG4gICAgICAgICAgICAgICAgICAgIGV4cGVjdChkcmlsbGVyLnZhbGlkYXRlU3RlcCgnc3RlcDInKSkudG9CZVRydXRoeSgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGl0KCdzaG91bGQgYmUgcG9zc2libGUgdG8gZW5hYmxlIGFuZCBkaXNhYmxlIHN0ZXBzIG1hbnVhbGx5JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBkcmlsbGVyID0gbmV3IERyaWxsZXIoe1xuICAgICAgICAgICAgICAgICAgICAgICAgZGlzY2lwbGluZTogJ3Rlc3REaXNhYmxpbmcnXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBleHBlY3QoZHJpbGxlci52YWxpZGF0ZVN0ZXAoJ3N0ZXAxJykpLnRvQmVUcnV0aHkoKTtcbiAgICAgICAgICAgICAgICAgICAgZHJpbGxlci5kaXNhYmxlU3RlcCgnc3RlcDEnKTtcbiAgICAgICAgICAgICAgICAgICAgZXhwZWN0KGRyaWxsZXIudmFsaWRhdGVTdGVwKCdzdGVwMScpKS50b0JlRmFsc3koKTtcbiAgICAgICAgICAgICAgICAgICAgZHJpbGxlci5lbmFibGVTdGVwKCdzdGVwMScpO1xuICAgICAgICAgICAgICAgICAgICBleHBlY3QoZHJpbGxlci52YWxpZGF0ZVN0ZXAoJ3N0ZXAxJykpLnRvQmVUcnV0aHkoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZGVzY3JpYmUoJ21vdmluZyBpbiBhIGxpbWl0ZWQgc3BhY2UnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaXQoJ3Nob3VsZCBub3QgYWxsb3cgc3RlcHBpbmcgb3V0c2lkZSB0aGUgcGFyYWRlIGdyb3VuZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgRHJpbGxlci5hZGREaXNjaXBsaW5lKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICd0ZXN0TW92aW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0ZXBzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9DaGFuZ2U6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnJvbnRGb290OiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb3ZlOiBbMCwgMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RlcEZvcndhcmQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnJvbnRGb290OiAnTGVmdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vdmU6IFsxLCAwXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0aW9uOiAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGVwU2lkZXdheXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnJvbnRGb290OiAnTGVmdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vdmU6IFswLCAxXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0aW9uOiAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0U2VxdWVuY2U6IFsnbm9DaGFuZ2UnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZFNlcXVlbmNlOiBbJ25vQ2hhbmdlJ11cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGRyaWxsZXIgPSBuZXcgRHJpbGxlcih7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcmVhTGVuZ3RoOiAxLFxuICAgICAgICAgICAgICAgICAgICAgICAgYXJlYVdpZHRoOiAxLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzY2lwbGluZTogJ3Rlc3RNb3ZpbmcnXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIGV4cGVjdChkcmlsbGVyLnZhbGlkYXRlU3RlcCgnc3RlcEZvcndhcmQnKSkudG9CZUZhbHN5KCk7XG4gICAgICAgICAgICAgICAgICAgIGV4cGVjdChkcmlsbGVyLnZhbGlkYXRlU3RlcCgnc3RlcFNpZGV3YXlzJykpLnRvQmVGYWxzeSgpO1xuICAgICAgICAgICAgICAgICAgICBleHBlY3QoZHJpbGxlci52YWxpZGF0ZVN0ZXAoJ25vQ2hhbmdlJykpLnRvQmVUcnV0aHkoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBkZXNjcmliZSgndGltaW5ncycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGJlZm9yZUVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGRyaWxsZXIgPSBuZXcgRHJpbGxlcih7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0U2VxdWVuY2U6IFsnbm9DaGFuZ2UnXSxcbiAgICAgICAgICAgICAgICAgICAgbWluVGltZTogMixcbiAgICAgICAgICAgICAgICAgICAgbWF4VGltZTogNCxcbiAgICAgICAgICAgICAgICAgICAgYXZnVGltZTogM1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpdCgnc2hvdWxkIG5vdCBleGNlZWQgbWF4aW11bSB0aW1lIGFsbG93ZWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgc3B5T24oTWF0aCwgJ3JhbmRvbScpLmFuZENhbGxGYWtlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDY7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGRyaWxsZXIuZ2V0VGltZUludGVydmFsKCkpLnRvQmUoNDAwMCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaXQoJ3Nob3VsZCBub3QgYmUgbGVzcyB0aGFuIG1pbmltdW0gdGltZSBhbGxvd2VkJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHNweU9uKE1hdGgsICdyYW5kb20nKS5hbmRDYWxsRmFrZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAtNjtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBleHBlY3QoZHJpbGxlci5nZXRUaW1lSW50ZXJ2YWwoKSkudG9CZSgyMDAwKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpdCgnc2hvdWxkIGdyYWR1YWxseSBzcGVlZCB1cCB3aGVuIHNwZWNpZmllZCcsIGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfSk7XG5cbiAgICB9KTtcblxufSk7IiwiLypnbG9iYWwgVGVzdEhlbHBlcnM6ZmFsc2UsIGRlc2NyaWJlOmZhbHNlLCBqYXNtaW5lOmZhbHNlLCBiZWZvcmVFYWNoOmZhbHNlLCBhZnRlckVhY2g6ZmFsc2UscnVuczpmYWxzZSx3YWl0czpmYWxzZSxleHBlY3Q6ZmFsc2UsaXQ6ZmFsc2Usc3B5T246ZmFsc2UgKi9cbmRlc2NyaWJlKCdtb2R1bGVzL3N0ZXAtc2VsZWN0b3InLCBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIFN0ZXBTZWxlY3RvciA9IHJlcXVpcmUoJy4uLy4uLy4uL3NyYy9tb2R1bGVzL3N0ZXAtc2VsZWN0b3InKSxcbiAgICAgICAgZXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnLi4vLi4vLi4vc3JjL21peGlucy9ldmVudC1lbWl0dGVyJyksXG4gICAgICAgIERyaWxsZXIgPSByZXF1aXJlKCcuLi8uLi8uLi9zcmMvbW9kdWxlcy9kcmlsbGVyJyksXG4gICAgICAgIHN0ZXBTZWxlY3RvcixcbiAgICAgICAgZG9tTm9kZSxcbiAgICAgICAgZ2V0RHJpbGxlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgRHJpbGxlcih7XG4gICAgICAgICAgICAgICAgZGlzY2lwbGluZTogJ3Rlc3REaXNhYmxlcicsXG4gICAgICAgICAgICAgICAgZGlzYWJsZWRTdGVwczogWydkaXNhYmxlZFN0ZXAnXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgIERyaWxsZXIuYWRkRGlzY2lwbGluZSh7XG4gICAgICAgIG5hbWU6ICd0ZXN0RGlzYWJsZXInLFxuICAgICAgICBzdGVwczoge1xuICAgICAgICAgICAgZGlzYWJsZWRTdGVwOiB7XG4gICAgICAgICAgICAgICAgZnJvbnRGb290OiAwLFxuICAgICAgICAgICAgICAgIG1vdmU6IFswLCAwXSxcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb246IDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbmFibGVkU3RlcDoge1xuICAgICAgICAgICAgICAgIGZyb250Rm9vdDogMCxcbiAgICAgICAgICAgICAgICBtb3ZlOiBbMCwgMF0sXG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uOiAwXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHN0YXJ0U2VxdWVuY2U6IFsnZGlzYWJsZWRTdGVwJ10sXG4gICAgICAgIGVuZFNlcXVlbmNlOiBbJ2Rpc2FibGVkU3RlcCddXG4gICAgfSk7XG5cbiAgICBiZWZvcmVFYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZG9tTm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBkb21Ob2RlLmlkID0gJ2RvbU5vZGUnO1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYm9keScpWzBdLmFwcGVuZENoaWxkKGRvbU5vZGUpO1xuICAgIH0pO1xuXG4gICAgYWZ0ZXJFYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZG9tTm9kZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGRvbU5vZGUpO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJ2luaXRpYWxpc2F0aW9uJywgZnVuY3Rpb24gKCkge1xuICAgICAgICBpdCgnc2hvdWxkIHJlcXVpcmUgYSBkcmlsbGVyJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZXhwZWN0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBuZXcgU3RlcFNlbGVjdG9yKHVuZGVmaW5lZCwgJ2RvbU5vZGUnKTtcbiAgICAgICAgICAgIH0pLnRvVGhyb3coKTtcbiAgICAgICAgICAgIGV4cGVjdChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgbmV3IFN0ZXBTZWxlY3Rvcih7fSwgJ2RvbU5vZGUnKTtcbiAgICAgICAgICAgIH0pLnRvVGhyb3coKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3Nob3VsZCByZXF1aXJlIGFuIGV4aXN0aW5nIGRvbSBub2RlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZXhwZWN0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBuZXcgU3RlcFNlbGVjdG9yKGdldERyaWxsZXIoKSk7XG4gICAgICAgICAgICB9KS50b1Rocm93KCk7XG4gICAgICAgICAgICBleHBlY3QoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIG5ldyBTdGVwU2VsZWN0b3IoZ2V0RHJpbGxlcigpLCAnZG9tTm9kZTInKTtcbiAgICAgICAgICAgIH0pLnRvVGhyb3coKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3Nob3VsZCBhZGQgYW4gaW5wdXQgZm9yIGVhY2ggc3RlcCB3aGljaCByZWZsZWN0cyB3aGV0aGVyIGl0XFwncyBlbmFibGVkIG9yIG5vdCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIG5ldyBTdGVwU2VsZWN0b3IoZ2V0RHJpbGxlcigpLCAnZG9tTm9kZScpO1xuICAgICAgICAgICAgdmFyIGlucHV0cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tuYW1lPVwic3RlcFNlbGVjdG9yXCJdJyk7XG4gICAgICAgICAgICBleHBlY3QoaW5wdXRzLmxlbmd0aCkudG9CZSgyKTtcbiAgICAgICAgICAgIGV4cGVjdChpbnB1dHNbMF0uY2hlY2tlZCkudG9CZUZhbHN5KCk7XG4gICAgICAgICAgICBleHBlY3QoaW5wdXRzWzFdLmNoZWNrZWQpLnRvQmVUcnV0aHkoKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgndXBkYXRpbmcgZGlzYWJsZWQgc3RlcHMnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIFxuICAgICAgICBpdCgnc2hvdWxkIGRpc2FibGUvZW5hYmxlIHN0ZXBzIGJhc2VkIG9uIHVzZXIgaW50ZXJhY3Rpb24nLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZHJpbGxlciA9IGdldERyaWxsZXIoKTtcbiAgICAgICAgICAgIHNweU9uKGRyaWxsZXIsICdkaXNhYmxlU3RlcCcpO1xuICAgICAgICAgICAgc3B5T24oZHJpbGxlciwgJ2VuYWJsZVN0ZXAnKTtcbiAgICAgICAgICAgIG5ldyBTdGVwU2VsZWN0b3IoZHJpbGxlciwgJ2RvbU5vZGUnKTtcbiAgICAgICAgICAgIHZhciBkaXNhYmxlZFN0ZXAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGlzYWJsZWRTdGVwJyksXG4gICAgICAgICAgICAgICAgZW5hYmxlZFN0ZXAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZW5hYmxlZFN0ZXAnKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gbm90ZSB0aGF0IHRoZSBjaGFuZ2UgZXZlbnQgZG9lc24ndCBjaGFuZ2UgdGhlIHZhbHVlIHNvIGZpcmluZyBjaGFuZ2Ugb24gYW4gZW5hYmxlZCBzdGVwIGlzIHRoZSBcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgdGhlIHVzZXIgY2hhbmdpbmcgdGhlIHZhbHVlIHRvIGVuYWJsZWQgb24gYSBkaXNhYmxlZCBzdGVwLCBzbyB0aGlzIHRlc3QgcmVhZHMgYSBsaXR0bGUgY291bnRlcmludHVpdGl2ZWx5XG4gICAgICAgICAgICBUZXN0SGVscGVycy5maXJlRXZlbnQoZW5hYmxlZFN0ZXAsICdjaGFuZ2UnKTtcbiAgICAgICAgICAgIGV4cGVjdChkcmlsbGVyLmVuYWJsZVN0ZXApLnRvSGF2ZUJlZW5DYWxsZWQoKTtcbiAgICAgICAgICAgIGV4cGVjdChkcmlsbGVyLmRpc2FibGVTdGVwKS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpO1xuXG4gICAgICAgICAgICBUZXN0SGVscGVycy5maXJlRXZlbnQoZGlzYWJsZWRTdGVwLCAnY2hhbmdlJyk7XG4gICAgICAgICAgICBleHBlY3QoZHJpbGxlci5kaXNhYmxlU3RlcCkudG9IYXZlQmVlbkNhbGxlZCgpO1xuICAgICAgICAgICAgZXhwZWN0KGRyaWxsZXIuZGlzYWJsZVN0ZXAuY2FsbHMubGVuZ3RoKS50b0JlKDEpO1xuICAgICAgICAgICAgZXhwZWN0KGRyaWxsZXIuZW5hYmxlU3RlcC5jYWxscy5sZW5ndGgpLnRvQmUoMSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdzaG91bGQgYmUgYWJsZSB0byBkaXNhYmxlIHN0ZXBzIHdoZW4gbm8gb3RoZXJzIGRpc2FibGVkIGluIGNvbmZpZycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBkcmlsbGVyID0gbmV3IERyaWxsZXIoe1xuICAgICAgICAgICAgICAgIGRpc2NpcGxpbmU6ICd0ZXN0RGlzYWJsZXInXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgc3B5T24oZHJpbGxlciwgJ2Rpc2FibGVTdGVwJyk7XG4gICAgICAgICAgICBuZXcgU3RlcFNlbGVjdG9yKGRyaWxsZXIsICdkb21Ob2RlJyk7XG4gICAgICAgICAgICB2YXIgZGlzYWJsZWRTdGVwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Rpc2FibGVkU3RlcCcpO1xuICAgICAgICAgICAgZGlzYWJsZWRTdGVwLmNoZWNrZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIFRlc3RIZWxwZXJzLmZpcmVFdmVudChkaXNhYmxlZFN0ZXAsICdjaGFuZ2UnKTtcbiAgICAgICAgICAgIGV4cGVjdChkcmlsbGVyLmRpc2FibGVTdGVwKS50b0hhdmVCZWVuQ2FsbGVkKCk7XG5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3Nob3VsZCBwZXJzaXN0IHRoZSBjaGFuZ2Ugd2hlbiBkcmlsbGVyIGlzIHJlc3RhcnRlZCcsIGZ1bmN0aW9uICgpIHtcblxuICAgICAgICB9KTtcbiAgICB9KTtcblxufSk7IiwiLypnbG9iYWwgZGVzY3JpYmU6ZmFsc2UsIGphc21pbmU6ZmFsc2UsIGJlZm9yZUVhY2g6ZmFsc2UsIGFmdGVyRWFjaDpmYWxzZSxydW5zOmZhbHNlLHdhaXRzOmZhbHNlLGV4cGVjdDpmYWxzZSxpdDpmYWxzZSxzcHlPbjpmYWxzZSAqL1xuZGVzY3JpYmUoJ3V0aWxzJywgZnVuY3Rpb24gKCkge1xuICAgIHZhciB1dGlscyA9IHJlcXVpcmUoJy4uLy4uL3NyYy91dGlscycpO1xuXG4gICAgZGVzY3JpYmUoJ3BpY2tSYW5kb21Qcm9wZXJ0eScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaXQoJ3Nob3VsZCByZXR1cm4gdW5kZWZpbmVkIHdoZW4gcGFzc2VkIGFuIGVtcHR5IG9iamVjdCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGV4cGVjdCh1dGlscy5waWNrUmFuZG9tUHJvcGVydHkoe30pKS50b0JlVW5kZWZpbmVkKCk7XG4gICAgICAgIH0pO1xuICAgICAgICBpdCgnc2hvdWxkIHBpY2sgYSByYW5kb20gcHJvcGVydHknLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgIC8vIGhvdyB0byB0ZXN0P1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKCdleHRlbmRPYmonLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBleHRlbmRPYmogPSB1dGlscy5leHRlbmRPYmo7XG5cbiAgICAgICAgaXQoJ3Nob3VsZCByZXR1cm4gdGhlIG9yaWdpbmFsIG9iamVjdCB3aGVuIG5vIGV4dGVuZGVycyBzcGVjaWZpZWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0ge1xuICAgICAgICAgICAgICAgIHByb3A6ICd0ZXN0J1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHZhciB0ZXN0T2JqID0gZXh0ZW5kT2JqKG9iaik7XG4gICAgICAgICAgICBleHBlY3QodGVzdE9iaikudG9CZShvYmopO1xuICAgICAgICAgICAgZXhwZWN0KHRlc3RPYmopLnRvRXF1YWwoe1xuICAgICAgICAgICAgICAgIHByb3A6ICd0ZXN0J1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3Nob3VsZCBvdmVyd3JpdGUgd2l0aCBwcm9wcyBmcm9tIGV4dGVuZGluZyBvYmplY3QgaGllcmFyY2hpY2FsbHknLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgb2JqMSA9IHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcDE6IDExLFxuICAgICAgICAgICAgICAgICAgICBwcm9wMjogMjEsXG4gICAgICAgICAgICAgICAgICAgIHByb3AzOiAzMSxcbiAgICAgICAgICAgICAgICAgICAgcHJvcDQ6IDQxXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBvYmoyID0ge1xuICAgICAgICAgICAgICAgICAgICBwcm9wMjogMjIsXG4gICAgICAgICAgICAgICAgICAgIHByb3AzOiAzMixcbiAgICAgICAgICAgICAgICAgICAgcHJvcDQ6IDQyXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBvYmozID0ge1xuICAgICAgICAgICAgICAgICAgICBwcm9wMzogMzMsXG4gICAgICAgICAgICAgICAgICAgIHByb3A0OiA0M1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb2JqNCA9IHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcDQ6IDQ0XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIHRlc3RPYmogPSBleHRlbmRPYmoob2JqMSwgb2JqMiwgb2JqMywgb2JqNCk7XG4gICAgICAgICAgICBleHBlY3QodGVzdE9iaikudG9CZShvYmoxKTtcbiAgICAgICAgICAgIGV4cGVjdCh0ZXN0T2JqKS50b0VxdWFsKHtcbiAgICAgICAgICAgICAgICBwcm9wMTogMTEsXG4gICAgICAgICAgICAgICAgcHJvcDI6IDIyLFxuICAgICAgICAgICAgICAgIHByb3AzOiAzMyxcbiAgICAgICAgICAgICAgICBwcm9wNDogNDRcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdzaG91bGQgbm90IGFsdGVyIGFueSBvZiB0aGUgb3JpZ2luYWwgb2JqZWN0cyBleGNlcHQgdGhlIGJhc2Ugb2JqZWN0JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIG9iajEgPSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3AxOiAxMSxcbiAgICAgICAgICAgICAgICAgICAgcHJvcDI6IDIxLFxuICAgICAgICAgICAgICAgICAgICBwcm9wMzogMzEsXG4gICAgICAgICAgICAgICAgICAgIHByb3A0OiA0MVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb2JqMiA9IHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcDI6IDIyLFxuICAgICAgICAgICAgICAgICAgICBwcm9wMzogMzIsXG4gICAgICAgICAgICAgICAgICAgIHByb3A0OiA0MlxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb2JqMyA9IHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcDM6IDMzLFxuICAgICAgICAgICAgICAgICAgICBwcm9wNDogNDNcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9iajQgPSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3A0OiA0NFxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGV4dGVuZE9iaihvYmoxLCBvYmoyLCBvYmozLCBvYmo0KTtcblxuICAgICAgICAgICAgZXhwZWN0KG9iajIpLnRvRXF1YWwoe1xuICAgICAgICAgICAgICAgIHByb3AyOiAyMixcbiAgICAgICAgICAgICAgICBwcm9wMzogMzIsXG4gICAgICAgICAgICAgICAgcHJvcDQ6IDQyXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGV4cGVjdChvYmozKS50b0VxdWFsKHtcbiAgICAgICAgICAgICAgICBwcm9wMzogMzMsXG4gICAgICAgICAgICAgICAgcHJvcDQ6IDQzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGV4cGVjdChvYmo0KS50b0VxdWFsKHtcbiAgICAgICAgICAgICAgICBwcm9wNDogNDRcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH0pO1xuXG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgndG9DYW1lbCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaXQoJ3Nob3VsZCBjaGFuZ2UgZGFzaGVzIGluIHN0cmluZyB0byBjYW1lbC1jYXNpbmcnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBleHBlY3QodXRpbHMudG9DYW1lbCgnYWItY2QtXyQlLWVmJykpLnRvRXF1YWwoJ2FiQ2RfJCVFZicpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKCd0b0Rhc2hlZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaXQoJ3Nob3VsZCBjaGFuZ2UgY2FwcyBpbiBzdHJpbmcgdG8gZGFzaGVzJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZXhwZWN0KHV0aWxzLnRvRGFzaGVkKCdhYkNkXyQlRWYnKSkudG9FcXVhbCgnYWItY2RfJCUtZWYnKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgnZGFzaGVkVG9TcGFjZWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGl0KCdzaG91bGQgY2hhbmdlIGRhc2hlcyBpbiBzdHJpbmcgdG8gc3BhY2VzJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZXhwZWN0KHV0aWxzLmRhc2hlZFRvU3BhY2VkKCdhYi1jZC1fJCUtZWYnKSkudG9FcXVhbCgnYWIgY2QgXyQlIGVmJyk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJ2NhbWVsVG9TcGFjZWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGl0KCdzaG91bGQgY2hhbmdlIGNhcHMgaW4gc3RyaW5nIHRvIHNwYWNlcycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGV4cGVjdCh1dGlscy5jYW1lbFRvU3BhY2VkKCdhYkNkXyQlRWYnKSkudG9FcXVhbCgnYWIgY2RfJCUgZWYnKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbn0pOyJdfQ==
;