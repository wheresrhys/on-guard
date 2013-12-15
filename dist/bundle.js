;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var	Driller = require('./modules/driller'),
    Caller = require('./modules/caller'),
    Visualiser = require('./modules/simple-visualiser'),
    ControlPanel = require('./modules/control-panel'),
    StepSelector = require('./modules/step-selector'),
    taiChiConfig = require('./configs/tai-chi');

module.exports = {
    init: function () {
        Driller.addDiscipline(taiChiConfig);
        
        var driller = new Driller({
            discipline: 'taiChi',
            disabledSteps: ['inside', 'outside'],
            delay: 2
        });

        if (window.location.hash !== '#silent') {
            var caller = new Caller(driller);
        }
        var controlPanel = new ControlPanel(driller, {
            fieldList: ['minTime','maxTime','areaWidth','areaLength','stepCount', 'delay', 'preservePosition'],
            actionList: ['resetAndStart', 'stop'],
            formId: 'onGuardControlPanel'
        });
        var stepSelector = new StepSelector(driller, 'disabledSteps');
        var visualiser = new Visualiser(driller, 'visualiser');
    }
};
},{"./configs/tai-chi":2,"./modules/caller":5,"./modules/control-panel":6,"./modules/driller":7,"./modules/simple-visualiser":8,"./modules/step-selector":9}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
'use strict';

var app = require('./app');

