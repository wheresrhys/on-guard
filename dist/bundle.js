(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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