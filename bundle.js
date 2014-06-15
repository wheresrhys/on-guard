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
            disabledSteps: ['turn', 'inside', 'outside'],
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
        this.sources = {};
        var self = this;
        this.srcTypes = 'mp3,ogg,wav,aiff'.split(',')

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
defaultCellHtml = '<div>&nbsp;&nbsp;&nbsp;&nbsp;</div>';

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
        // cell.innerHTML = '&#8593;';
    },
    unshowPosition: function () {
        var cell = this.grid.getElementsByTagName('tr')[(this.conf.areaLength - 1) - this.position[0]]
                .getElementsByTagName('td')[this.position[1]];
        cell.className = '';
        // cell.offsetWidth;
        // cell.innerHTML = defaultCellHtml;
        
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
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvd2hlcmVzcmh5cy9TaXRlcy9vbi1ndWFyZC9zcmMvYXBwLmpzIiwiL1VzZXJzL3doZXJlc3JoeXMvU2l0ZXMvb24tZ3VhcmQvc3JjL2NvbmZpZ3MvdGFpLWNoaS5qcyIsIi9Vc2Vycy93aGVyZXNyaHlzL1NpdGVzL29uLWd1YXJkL3NyYy9tYWluLmpzIiwiL1VzZXJzL3doZXJlc3JoeXMvU2l0ZXMvb24tZ3VhcmQvc3JjL21peGlucy9ldmVudC1lbWl0dGVyLmpzIiwiL1VzZXJzL3doZXJlc3JoeXMvU2l0ZXMvb24tZ3VhcmQvc3JjL21vZHVsZXMvY2FsbGVyLmpzIiwiL1VzZXJzL3doZXJlc3JoeXMvU2l0ZXMvb24tZ3VhcmQvc3JjL21vZHVsZXMvY29udHJvbC1wYW5lbC5qcyIsIi9Vc2Vycy93aGVyZXNyaHlzL1NpdGVzL29uLWd1YXJkL3NyYy9tb2R1bGVzL2RyaWxsZXIuanMiLCIvVXNlcnMvd2hlcmVzcmh5cy9TaXRlcy9vbi1ndWFyZC9zcmMvbW9kdWxlcy9zaW1wbGUtdmlzdWFsaXNlci5qcyIsIi9Vc2Vycy93aGVyZXNyaHlzL1NpdGVzL29uLWd1YXJkL3NyYy9tb2R1bGVzL3N0ZXAtc2VsZWN0b3IuanMiLCIvVXNlcnMvd2hlcmVzcmh5cy9TaXRlcy9vbi1ndWFyZC9zcmMvdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbnZhclx0RHJpbGxlciA9IHJlcXVpcmUoJy4vbW9kdWxlcy9kcmlsbGVyJyksXG4gICAgQ2FsbGVyID0gcmVxdWlyZSgnLi9tb2R1bGVzL2NhbGxlcicpLFxuICAgIFZpc3VhbGlzZXIgPSByZXF1aXJlKCcuL21vZHVsZXMvc2ltcGxlLXZpc3VhbGlzZXInKSxcbiAgICBDb250cm9sUGFuZWwgPSByZXF1aXJlKCcuL21vZHVsZXMvY29udHJvbC1wYW5lbCcpLFxuICAgIFN0ZXBTZWxlY3RvciA9IHJlcXVpcmUoJy4vbW9kdWxlcy9zdGVwLXNlbGVjdG9yJyksXG4gICAgdGFpQ2hpQ29uZmlnID0gcmVxdWlyZSgnLi9jb25maWdzL3RhaS1jaGknKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICBEcmlsbGVyLmFkZERpc2NpcGxpbmUodGFpQ2hpQ29uZmlnKTtcbiAgICAgICAgXG4gICAgICAgIHZhciBkcmlsbGVyID0gbmV3IERyaWxsZXIoe1xuICAgICAgICAgICAgZGlzY2lwbGluZTogJ3RhaUNoaScsXG4gICAgICAgICAgICBkaXNhYmxlZFN0ZXBzOiBbJ3R1cm4nLCAnaW5zaWRlJywgJ291dHNpZGUnXSxcbiAgICAgICAgICAgIGRlbGF5OiAyXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmICh3aW5kb3cubG9jYXRpb24uaGFzaCAhPT0gJyNzaWxlbnQnKSB7XG4gICAgICAgICAgICB2YXIgY2FsbGVyID0gbmV3IENhbGxlcihkcmlsbGVyKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgY29udHJvbFBhbmVsID0gbmV3IENvbnRyb2xQYW5lbChkcmlsbGVyLCB7XG4gICAgICAgICAgICBmaWVsZExpc3Q6IFsnbWluVGltZScsJ21heFRpbWUnLCdhcmVhV2lkdGgnLCdhcmVhTGVuZ3RoJywnc3RlcENvdW50JywgJ2RlbGF5JywgJ3ByZXNlcnZlUG9zaXRpb24nXSxcbiAgICAgICAgICAgIGFjdGlvbkxpc3Q6IFsncmVzZXRBbmRTdGFydCcsICdzdG9wJ10sXG4gICAgICAgICAgICBmb3JtSWQ6ICdvbkd1YXJkQ29udHJvbFBhbmVsJ1xuICAgICAgICB9KTtcbiAgICAgICAgdmFyIHN0ZXBTZWxlY3RvciA9IG5ldyBTdGVwU2VsZWN0b3IoZHJpbGxlciwgJ2Rpc2FibGVkU3RlcHMnKTtcbiAgICAgICAgdmFyIHZpc3VhbGlzZXIgPSBuZXcgVmlzdWFsaXNlcihkcmlsbGVyLCAndmlzdWFsaXNlcicpO1xuICAgIH1cbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBuYW1lOiAndGFpQ2hpJyxcbiAgICBzdGVwczoge1xuICAgICAgICBzdGVwOiB7XG4gICAgICAgICAgICBmcm9udEZvb3Q6IDEsXG4gICAgICAgICAgICBtb3ZlOiBbMSwgMF0sXG4gICAgICAgICAgICBkaXJlY3Rpb246IDBcbiAgICAgICAgfSxcbiAgICAgICAgYmFjazoge1xuICAgICAgICAgICAgZnJvbnRGb290OiAxLFxuICAgICAgICAgICAgbW92ZTogWy0xLCAwXSxcbiAgICAgICAgICAgIGRpcmVjdGlvbjogMFxuICAgICAgICB9LFxuICAgICAgICBzaGlmdDoge1xuICAgICAgICAgICAgZnJvbnRGb290OiAxLFxuICAgICAgICAgICAgbW92ZTogWzAsIDBdLFxuICAgICAgICAgICAgZGlyZWN0aW9uOiAxXG4gICAgICAgIH0sXG4gICAgICAgICdzd2l0Y2gnOiB7XG4gICAgICAgICAgICBmcm9udEZvb3Q6IDEsXG4gICAgICAgICAgICBtb3ZlOiBbMCwgMF0sXG4gICAgICAgICAgICBkaXJlY3Rpb246IDBcbiAgICAgICAgfSxcbiAgICAgICAgaW5zaWRlOiB7XG4gICAgICAgICAgICBmcm9udEZvb3Q6IDAsXG4gICAgICAgICAgICBtb3ZlOiBbMCwgMV0sXG4gICAgICAgICAgICBkaXJlY3Rpb246IDBcbiAgICAgICAgfSxcbiAgICAgICAgb3V0c2lkZToge1xuICAgICAgICAgICAgZnJvbnRGb290OiAxLFxuICAgICAgICAgICAgbW92ZTogWzAsIC0xXSxcbiAgICAgICAgICAgIGRpcmVjdGlvbjogMFxuICAgICAgICB9LFxuICAgICAgICB0dXJuOiB7XG4gICAgICAgICAgICBmcm9udEZvb3Q6IDAsXG4gICAgICAgICAgICBtb3ZlOiBbMCwgLTFdLFxuICAgICAgICAgICAgZGlyZWN0aW9uOiAxXG4gICAgICAgIH0sXG4gICAgICAgIG9uR3VhcmQ6IHtcbiAgICAgICAgICAgIF9wcm9wZXJ0eURlZmluaXRpb246IHRydWUsXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICAgICAgZnJvbnRGb290OiAnTGVmdCcsXG4gICAgICAgICAgICAgICAgbW92ZTogWzAsIDBdLFxuICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogMFxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB3dUNoaToge1xuICAgICAgICAgICAgX3Byb3BlcnR5RGVmaW5pdGlvbjogdHJ1ZSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgICAgICBmcm9udEZvb3Q6IG51bGwsXG4gICAgICAgICAgICAgICAgbW92ZTogWzAsIDBdLFxuICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogMFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBzdGFydFNlcXVlbmNlOiBbJ3d1Q2hpJywgJ29uR3VhcmQnXSxcbiAgICBlbmRTZXF1ZW5jZTogWyd3dUNoaSddXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgYXBwID0gcmVxdWlyZSgnLi9hcHAnKTtcblxuYXBwLmluaXQoKTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBldmVudEVtaXR0ZXIgPSAoZnVuY3Rpb24gKHVuZGVmaW5lZCkge1xuXG4gICAgdmFyIGRvT24gPSBmdW5jdGlvbiAoY2FsbGJhY2tzLCBldmVudCwgY2FsbGJhY2ssIGNvbnRleHQpIHtcblxuICAgICAgICAgICAgLy8gZmV0Y2ggdGhlIGV2ZW50J3Mgc3RvcmUgb2YgY2FsbGJhY2tzIG9yIGNyZWF0ZSBpdCBpZiBuZWVkZWRcbiAgICAgICAgICAgIHZhciBzdG9yZSA9IGNhbGxiYWNrc1tldmVudF0gfHwgKGNhbGxiYWNrc1tldmVudF0gPSBbXSk7XG5cbiAgICAgICAgICAgIC8vIHN0b3JlIHRoZSBjYWxsYmFjayBmb3IgbGF0ZXIgdXNlXG4gICAgICAgICAgICBzdG9yZS5wdXNoKHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjazogY2FsbGJhY2ssXG4gICAgICAgICAgICAgICAgY29udGV4dDogY29udGV4dCB8fCB3aW5kb3cgfHwgbnVsbFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIGFsc28gb24gdG8gdGhlIGNvbnRleHQgb2JqZWN0J3MgZGVzdHJveSBldmVudCBpbiBvcmRlciB0byBvZmZcbiAgICAgICAgICAgIGlmIChjb250ZXh0KSB7XG4gICAgICAgICAgICAgICAgaWYgKGNvbnRleHQub24gIT09IG9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50RW1pdHRlci5hcHBseShjb250ZXh0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50ICE9PSAnc2lsZW5jZUV2ZW50cycpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5vbignc2lsZW5jZUV2ZW50cycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9mZi5jYWxsKHRoaXMsIGV2ZW50LCBjYWxsYmFjaywgY29udGV4dCk7XG4gICAgICAgICAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBkb09mZiA9IGZ1bmN0aW9uIChjYWxsYmFja3MsIGV2ZW50LCBjYWxsYmFjaywgY29udGV4dCkge1xuICAgICAgICAgICAgdmFyIHN0b3JlID0gY2FsbGJhY2tzW2V2ZW50XSxcbiAgICAgICAgICAgICAgICBpO1xuXG4gICAgICAgICAgICBpZiAoIXN0b3JlKSB7cmV0dXJuO31cblxuICAgICAgICAgICAgaWYgKCFjYWxsYmFjayAmJiAhY29udGV4dCkge1xuICAgICAgICAgICAgICAgIHN0b3JlLmxlbmd0aCA9IFtdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBmYXN0IGxvb3BcbiAgICAgICAgICAgIGZvciAoaSA9IHN0b3JlLmxlbmd0aCAtIDE7IGk+PTA7IGktLSkge1xuICAgICAgICAgICAgICAgIGlmICgoIWNhbGxiYWNrICYmIHN0b3JlW2ldLmNvbnRleHQgPT09IGNvbnRleHQpIHx8IChzdG9yZVtpXS5jYWxsYmFjayA9PT0gY2FsbGJhY2sgJiYgKCFjb250ZXh0IHx8ICEoc3RvcmVbaV0uY29udGV4dCkgfHwgc3RvcmVbaV0uY29udGV4dCA9PT0gY29udGV4dCkpKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gSSBtaWdodCBoYXZlIGdvdCB0aGUgaW5kZXggd3JvbmcgaGVyZSAtIHNob3VkbCBpdCBiZSBpLTEuIE9idmlvdXNseSBJJ2QgY2hlY2sgdGhvcm91Z2hseSBpbiBhIHJlYWwgYXBwXG4gICAgICAgICAgICAgICAgICAgIHN0b3JlLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGRvRmlyZSA9IGZ1bmN0aW9uIChjYWxsYmFja3MsIGV2ZW50LCByZXN1bHQpIHtcbiAgICAgICAgICAgIHZhciBzdG9yZSA9IGNhbGxiYWNrc1tldmVudF0sXG4gICAgICAgICAgICAgICAgaSA9IDAsXG4gICAgICAgICAgICAgICAgaWw7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdFdmVudCBlbWl0dGVkJywgJ1xcbmVtaXR0ZXI6ICcsIHRoaXMsICdcXG5ldmVudDonLCBldmVudCwgJ1xcbmRhdGE6ICcsIHJlc3VsdCk7XG4gICAgICAgICAgICBpZiAoIXN0b3JlKSB7cmV0dXJuO31cblxuICAgICAgICAgICAgLy8gbG9vcCBoZXJlIG11c3QgYmUgaW4gaW5jcmVhc2luZyBvcmRlclxuICAgICAgICAgICAgZm9yIChpbCA9IHN0b3JlLmxlbmd0aDsgaTxpbDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgc3RvcmVbaV0uY2FsbGJhY2suY2FsbChzdG9yZVtpXS5jb250ZXh0LCByZXN1bHQsIGV2ZW50LCB0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgb24gPSBmdW5jdGlvbiAoZXZlbnQsIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGV2ZW50ICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIHRocm93KCdwcm92aWRlIGEgc3RyaW5nIG5hbWUgZm9yIHRoZSBldmVudCB0byBzdWJzY3JpYmUgdG8nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICB0aHJvdygncHJvdmlkZSBhIGNhbGxiYWNrIGZvciB0aGUgZXZlbnQgdG8gc3Vic2NyaWJlIHRvJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBjYWxsYmFja3MgPSBnZXRDYWxsYmFja3ModGhpcyksXG4gICAgICAgICAgICAgICAgZXZlbnRzID0gZXZlbnQuc3BsaXQoJyAnKTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGlsID0gZXZlbnRzLmxlbmd0aDsgaTxpbDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgZG9Pbi5jYWxsKHRoaXMsIGNhbGxiYWNrcywgZXZlbnRzW2ldLCBjYWxsYmFjaywgY29udGV4dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgb2ZmID0gZnVuY3Rpb24gKGV2ZW50LCBjYWxsYmFjaywgY29udGV4dCkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBldmVudCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICB0aHJvdygncHJvdmlkZSBhIHN0cmluZyBuYW1lIGZvciB0aGUgZXZlbnQgdG8gdW5zdWJzY3JpYmUgZnJvbScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGNhbGxiYWNrcyA9IGdldENhbGxiYWNrcyh0aGlzLCB0cnVlKSxcbiAgICAgICAgICAgICAgICBldmVudHMgPSBldmVudC5zcGxpdCgnICcpO1xuXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmICghY2FsbGJhY2tzKSB7cmV0dXJuIGZhbHNlO31cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGlsID0gZXZlbnRzLmxlbmd0aDsgaTxpbDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgZG9PZmYuY2FsbCh0aGlzLCBjYWxsYmFja3MsIGV2ZW50c1tpXSwgY2FsbGJhY2ssIGNvbnRleHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGZpcmUgPSBmdW5jdGlvbiAoZXZlbnQsIHJlc3VsdCkge1xuICAgICAgICAgICAgdmFyIGNhbGxiYWNrcyA9IGdldENhbGxiYWNrcyh0aGlzKSxcbiAgICAgICAgICAgICAgICBldmVudHMgPSBldmVudC5zcGxpdCgnICcpO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgaWwgPSBldmVudHMubGVuZ3RoOyBpPGlsOyBpKyspIHtcbiAgICAgICAgICAgICAgICBkb0ZpcmUuY2FsbCh0aGlzLCBjYWxsYmFja3MsIGV2ZW50c1tpXSwgcmVzdWx0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBnZXRDYWxsYmFja3MgPSBmdW5jdGlvbiAob2JqLCBkb250U2V0KSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgaWwgPSBjb250ZXh0cy5sZW5ndGg7IGkgPCBpbDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNvbnRleHRzW2ldID09PSBvYmopIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrc1tpXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWRvbnRTZXQpIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0cy5wdXNoKG9iaik7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2tzLnB1c2goW10pO1xuICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFja3NbY2FsbGJhY2tzLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGNhbGxiYWNrcyA9IFtdLFxuICAgICAgICBjb250ZXh0cyA9IFtdLFxuICAgICAgICBcbiAgICAgICAgbWl4aW4gPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHRoaXMub24gPSBvbjtcbiAgICAgICAgICAgIHRoaXMub2ZmID0gb2ZmO1xuICAgICAgICAgICAgdGhpcy5maXJlID0gZmlyZTtcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH07XG5cbiAgICBtaXhpbi5jbGVhblVwID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBjYWxsYmFja3MgPSBbXTtcbiAgICAgICAgY29udGV4dHMgPSBbXTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIG1peGluO1xuXG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV2ZW50RW1pdHRlcjsiLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyksXG4gICAgTCA9ICdMZWZ0JyxcbiAgICBSID0gJ1JpZ2h0JyxcbiAgICBOID0gJ05vcnRoJyxcbiAgICBTID0gJ1NvdXRoJyxcbiAgICBFID0gJ0Vhc3QnLFxuICAgIFcgPSAnV2VzdCcsXG4gICAgY29tcGFzcyA9IFtOLCBFLCBTLCBXXTtcblxudmFyIENhbGxlciA9IGZ1bmN0aW9uIChkcmlsbGVyKSB7XG4gICAgaWYgKCFkcmlsbGVyLm9uKSB7XG4gICAgICAgIHRocm93KCdkcmlsbGVyIG11c3QgaW1wbGVtZW50IGV2ZW50IGVtaXR0ZXInKTtcbiAgICB9XG4gICAgdGhpcy5kcmlsbGVyID0gZHJpbGxlcjtcbiAgICB0aGlzLmluaXQoKTtcbn07XG5cbkNhbGxlci5wcm90b3R5cGUgPSB7XG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICAvL3RoaXMucHJlbG9hZEF1ZGlvKCk7XG4gICAgICAgIHRoaXMuc3BlYWtlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2F1ZGlvJyk7XG4gICAgICAgIHRoaXMuc3BlYWtlci5wcmVsb2FkID0gJ2F1dG8nO1xuICAgICAgICB0aGlzLnNwZWFrZXIuYXV0b3BsYXkgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5zb3VyY2VzID0ge307XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdGhpcy5zcmNUeXBlcyA9ICdtcDMsb2dnLHdhdixhaWZmJy5zcGxpdCgnLCcpXG5cbiAgICAgICAgdGhpcy5zcmNUeXBlcy5mb3JFYWNoKGZ1bmN0aW9uIChmb3JtYXQpIHtcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBzZWxmLnNvdXJjZXNbZm9ybWF0XSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NvdXJjZScpO1xuICAgICAgICAgICAgc291cmNlLnR5cGUgPSAnYXVkaW8vJyArIChmb3JtYXQgPT09ICdtcDMnID8gJ21wZWcnIDogKGZvcm1hdCA9PT0gJ2FpZmYnID8gJ3gtYWlmZicgOiBmb3JtYXQpKTtcbiAgICAgICAgICAgIHNlbGYuc3BlYWtlci5hcHBlbmRDaGlsZChzb3VyY2UpO1xuICAgICAgICB9KTtcblxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYm9keScpWzBdLmFwcGVuZENoaWxkKHRoaXMuc3BlYWtlcik7XG4gICAgICAgIHRoaXMuZHJpbGxlci5vbignc3RlcCcsIHRoaXMuY2FsbFN0ZXAsIHRoaXMpO1xuICAgIH0sXG4gICAgY2FsbFN0ZXA6IGZ1bmN0aW9uIChzdGF0ZSkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHRoaXMuc3JjVHlwZXMuZm9yRWFjaChmdW5jdGlvbiAoZm9ybWF0KSB7XG4gICAgICAgICAgICBzZWxmLnNvdXJjZXNbZm9ybWF0XS5zcmMgPSAnYXNzZXRzL2F1ZGlvLycgKyB1dGlscy50b0Rhc2hlZChzZWxmLmRyaWxsZXIuZGlzY2lwbGluZSkgKyAnLycgKyB1dGlscy50b0Rhc2hlZChzdGF0ZS5sYXN0U3RlcCkgKyAnLicgKyBmb3JtYXQ7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnNwZWFrZXIubG9hZCgpO1xuICAgICAgICB0aGlzLnNwZWFrZXIucGxheSgpO1xuICAgIH0vLyxcbi8vICAgICAgICAgcHJlbG9hZEF1ZGlvOiBmdW5jdGlvbiAoKSB7XG4vLyAgICAgICAgICAgICB2YXIgc3RlcHMgPSB0aGlzLmRyaWxsZXIuY29uZi5zdGVwcztcbi8vIC8vZ2V0T3duUHJvcGVydHlOYW1lc1xuLy8gICAgICAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENhbGxlcjsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBDb250cm9sUGFuZWwgPSBmdW5jdGlvbiAoY29udHJvbGxlciwgY29uZikge1xuICAgIGlmICghY29udHJvbGxlci5vbikge1xuICAgICAgICB0aHJvdygnY29udHJvbGxlciBtdXN0IGltcGxlbWVudCBldmVudCBlbWl0dGVyIHBhdHRlcm4nKTtcbiAgICB9XG4gICAgdGhpcy5maWVsZExpc3QgPSBjb25mLmZpZWxkTGlzdDtcbiAgICB0aGlzLmFjdGlvbkxpc3QgPSBjb25mLmFjdGlvbkxpc3Q7XG4gICAgdGhpcy5jb250cm9sbGVyID0gY29udHJvbGxlcjtcbiAgICB0aGlzLmZvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb25mLmZvcm1JZCk7XG4gICAgdGhpcy5pbml0KCk7XG59O1xuXG5Db250cm9sUGFuZWwucHJvdG90eXBlID0ge1xuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGksIGlsO1xuICAgICAgICBpZiAodGhpcy5maWVsZExpc3QpIHtcbiAgICAgICAgICAgIGZvcihpID0gMCwgaWwgPSB0aGlzLmZpZWxkTGlzdC5sZW5ndGg7IGk8aWw7IGkrKykge1xuICAgICAgICAgICAgICAgIHRoaXMuYmluZEZpZWxkKHRoaXMuZmllbGRMaXN0W2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5hY3Rpb25MaXN0KSB7XG4gICAgICAgICAgICBmb3IoaSA9IDAsIGlsID0gdGhpcy5hY3Rpb25MaXN0Lmxlbmd0aDsgaTxpbDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5iaW5kQWN0aW9uKHRoaXMuYWN0aW9uTGlzdFtpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgYmluZEZpZWxkOiBmdW5jdGlvbiAoZmllbGROYW1lKSB7XG4gICAgICAgIHZhciBmaWVsZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGZpZWxkTmFtZSksXG4gICAgICAgICAgICB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgIHZhbFByb3A7XG5cbiAgICAgICAgaWYgKCFmaWVsZCkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdtaXNzaW5nIGZpZWxkIGluIGNvbnRyb2wgcGFuZWw6ICcgKyBmaWVsZE5hbWUpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhbFByb3AgPSBbJ2NoZWNrYm94JywgJ3JhZGlvJ10uaW5kZXhPZihmaWVsZC50eXBlKSA+IC0xID8gJ2NoZWNrZWQnIDogJ3ZhbHVlJztcbiAgICAgICAgZmllbGRbdmFsUHJvcF0gPSB0aGlzLmNvbnRyb2xsZXIuY29uZltmaWVsZE5hbWVdO1xuICAgICAgICBmaWVsZC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSBmaWVsZFt2YWxQcm9wXTtcbiAgICAgICAgICAgIHRoYXQuY29udHJvbGxlci5jb25mW2ZpZWxkTmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIHZhciBkYXRhID0ge307XG4gICAgICAgICAgICBkYXRhW2ZpZWxkTmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIHRoYXQuY29udHJvbGxlci5maXJlKCdjb25maWdDaGFuZ2UnLCBkYXRhKTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBiaW5kQWN0aW9uOiBmdW5jdGlvbiAoYWN0aW9uTmFtZSkge1xuICAgICAgICB2YXIgYnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYWN0aW9uTmFtZSksXG4gICAgICAgICAgICB0aGF0ID0gdGhpcztcbiAgICAgICAgaWYgKCFidXR0b24pIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignbWlzc2luZyBidXR0b24gb24gY29udHJvbCBwYW5lbDogJyArIGFjdGlvbk5hbWUpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoYXQuY29udHJvbGxlclthY3Rpb25OYW1lXSgpO1xuICAgICAgICB9KTtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvbnRyb2xQYW5lbDsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBldmVudEVtaXR0ZXIgPSByZXF1aXJlKCcuLi9taXhpbnMvZXZlbnQtZW1pdHRlcicpLFxuICAgIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKSxcbiAgICBMID0gJ0xlZnQnLFxuICAgIFIgPSAnUmlnaHQnLFxuICAgIE4gPSAnTm9ydGgnLFxuICAgIFMgPSAnU291dGgnLFxuICAgIEUgPSAnRWFzdCcsXG4gICAgVyA9ICdXZXN0JyxcbiAgICBjb21wYXNzID0gW04sIEUsIFMsIFddO1xuXG52YXIgRHJpbGxlciA9IGZ1bmN0aW9uIChjb25mKSB7XG4gICAgdGhpcy5kaXNjaXBsaW5lID0gKGNvbmYgJiYgY29uZi5kaXNjaXBsaW5lKSB8fCBEcmlsbGVyLmRlZmF1bHRzLmRpc2NpcGxpbmU7XG4gICAgdGhpcy5jb25mID0gdXRpbHMuZXh0ZW5kT2JqKHt9LCBEcmlsbGVyLmRlZmF1bHRzLCBEcmlsbGVyLmRpc2NpcGxpbmVDb25maWdzW3RoaXMuZGlzY2lwbGluZV0sIGNvbmYgfHwge30pO1xuICAgIHRoaXMuaW5pdCgpO1xufTtcblxuRHJpbGxlci5kZWZhdWx0cyA9IHtcbiAgICBkaXNjaXBsaW5lOiAndGFpQ2hpJyxcbiAgICBkaXNhYmxlZFN0ZXBzOiBbXSxcbiAgICBtaW5UaW1lOiAxLFxuICAgIG1heFRpbWU6IDIsXG4gICAgLy8gYXZnVGltZTogMyxcbiAgICAvLyBhdmdXZWlnaHQ6IDEsXG4gICAgYXJlYVdpZHRoOiA0LFxuICAgIGFyZWFMZW5ndGg6IDQsXG4gICAgc3RlcENvdW50OiAtMSAvLyAtMSBmb3IgaW5maW5pdGVcbn07XG5cbkRyaWxsZXIuYWRkRGlzY2lwbGluZSA9IGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICBpZiAoIWNvbmZpZy5uYW1lKSB7XG4gICAgICAgIHRocm93KCduYW1lIG11c3QgYmUgZGVmaW5lZCBmb3IgYW55IGRpc2NpcGxpbmUgY29uZmlnJyk7XG4gICAgfVxuICAgIERyaWxsZXIuZGlzY2lwbGluZUNvbmZpZ3NbY29uZmlnLm5hbWVdID0gY29uZmlnO1xuICAgIHV0aWxzLmRlZmluZVByb3BzKGNvbmZpZy5zdGVwcyk7XG59O1xuXG5EcmlsbGVyLmRpc2NpcGxpbmVDb25maWdzID0ge307XG5cbkRyaWxsZXIucHJvdG90eXBlID0ge1xuICAgIGluaXQ6IGZ1bmN0aW9uIChkb250U3RhcnQpIHtcbiAgICAgICAgdmFyIHN0YXJ0UG9zID0gdGhpcy5jb25mLnN0YXJ0UG9zaXRpb24gfHwge30sXG4gICAgICAgICAgICB0aGF0ID0gdGhpcztcbiAgICAgICAgdGhpcy5kaXNhYmxlZFN0ZXBzID0ge307XG4gICAgICAgIHRoaXMuY29uZi5kaXNhYmxlZFN0ZXBzLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgdGhhdC5kaXNhYmxlZFN0ZXBzW2l0ZW1dID0gdHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuY29vcmRzID0gKHRoaXMuY29uZi5wcmVzZXJ2ZVBvc2l0aW9uID8gdGhpcy5jb29yZHMgOiBzdGFydFBvcy5jb29yZHMpIHx8IFswLDBdO1xuICAgICAgICB0aGlzLmZyb250Rm9vdCA9IHN0YXJ0UG9zLmZyb250Rm9vdCB8fCBudWxsO1xuICAgICAgICAvLyBpZiAoJ2RpcmVjdGlvbicgaW4gdGhpcykge1xuXG4gICAgICAgIC8vIH1cbiAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSAodGhpcy5jb25mLnByZXNlcnZlUG9zaXRpb24gPyB0aGlzLmRpcmVjdGlvbiA6IHN0YXJ0UG9zLmRpcmVjdGlvbik7XG4gICAgICAgIHRoaXMuZGlyZWN0aW9uID0gdHlwZW9mIHRoaXMuZGlyZWN0aW9uID09PSAndW5kZWZpbmVkJyA/IDAgOiB0aGlzLmRpcmVjdGlvbjtcbiAgICAgICAgdGhpcy5sb25nRGlyZWN0aW9uID0gY29tcGFzc1t0aGlzLmRpcmVjdGlvbl07XG4gICAgICAgIC8vdGhpcy5kaXJlY3Rpb24gPSBzdGFydFBvcy5kaXJlY3Rpb24gfHwgMDtcbiAgICAgICAgdGhpcy5zdGVwQ291bnQgPSB0aGlzLmNvbmYuc3RlcENvdW50O1xuICAgICAgICB0aGlzLmNvbmYubWluVGltZSA9IE1hdGgubWF4KHRoaXMuY29uZi5taW5UaW1lLCAwLjUpO1xuICAgICAgICB0aGlzLmNvbmYubWF4VGltZSA9IE1hdGgubWF4KHRoaXMuY29uZi5tYXhUaW1lLCB0aGlzLmNvbmYubWluVGltZSk7XG4gICAgICAgIHRoaXMuZmlyZSgnaW5pdGlhbGlzZWQnKTtcbiAgICAgICAgaWYgKHRoaXMuY29uZi5hdXRvcGxheSAmJiAhZG9udFN0YXJ0KSB7XG4gICAgICAgICAgICB0aGlzLnN0YXJ0KCk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIF9zdGFydDogZnVuY3Rpb24gKHJlc2V0KSB7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmZpcmUoJ3N0YXJ0ZWQnKTtcbiAgICAgICAgdGhpcy5ydW5uaW5nID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5zdGFydFNlcXVlbmNlID0gdGhpcy5jb25mLnN0YXJ0U2VxdWVuY2Uuc2xpY2UoKTtcbiAgICAgICAgdGhpcy5hbm5vdW5jZVN0ZXAodGhpcy5zdGFydFNlcXVlbmNlLnNoaWZ0KCkpO1xuICAgICAgICB0aGlzLnRha2VTdGVwKCk7XG4gICAgfSxcbiAgICBzdGFydDogZnVuY3Rpb24gKHJlc2V0KSB7XG4gICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgaWYgKHJlc2V0KSB7XG4gICAgICAgICAgICB0aGlzLmluaXQodHJ1ZSk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5ydW5uaW5nID09PSB0cnVlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuY29uZi5kZWxheSkge1xuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5fc3RhcnQocmVzZXQpO1xuICAgICAgICAgICAgfSwgdGhpcy5jb25mLmRlbGF5ICogMTAwMCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9zdGFydChyZXNldCk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHJlc2V0QW5kU3RhcnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5zdG9wKHRydWUpO1xuICAgICAgICB0aGlzLnN0YXJ0KHRydWUpO1xuICAgIH0sXG4gICAgYW5ub3VuY2VTdGVwOiBmdW5jdGlvbiAoc3RlcCkge1xuICAgICAgICBpZiAoIXRoaXMuY29uZi5zdGVwc1tzdGVwXSkge1xuICAgICAgICAgICAgdGhyb3coJ2ludmFsaWQgc3RlcCBuYW1lOiAnICsgc3RlcCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5maXJlKCdzdGVwJywge1xuICAgICAgICAgICAgZGlyZWN0aW9uOiBjb21wYXNzW3RoaXMuZGlyZWN0aW9uXSxcbiAgICAgICAgICAgIGZyb250Rm9vdDogdGhpcy5mcm9udEZvb3QsXG4gICAgICAgICAgICBsYXN0U3RlcDogc3RlcCxcbiAgICAgICAgICAgIGNvb3JkczogdGhpcy5jb29yZHMuc2xpY2UoKVxuICAgICAgICB9KTtcbiAgICB9LFxuICAgIHN0b3A6IGZ1bmN0aW9uIChhYm9ydCkge1xuICAgICAgICBpZiAodGhpcy5ydW5uaW5nID09PSB0cnVlKSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lcik7XG4gICAgICAgICAgICBpZiAoIWFib3J0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbmRTZXF1ZW5jZSA9IHRoaXMuY29uZi5lbmRTZXF1ZW5jZS5zbGljZSgpO1xuICAgICAgICAgICAgICAgIHRoaXMudGFrZVN0ZXAodHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmZpcmUoJ3N0b3BwZWQnKTtcbiAgICAgICAgICAgIHRoaXMucnVubmluZyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfSxcbiAgICB0YWtlU3RlcDogZnVuY3Rpb24gKGNsb3NpbmcpIHtcbiAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgc3RlcDtcbiAgICAgICAgXG4gICAgICAgIGlmICghdGhpcy5zdGVwQ291bnQgJiYgIWNsb3NpbmcgJiYgIXRoaXMuc3RhcnRTZXF1ZW5jZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnN0b3AoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5zdGVwQ291bnQgJiYgIXRoaXMuc3RhcnRTZXF1ZW5jZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMuc3RlcENvdW50LS07XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHN0ZXAgPSB0aGlzLmdldE5leHRTdGVwTmFtZShjbG9zaW5nKTtcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBpZiAoY2xvc2luZykge1xuICAgICAgICAgICAgaWYgKHN0ZXApIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFkanVzdFBvc2l0aW9uKHN0ZXApO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmVuZFNlcXVlbmNlLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICB0aGF0LnRha2VTdGVwKGNsb3NpbmcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aGF0LmFkanVzdFBvc2l0aW9uKHN0ZXApO1xuICAgICAgICAgICAgICAgIHRoYXQudGFrZVN0ZXAoKTtcbiAgICAgICAgICAgICAgICAvLyByZW1lbWJlciB0byBkbyB0aGlzIG9uIHNvdW5kIGZpbmlzaCAobWF5YmU/KVxuICAgICAgICAgICAgfSwgdGhpcy5nZXRUaW1lSW50ZXJ2YWwoKSk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGdldE5leHRTdGVwTmFtZTogZnVuY3Rpb24gKGNsb3NpbmcpIHtcbiAgICAgICAgdmFyIHN0ZXA7XG4gICAgICAgIGlmIChjbG9zaW5nKSB7XG4gICAgICAgICAgICBzdGVwID0gdGhpcy5lbmRTZXF1ZW5jZS5sZW5ndGggPyB0aGlzLmVuZFNlcXVlbmNlLnNoaWZ0KCk6IHVuZGVmaW5lZDtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXJ0U2VxdWVuY2UubGVuZ3RoKSB7XG4gICAgICAgICAgICBzdGVwID0gdGhpcy5zdGFydFNlcXVlbmNlLnNoaWZ0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdGVwID0gdGhpcy5nZXRSYW5kb21TdGVwKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFzdGVwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMudmFsaWRhdGVTdGVwKHN0ZXApID8gc3RlcCA6IHRoaXMuZ2V0TmV4dFN0ZXBOYW1lKGNsb3NpbmcpO1xuICAgIH0sXG4gICAgZ2V0UmFuZG9tU3RlcDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdXRpbHMucGlja1JhbmRvbVByb3BlcnR5KHRoaXMuY29uZi5zdGVwcyk7XG4gICAgfSxcbiAgICB2YWxpZGF0ZVN0ZXA6IGZ1bmN0aW9uIChzdGVwKSB7XG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkU3RlcHNbc3RlcF0pIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbmV3UG9zaXRpb24gPSB0aGlzLmFkanVzdFBvc2l0aW9uKHN0ZXAsIHRydWUpO1xuICAgICAgICByZXR1cm4gKG5ld1Bvc2l0aW9uWzBdID49IDAgJiYgbmV3UG9zaXRpb25bMV0gPj0gMCAmJiBuZXdQb3NpdGlvblsxXSA8IHRoaXMuY29uZi5hcmVhV2lkdGggJiYgbmV3UG9zaXRpb25bMF0gPCB0aGlzLmNvbmYuYXJlYUxlbmd0aCk7XG4gICAgfSxcbiAgICBhZGp1c3RQb3NpdGlvbjogZnVuY3Rpb24gKHN0ZXAsIGR1bW15KSB7XG4gICAgICAgIHZhciBtb3ZlTWF0cml4LFxuICAgICAgICAgICAgbGVmdFRvUmlnaHQsXG4gICAgICAgICAgICBmcm9udFRvQmFjayxcbiAgICAgICAgICAgIGNvb3JkcyxcbiAgICAgICAgICAgIGN1cnJlbnRTdGVwLFxuICAgICAgICAgICAgZGlyZWN0aW9uLFxuICAgICAgICAgICAgbG9uZ0RpcmVjdGlvbiwgXG4gICAgICAgICAgICBmcm9udEZvb3Q7XG5cbiAgICAgICAgY3VycmVudFN0ZXAgPSB0aGlzLmNvbmYuc3RlcHNbc3RlcF07XG4gICAgICAgIGlmICghY3VycmVudFN0ZXApIHtcbiAgICAgICAgICAgIC8vIGlmIChkdW1teSkge1xuICAgICAgICAgICAgLy8gICAgIHJldHVybiBbMTAwMDAwMDAwMCwgMTAwMDAwMDAwMF07XG4gICAgICAgICAgICAvLyB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3coJ2ludmFsaWQgc3RlcCBuYW1lOiAnICsgc3RlcCk7XG4gICAgICAgICAgICAvLyB9XG4gICAgICAgIH1cbiAgICAgICAgZGlyZWN0aW9uID0gKHRoaXMuZGlyZWN0aW9uICsgKCh0aGlzLmZyb250Rm9vdCA9PT0gTCA/IDEgOiAtMSkgKiBjdXJyZW50U3RlcC5kaXJlY3Rpb24pICsgNCkgJSA0O1xuICAgICAgICBsb25nRGlyZWN0aW9uID0gY29tcGFzc1tkaXJlY3Rpb25dO1xuICAgICAgICBsZWZ0VG9SaWdodCA9IGN1cnJlbnRTdGVwLm1vdmVbMV0gKiAodGhpcy5mcm9udEZvb3QgIT09IFIgPyAxOiAtMSk7XG4gICAgICAgIGZyb250VG9CYWNrID0gY3VycmVudFN0ZXAubW92ZVswXTtcblxuICAgICAgICBmcm9udEZvb3QgPSAgICBjdXJyZW50U3RlcC5mcm9udEZvb3QgPT09IEwgPyBMIDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRTdGVwLmZyb250Rm9vdCA9PT0gUiA/IFIgOlxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFN0ZXAuZnJvbnRGb290ID09PSBudWxsID8gbnVsbCA6XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50U3RlcC5mcm9udEZvb3QgPT09IDEgPyAodGhpcy5mcm9udEZvb3QgPT09IFIgPyBMIDogUikgOlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5mcm9udEZvb3Q7XG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggKHRoaXMuZGlyZWN0aW9uKSB7XG4gICAgICAgIFxuICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICBtb3ZlTWF0cml4ID0gW2Zyb250VG9CYWNrLCBsZWZ0VG9SaWdodF07XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgbW92ZU1hdHJpeCA9IFstbGVmdFRvUmlnaHQsIGZyb250VG9CYWNrXTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICBtb3ZlTWF0cml4ID0gWy1mcm9udFRvQmFjaywgLWxlZnRUb1JpZ2h0XTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICBtb3ZlTWF0cml4ID0gW2xlZnRUb1JpZ2h0LCAtZnJvbnRUb0JhY2tdO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIGNvb3JkcyA9IFt0aGlzLmNvb3Jkc1swXSArIG1vdmVNYXRyaXhbMF0sIHRoaXMuY29vcmRzWzFdICsgbW92ZU1hdHJpeFsxXV07XG5cbiAgICAgICAgaWYgKGR1bW15KSB7XG4gICAgICAgICAgICByZXR1cm4gY29vcmRzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5jb29yZHMgPSBjb29yZHM7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTdGVwID0gY3VycmVudFN0ZXA7XG4gICAgICAgICAgICB0aGlzLmRpcmVjdGlvbiA9IGRpcmVjdGlvbjtcbiAgICAgICAgICAgIHRoaXMubG9uZ0RpcmVjdGlvbiA9IGxvbmdEaXJlY3Rpb247XG4gICAgICAgICAgICB0aGlzLmZyb250Rm9vdCA9IGZyb250Rm9vdDtcbiAgICAgICAgICAgIHRoaXMuYW5ub3VuY2VTdGVwKHN0ZXApOyAgICBcbiAgICAgICAgfVxuICAgICAgICBcbiAgICB9LFxuXG4gICAgZ2V0VGltZUludGVydmFsOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBtaW4gPSAyLFxuICAgICAgICAgICAgYXZhaWxhYmxlSW50ZXJ2YWwgPSB0aGlzLmNvbmYubWF4VGltZSAtIHRoaXMuY29uZi5taW5UaW1lO1xuXG4gICAgICAgIHZhciB0aW1lID0gKG1pbiArIChhdmFpbGFibGVJbnRlcnZhbCAqIE1hdGgucmFuZG9tKCkpKTtcbiAgICAgICAgdGltZSA9IE1hdGgubWF4KE1hdGgubWluKHRoaXMuY29uZi5tYXhUaW1lLCB0aW1lKSwgdGhpcy5jb25mLm1pblRpbWUpO1xuICAgICAgICByZXR1cm4gdGltZSAqIDEwMDA7XG5cblxuICAgICAgICAvLyB2YXIgdGltZSA9ICgoKGF2YWlsYWJsZUludGVydmFsICogTWF0aC5yYW5kb20oKSkvKHRoaXMuY29uZi5hdmdXZWlnaHQgKyAxKSkgKyAodGhpcy5jb25mLmF2Z1RpbWUgKih0aGlzLmNvbmYuYXZnV2VpZ2h0Lyh0aGlzLmNvbmYuYXZnV2VpZ2h0ICsgMSkpKSkgKyB0aGlzLmNvbmYubWluVGltZTtcblxuICAgIH0sXG4gICAgZW5hYmxlU3RlcDogZnVuY3Rpb24gKHN0ZXApIHtcbiAgICAgICAgXG4gICAgICAgIHZhciBzdGVwSW5kZXggPSB0aGlzLmNvbmYuZGlzYWJsZWRTdGVwcy5pbmRleE9mKHN0ZXApO1xuICAgICAgICB0aGlzLmRpc2FibGVkU3RlcHNbc3RlcF0gPSBmYWxzZTtcbiAgICAgICAgaWYgKHN0ZXBJbmRleCA+IC0xKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmYuZGlzYWJsZWRTdGVwcy5zcGxpY2Uoc3RlcEluZGV4LCAxKTtcbiAgICAgICAgICAgIC8vIG9yIGNvdWxkIGp1c3QgZmlyZSAnc3RlcERpc2FibGVkJ1xuICAgICAgICAgICAgdGhpcy5maXJlKCdjb25maWdDaGFuZ2UnLCB7XG4gICAgICAgICAgICAgICAgZGlzYWJsZWRTdGVwczogdGhpcy5jb25mLmRpc2FibGVkU3RlcHNcbiAgICAgICAgICAgIH0pOyAgXG4gICAgICAgIH1cbiAgICB9LFxuICAgIGRpc2FibGVTdGVwOiBmdW5jdGlvbiAoc3RlcCkge1xuICAgICAgICB2YXIgc3RlcEluZGV4ID0gdGhpcy5jb25mLmRpc2FibGVkU3RlcHMuaW5kZXhPZihzdGVwKTtcbiAgICAgICAgdGhpcy5kaXNhYmxlZFN0ZXBzW3N0ZXBdID0gdHJ1ZTtcbiAgICAgICAgaWYgKHN0ZXBJbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgIHRoaXMuY29uZi5kaXNhYmxlZFN0ZXBzLnB1c2goc3RlcCk7XG4gICAgICAgICAgICB0aGlzLmZpcmUoJ2NvbmZpZ0NoYW5nZScsIHtcbiAgICAgICAgICAgICAgICBkaXNhYmxlZFN0ZXBzOiB0aGlzLmNvbmYuZGlzYWJsZWRTdGVwc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG5cbiAgICAvLyA/Pz9ORUVEIFRPIFdSSVRFIFRFU1RTIEZPUiB0aGlzXG4gICAgLy8gICAgICAgICAgICAgaXQoJ3Nob3VsZCBiZSBhZmZlY3RlZCBieSBsaXZlIGNoYW5nZXMgdG8gdGhlIGNvbmZpZycsIGZ1bmN0aW9uICgpIHtcblxuICAgIC8vICAgICB9KTtcbiAgICB1cGRhdGVTZXR0aW5nczogZnVuY3Rpb24gKGNvbmYpIHtcbiAgICAgICAgdGhpcy5jb25mID0gdXRpbHMuZXh0ZW5kT2JqKHRoaXMuY29uZiwgY29uZik7XG4gICAgICAgIFxuICAgIC8vIGRlZmluZVN0ZXA6IGZ1bmN0aW9uIChuYW1lLCBjb25mKSB7XG4gICAgLy8gICAgIHRoaXMuc3RlcHNbbmFtZV0gPSBjb25mO1xuICAgIC8vIH0sXG4gICAgLy8gdW5kZWZpbmVTdGVwOiBmdW5jdGlvbiAobmFtZSkge1xuICAgIC8vICAgICBpZiAodGhpcy5zdGVwc1tuYW1lXSkge1xuICAgIC8vICAgICAgICAgZGVsZXRlIHRoaXMuc3RlcHNbbmFtZV07XG4gICAgLy8gICAgIH1cbiAgICB9XG59O1xuXG5ldmVudEVtaXR0ZXIuYXBwbHkoRHJpbGxlci5wcm90b3R5cGUpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IERyaWxsZXI7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpLFxuICAgIGFycm93Q29kZXMgPSB7IFxuICAgIFdlc3Q6IDg1OTIsXG4gICAgTm9ydGg6IDg1OTMsXG4gICAgRWFzdDogODU5NCxcbiAgICBTb3V0aDogODU5NVxufSxcbmRlZmF1bHRDZWxsSHRtbCA9ICc8ZGl2PiZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwOzwvZGl2Pic7XG5cbnZhciBWaXN1YWxpc2VyID0gZnVuY3Rpb24gKGRyaWxsZXIsIGRvbU5vZGVJZCkge1xuICAgIHRoaXMuY29uZiA9IGRyaWxsZXIuY29uZjtcbiAgICB0aGlzLmRyaWxsZXIgPSBkcmlsbGVyO1xuICAgIHRoaXMuZG9tTm9kZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGRvbU5vZGVJZCk7XG4gICAgdGhpcy5pbml0KCk7XG59O1xuXG5WaXN1YWxpc2VyLnByb3RvdHlwZSA9IHtcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgXG4gICAgICAgIHRoaXMuZHJpbGxlci5vbignaW5pdGlhbGlzZWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLnByaW1lKCk7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgICAgICAvLyB0aGlzLmRyaWxsZXIub24oJ3N0b3BwZWQnLCB0aGlzLnVuZHJhd0dyaWQsIHRoaXMpO1xuICAgICAgICB0aGlzLmRyaWxsZXIub24oJ3N0ZXAnLCBmdW5jdGlvbiAoc3RhdGUpIHtcbiAgICAgICAgICAgIGlmKHRoaXMuY29uZi5hcmVhV2lkdGggPiAwICYmIHRoaXMuY29uZi5hcmVhTGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0UG9zaXRpb24oc3RhdGUuY29vcmRzLCBzdGF0ZS5kaXJlY3Rpb24sIHN0YXRlLmZyb250Rm9vdCk7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDYXB0aW9uKHV0aWxzLmNhbWVsVG9TcGFjZWQoc3RhdGUubGFzdFN0ZXApKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgdGhpcy5wcmltZSgpO1xuXG5cbiAgICB9LFxuICAgIHByaW1lOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmKHRoaXMuY29uZi5hcmVhV2lkdGggPiAwICYmIHRoaXMuY29uZi5hcmVhTGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdGhpcy51bmRyYXdHcmlkKCk7XG4gICAgICAgICAgICB0aGlzLmRyYXdDYXB0aW9uKCk7XG4gICAgICAgICAgICB0aGlzLmRyYXdHcmlkKCk7XG4gICAgICAgICAgICB0aGlzLnNldFBvc2l0aW9uKHRoaXMuZHJpbGxlci5jb29yZHMsIHRoaXMuZHJpbGxlci5sb25nRGlyZWN0aW9uLCAnY2VudGVyJyk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGRyYXdDYXB0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuY2FwdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2gyJyk7XG4gICAgICAgIHRoaXMuY2FwdGlvbi5pbm5lckhUTUwgPSAnJm5ic3A7JztcbiAgICAgICAgdGhpcy5kb21Ob2RlLmFwcGVuZENoaWxkKHRoaXMuY2FwdGlvbik7XG4gICAgfSxcbiAgICB1cGRhdGVDYXB0aW9uOiBmdW5jdGlvbiAodGV4dCkge1xuICAgICAgICB0aGlzLmNhcHRpb24uaW5uZXJIVE1MID0gdGV4dC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHRleHQuc3Vic3RyKDEpO1xuICAgIH0sXG4gICAgZHJhd0dyaWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHRhYmxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGFibGUnKSxcbiAgICAgICAgICAgIHJvdyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RyJyksXG4gICAgICAgICAgICBjZWxsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGQnKSxcbiAgICAgICAgICAgIHdpZHRoID0gdGhpcy5jb25mLmFyZWFXaWR0aCxcbiAgICAgICAgICAgIGhlaWdodCA9IHRoaXMuY29uZi5hcmVhTGVuZ3RoLFxuICAgICAgICAgICAgaSxcbiAgICAgICAgICAgIG5ld1JvdyxcbiAgICAgICAgICAgIG5ld0NlbGw7XG5cbiAgICAgICAgd2hpbGUoaGVpZ2h0LS0pIHtcbiAgICAgICAgICAgIG5ld1JvdyA9IHJvdy5jbG9uZU5vZGUoKTtcbiAgICAgICAgICAgIHRhYmxlLmFwcGVuZENoaWxkKG5ld1Jvdyk7XG4gICAgICAgICAgICBmb3IoaT0wO2k8d2lkdGg7aSsrKSB7XG4gICAgICAgICAgICAgICAgbmV3Q2VsbCA9IGNlbGwuY2xvbmVOb2RlKCk7XG4gICAgICAgICAgICAgICAgbmV3Q2VsbC5pbm5lckhUTUwgPSBkZWZhdWx0Q2VsbEh0bWw7XG4gICAgICAgICAgICAgICAgbmV3Um93LmFwcGVuZENoaWxkKG5ld0NlbGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuZG9tTm9kZS5hcHBlbmRDaGlsZCh0YWJsZSk7XG4gICAgICAgIHRoaXMuZ3JpZCA9IHRhYmxlO1xuICAgICAgICB0YWJsZS5jbGFzc05hbWUgPSAnZmxvb3JzcGFjZSc7XG4gICAgfSxcbiAgICB1bmRyYXdHcmlkOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuZG9tTm9kZS5pbm5lckhUTUwgPSAnJztcbiAgICB9LFxuICAgIHNldFBvc2l0aW9uOiBmdW5jdGlvbihjb29yZHMsIGRpcmVjdGlvbiwgZnJvbnRGb290KSB7XG4gICAgICAgIFxuICAgICAgICBpZiAodGhpcy5wb3NpdGlvbikge1xuICAgICAgICAgICAgdGhpcy51bnNob3dQb3NpdGlvbigpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBjZWxsID0gdGhpcy5ncmlkLmdldEVsZW1lbnRzQnlUYWdOYW1lKCd0cicpWyh0aGlzLmNvbmYuYXJlYUxlbmd0aCAtIDEpIC0gY29vcmRzWzBdXVxuICAgICAgICAgICAgICAgIC5nZXRFbGVtZW50c0J5VGFnTmFtZSgndGQnKVtjb29yZHNbMV1dO1xuXG4gICAgICAgIGNlbGwuY2xhc3NOYW1lID0gJ2N1cnJlbnQgJyArIGRpcmVjdGlvbi50b0xvd2VyQ2FzZSgpICsgJyAnICsgKGZyb250Rm9vdCAmJiBmcm9udEZvb3QudG9Mb3dlckNhc2UoKSk7XG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBjb29yZHM7XG4gICAgICAgIC8vIHVwIGFycm93XG4gICAgICAgIC8vIGNlbGwuaW5uZXJIVE1MID0gJyYjODU5MzsnO1xuICAgIH0sXG4gICAgdW5zaG93UG9zaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGNlbGwgPSB0aGlzLmdyaWQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3RyJylbKHRoaXMuY29uZi5hcmVhTGVuZ3RoIC0gMSkgLSB0aGlzLnBvc2l0aW9uWzBdXVxuICAgICAgICAgICAgICAgIC5nZXRFbGVtZW50c0J5VGFnTmFtZSgndGQnKVt0aGlzLnBvc2l0aW9uWzFdXTtcbiAgICAgICAgY2VsbC5jbGFzc05hbWUgPSAnJztcbiAgICAgICAgLy8gY2VsbC5vZmZzZXRXaWR0aDtcbiAgICAgICAgLy8gY2VsbC5pbm5lckhUTUwgPSBkZWZhdWx0Q2VsbEh0bWw7XG4gICAgICAgIFxuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVmlzdWFsaXNlcjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxudmFyIFN0ZXBTZWxlY3RvciA9IGZ1bmN0aW9uIChkcmlsbGVyLCBkb21Ob2RlSWQpIHtcbiAgICB0aGlzLmRyaWxsZXIgPSBkcmlsbGVyO1xuICAgIHRoaXMuZG9tTm9kZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGRvbU5vZGVJZCk7XG4gICAgdGhpcy5pbml0KCk7XG59O1xuXG5TdGVwU2VsZWN0b3IucHJvdG90eXBlID0ge1xuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGhlYWRpbmcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XG4gICAgICAgIGhlYWRpbmcudGV4dENvbnRlbnQgPSAnQ2hvb3NlIHdoaWNoIHN0ZXBzIHRvIGluY2x1ZGUgaW4geW91ciBkcmlsbCcsXG4gICAgICAgIHRoaXMuZG9tTm9kZS5hcHBlbmRDaGlsZChoZWFkaW5nKTtcbiAgICAgICAgdGhpcy5jcmVhdGVJbnB1dHMoKTtcbiAgICB9LFxuICAgIGNyZWF0ZUlucHV0czogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgbGFiZWwsXG4gICAgICAgICAgICBpbnB1dDtcbiAgICAgICAgZm9yICh2YXIga2V5IGluIHRoaXMuZHJpbGxlci5jb25mLnN0ZXBzKSB7XG4gICAgICAgICAgICBsYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xhYmVsJyk7XG4gICAgICAgICAgICBsYWJlbFsnZm9yJ10gPSBrZXk7XG4gICAgICAgICAgICBsYWJlbC50ZXh0Q29udGVudCA9IHV0aWxzLmNhbWVsVG9TcGFjZWQoa2V5KTtcbiAgICAgICAgICAgIGlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcbiAgICAgICAgICAgIGlucHV0LmlkID0ga2V5O1xuICAgICAgICAgICAgaW5wdXQubmFtZSA9ICdzdGVwU2VsZWN0b3InO1xuICAgICAgICAgICAgaW5wdXQudHlwZSA9ICdjaGVja2JveCc7XG4gICAgICAgICAgICB0aGlzLmRvbU5vZGUuYXBwZW5kQ2hpbGQoaW5wdXQpO1xuICAgICAgICAgICAgdGhpcy5kb21Ob2RlLmFwcGVuZENoaWxkKGxhYmVsKTtcbiAgICAgICAgICAgIHRoaXMuYmluZElucHV0VG9EcmlsbGVyKGtleSwgaW5wdXQpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBiaW5kSW5wdXRUb0RyaWxsZXI6IGZ1bmN0aW9uIChzdGVwLCBpbnB1dCkge1xuICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgIGlucHV0LmNoZWNrZWQgPSB0aGlzLmRyaWxsZXIuY29uZi5kaXNhYmxlZFN0ZXBzLmluZGV4T2Yoc3RlcCkgPT09IC0xO1xuICAgICAgICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgc3RlcEluZGV4O1xuICAgICAgICAgICAgaWYgKGlucHV0LmNoZWNrZWQpIHtcbiAgICAgICAgICAgICAgICB0aGF0LmRyaWxsZXIuZW5hYmxlU3RlcChzdGVwKTsgXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoYXQuZHJpbGxlci5kaXNhYmxlU3RlcChzdGVwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTdGVwU2VsZWN0b3I7IiwidmFyIHBpY2tSYW5kb21Qcm9wZXJ0eSA9IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgdmFyIHJlc3VsdDtcbiAgICAgICAgdmFyIGNvdW50ID0gMDtcbiAgICAgICAgZm9yICh2YXIgcHJvcCBpbiBvYmopIHtcbiAgICAgICAgICAgIGlmIChNYXRoLnJhbmRvbSgpIDwgMSAvICsrY291bnQpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBwcm9wO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgICAgICAgICBcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgZGVmaW5lUHJvcHMgPSBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgIHZhciBwcm9wO1xuICAgICAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICAgICAgICBwcm9wID0gb2JqW2tleV07XG4gICAgICAgICAgICBpZiAocHJvcC5fcHJvcGVydHlEZWZpbml0aW9uKSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIG9ialtrZXldO1xuICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgcHJvcCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICB9LFxuXG4gICAgZXh0ZW5kT2JqID0gZnVuY3Rpb24gKGJhc2UpIHtcbiAgICAgICAgdmFyIGV4dGVuZGVycyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSksXG4gICAgICAgICAgICBleHRlbmRlcjtcblxuICAgICAgICBpZiAoIWV4dGVuZGVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBiYXNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGV4dGVuZGVycy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICBleHRlbmRlciA9IGV4dGVuZGVycy5wb3AoKTtcbiAgICAgICAgICAgIGJhc2UgPSBleHRlbmRPYmouYXBwbHkodGhpcywgQXJyYXkucHJvdG90eXBlLmNvbmNhdC5hcHBseShbYmFzZV0sIGV4dGVuZGVycykpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXh0ZW5kZXIgPSBleHRlbmRlcnNbMF07XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gZXh0ZW5kZXIpIHtcbiAgICAgICAgICAgIGJhc2Vba2V5XSA9IGV4dGVuZGVyW2tleV07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYmFzZTtcbiAgICB9LFxuICAgIHRvQ2FtZWwgPSBmdW5jdGlvbiAodGV4dCkge1xuICAgICAgICByZXR1cm4gdGV4dC5yZXBsYWNlKC9cXC1cXHcvZywgZnVuY3Rpb24gKCQwKSB7XG4gICAgICAgICAgICByZXR1cm4gJDAuY2hhckF0KDEpLnRvVXBwZXJDYXNlKCk7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgdG9EYXNoZWQgPSBmdW5jdGlvbih0ZXh0KSB7XG4gICAgICAgIHJldHVybiB0ZXh0LnJlcGxhY2UoL1teQS1aXVtBLVpdL2csIGZ1bmN0aW9uICgkMCkge1xuICAgICAgICAgICAgcmV0dXJuICQwLmNoYXJBdCgwKSArICctJyArICQwLmNoYXJBdCgxKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIGRhc2hlZFRvU3BhY2VkID0gZnVuY3Rpb24gKHRleHQpIHtcbiAgICAgICAgcmV0dXJuIHRleHQucmVwbGFjZSgvLS9nLCAnICcpO1xuICAgIH0sXG4gICAgY2FtZWxUb1NwYWNlZCA9IGZ1bmN0aW9uICh0ZXh0KSB7XG4gICAgICAgIHJldHVybiBkYXNoZWRUb1NwYWNlZCh0b0Rhc2hlZCh0ZXh0KSk7XG4gICAgfTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgcGlja1JhbmRvbVByb3BlcnR5OiBwaWNrUmFuZG9tUHJvcGVydHksXG4gICAgZGVmaW5lUHJvcHM6IGRlZmluZVByb3BzLFxuICAgIGV4dGVuZE9iajogZXh0ZW5kT2JqLFxuICAgIHRvQ2FtZWw6IHRvQ2FtZWwsXG4gICAgdG9EYXNoZWQ6IHRvRGFzaGVkLFxuICAgIGRhc2hlZFRvU3BhY2VkOiBkYXNoZWRUb1NwYWNlZCxcbiAgICBjYW1lbFRvU3BhY2VkOiBjYW1lbFRvU3BhY2VkXG59OyJdfQ==