app.init();
},{"./app":1}],4:[function(require,module,exports){
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
},{}],5:[function(require,module,exports){
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
},{"../utils":10}],6:[function(require,module,exports){
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
},{}],7:[function(require,module,exports){
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
},{"../mixins/event-emitter":4,"../utils":10}],8:[function(require,module,exports){
'use strict';

var utils = require('../utils'),
    arrowCodes = { 
    West: 8592,
    North: 8593,
    East: 8594,
    South: 8595
},
defaultCellHtml = '&nbsp;&nbsp;&nbsp;&nbsp;';

var Visualiser = function (driller, domNodeId) {
    this.conf = driller.conf;
    this.driller = driller;
    this.domNode = document.getElementById(domNodeId);
    this.init();
};

Visualiser.prototype = {
    init: function () {

     
        this.driller.on('initialised', function () {
            this.prime();
        }, this);
        // this.driller.on('stopped', this.undrawGrid, this);
        this.driller.on('step', function (state) {
            if(this.conf.areaWidth > 0 && this.conf.areaLength > 0) {
                this.setPosition(state.coords, state.direction, state.frontFoot);
                this.updateCaption(utils.camelToSpaced(state.lastStep));
            }
        }, this);

        this.prime();


    },
    prime: function () {
        if(this.conf.areaWidth > 0 && this.conf.areaLength > 0) {
            this.undrawGrid();
            this.drawCaption();
            this.drawGrid();
            this.setPosition(this.driller.coords, this.driller.longDirection, 'center');
        }
    },
    drawCaption: function () {
        this.caption = document.createElement('h2');
        this.caption.innerHTML = '&nbsp;';
        this.domNode.appendChild(this.caption);
    },
    updateCaption: function (text) {
        this.caption.innerHTML = text.charAt(0).toUpperCase() + text.substr(1);
    },
    drawGrid: function () {
        var table = document.createElement('table'),
            row = document.createElement('tr'),
            cell = document.createElement('td'),
            width = this.conf.areaWidth,
            height = this.conf.areaLength,
            i,
            newRow,
            newCell;

        while(height--) {
            newRow = row.cloneNode();
            table.appendChild(newRow);
            for(i=0;i<width;i++) {
                newCell = cell.cloneNode();
                newCell.innerHTML = defaultCellHtml;
                newRow.appendChild(newCell);
            }
        }
        this.domNode.appendChild(table);
        this.grid = table;
        table.className = 'floorspace';
    },
    undrawGrid: function () {
        this.domNode.innerHTML = '';
    },
    setPosition: function(coords, direction, frontFoot) {
        
        if (this.position) {
            this.unshowPosition();
        }
        var cell = this.grid.getElementsByTagName('tr')[(this.conf.areaLength - 1) - coords[0]]
                .getElementsByTagName('td')[coords[1]];

        cell.className = 'current ' + direction.toLowerCase() + ' ' + (frontFoot && frontFoot.toLowerCase());
        this.position = coords;
        // up arrow
        cell.innerHTML = '&#8593;';
    },
    unshowPosition: function () {
        var cell = this.grid.getElementsByTagName('tr')[(this.conf.areaLength - 1) - this.position[0]]
                .getElementsByTagName('td')[this.position[1]];
        cell.className = '';
        cell.innerHTML = defaultCellHtml;
        
    }
};

module.exports = Visualiser;

},{"../utils":10}],9:[function(require,module,exports){
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
},{"../utils":10}],10:[function(require,module,exports){
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
},{}]},{},[3])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvd2hlcmVzcmh5cy9TaXRlcy9vbi1ndWFyZC9zcmMvYXBwLmpzIiwiL1VzZXJzL3doZXJlc3JoeXMvU2l0ZXMvb24tZ3VhcmQvc3JjL2NvbmZpZ3MvdGFpLWNoaS5qcyIsIi9Vc2Vycy93aGVyZXNyaHlzL1NpdGVzL29uLWd1YXJkL3NyYy9tYWluLmpzIiwiL1VzZXJzL3doZXJlc3JoeXMvU2l0ZXMvb24tZ3VhcmQvc3JjL21peGlucy9ldmVudC1lbWl0dGVyLmpzIiwiL1VzZXJzL3doZXJlc3JoeXMvU2l0ZXMvb24tZ3VhcmQvc3JjL21vZHVsZXMvY2FsbGVyLmpzIiwiL1VzZXJzL3doZXJlc3JoeXMvU2l0ZXMvb24tZ3VhcmQvc3JjL21vZHVsZXMvY29udHJvbC1wYW5lbC5qcyIsIi9Vc2Vycy93aGVyZXNyaHlzL1NpdGVzL29uLWd1YXJkL3NyYy9tb2R1bGVzL2RyaWxsZXIuanMiLCIvVXNlcnMvd2hlcmVzcmh5cy9TaXRlcy9vbi1ndWFyZC9zcmMvbW9kdWxlcy9zaW1wbGUtdmlzdWFsaXNlci5qcyIsIi9Vc2Vycy93aGVyZXNyaHlzL1NpdGVzL29uLWd1YXJkL3NyYy9tb2R1bGVzL3N0ZXAtc2VsZWN0b3IuanMiLCIvVXNlcnMvd2hlcmVzcmh5cy9TaXRlcy9vbi1ndWFyZC9zcmMvdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbnZhclx0RHJpbGxlciA9IHJlcXVpcmUoJy4vbW9kdWxlcy9kcmlsbGVyJyksXG4gICAgQ2FsbGVyID0gcmVxdWlyZSgnLi9tb2R1bGVzL2NhbGxlcicpLFxuICAgIFZpc3VhbGlzZXIgPSByZXF1aXJlKCcuL21vZHVsZXMvc2ltcGxlLXZpc3VhbGlzZXInKSxcbiAgICBDb250cm9sUGFuZWwgPSByZXF1aXJlKCcuL21vZHVsZXMvY29udHJvbC1wYW5lbCcpLFxuICAgIFN0ZXBTZWxlY3RvciA9IHJlcXVpcmUoJy4vbW9kdWxlcy9zdGVwLXNlbGVjdG9yJyksXG4gICAgdGFpQ2hpQ29uZmlnID0gcmVxdWlyZSgnLi9jb25maWdzL3RhaS1jaGknKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICBEcmlsbGVyLmFkZERpc2NpcGxpbmUodGFpQ2hpQ29uZmlnKTtcbiAgICAgICAgXG4gICAgICAgIHZhciBkcmlsbGVyID0gbmV3IERyaWxsZXIoe1xuICAgICAgICAgICAgZGlzY2lwbGluZTogJ3RhaUNoaScsXG4gICAgICAgICAgICBkaXNhYmxlZFN0ZXBzOiBbJ2luc2lkZScsICdvdXRzaWRlJ10sXG4gICAgICAgICAgICBkZWxheTogMlxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAod2luZG93LmxvY2F0aW9uLmhhc2ggIT09ICcjc2lsZW50Jykge1xuICAgICAgICAgICAgdmFyIGNhbGxlciA9IG5ldyBDYWxsZXIoZHJpbGxlcik7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGNvbnRyb2xQYW5lbCA9IG5ldyBDb250cm9sUGFuZWwoZHJpbGxlciwge1xuICAgICAgICAgICAgZmllbGRMaXN0OiBbJ21pblRpbWUnLCdtYXhUaW1lJywnYXJlYVdpZHRoJywnYXJlYUxlbmd0aCcsJ3N0ZXBDb3VudCcsICdkZWxheScsICdwcmVzZXJ2ZVBvc2l0aW9uJ10sXG4gICAgICAgICAgICBhY3Rpb25MaXN0OiBbJ3Jlc2V0QW5kU3RhcnQnLCAnc3RvcCddLFxuICAgICAgICAgICAgZm9ybUlkOiAnb25HdWFyZENvbnRyb2xQYW5lbCdcbiAgICAgICAgfSk7XG4gICAgICAgIHZhciBzdGVwU2VsZWN0b3IgPSBuZXcgU3RlcFNlbGVjdG9yKGRyaWxsZXIsICdkaXNhYmxlZFN0ZXBzJyk7XG4gICAgICAgIHZhciB2aXN1YWxpc2VyID0gbmV3IFZpc3VhbGlzZXIoZHJpbGxlciwgJ3Zpc3VhbGlzZXInKTtcbiAgICB9XG59OyIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgbmFtZTogJ3RhaUNoaScsXG4gICAgc3RlcHM6IHtcbiAgICAgICAgc3RlcDoge1xuICAgICAgICAgICAgZnJvbnRGb290OiAxLFxuICAgICAgICAgICAgbW92ZTogWzEsIDBdLFxuICAgICAgICAgICAgZGlyZWN0aW9uOiAwXG4gICAgICAgIH0sXG4gICAgICAgIGJhY2s6IHtcbiAgICAgICAgICAgIGZyb250Rm9vdDogMSxcbiAgICAgICAgICAgIG1vdmU6IFstMSwgMF0sXG4gICAgICAgICAgICBkaXJlY3Rpb246IDBcbiAgICAgICAgfSxcbiAgICAgICAgc2hpZnQ6IHtcbiAgICAgICAgICAgIGZyb250Rm9vdDogMSxcbiAgICAgICAgICAgIG1vdmU6IFswLCAwXSxcbiAgICAgICAgICAgIGRpcmVjdGlvbjogMVxuICAgICAgICB9LFxuICAgICAgICAnc3dpdGNoJzoge1xuICAgICAgICAgICAgZnJvbnRGb290OiAxLFxuICAgICAgICAgICAgbW92ZTogWzAsIDBdLFxuICAgICAgICAgICAgZGlyZWN0aW9uOiAwXG4gICAgICAgIH0sXG4gICAgICAgIGluc2lkZToge1xuICAgICAgICAgICAgZnJvbnRGb290OiAwLFxuICAgICAgICAgICAgbW92ZTogWzAsIDFdLFxuICAgICAgICAgICAgZGlyZWN0aW9uOiAwXG4gICAgICAgIH0sXG4gICAgICAgIG91dHNpZGU6IHtcbiAgICAgICAgICAgIGZyb250Rm9vdDogMSxcbiAgICAgICAgICAgIG1vdmU6IFswLCAtMV0sXG4gICAgICAgICAgICBkaXJlY3Rpb246IDBcbiAgICAgICAgfSxcbiAgICAgICAgdHVybjoge1xuICAgICAgICAgICAgZnJvbnRGb290OiAwLFxuICAgICAgICAgICAgbW92ZTogWzAsIC0xXSxcbiAgICAgICAgICAgIGRpcmVjdGlvbjogMVxuICAgICAgICB9LFxuICAgICAgICBvbkd1YXJkOiB7XG4gICAgICAgICAgICBfcHJvcGVydHlEZWZpbml0aW9uOiB0cnVlLFxuICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgICAgIGZyb250Rm9vdDogJ0xlZnQnLFxuICAgICAgICAgICAgICAgIG1vdmU6IFswLCAwXSxcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb246IDBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgd3VDaGk6IHtcbiAgICAgICAgICAgIF9wcm9wZXJ0eURlZmluaXRpb246IHRydWUsXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICAgICAgZnJvbnRGb290OiBudWxsLFxuICAgICAgICAgICAgICAgIG1vdmU6IFswLCAwXSxcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb246IDBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgc3RhcnRTZXF1ZW5jZTogWyd3dUNoaScsICdvbkd1YXJkJ10sXG4gICAgZW5kU2VxdWVuY2U6IFsnd3VDaGknXVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGFwcCA9IHJlcXVpcmUoJy4vYXBwJyk7XG5cbmFwcC5pbml0KCk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZXZlbnRFbWl0dGVyID0gKGZ1bmN0aW9uICh1bmRlZmluZWQpIHtcblxuICAgIHZhciBkb09uID0gZnVuY3Rpb24gKGNhbGxiYWNrcywgZXZlbnQsIGNhbGxiYWNrLCBjb250ZXh0KSB7XG5cbiAgICAgICAgICAgIC8vIGZldGNoIHRoZSBldmVudCdzIHN0b3JlIG9mIGNhbGxiYWNrcyBvciBjcmVhdGUgaXQgaWYgbmVlZGVkXG4gICAgICAgICAgICB2YXIgc3RvcmUgPSBjYWxsYmFja3NbZXZlbnRdIHx8IChjYWxsYmFja3NbZXZlbnRdID0gW10pO1xuXG4gICAgICAgICAgICAvLyBzdG9yZSB0aGUgY2FsbGJhY2sgZm9yIGxhdGVyIHVzZVxuICAgICAgICAgICAgc3RvcmUucHVzaCh7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2s6IGNhbGxiYWNrLFxuICAgICAgICAgICAgICAgIGNvbnRleHQ6IGNvbnRleHQgfHwgd2luZG93IHx8IG51bGxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBhbHNvIG9uIHRvIHRoZSBjb250ZXh0IG9iamVjdCdzIGRlc3Ryb3kgZXZlbnQgaW4gb3JkZXIgdG8gb2ZmXG4gICAgICAgICAgICBpZiAoY29udGV4dCkge1xuICAgICAgICAgICAgICAgIGlmIChjb250ZXh0Lm9uICE9PSBvbikge1xuICAgICAgICAgICAgICAgICAgICBldmVudEVtaXR0ZXIuYXBwbHkoY29udGV4dCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChldmVudCAhPT0gJ3NpbGVuY2VFdmVudHMnKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQub24oJ3NpbGVuY2VFdmVudHMnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvZmYuY2FsbCh0aGlzLCBldmVudCwgY2FsbGJhY2ssIGNvbnRleHQpO1xuICAgICAgICAgICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZG9PZmYgPSBmdW5jdGlvbiAoY2FsbGJhY2tzLCBldmVudCwgY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgICAgICAgICAgIHZhciBzdG9yZSA9IGNhbGxiYWNrc1tldmVudF0sXG4gICAgICAgICAgICAgICAgaTtcblxuICAgICAgICAgICAgaWYgKCFzdG9yZSkge3JldHVybjt9XG5cbiAgICAgICAgICAgIGlmICghY2FsbGJhY2sgJiYgIWNvbnRleHQpIHtcbiAgICAgICAgICAgICAgICBzdG9yZS5sZW5ndGggPSBbXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gZmFzdCBsb29wXG4gICAgICAgICAgICBmb3IgKGkgPSBzdG9yZS5sZW5ndGggLSAxOyBpPj0wOyBpLS0pIHtcbiAgICAgICAgICAgICAgICBpZiAoKCFjYWxsYmFjayAmJiBzdG9yZVtpXS5jb250ZXh0ID09PSBjb250ZXh0KSB8fCAoc3RvcmVbaV0uY2FsbGJhY2sgPT09IGNhbGxiYWNrICYmICghY29udGV4dCB8fCAhKHN0b3JlW2ldLmNvbnRleHQpIHx8IHN0b3JlW2ldLmNvbnRleHQgPT09IGNvbnRleHQpKSkge1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIEkgbWlnaHQgaGF2ZSBnb3QgdGhlIGluZGV4IHdyb25nIGhlcmUgLSBzaG91ZGwgaXQgYmUgaS0xLiBPYnZpb3VzbHkgSSdkIGNoZWNrIHRob3JvdWdobHkgaW4gYSByZWFsIGFwcFxuICAgICAgICAgICAgICAgICAgICBzdG9yZS5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBkb0ZpcmUgPSBmdW5jdGlvbiAoY2FsbGJhY2tzLCBldmVudCwgcmVzdWx0KSB7XG4gICAgICAgICAgICB2YXIgc3RvcmUgPSBjYWxsYmFja3NbZXZlbnRdLFxuICAgICAgICAgICAgICAgIGkgPSAwLFxuICAgICAgICAgICAgICAgIGlsO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnRXZlbnQgZW1pdHRlZCcsICdcXG5lbWl0dGVyOiAnLCB0aGlzLCAnXFxuZXZlbnQ6JywgZXZlbnQsICdcXG5kYXRhOiAnLCByZXN1bHQpO1xuICAgICAgICAgICAgaWYgKCFzdG9yZSkge3JldHVybjt9XG5cbiAgICAgICAgICAgIC8vIGxvb3AgaGVyZSBtdXN0IGJlIGluIGluY3JlYXNpbmcgb3JkZXJcbiAgICAgICAgICAgIGZvciAoaWwgPSBzdG9yZS5sZW5ndGg7IGk8aWw7IGkrKykge1xuICAgICAgICAgICAgICAgIHN0b3JlW2ldLmNhbGxiYWNrLmNhbGwoc3RvcmVbaV0uY29udGV4dCwgcmVzdWx0LCBldmVudCwgdGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIG9uID0gZnVuY3Rpb24gKGV2ZW50LCBjYWxsYmFjaywgY29udGV4dCkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBldmVudCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICB0aHJvdygncHJvdmlkZSBhIHN0cmluZyBuYW1lIGZvciB0aGUgZXZlbnQgdG8gc3Vic2NyaWJlIHRvJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgdGhyb3coJ3Byb3ZpZGUgYSBjYWxsYmFjayBmb3IgdGhlIGV2ZW50IHRvIHN1YnNjcmliZSB0bycpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgY2FsbGJhY2tzID0gZ2V0Q2FsbGJhY2tzKHRoaXMpLFxuICAgICAgICAgICAgICAgIGV2ZW50cyA9IGV2ZW50LnNwbGl0KCcgJyk7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBpbCA9IGV2ZW50cy5sZW5ndGg7IGk8aWw7IGkrKykge1xuICAgICAgICAgICAgICAgIGRvT24uY2FsbCh0aGlzLCBjYWxsYmFja3MsIGV2ZW50c1tpXSwgY2FsbGJhY2ssIGNvbnRleHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIG9mZiA9IGZ1bmN0aW9uIChldmVudCwgY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZXZlbnQgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgdGhyb3coJ3Byb3ZpZGUgYSBzdHJpbmcgbmFtZSBmb3IgdGhlIGV2ZW50IHRvIHVuc3Vic2NyaWJlIGZyb20nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBjYWxsYmFja3MgPSBnZXRDYWxsYmFja3ModGhpcywgdHJ1ZSksXG4gICAgICAgICAgICAgICAgZXZlbnRzID0gZXZlbnQuc3BsaXQoJyAnKTtcblxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoIWNhbGxiYWNrcykge3JldHVybiBmYWxzZTt9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBpbCA9IGV2ZW50cy5sZW5ndGg7IGk8aWw7IGkrKykge1xuICAgICAgICAgICAgICAgIGRvT2ZmLmNhbGwodGhpcywgY2FsbGJhY2tzLCBldmVudHNbaV0sIGNhbGxiYWNrLCBjb250ZXh0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBmaXJlID0gZnVuY3Rpb24gKGV2ZW50LCByZXN1bHQpIHtcbiAgICAgICAgICAgIHZhciBjYWxsYmFja3MgPSBnZXRDYWxsYmFja3ModGhpcyksXG4gICAgICAgICAgICAgICAgZXZlbnRzID0gZXZlbnQuc3BsaXQoJyAnKTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGlsID0gZXZlbnRzLmxlbmd0aDsgaTxpbDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgZG9GaXJlLmNhbGwodGhpcywgY2FsbGJhY2tzLCBldmVudHNbaV0sIHJlc3VsdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0Q2FsbGJhY2tzID0gZnVuY3Rpb24gKG9iaiwgZG9udFNldCkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGlsID0gY29udGV4dHMubGVuZ3RoOyBpIDwgaWw7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChjb250ZXh0c1tpXSA9PT0gb2JqKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFja3NbaV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFkb250U2V0KSB7XG4gICAgICAgICAgICAgICAgY29udGV4dHMucHVzaChvYmopO1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrcy5wdXNoKFtdKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2tzW2NhbGxiYWNrcy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBjYWxsYmFja3MgPSBbXSxcbiAgICAgICAgY29udGV4dHMgPSBbXSxcbiAgICAgICAgXG4gICAgICAgIG1peGluID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICB0aGlzLm9uID0gb247XG4gICAgICAgICAgICB0aGlzLm9mZiA9IG9mZjtcbiAgICAgICAgICAgIHRoaXMuZmlyZSA9IGZpcmU7XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9O1xuXG4gICAgbWl4aW4uY2xlYW5VcCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY2FsbGJhY2tzID0gW107XG4gICAgICAgIGNvbnRleHRzID0gW107XG4gICAgfTtcblxuICAgIHJldHVybiBtaXhpbjtcblxufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBldmVudEVtaXR0ZXI7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpLFxuICAgIEwgPSAnTGVmdCcsXG4gICAgUiA9ICdSaWdodCcsXG4gICAgTiA9ICdOb3J0aCcsXG4gICAgUyA9ICdTb3V0aCcsXG4gICAgRSA9ICdFYXN0JyxcbiAgICBXID0gJ1dlc3QnLFxuICAgIGNvbXBhc3MgPSBbTiwgRSwgUywgV107XG5cbnZhciBDYWxsZXIgPSBmdW5jdGlvbiAoZHJpbGxlcikge1xuICAgIGlmICghZHJpbGxlci5vbikge1xuICAgICAgICB0aHJvdygnZHJpbGxlciBtdXN0IGltcGxlbWVudCBldmVudCBlbWl0dGVyJyk7XG4gICAgfVxuICAgIHRoaXMuZHJpbGxlciA9IGRyaWxsZXI7XG4gICAgdGhpcy5pbml0KCk7XG59O1xuXG5DYWxsZXIucHJvdG90eXBlID0ge1xuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy90aGlzLnByZWxvYWRBdWRpbygpO1xuICAgICAgICB0aGlzLnNwZWFrZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhdWRpbycpO1xuICAgICAgICB0aGlzLnNwZWFrZXIucHJlbG9hZCA9ICdhdXRvJztcbiAgICAgICAgdGhpcy5zcGVha2VyLmF1dG9wbGF5ID0gZmFsc2U7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdib2R5JylbMF0uYXBwZW5kQ2hpbGQodGhpcy5zcGVha2VyKTtcbiAgICAgICAgdGhpcy5kcmlsbGVyLm9uKCdzdGVwJywgdGhpcy5jYWxsU3RlcCwgdGhpcyk7XG4gICAgfSxcbiAgICBjYWxsU3RlcDogZnVuY3Rpb24gKHN0YXRlKSB7XG4gICAgICAgIHRoaXMuc3BlYWtlci5zcmMgPSAnYXNzZXRzL2F1ZGlvLycgKyB1dGlscy50b0Rhc2hlZCh0aGlzLmRyaWxsZXIuZGlzY2lwbGluZSkgKyAnLycgKyB1dGlscy50b0Rhc2hlZChzdGF0ZS5sYXN0U3RlcCkgKyAnLm9nZyc7XG4gICAgICAgIHRoaXMuc3BlYWtlci5wbGF5KCk7XG4gICAgfS8vLFxuLy8gICAgICAgICBwcmVsb2FkQXVkaW86IGZ1bmN0aW9uICgpIHtcbi8vICAgICAgICAgICAgIHZhciBzdGVwcyA9IHRoaXMuZHJpbGxlci5jb25mLnN0ZXBzO1xuLy8gLy9nZXRPd25Qcm9wZXJ0eU5hbWVzXG4vLyAgICAgICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FsbGVyOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIENvbnRyb2xQYW5lbCA9IGZ1bmN0aW9uIChjb250cm9sbGVyLCBjb25mKSB7XG4gICAgaWYgKCFjb250cm9sbGVyLm9uKSB7XG4gICAgICAgIHRocm93KCdjb250cm9sbGVyIG11c3QgaW1wbGVtZW50IGV2ZW50IGVtaXR0ZXIgcGF0dGVybicpO1xuICAgIH1cbiAgICB0aGlzLmZpZWxkTGlzdCA9IGNvbmYuZmllbGRMaXN0O1xuICAgIHRoaXMuYWN0aW9uTGlzdCA9IGNvbmYuYWN0aW9uTGlzdDtcbiAgICB0aGlzLmNvbnRyb2xsZXIgPSBjb250cm9sbGVyO1xuICAgIHRoaXMuZm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbmYuZm9ybUlkKTtcbiAgICB0aGlzLmluaXQoKTtcbn07XG5cbkNvbnRyb2xQYW5lbC5wcm90b3R5cGUgPSB7XG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgaSwgaWw7XG4gICAgICAgIGlmICh0aGlzLmZpZWxkTGlzdCkge1xuICAgICAgICAgICAgZm9yKGkgPSAwLCBpbCA9IHRoaXMuZmllbGRMaXN0Lmxlbmd0aDsgaTxpbDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5iaW5kRmllbGQodGhpcy5maWVsZExpc3RbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmFjdGlvbkxpc3QpIHtcbiAgICAgICAgICAgIGZvcihpID0gMCwgaWwgPSB0aGlzLmFjdGlvbkxpc3QubGVuZ3RoOyBpPGlsOyBpKyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLmJpbmRBY3Rpb24odGhpcy5hY3Rpb25MaXN0W2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBiaW5kRmllbGQ6IGZ1bmN0aW9uIChmaWVsZE5hbWUpIHtcbiAgICAgICAgdmFyIGZpZWxkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZmllbGROYW1lKSxcbiAgICAgICAgICAgIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgdmFsUHJvcDtcblxuICAgICAgICBpZiAoIWZpZWxkKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ21pc3NpbmcgZmllbGQgaW4gY29udHJvbCBwYW5lbDogJyArIGZpZWxkTmFtZSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmFsUHJvcCA9IFsnY2hlY2tib3gnLCAncmFkaW8nXS5pbmRleE9mKGZpZWxkLnR5cGUpID4gLTEgPyAnY2hlY2tlZCcgOiAndmFsdWUnO1xuICAgICAgICBmaWVsZFt2YWxQcm9wXSA9IHRoaXMuY29udHJvbGxlci5jb25mW2ZpZWxkTmFtZV07XG4gICAgICAgIGZpZWxkLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IGZpZWxkW3ZhbFByb3BdO1xuICAgICAgICAgICAgdGhhdC5jb250cm9sbGVyLmNvbmZbZmllbGROYW1lXSA9IHZhbHVlO1xuICAgICAgICAgICAgdmFyIGRhdGEgPSB7fTtcbiAgICAgICAgICAgIGRhdGFbZmllbGROYW1lXSA9IHZhbHVlO1xuICAgICAgICAgICAgdGhhdC5jb250cm9sbGVyLmZpcmUoJ2NvbmZpZ0NoYW5nZScsIGRhdGEpO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIGJpbmRBY3Rpb246IGZ1bmN0aW9uIChhY3Rpb25OYW1lKSB7XG4gICAgICAgIHZhciBidXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChhY3Rpb25OYW1lKSxcbiAgICAgICAgICAgIHRoYXQgPSB0aGlzO1xuICAgICAgICBpZiAoIWJ1dHRvbikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdtaXNzaW5nIGJ1dHRvbiBvbiBjb250cm9sIHBhbmVsOiAnICsgYWN0aW9uTmFtZSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhhdC5jb250cm9sbGVyW2FjdGlvbk5hbWVdKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ29udHJvbFBhbmVsOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJy4uL21peGlucy9ldmVudC1lbWl0dGVyJyksXG4gICAgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpLFxuICAgIEwgPSAnTGVmdCcsXG4gICAgUiA9ICdSaWdodCcsXG4gICAgTiA9ICdOb3J0aCcsXG4gICAgUyA9ICdTb3V0aCcsXG4gICAgRSA9ICdFYXN0JyxcbiAgICBXID0gJ1dlc3QnLFxuICAgIGNvbXBhc3MgPSBbTiwgRSwgUywgV107XG5cbnZhciBEcmlsbGVyID0gZnVuY3Rpb24gKGNvbmYpIHtcbiAgICB0aGlzLmRpc2NpcGxpbmUgPSAoY29uZiAmJiBjb25mLmRpc2NpcGxpbmUpIHx8IERyaWxsZXIuZGVmYXVsdHMuZGlzY2lwbGluZTtcbiAgICB0aGlzLmNvbmYgPSB1dGlscy5leHRlbmRPYmooe30sIERyaWxsZXIuZGVmYXVsdHMsIERyaWxsZXIuZGlzY2lwbGluZUNvbmZpZ3NbdGhpcy5kaXNjaXBsaW5lXSwgY29uZiB8fCB7fSk7XG4gICAgdGhpcy5pbml0KCk7XG59O1xuXG5EcmlsbGVyLmRlZmF1bHRzID0ge1xuICAgIGRpc2NpcGxpbmU6ICd0YWlDaGknLFxuICAgIGRpc2FibGVkU3RlcHM6IFtdLFxuICAgIG1pblRpbWU6IDEsXG4gICAgbWF4VGltZTogMixcbiAgICAvLyBhdmdUaW1lOiAzLFxuICAgIC8vIGF2Z1dlaWdodDogMSxcbiAgICBhcmVhV2lkdGg6IDQsXG4gICAgYXJlYUxlbmd0aDogNCxcbiAgICBzdGVwQ291bnQ6IC0xIC8vIC0xIGZvciBpbmZpbml0ZVxufTtcblxuRHJpbGxlci5hZGREaXNjaXBsaW5lID0gZnVuY3Rpb24gKGNvbmZpZykge1xuICAgIGlmICghY29uZmlnLm5hbWUpIHtcbiAgICAgICAgdGhyb3coJ25hbWUgbXVzdCBiZSBkZWZpbmVkIGZvciBhbnkgZGlzY2lwbGluZSBjb25maWcnKTtcbiAgICB9XG4gICAgRHJpbGxlci5kaXNjaXBsaW5lQ29uZmlnc1tjb25maWcubmFtZV0gPSBjb25maWc7XG4gICAgdXRpbHMuZGVmaW5lUHJvcHMoY29uZmlnLnN0ZXBzKTtcbn07XG5cbkRyaWxsZXIuZGlzY2lwbGluZUNvbmZpZ3MgPSB7fTtcblxuRHJpbGxlci5wcm90b3R5cGUgPSB7XG4gICAgaW5pdDogZnVuY3Rpb24gKGRvbnRTdGFydCkge1xuICAgICAgICB2YXIgc3RhcnRQb3MgPSB0aGlzLmNvbmYuc3RhcnRQb3NpdGlvbiB8fCB7fSxcbiAgICAgICAgICAgIHRoYXQgPSB0aGlzO1xuICAgICAgICB0aGlzLmRpc2FibGVkU3RlcHMgPSB7fTtcbiAgICAgICAgdGhpcy5jb25mLmRpc2FibGVkU3RlcHMubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICB0aGF0LmRpc2FibGVkU3RlcHNbaXRlbV0gPSB0cnVlO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5jb29yZHMgPSAodGhpcy5jb25mLnByZXNlcnZlUG9zaXRpb24gPyB0aGlzLmNvb3JkcyA6IHN0YXJ0UG9zLmNvb3JkcykgfHwgWzAsMF07XG4gICAgICAgIHRoaXMuZnJvbnRGb290ID0gc3RhcnRQb3MuZnJvbnRGb290IHx8IG51bGw7XG4gICAgICAgIC8vIGlmICgnZGlyZWN0aW9uJyBpbiB0aGlzKSB7XG5cbiAgICAgICAgLy8gfVxuICAgICAgICB0aGlzLmRpcmVjdGlvbiA9ICh0aGlzLmNvbmYucHJlc2VydmVQb3NpdGlvbiA/IHRoaXMuZGlyZWN0aW9uIDogc3RhcnRQb3MuZGlyZWN0aW9uKTtcbiAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSB0eXBlb2YgdGhpcy5kaXJlY3Rpb24gPT09ICd1bmRlZmluZWQnID8gMCA6IHRoaXMuZGlyZWN0aW9uO1xuICAgICAgICB0aGlzLmxvbmdEaXJlY3Rpb24gPSBjb21wYXNzW3RoaXMuZGlyZWN0aW9uXTtcbiAgICAgICAgLy90aGlzLmRpcmVjdGlvbiA9IHN0YXJ0UG9zLmRpcmVjdGlvbiB8fCAwO1xuICAgICAgICB0aGlzLnN0ZXBDb3VudCA9IHRoaXMuY29uZi5zdGVwQ291bnQ7XG4gICAgICAgIHRoaXMuY29uZi5taW5UaW1lID0gTWF0aC5tYXgodGhpcy5jb25mLm1pblRpbWUsIDAuNSk7XG4gICAgICAgIHRoaXMuY29uZi5tYXhUaW1lID0gTWF0aC5tYXgodGhpcy5jb25mLm1heFRpbWUsIHRoaXMuY29uZi5taW5UaW1lKTtcbiAgICAgICAgdGhpcy5maXJlKCdpbml0aWFsaXNlZCcpO1xuICAgICAgICBpZiAodGhpcy5jb25mLmF1dG9wbGF5ICYmICFkb250U3RhcnQpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhcnQoKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgX3N0YXJ0OiBmdW5jdGlvbiAocmVzZXQpIHtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuZmlyZSgnc3RhcnRlZCcpO1xuICAgICAgICB0aGlzLnJ1bm5pbmcgPSB0cnVlO1xuICAgICAgICB0aGlzLnN0YXJ0U2VxdWVuY2UgPSB0aGlzLmNvbmYuc3RhcnRTZXF1ZW5jZS5zbGljZSgpO1xuICAgICAgICB0aGlzLmFubm91bmNlU3RlcCh0aGlzLnN0YXJ0U2VxdWVuY2Uuc2hpZnQoKSk7XG4gICAgICAgIHRoaXMudGFrZVN0ZXAoKTtcbiAgICB9LFxuICAgIHN0YXJ0OiBmdW5jdGlvbiAocmVzZXQpIHtcbiAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICBpZiAocmVzZXQpIHtcbiAgICAgICAgICAgIHRoaXMuaW5pdCh0cnVlKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnJ1bm5pbmcgPT09IHRydWUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5jb25mLmRlbGF5KSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aGF0Ll9zdGFydChyZXNldCk7XG4gICAgICAgICAgICB9LCB0aGlzLmNvbmYuZGVsYXkgKiAxMDAwKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX3N0YXJ0KHJlc2V0KTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgcmVzZXRBbmRTdGFydDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnN0b3AodHJ1ZSk7XG4gICAgICAgIHRoaXMuc3RhcnQodHJ1ZSk7XG4gICAgfSxcbiAgICBhbm5vdW5jZVN0ZXA6IGZ1bmN0aW9uIChzdGVwKSB7XG4gICAgICAgIGlmICghdGhpcy5jb25mLnN0ZXBzW3N0ZXBdKSB7XG4gICAgICAgICAgICB0aHJvdygnaW52YWxpZCBzdGVwIG5hbWU6ICcgKyBzdGVwKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmZpcmUoJ3N0ZXAnLCB7XG4gICAgICAgICAgICBkaXJlY3Rpb246IGNvbXBhc3NbdGhpcy5kaXJlY3Rpb25dLFxuICAgICAgICAgICAgZnJvbnRGb290OiB0aGlzLmZyb250Rm9vdCxcbiAgICAgICAgICAgIGxhc3RTdGVwOiBzdGVwLFxuICAgICAgICAgICAgY29vcmRzOiB0aGlzLmNvb3Jkcy5zbGljZSgpXG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgc3RvcDogZnVuY3Rpb24gKGFib3J0KSB7XG4gICAgICAgIGlmICh0aGlzLnJ1bm5pbmcgPT09IHRydWUpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVyKTtcbiAgICAgICAgICAgIGlmICghYWJvcnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVuZFNlcXVlbmNlID0gdGhpcy5jb25mLmVuZFNlcXVlbmNlLnNsaWNlKCk7XG4gICAgICAgICAgICAgICAgdGhpcy50YWtlU3RlcCh0cnVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuZmlyZSgnc3RvcHBlZCcpO1xuICAgICAgICAgICAgdGhpcy5ydW5uaW5nID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHRha2VTdGVwOiBmdW5jdGlvbiAoY2xvc2luZykge1xuICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICBzdGVwO1xuICAgICAgICBcbiAgICAgICAgaWYgKCF0aGlzLnN0ZXBDb3VudCAmJiAhY2xvc2luZyAmJiAhdGhpcy5zdGFydFNlcXVlbmNlLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RvcCgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnN0ZXBDb3VudCAmJiAhdGhpcy5zdGFydFNlcXVlbmNlLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy5zdGVwQ291bnQtLTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgc3RlcCA9IHRoaXMuZ2V0TmV4dFN0ZXBOYW1lKGNsb3NpbmcpO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIGlmIChjbG9zaW5nKSB7XG4gICAgICAgICAgICBpZiAoc3RlcCkge1xuICAgICAgICAgICAgICAgIHRoaXMuYWRqdXN0UG9zaXRpb24oc3RlcCk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZW5kU2VxdWVuY2UubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQudGFrZVN0ZXAoY2xvc2luZyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy50aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRoYXQuYWRqdXN0UG9zaXRpb24oc3RlcCk7XG4gICAgICAgICAgICAgICAgdGhhdC50YWtlU3RlcCgpO1xuICAgICAgICAgICAgICAgIC8vIHJlbWVtYmVyIHRvIGRvIHRoaXMgb24gc291bmQgZmluaXNoIChtYXliZT8pXG4gICAgICAgICAgICB9LCB0aGlzLmdldFRpbWVJbnRlcnZhbCgpKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgZ2V0TmV4dFN0ZXBOYW1lOiBmdW5jdGlvbiAoY2xvc2luZykge1xuICAgICAgICB2YXIgc3RlcDtcbiAgICAgICAgaWYgKGNsb3NpbmcpIHtcbiAgICAgICAgICAgIHN0ZXAgPSB0aGlzLmVuZFNlcXVlbmNlLmxlbmd0aCA/IHRoaXMuZW5kU2VxdWVuY2Uuc2hpZnQoKTogdW5kZWZpbmVkO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhcnRTZXF1ZW5jZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHN0ZXAgPSB0aGlzLnN0YXJ0U2VxdWVuY2Uuc2hpZnQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0ZXAgPSB0aGlzLmdldFJhbmRvbVN0ZXAoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXN0ZXApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy52YWxpZGF0ZVN0ZXAoc3RlcCkgPyBzdGVwIDogdGhpcy5nZXROZXh0U3RlcE5hbWUoY2xvc2luZyk7XG4gICAgfSxcbiAgICBnZXRSYW5kb21TdGVwOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB1dGlscy5waWNrUmFuZG9tUHJvcGVydHkodGhpcy5jb25mLnN0ZXBzKTtcbiAgICB9LFxuICAgIHZhbGlkYXRlU3RlcDogZnVuY3Rpb24gKHN0ZXApIHtcbiAgICAgICAgaWYgKHRoaXMuZGlzYWJsZWRTdGVwc1tzdGVwXSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHZhciBuZXdQb3NpdGlvbiA9IHRoaXMuYWRqdXN0UG9zaXRpb24oc3RlcCwgdHJ1ZSk7XG4gICAgICAgIHJldHVybiAobmV3UG9zaXRpb25bMF0gPj0gMCAmJiBuZXdQb3NpdGlvblsxXSA+PSAwICYmIG5ld1Bvc2l0aW9uWzFdIDwgdGhpcy5jb25mLmFyZWFXaWR0aCAmJiBuZXdQb3NpdGlvblswXSA8IHRoaXMuY29uZi5hcmVhTGVuZ3RoKTtcbiAgICB9LFxuICAgIGFkanVzdFBvc2l0aW9uOiBmdW5jdGlvbiAoc3RlcCwgZHVtbXkpIHtcbiAgICAgICAgdmFyIG1vdmVNYXRyaXgsXG4gICAgICAgICAgICBsZWZ0VG9SaWdodCxcbiAgICAgICAgICAgIGZyb250VG9CYWNrLFxuICAgICAgICAgICAgY29vcmRzLFxuICAgICAgICAgICAgY3VycmVudFN0ZXAsXG4gICAgICAgICAgICBkaXJlY3Rpb24sXG4gICAgICAgICAgICBsb25nRGlyZWN0aW9uLCBcbiAgICAgICAgICAgIGZyb250Rm9vdDtcblxuICAgICAgICBjdXJyZW50U3RlcCA9IHRoaXMuY29uZi5zdGVwc1tzdGVwXTtcbiAgICAgICAgaWYgKCFjdXJyZW50U3RlcCkge1xuICAgICAgICAgICAgLy8gaWYgKGR1bW15KSB7XG4gICAgICAgICAgICAvLyAgICAgcmV0dXJuIFsxMDAwMDAwMDAwLCAxMDAwMDAwMDAwXTtcbiAgICAgICAgICAgIC8vIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdygnaW52YWxpZCBzdGVwIG5hbWU6ICcgKyBzdGVwKTtcbiAgICAgICAgICAgIC8vIH1cbiAgICAgICAgfVxuICAgICAgICBkaXJlY3Rpb24gPSAodGhpcy5kaXJlY3Rpb24gKyAoKHRoaXMuZnJvbnRGb290ID09PSBMID8gMSA6IC0xKSAqIGN1cnJlbnRTdGVwLmRpcmVjdGlvbikgKyA0KSAlIDQ7XG4gICAgICAgIGxvbmdEaXJlY3Rpb24gPSBjb21wYXNzW2RpcmVjdGlvbl07XG4gICAgICAgIGxlZnRUb1JpZ2h0ID0gY3VycmVudFN0ZXAubW92ZVsxXSAqICh0aGlzLmZyb250Rm9vdCAhPT0gUiA/IDE6IC0xKTtcbiAgICAgICAgZnJvbnRUb0JhY2sgPSBjdXJyZW50U3RlcC5tb3ZlWzBdO1xuXG4gICAgICAgIGZyb250Rm9vdCA9ICAgIGN1cnJlbnRTdGVwLmZyb250Rm9vdCA9PT0gTCA/IEwgOlxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFN0ZXAuZnJvbnRGb290ID09PSBSID8gUiA6XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50U3RlcC5mcm9udEZvb3QgPT09IG51bGwgPyBudWxsIDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRTdGVwLmZyb250Rm9vdCA9PT0gMSA/ICh0aGlzLmZyb250Rm9vdCA9PT0gUiA/IEwgOiBSKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZyb250Rm9vdDtcbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCAodGhpcy5kaXJlY3Rpb24pIHtcbiAgICAgICAgXG4gICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgIG1vdmVNYXRyaXggPSBbZnJvbnRUb0JhY2ssIGxlZnRUb1JpZ2h0XTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICBtb3ZlTWF0cml4ID0gWy1sZWZ0VG9SaWdodCwgZnJvbnRUb0JhY2tdO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIG1vdmVNYXRyaXggPSBbLWZyb250VG9CYWNrLCAtbGVmdFRvUmlnaHRdO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIG1vdmVNYXRyaXggPSBbbGVmdFRvUmlnaHQsIC1mcm9udFRvQmFja107XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICB9XG5cbiAgICAgICAgY29vcmRzID0gW3RoaXMuY29vcmRzWzBdICsgbW92ZU1hdHJpeFswXSwgdGhpcy5jb29yZHNbMV0gKyBtb3ZlTWF0cml4WzFdXTtcblxuICAgICAgICBpZiAoZHVtbXkpIHtcbiAgICAgICAgICAgIHJldHVybiBjb29yZHM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmNvb3JkcyA9IGNvb3JkcztcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFN0ZXAgPSBjdXJyZW50U3RlcDtcbiAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uID0gZGlyZWN0aW9uO1xuICAgICAgICAgICAgdGhpcy5sb25nRGlyZWN0aW9uID0gbG9uZ0RpcmVjdGlvbjtcbiAgICAgICAgICAgIHRoaXMuZnJvbnRGb290ID0gZnJvbnRGb290O1xuICAgICAgICAgICAgdGhpcy5hbm5vdW5jZVN0ZXAoc3RlcCk7ICAgIFxuICAgICAgICB9XG4gICAgICAgIFxuICAgIH0sXG5cbiAgICBnZXRUaW1lSW50ZXJ2YWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG1pbiA9IDIsXG4gICAgICAgICAgICBhdmFpbGFibGVJbnRlcnZhbCA9IHRoaXMuY29uZi5tYXhUaW1lIC0gdGhpcy5jb25mLm1pblRpbWU7XG5cbiAgICAgICAgdmFyIHRpbWUgPSAobWluICsgKGF2YWlsYWJsZUludGVydmFsICogTWF0aC5yYW5kb20oKSkpO1xuICAgICAgICB0aW1lID0gTWF0aC5tYXgoTWF0aC5taW4odGhpcy5jb25mLm1heFRpbWUsIHRpbWUpLCB0aGlzLmNvbmYubWluVGltZSk7XG4gICAgICAgIHJldHVybiB0aW1lICogMTAwMDtcblxuXG4gICAgICAgIC8vIHZhciB0aW1lID0gKCgoYXZhaWxhYmxlSW50ZXJ2YWwgKiBNYXRoLnJhbmRvbSgpKS8odGhpcy5jb25mLmF2Z1dlaWdodCArIDEpKSArICh0aGlzLmNvbmYuYXZnVGltZSAqKHRoaXMuY29uZi5hdmdXZWlnaHQvKHRoaXMuY29uZi5hdmdXZWlnaHQgKyAxKSkpKSArIHRoaXMuY29uZi5taW5UaW1lO1xuXG4gICAgfSxcbiAgICBlbmFibGVTdGVwOiBmdW5jdGlvbiAoc3RlcCkge1xuICAgICAgICBcbiAgICAgICAgdmFyIHN0ZXBJbmRleCA9IHRoaXMuY29uZi5kaXNhYmxlZFN0ZXBzLmluZGV4T2Yoc3RlcCk7XG4gICAgICAgIHRoaXMuZGlzYWJsZWRTdGVwc1tzdGVwXSA9IGZhbHNlO1xuICAgICAgICBpZiAoc3RlcEluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZi5kaXNhYmxlZFN0ZXBzLnNwbGljZShzdGVwSW5kZXgsIDEpO1xuICAgICAgICAgICAgLy8gb3IgY291bGQganVzdCBmaXJlICdzdGVwRGlzYWJsZWQnXG4gICAgICAgICAgICB0aGlzLmZpcmUoJ2NvbmZpZ0NoYW5nZScsIHtcbiAgICAgICAgICAgICAgICBkaXNhYmxlZFN0ZXBzOiB0aGlzLmNvbmYuZGlzYWJsZWRTdGVwc1xuICAgICAgICAgICAgfSk7ICBcbiAgICAgICAgfVxuICAgIH0sXG4gICAgZGlzYWJsZVN0ZXA6IGZ1bmN0aW9uIChzdGVwKSB7XG4gICAgICAgIHZhciBzdGVwSW5kZXggPSB0aGlzLmNvbmYuZGlzYWJsZWRTdGVwcy5pbmRleE9mKHN0ZXApO1xuICAgICAgICB0aGlzLmRpc2FibGVkU3RlcHNbc3RlcF0gPSB0cnVlO1xuICAgICAgICBpZiAoc3RlcEluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgdGhpcy5jb25mLmRpc2FibGVkU3RlcHMucHVzaChzdGVwKTtcbiAgICAgICAgICAgIHRoaXMuZmlyZSgnY29uZmlnQ2hhbmdlJywge1xuICAgICAgICAgICAgICAgIGRpc2FibGVkU3RlcHM6IHRoaXMuY29uZi5kaXNhYmxlZFN0ZXBzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sXG5cblxuICAgIC8vID8/P05FRUQgVE8gV1JJVEUgVEVTVFMgRk9SIHRoaXNcbiAgICAvLyAgICAgICAgICAgICBpdCgnc2hvdWxkIGJlIGFmZmVjdGVkIGJ5IGxpdmUgY2hhbmdlcyB0byB0aGUgY29uZmlnJywgZnVuY3Rpb24gKCkge1xuXG4gICAgLy8gICAgIH0pO1xuICAgIHVwZGF0ZVNldHRpbmdzOiBmdW5jdGlvbiAoY29uZikge1xuICAgICAgICB0aGlzLmNvbmYgPSB1dGlscy5leHRlbmRPYmoodGhpcy5jb25mLCBjb25mKTtcbiAgICAgICAgXG4gICAgLy8gZGVmaW5lU3RlcDogZnVuY3Rpb24gKG5hbWUsIGNvbmYpIHtcbiAgICAvLyAgICAgdGhpcy5zdGVwc1tuYW1lXSA9IGNvbmY7XG4gICAgLy8gfSxcbiAgICAvLyB1bmRlZmluZVN0ZXA6IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgLy8gICAgIGlmICh0aGlzLnN0ZXBzW25hbWVdKSB7XG4gICAgLy8gICAgICAgICBkZWxldGUgdGhpcy5zdGVwc1tuYW1lXTtcbiAgICAvLyAgICAgfVxuICAgIH1cbn07XG5cbmV2ZW50RW1pdHRlci5hcHBseShEcmlsbGVyLnByb3RvdHlwZSk7XG5cbm1vZHVsZS5leHBvcnRzID0gRHJpbGxlcjsiLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyksXG4gICAgYXJyb3dDb2RlcyA9IHsgXG4gICAgV2VzdDogODU5MixcbiAgICBOb3J0aDogODU5MyxcbiAgICBFYXN0OiA4NTk0LFxuICAgIFNvdXRoOiA4NTk1XG59LFxuZGVmYXVsdENlbGxIdG1sID0gJyZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwOyc7XG5cbnZhciBWaXN1YWxpc2VyID0gZnVuY3Rpb24gKGRyaWxsZXIsIGRvbU5vZGVJZCkge1xuICAgIHRoaXMuY29uZiA9IGRyaWxsZXIuY29uZjtcbiAgICB0aGlzLmRyaWxsZXIgPSBkcmlsbGVyO1xuICAgIHRoaXMuZG9tTm9kZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGRvbU5vZGVJZCk7XG4gICAgdGhpcy5pbml0KCk7XG59O1xuXG5WaXN1YWxpc2VyLnByb3RvdHlwZSA9IHtcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgXG4gICAgICAgIHRoaXMuZHJpbGxlci5vbignaW5pdGlhbGlzZWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLnByaW1lKCk7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgICAgICAvLyB0aGlzLmRyaWxsZXIub24oJ3N0b3BwZWQnLCB0aGlzLnVuZHJhd0dyaWQsIHRoaXMpO1xuICAgICAgICB0aGlzLmRyaWxsZXIub24oJ3N0ZXAnLCBmdW5jdGlvbiAoc3RhdGUpIHtcbiAgICAgICAgICAgIGlmKHRoaXMuY29uZi5hcmVhV2lkdGggPiAwICYmIHRoaXMuY29uZi5hcmVhTGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0UG9zaXRpb24oc3RhdGUuY29vcmRzLCBzdGF0ZS5kaXJlY3Rpb24sIHN0YXRlLmZyb250Rm9vdCk7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDYXB0aW9uKHV0aWxzLmNhbWVsVG9TcGFjZWQoc3RhdGUubGFzdFN0ZXApKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgdGhpcy5wcmltZSgpO1xuXG5cbiAgICB9LFxuICAgIHByaW1lOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmKHRoaXMuY29uZi5hcmVhV2lkdGggPiAwICYmIHRoaXMuY29uZi5hcmVhTGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdGhpcy51bmRyYXdHcmlkKCk7XG4gICAgICAgICAgICB0aGlzLmRyYXdDYXB0aW9uKCk7XG4gICAgICAgICAgICB0aGlzLmRyYXdHcmlkKCk7XG4gICAgICAgICAgICB0aGlzLnNldFBvc2l0aW9uKHRoaXMuZHJpbGxlci5jb29yZHMsIHRoaXMuZHJpbGxlci5sb25nRGlyZWN0aW9uLCAnY2VudGVyJyk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGRyYXdDYXB0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuY2FwdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2gyJyk7XG4gICAgICAgIHRoaXMuY2FwdGlvbi5pbm5lckhUTUwgPSAnJm5ic3A7JztcbiAgICAgICAgdGhpcy5kb21Ob2RlLmFwcGVuZENoaWxkKHRoaXMuY2FwdGlvbik7XG4gICAgfSxcbiAgICB1cGRhdGVDYXB0aW9uOiBmdW5jdGlvbiAodGV4dCkge1xuICAgICAgICB0aGlzLmNhcHRpb24uaW5uZXJIVE1MID0gdGV4dC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHRleHQuc3Vic3RyKDEpO1xuICAgIH0sXG4gICAgZHJhd0dyaWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHRhYmxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGFibGUnKSxcbiAgICAgICAgICAgIHJvdyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RyJyksXG4gICAgICAgICAgICBjZWxsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGQnKSxcbiAgICAgICAgICAgIHdpZHRoID0gdGhpcy5jb25mLmFyZWFXaWR0aCxcbiAgICAgICAgICAgIGhlaWdodCA9IHRoaXMuY29uZi5hcmVhTGVuZ3RoLFxuICAgICAgICAgICAgaSxcbiAgICAgICAgICAgIG5ld1JvdyxcbiAgICAgICAgICAgIG5ld0NlbGw7XG5cbiAgICAgICAgd2hpbGUoaGVpZ2h0LS0pIHtcbiAgICAgICAgICAgIG5ld1JvdyA9IHJvdy5jbG9uZU5vZGUoKTtcbiAgICAgICAgICAgIHRhYmxlLmFwcGVuZENoaWxkKG5ld1Jvdyk7XG4gICAgICAgICAgICBmb3IoaT0wO2k8d2lkdGg7aSsrKSB7XG4gICAgICAgICAgICAgICAgbmV3Q2VsbCA9IGNlbGwuY2xvbmVOb2RlKCk7XG4gICAgICAgICAgICAgICAgbmV3Q2VsbC5pbm5lckhUTUwgPSBkZWZhdWx0Q2VsbEh0bWw7XG4gICAgICAgICAgICAgICAgbmV3Um93LmFwcGVuZENoaWxkKG5ld0NlbGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuZG9tTm9kZS5hcHBlbmRDaGlsZCh0YWJsZSk7XG4gICAgICAgIHRoaXMuZ3JpZCA9IHRhYmxlO1xuICAgICAgICB0YWJsZS5jbGFzc05hbWUgPSAnZmxvb3JzcGFjZSc7XG4gICAgfSxcbiAgICB1bmRyYXdHcmlkOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuZG9tTm9kZS5pbm5lckhUTUwgPSAnJztcbiAgICB9LFxuICAgIHNldFBvc2l0aW9uOiBmdW5jdGlvbihjb29yZHMsIGRpcmVjdGlvbiwgZnJvbnRGb290KSB7XG4gICAgICAgIFxuICAgICAgICBpZiAodGhpcy5wb3NpdGlvbikge1xuICAgICAgICAgICAgdGhpcy51bnNob3dQb3NpdGlvbigpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBjZWxsID0gdGhpcy5ncmlkLmdldEVsZW1lbnRzQnlUYWdOYW1lKCd0cicpWyh0aGlzLmNvbmYuYXJlYUxlbmd0aCAtIDEpIC0gY29vcmRzWzBdXVxuICAgICAgICAgICAgICAgIC5nZXRFbGVtZW50c0J5VGFnTmFtZSgndGQnKVtjb29yZHNbMV1dO1xuXG4gICAgICAgIGNlbGwuY2xhc3NOYW1lID0gJ2N1cnJlbnQgJyArIGRpcmVjdGlvbi50b0xvd2VyQ2FzZSgpICsgJyAnICsgKGZyb250Rm9vdCAmJiBmcm9udEZvb3QudG9Mb3dlckNhc2UoKSk7XG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBjb29yZHM7XG4gICAgICAgIC8vIHVwIGFycm93XG4gICAgICAgIGNlbGwuaW5uZXJIVE1MID0gJyYjODU5MzsnO1xuICAgIH0sXG4gICAgdW5zaG93UG9zaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGNlbGwgPSB0aGlzLmdyaWQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3RyJylbKHRoaXMuY29uZi5hcmVhTGVuZ3RoIC0gMSkgLSB0aGlzLnBvc2l0aW9uWzBdXVxuICAgICAgICAgICAgICAgIC5nZXRFbGVtZW50c0J5VGFnTmFtZSgndGQnKVt0aGlzLnBvc2l0aW9uWzFdXTtcbiAgICAgICAgY2VsbC5jbGFzc05hbWUgPSAnJztcbiAgICAgICAgY2VsbC5pbm5lckhUTUwgPSBkZWZhdWx0Q2VsbEh0bWw7XG4gICAgICAgIFxuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVmlzdWFsaXNlcjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxudmFyIFN0ZXBTZWxlY3RvciA9IGZ1bmN0aW9uIChkcmlsbGVyLCBkb21Ob2RlSWQpIHtcbiAgICB0aGlzLmRyaWxsZXIgPSBkcmlsbGVyO1xuICAgIHRoaXMuZG9tTm9kZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGRvbU5vZGVJZCk7XG4gICAgdGhpcy5pbml0KCk7XG59O1xuXG5TdGVwU2VsZWN0b3IucHJvdG90eXBlID0ge1xuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGhlYWRpbmcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XG4gICAgICAgIGhlYWRpbmcudGV4dENvbnRlbnQgPSAnQ2hvb3NlIHdoaWNoIHN0ZXBzIHRvIGluY2x1ZGUgaW4geW91ciBkcmlsbCcsXG4gICAgICAgIHRoaXMuZG9tTm9kZS5hcHBlbmRDaGlsZChoZWFkaW5nKTtcbiAgICAgICAgdGhpcy5jcmVhdGVJbnB1dHMoKTtcbiAgICB9LFxuICAgIGNyZWF0ZUlucHV0czogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgbGFiZWwsXG4gICAgICAgICAgICBpbnB1dDtcbiAgICAgICAgZm9yICh2YXIga2V5IGluIHRoaXMuZHJpbGxlci5jb25mLnN0ZXBzKSB7XG4gICAgICAgICAgICBsYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xhYmVsJyk7XG4gICAgICAgICAgICBsYWJlbFsnZm9yJ10gPSBrZXk7XG4gICAgICAgICAgICBsYWJlbC50ZXh0Q29udGVudCA9IHV0aWxzLmNhbWVsVG9TcGFjZWQoa2V5KTtcbiAgICAgICAgICAgIGlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcbiAgICAgICAgICAgIGlucHV0LmlkID0ga2V5O1xuICAgICAgICAgICAgaW5wdXQubmFtZSA9ICdzdGVwU2VsZWN0b3InO1xuICAgICAgICAgICAgaW5wdXQudHlwZSA9ICdjaGVja2JveCc7XG4gICAgICAgICAgICB0aGlzLmRvbU5vZGUuYXBwZW5kQ2hpbGQoaW5wdXQpO1xuICAgICAgICAgICAgdGhpcy5kb21Ob2RlLmFwcGVuZENoaWxkKGxhYmVsKTtcbiAgICAgICAgICAgIHRoaXMuYmluZElucHV0VG9EcmlsbGVyKGtleSwgaW5wdXQpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBiaW5kSW5wdXRUb0RyaWxsZXI6IGZ1bmN0aW9uIChzdGVwLCBpbnB1dCkge1xuICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgIGlucHV0LmNoZWNrZWQgPSB0aGlzLmRyaWxsZXIuY29uZi5kaXNhYmxlZFN0ZXBzLmluZGV4T2Yoc3RlcCkgPT09IC0xO1xuICAgICAgICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgc3RlcEluZGV4O1xuICAgICAgICAgICAgaWYgKGlucHV0LmNoZWNrZWQpIHtcbiAgICAgICAgICAgICAgICB0aGF0LmRyaWxsZXIuZW5hYmxlU3RlcChzdGVwKTsgXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoYXQuZHJpbGxlci5kaXNhYmxlU3RlcChzdGVwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTdGVwU2VsZWN0b3I7IiwidmFyIHBpY2tSYW5kb21Qcm9wZXJ0eSA9IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgdmFyIHJlc3VsdDtcbiAgICAgICAgdmFyIGNvdW50ID0gMDtcbiAgICAgICAgZm9yICh2YXIgcHJvcCBpbiBvYmopIHtcbiAgICAgICAgICAgIGlmIChNYXRoLnJhbmRvbSgpIDwgMSAvICsrY291bnQpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBwcm9wO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgICAgICAgICBcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgZGVmaW5lUHJvcHMgPSBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgIHZhciBwcm9wO1xuICAgICAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICAgICAgICBwcm9wID0gb2JqW2tleV07XG4gICAgICAgICAgICBpZiAocHJvcC5fcHJvcGVydHlEZWZpbml0aW9uKSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIG9ialtrZXldO1xuICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgcHJvcCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICB9LFxuXG4gICAgZXh0ZW5kT2JqID0gZnVuY3Rpb24gKGJhc2UpIHtcbiAgICAgICAgdmFyIGV4dGVuZGVycyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSksXG4gICAgICAgICAgICBleHRlbmRlcjtcblxuICAgICAgICBpZiAoIWV4dGVuZGVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBiYXNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGV4dGVuZGVycy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICBleHRlbmRlciA9IGV4dGVuZGVycy5wb3AoKTtcbiAgICAgICAgICAgIGJhc2UgPSBleHRlbmRPYmouYXBwbHkodGhpcywgQXJyYXkucHJvdG90eXBlLmNvbmNhdC5hcHBseShbYmFzZV0sIGV4dGVuZGVycykpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXh0ZW5kZXIgPSBleHRlbmRlcnNbMF07XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gZXh0ZW5kZXIpIHtcbiAgICAgICAgICAgIGJhc2Vba2V5XSA9IGV4dGVuZGVyW2tleV07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYmFzZTtcbiAgICB9LFxuICAgIHRvQ2FtZWwgPSBmdW5jdGlvbiAodGV4dCkge1xuICAgICAgICByZXR1cm4gdGV4dC5yZXBsYWNlKC9cXC1cXHcvZywgZnVuY3Rpb24gKCQwKSB7XG4gICAgICAgICAgICByZXR1cm4gJDAuY2hhckF0KDEpLnRvVXBwZXJDYXNlKCk7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgdG9EYXNoZWQgPSBmdW5jdGlvbih0ZXh0KSB7XG4gICAgICAgIHJldHVybiB0ZXh0LnJlcGxhY2UoL1teQS1aXVtBLVpdL2csIGZ1bmN0aW9uICgkMCkge1xuICAgICAgICAgICAgcmV0dXJuICQwLmNoYXJBdCgwKSArICctJyArICQwLmNoYXJBdCgxKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIGRhc2hlZFRvU3BhY2VkID0gZnVuY3Rpb24gKHRleHQpIHtcbiAgICAgICAgcmV0dXJuIHRleHQucmVwbGFjZSgvLS9nLCAnICcpO1xuICAgIH0sXG4gICAgY2FtZWxUb1NwYWNlZCA9IGZ1bmN0aW9uICh0ZXh0KSB7XG4gICAgICAgIHJldHVybiBkYXNoZWRUb1NwYWNlZCh0b0Rhc2hlZCh0ZXh0KSk7XG4gICAgfTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgcGlja1JhbmRvbVByb3BlcnR5OiBwaWNrUmFuZG9tUHJvcGVydHksXG4gICAgZGVmaW5lUHJvcHM6IGRlZmluZVByb3BzLFxuICAgIGV4dGVuZE9iajogZXh0ZW5kT2JqLFxuICAgIHRvQ2FtZWw6IHRvQ2FtZWwsXG4gICAgdG9EYXNoZWQ6IHRvRGFzaGVkLFxuICAgIGRhc2hlZFRvU3BhY2VkOiBkYXNoZWRUb1NwYWNlZCxcbiAgICBjYW1lbFRvU3BhY2VkOiBjYW1lbFRvU3BhY2VkXG59OyJdfQ==
;