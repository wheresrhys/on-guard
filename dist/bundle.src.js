require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"src/app":[function(require,module,exports){
module.exports=require('XaIZKC');
},{}],"XaIZKC":[function(require,module,exports){
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
},{"./configs/tai-chi":"+4n2TQ","./modules/caller":"YVoqnn","./modules/control-panel":"C868nE","./modules/driller":"PydxuG","./modules/simple-visualiser":"KUNvBg","./modules/step-selector":"tgKZ27"}],"src/configs/tai-chi":[function(require,module,exports){
module.exports=require('+4n2TQ');
},{}],"+4n2TQ":[function(require,module,exports){
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

},{}],"src/main":[function(require,module,exports){
module.exports=require('TdjaPY');
},{}],"TdjaPY":[function(require,module,exports){
'use strict';

var app = require('./app');

app.init();
},{"./app":"XaIZKC"}],"src/mixins/event-emitter":[function(require,module,exports){
module.exports=require('/DvOa3');
},{}],"/DvOa3":[function(require,module,exports){
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
},{}],"src/modules/caller":[function(require,module,exports){
module.exports=require('YVoqnn');
},{}],"YVoqnn":[function(require,module,exports){
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
},{"../utils":"EUNfuN"}],"src/modules/control-panel":[function(require,module,exports){
module.exports=require('C868nE');
},{}],"C868nE":[function(require,module,exports){
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
},{}],"PydxuG":[function(require,module,exports){
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
},{"../mixins/event-emitter":"/DvOa3","../utils":"EUNfuN"}],"src/modules/driller":[function(require,module,exports){
module.exports=require('PydxuG');
},{}],"src/modules/simple-visualiser":[function(require,module,exports){
module.exports=require('KUNvBg');
},{}],"KUNvBg":[function(require,module,exports){
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

},{"../utils":"EUNfuN"}],"tgKZ27":[function(require,module,exports){
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
},{"../utils":"EUNfuN"}],"src/modules/step-selector":[function(require,module,exports){
module.exports=require('tgKZ27');
},{}],"src/utils":[function(require,module,exports){
module.exports=require('EUNfuN');
},{}],"EUNfuN":[function(require,module,exports){
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
},{}]},{},["XaIZKC","+4n2TQ","TdjaPY","/DvOa3","YVoqnn","C868nE","PydxuG","KUNvBg","tgKZ27","EUNfuN"])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvd2hlcmVzcmh5cy9TaXRlcy9vbi1ndWFyZC9zcmMvYXBwLmpzIiwiL1VzZXJzL3doZXJlc3JoeXMvU2l0ZXMvb24tZ3VhcmQvc3JjL2NvbmZpZ3MvdGFpLWNoaS5qcyIsIi9Vc2Vycy93aGVyZXNyaHlzL1NpdGVzL29uLWd1YXJkL3NyYy9tYWluLmpzIiwiL1VzZXJzL3doZXJlc3JoeXMvU2l0ZXMvb24tZ3VhcmQvc3JjL21peGlucy9ldmVudC1lbWl0dGVyLmpzIiwiL1VzZXJzL3doZXJlc3JoeXMvU2l0ZXMvb24tZ3VhcmQvc3JjL21vZHVsZXMvY2FsbGVyLmpzIiwiL1VzZXJzL3doZXJlc3JoeXMvU2l0ZXMvb24tZ3VhcmQvc3JjL21vZHVsZXMvY29udHJvbC1wYW5lbC5qcyIsIi9Vc2Vycy93aGVyZXNyaHlzL1NpdGVzL29uLWd1YXJkL3NyYy9tb2R1bGVzL2RyaWxsZXIuanMiLCIvVXNlcnMvd2hlcmVzcmh5cy9TaXRlcy9vbi1ndWFyZC9zcmMvbW9kdWxlcy9zaW1wbGUtdmlzdWFsaXNlci5qcyIsIi9Vc2Vycy93aGVyZXNyaHlzL1NpdGVzL29uLWd1YXJkL3NyYy9tb2R1bGVzL3N0ZXAtc2VsZWN0b3IuanMiLCIvVXNlcnMvd2hlcmVzcmh5cy9TaXRlcy9vbi1ndWFyZC9zcmMvdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3ZJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7OztBQzNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxudmFyXHREcmlsbGVyID0gcmVxdWlyZSgnLi9tb2R1bGVzL2RyaWxsZXInKSxcbiAgICBDYWxsZXIgPSByZXF1aXJlKCcuL21vZHVsZXMvY2FsbGVyJyksXG4gICAgVmlzdWFsaXNlciA9IHJlcXVpcmUoJy4vbW9kdWxlcy9zaW1wbGUtdmlzdWFsaXNlcicpLFxuICAgIENvbnRyb2xQYW5lbCA9IHJlcXVpcmUoJy4vbW9kdWxlcy9jb250cm9sLXBhbmVsJyksXG4gICAgU3RlcFNlbGVjdG9yID0gcmVxdWlyZSgnLi9tb2R1bGVzL3N0ZXAtc2VsZWN0b3InKSxcbiAgICB0YWlDaGlDb25maWcgPSByZXF1aXJlKCcuL2NvbmZpZ3MvdGFpLWNoaScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIERyaWxsZXIuYWRkRGlzY2lwbGluZSh0YWlDaGlDb25maWcpO1xuICAgICAgICBcbiAgICAgICAgdmFyIGRyaWxsZXIgPSBuZXcgRHJpbGxlcih7XG4gICAgICAgICAgICBkaXNjaXBsaW5lOiAndGFpQ2hpJyxcbiAgICAgICAgICAgIGRpc2FibGVkU3RlcHM6IFsnaW5zaWRlJywgJ291dHNpZGUnXSxcbiAgICAgICAgICAgIGRlbGF5OiAyXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmICh3aW5kb3cubG9jYXRpb24uaGFzaCAhPT0gJyNzaWxlbnQnKSB7XG4gICAgICAgICAgICB2YXIgY2FsbGVyID0gbmV3IENhbGxlcihkcmlsbGVyKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgY29udHJvbFBhbmVsID0gbmV3IENvbnRyb2xQYW5lbChkcmlsbGVyLCB7XG4gICAgICAgICAgICBmaWVsZExpc3Q6IFsnbWluVGltZScsJ21heFRpbWUnLCdhcmVhV2lkdGgnLCdhcmVhTGVuZ3RoJywnc3RlcENvdW50JywgJ2RlbGF5JywgJ3ByZXNlcnZlUG9zaXRpb24nXSxcbiAgICAgICAgICAgIGFjdGlvbkxpc3Q6IFsncmVzZXRBbmRTdGFydCcsICdzdG9wJ10sXG4gICAgICAgICAgICBmb3JtSWQ6ICdvbkd1YXJkQ29udHJvbFBhbmVsJ1xuICAgICAgICB9KTtcbiAgICAgICAgdmFyIHN0ZXBTZWxlY3RvciA9IG5ldyBTdGVwU2VsZWN0b3IoZHJpbGxlciwgJ2Rpc2FibGVkU3RlcHMnKTtcbiAgICAgICAgdmFyIHZpc3VhbGlzZXIgPSBuZXcgVmlzdWFsaXNlcihkcmlsbGVyLCAndmlzdWFsaXNlcicpO1xuICAgIH1cbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBuYW1lOiAndGFpQ2hpJyxcbiAgICBzdGVwczoge1xuICAgICAgICBzdGVwOiB7XG4gICAgICAgICAgICBmcm9udEZvb3Q6IDEsXG4gICAgICAgICAgICBtb3ZlOiBbMSwgMF0sXG4gICAgICAgICAgICBkaXJlY3Rpb246IDBcbiAgICAgICAgfSxcbiAgICAgICAgYmFjazoge1xuICAgICAgICAgICAgZnJvbnRGb290OiAxLFxuICAgICAgICAgICAgbW92ZTogWy0xLCAwXSxcbiAgICAgICAgICAgIGRpcmVjdGlvbjogMFxuICAgICAgICB9LFxuICAgICAgICBzaGlmdDoge1xuICAgICAgICAgICAgZnJvbnRGb290OiAxLFxuICAgICAgICAgICAgbW92ZTogWzAsIDBdLFxuICAgICAgICAgICAgZGlyZWN0aW9uOiAxXG4gICAgICAgIH0sXG4gICAgICAgICdzd2l0Y2gnOiB7XG4gICAgICAgICAgICBmcm9udEZvb3Q6IDEsXG4gICAgICAgICAgICBtb3ZlOiBbMCwgMF0sXG4gICAgICAgICAgICBkaXJlY3Rpb246IDBcbiAgICAgICAgfSxcbiAgICAgICAgaW5zaWRlOiB7XG4gICAgICAgICAgICBmcm9udEZvb3Q6IDAsXG4gICAgICAgICAgICBtb3ZlOiBbMCwgMV0sXG4gICAgICAgICAgICBkaXJlY3Rpb246IDBcbiAgICAgICAgfSxcbiAgICAgICAgb3V0c2lkZToge1xuICAgICAgICAgICAgZnJvbnRGb290OiAxLFxuICAgICAgICAgICAgbW92ZTogWzAsIC0xXSxcbiAgICAgICAgICAgIGRpcmVjdGlvbjogMFxuICAgICAgICB9LFxuICAgICAgICB0dXJuOiB7XG4gICAgICAgICAgICBmcm9udEZvb3Q6IDAsXG4gICAgICAgICAgICBtb3ZlOiBbMCwgLTFdLFxuICAgICAgICAgICAgZGlyZWN0aW9uOiAxXG4gICAgICAgIH0sXG4gICAgICAgIG9uR3VhcmQ6IHtcbiAgICAgICAgICAgIF9wcm9wZXJ0eURlZmluaXRpb246IHRydWUsXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICAgICAgZnJvbnRGb290OiAnTGVmdCcsXG4gICAgICAgICAgICAgICAgbW92ZTogWzAsIDBdLFxuICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogMFxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB3dUNoaToge1xuICAgICAgICAgICAgX3Byb3BlcnR5RGVmaW5pdGlvbjogdHJ1ZSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgICAgICBmcm9udEZvb3Q6IG51bGwsXG4gICAgICAgICAgICAgICAgbW92ZTogWzAsIDBdLFxuICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogMFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBzdGFydFNlcXVlbmNlOiBbJ3d1Q2hpJywgJ29uR3VhcmQnXSxcbiAgICBlbmRTZXF1ZW5jZTogWyd3dUNoaSddXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgYXBwID0gcmVxdWlyZSgnLi9hcHAnKTtcblxuYXBwLmluaXQoKTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBldmVudEVtaXR0ZXIgPSAoZnVuY3Rpb24gKHVuZGVmaW5lZCkge1xuXG4gICAgdmFyIGRvT24gPSBmdW5jdGlvbiAoY2FsbGJhY2tzLCBldmVudCwgY2FsbGJhY2ssIGNvbnRleHQpIHtcblxuICAgICAgICAgICAgLy8gZmV0Y2ggdGhlIGV2ZW50J3Mgc3RvcmUgb2YgY2FsbGJhY2tzIG9yIGNyZWF0ZSBpdCBpZiBuZWVkZWRcbiAgICAgICAgICAgIHZhciBzdG9yZSA9IGNhbGxiYWNrc1tldmVudF0gfHwgKGNhbGxiYWNrc1tldmVudF0gPSBbXSk7XG5cbiAgICAgICAgICAgIC8vIHN0b3JlIHRoZSBjYWxsYmFjayBmb3IgbGF0ZXIgdXNlXG4gICAgICAgICAgICBzdG9yZS5wdXNoKHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjazogY2FsbGJhY2ssXG4gICAgICAgICAgICAgICAgY29udGV4dDogY29udGV4dCB8fCB3aW5kb3cgfHwgbnVsbFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIGFsc28gb24gdG8gdGhlIGNvbnRleHQgb2JqZWN0J3MgZGVzdHJveSBldmVudCBpbiBvcmRlciB0byBvZmZcbiAgICAgICAgICAgIGlmIChjb250ZXh0KSB7XG4gICAgICAgICAgICAgICAgaWYgKGNvbnRleHQub24gIT09IG9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50RW1pdHRlci5hcHBseShjb250ZXh0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50ICE9PSAnc2lsZW5jZUV2ZW50cycpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5vbignc2lsZW5jZUV2ZW50cycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9mZi5jYWxsKHRoaXMsIGV2ZW50LCBjYWxsYmFjaywgY29udGV4dCk7XG4gICAgICAgICAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBkb09mZiA9IGZ1bmN0aW9uIChjYWxsYmFja3MsIGV2ZW50LCBjYWxsYmFjaywgY29udGV4dCkge1xuICAgICAgICAgICAgdmFyIHN0b3JlID0gY2FsbGJhY2tzW2V2ZW50XSxcbiAgICAgICAgICAgICAgICBpO1xuXG4gICAgICAgICAgICBpZiAoIXN0b3JlKSB7cmV0dXJuO31cblxuICAgICAgICAgICAgaWYgKCFjYWxsYmFjayAmJiAhY29udGV4dCkge1xuICAgICAgICAgICAgICAgIHN0b3JlLmxlbmd0aCA9IFtdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBmYXN0IGxvb3BcbiAgICAgICAgICAgIGZvciAoaSA9IHN0b3JlLmxlbmd0aCAtIDE7IGk+PTA7IGktLSkge1xuICAgICAgICAgICAgICAgIGlmICgoIWNhbGxiYWNrICYmIHN0b3JlW2ldLmNvbnRleHQgPT09IGNvbnRleHQpIHx8IChzdG9yZVtpXS5jYWxsYmFjayA9PT0gY2FsbGJhY2sgJiYgKCFjb250ZXh0IHx8ICEoc3RvcmVbaV0uY29udGV4dCkgfHwgc3RvcmVbaV0uY29udGV4dCA9PT0gY29udGV4dCkpKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gSSBtaWdodCBoYXZlIGdvdCB0aGUgaW5kZXggd3JvbmcgaGVyZSAtIHNob3VkbCBpdCBiZSBpLTEuIE9idmlvdXNseSBJJ2QgY2hlY2sgdGhvcm91Z2hseSBpbiBhIHJlYWwgYXBwXG4gICAgICAgICAgICAgICAgICAgIHN0b3JlLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGRvRmlyZSA9IGZ1bmN0aW9uIChjYWxsYmFja3MsIGV2ZW50LCByZXN1bHQpIHtcbiAgICAgICAgICAgIHZhciBzdG9yZSA9IGNhbGxiYWNrc1tldmVudF0sXG4gICAgICAgICAgICAgICAgaSA9IDAsXG4gICAgICAgICAgICAgICAgaWw7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdFdmVudCBlbWl0dGVkJywgJ1xcbmVtaXR0ZXI6ICcsIHRoaXMsICdcXG5ldmVudDonLCBldmVudCwgJ1xcbmRhdGE6ICcsIHJlc3VsdCk7XG4gICAgICAgICAgICBpZiAoIXN0b3JlKSB7cmV0dXJuO31cblxuICAgICAgICAgICAgLy8gbG9vcCBoZXJlIG11c3QgYmUgaW4gaW5jcmVhc2luZyBvcmRlclxuICAgICAgICAgICAgZm9yIChpbCA9IHN0b3JlLmxlbmd0aDsgaTxpbDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgc3RvcmVbaV0uY2FsbGJhY2suY2FsbChzdG9yZVtpXS5jb250ZXh0LCByZXN1bHQsIGV2ZW50LCB0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgb24gPSBmdW5jdGlvbiAoZXZlbnQsIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGV2ZW50ICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIHRocm93KCdwcm92aWRlIGEgc3RyaW5nIG5hbWUgZm9yIHRoZSBldmVudCB0byBzdWJzY3JpYmUgdG8nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICB0aHJvdygncHJvdmlkZSBhIGNhbGxiYWNrIGZvciB0aGUgZXZlbnQgdG8gc3Vic2NyaWJlIHRvJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBjYWxsYmFja3MgPSBnZXRDYWxsYmFja3ModGhpcyksXG4gICAgICAgICAgICAgICAgZXZlbnRzID0gZXZlbnQuc3BsaXQoJyAnKTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGlsID0gZXZlbnRzLmxlbmd0aDsgaTxpbDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgZG9Pbi5jYWxsKHRoaXMsIGNhbGxiYWNrcywgZXZlbnRzW2ldLCBjYWxsYmFjaywgY29udGV4dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgb2ZmID0gZnVuY3Rpb24gKGV2ZW50LCBjYWxsYmFjaywgY29udGV4dCkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBldmVudCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICB0aHJvdygncHJvdmlkZSBhIHN0cmluZyBuYW1lIGZvciB0aGUgZXZlbnQgdG8gdW5zdWJzY3JpYmUgZnJvbScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGNhbGxiYWNrcyA9IGdldENhbGxiYWNrcyh0aGlzLCB0cnVlKSxcbiAgICAgICAgICAgICAgICBldmVudHMgPSBldmVudC5zcGxpdCgnICcpO1xuXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmICghY2FsbGJhY2tzKSB7cmV0dXJuIGZhbHNlO31cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGlsID0gZXZlbnRzLmxlbmd0aDsgaTxpbDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgZG9PZmYuY2FsbCh0aGlzLCBjYWxsYmFja3MsIGV2ZW50c1tpXSwgY2FsbGJhY2ssIGNvbnRleHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGZpcmUgPSBmdW5jdGlvbiAoZXZlbnQsIHJlc3VsdCkge1xuICAgICAgICAgICAgdmFyIGNhbGxiYWNrcyA9IGdldENhbGxiYWNrcyh0aGlzKSxcbiAgICAgICAgICAgICAgICBldmVudHMgPSBldmVudC5zcGxpdCgnICcpO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgaWwgPSBldmVudHMubGVuZ3RoOyBpPGlsOyBpKyspIHtcbiAgICAgICAgICAgICAgICBkb0ZpcmUuY2FsbCh0aGlzLCBjYWxsYmFja3MsIGV2ZW50c1tpXSwgcmVzdWx0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBnZXRDYWxsYmFja3MgPSBmdW5jdGlvbiAob2JqLCBkb250U2V0KSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgaWwgPSBjb250ZXh0cy5sZW5ndGg7IGkgPCBpbDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNvbnRleHRzW2ldID09PSBvYmopIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrc1tpXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWRvbnRTZXQpIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0cy5wdXNoKG9iaik7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2tzLnB1c2goW10pO1xuICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFja3NbY2FsbGJhY2tzLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGNhbGxiYWNrcyA9IFtdLFxuICAgICAgICBjb250ZXh0cyA9IFtdLFxuICAgICAgICBcbiAgICAgICAgbWl4aW4gPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHRoaXMub24gPSBvbjtcbiAgICAgICAgICAgIHRoaXMub2ZmID0gb2ZmO1xuICAgICAgICAgICAgdGhpcy5maXJlID0gZmlyZTtcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH07XG5cbiAgICBtaXhpbi5jbGVhblVwID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBjYWxsYmFja3MgPSBbXTtcbiAgICAgICAgY29udGV4dHMgPSBbXTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIG1peGluO1xuXG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV2ZW50RW1pdHRlcjsiLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyksXG4gICAgTCA9ICdMZWZ0JyxcbiAgICBSID0gJ1JpZ2h0JyxcbiAgICBOID0gJ05vcnRoJyxcbiAgICBTID0gJ1NvdXRoJyxcbiAgICBFID0gJ0Vhc3QnLFxuICAgIFcgPSAnV2VzdCcsXG4gICAgY29tcGFzcyA9IFtOLCBFLCBTLCBXXTtcblxudmFyIENhbGxlciA9IGZ1bmN0aW9uIChkcmlsbGVyKSB7XG4gICAgaWYgKCFkcmlsbGVyLm9uKSB7XG4gICAgICAgIHRocm93KCdkcmlsbGVyIG11c3QgaW1wbGVtZW50IGV2ZW50IGVtaXR0ZXInKTtcbiAgICB9XG4gICAgdGhpcy5kcmlsbGVyID0gZHJpbGxlcjtcbiAgICB0aGlzLmluaXQoKTtcbn07XG5cbkNhbGxlci5wcm90b3R5cGUgPSB7XG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICAvL3RoaXMucHJlbG9hZEF1ZGlvKCk7XG4gICAgICAgIHRoaXMuc3BlYWtlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2F1ZGlvJyk7XG4gICAgICAgIHRoaXMuc3BlYWtlci5wcmVsb2FkID0gJ2F1dG8nO1xuICAgICAgICB0aGlzLnNwZWFrZXIuYXV0b3BsYXkgPSBmYWxzZTtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2JvZHknKVswXS5hcHBlbmRDaGlsZCh0aGlzLnNwZWFrZXIpO1xuICAgICAgICB0aGlzLmRyaWxsZXIub24oJ3N0ZXAnLCB0aGlzLmNhbGxTdGVwLCB0aGlzKTtcbiAgICB9LFxuICAgIGNhbGxTdGVwOiBmdW5jdGlvbiAoc3RhdGUpIHtcbiAgICAgICAgdGhpcy5zcGVha2VyLnNyYyA9ICdhc3NldHMvYXVkaW8vJyArIHV0aWxzLnRvRGFzaGVkKHRoaXMuZHJpbGxlci5kaXNjaXBsaW5lKSArICcvJyArIHV0aWxzLnRvRGFzaGVkKHN0YXRlLmxhc3RTdGVwKSArICcub2dnJztcbiAgICAgICAgdGhpcy5zcGVha2VyLnBsYXkoKTtcbiAgICB9Ly8sXG4vLyAgICAgICAgIHByZWxvYWRBdWRpbzogZnVuY3Rpb24gKCkge1xuLy8gICAgICAgICAgICAgdmFyIHN0ZXBzID0gdGhpcy5kcmlsbGVyLmNvbmYuc3RlcHM7XG4vLyAvL2dldE93blByb3BlcnR5TmFtZXNcbi8vICAgICAgICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDYWxsZXI7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29udHJvbFBhbmVsID0gZnVuY3Rpb24gKGNvbnRyb2xsZXIsIGNvbmYpIHtcbiAgICBpZiAoIWNvbnRyb2xsZXIub24pIHtcbiAgICAgICAgdGhyb3coJ2NvbnRyb2xsZXIgbXVzdCBpbXBsZW1lbnQgZXZlbnQgZW1pdHRlciBwYXR0ZXJuJyk7XG4gICAgfVxuICAgIHRoaXMuZmllbGRMaXN0ID0gY29uZi5maWVsZExpc3Q7XG4gICAgdGhpcy5hY3Rpb25MaXN0ID0gY29uZi5hY3Rpb25MaXN0O1xuICAgIHRoaXMuY29udHJvbGxlciA9IGNvbnRyb2xsZXI7XG4gICAgdGhpcy5mb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29uZi5mb3JtSWQpO1xuICAgIHRoaXMuaW5pdCgpO1xufTtcblxuQ29udHJvbFBhbmVsLnByb3RvdHlwZSA9IHtcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBpLCBpbDtcbiAgICAgICAgaWYgKHRoaXMuZmllbGRMaXN0KSB7XG4gICAgICAgICAgICBmb3IoaSA9IDAsIGlsID0gdGhpcy5maWVsZExpc3QubGVuZ3RoOyBpPGlsOyBpKyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLmJpbmRGaWVsZCh0aGlzLmZpZWxkTGlzdFtpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuYWN0aW9uTGlzdCkge1xuICAgICAgICAgICAgZm9yKGkgPSAwLCBpbCA9IHRoaXMuYWN0aW9uTGlzdC5sZW5ndGg7IGk8aWw7IGkrKykge1xuICAgICAgICAgICAgICAgIHRoaXMuYmluZEFjdGlvbih0aGlzLmFjdGlvbkxpc3RbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIGJpbmRGaWVsZDogZnVuY3Rpb24gKGZpZWxkTmFtZSkge1xuICAgICAgICB2YXIgZmllbGQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChmaWVsZE5hbWUpLFxuICAgICAgICAgICAgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICB2YWxQcm9wO1xuXG4gICAgICAgIGlmICghZmllbGQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignbWlzc2luZyBmaWVsZCBpbiBjb250cm9sIHBhbmVsOiAnICsgZmllbGROYW1lKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YWxQcm9wID0gWydjaGVja2JveCcsICdyYWRpbyddLmluZGV4T2YoZmllbGQudHlwZSkgPiAtMSA/ICdjaGVja2VkJyA6ICd2YWx1ZSc7XG4gICAgICAgIGZpZWxkW3ZhbFByb3BdID0gdGhpcy5jb250cm9sbGVyLmNvbmZbZmllbGROYW1lXTtcbiAgICAgICAgZmllbGQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHZhbHVlID0gZmllbGRbdmFsUHJvcF07XG4gICAgICAgICAgICB0aGF0LmNvbnRyb2xsZXIuY29uZltmaWVsZE5hbWVdID0gdmFsdWU7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IHt9O1xuICAgICAgICAgICAgZGF0YVtmaWVsZE5hbWVdID0gdmFsdWU7XG4gICAgICAgICAgICB0aGF0LmNvbnRyb2xsZXIuZmlyZSgnY29uZmlnQ2hhbmdlJywgZGF0YSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgYmluZEFjdGlvbjogZnVuY3Rpb24gKGFjdGlvbk5hbWUpIHtcbiAgICAgICAgdmFyIGJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGFjdGlvbk5hbWUpLFxuICAgICAgICAgICAgdGhhdCA9IHRoaXM7XG4gICAgICAgIGlmICghYnV0dG9uKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ21pc3NpbmcgYnV0dG9uIG9uIGNvbnRyb2wgcGFuZWw6ICcgKyBhY3Rpb25OYW1lKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGF0LmNvbnRyb2xsZXJbYWN0aW9uTmFtZV0oKTtcbiAgICAgICAgfSk7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb250cm9sUGFuZWw7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnLi4vbWl4aW5zL2V2ZW50LWVtaXR0ZXInKSxcbiAgICB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyksXG4gICAgTCA9ICdMZWZ0JyxcbiAgICBSID0gJ1JpZ2h0JyxcbiAgICBOID0gJ05vcnRoJyxcbiAgICBTID0gJ1NvdXRoJyxcbiAgICBFID0gJ0Vhc3QnLFxuICAgIFcgPSAnV2VzdCcsXG4gICAgY29tcGFzcyA9IFtOLCBFLCBTLCBXXTtcblxudmFyIERyaWxsZXIgPSBmdW5jdGlvbiAoY29uZikge1xuICAgIHRoaXMuZGlzY2lwbGluZSA9IChjb25mICYmIGNvbmYuZGlzY2lwbGluZSkgfHwgRHJpbGxlci5kZWZhdWx0cy5kaXNjaXBsaW5lO1xuICAgIHRoaXMuY29uZiA9IHV0aWxzLmV4dGVuZE9iaih7fSwgRHJpbGxlci5kZWZhdWx0cywgRHJpbGxlci5kaXNjaXBsaW5lQ29uZmlnc1t0aGlzLmRpc2NpcGxpbmVdLCBjb25mIHx8IHt9KTtcbiAgICB0aGlzLmluaXQoKTtcbn07XG5cbkRyaWxsZXIuZGVmYXVsdHMgPSB7XG4gICAgZGlzY2lwbGluZTogJ3RhaUNoaScsXG4gICAgZGlzYWJsZWRTdGVwczogW10sXG4gICAgbWluVGltZTogMSxcbiAgICBtYXhUaW1lOiAyLFxuICAgIC8vIGF2Z1RpbWU6IDMsXG4gICAgLy8gYXZnV2VpZ2h0OiAxLFxuICAgIGFyZWFXaWR0aDogNCxcbiAgICBhcmVhTGVuZ3RoOiA0LFxuICAgIHN0ZXBDb3VudDogLTEgLy8gLTEgZm9yIGluZmluaXRlXG59O1xuXG5EcmlsbGVyLmFkZERpc2NpcGxpbmUgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgaWYgKCFjb25maWcubmFtZSkge1xuICAgICAgICB0aHJvdygnbmFtZSBtdXN0IGJlIGRlZmluZWQgZm9yIGFueSBkaXNjaXBsaW5lIGNvbmZpZycpO1xuICAgIH1cbiAgICBEcmlsbGVyLmRpc2NpcGxpbmVDb25maWdzW2NvbmZpZy5uYW1lXSA9IGNvbmZpZztcbiAgICB1dGlscy5kZWZpbmVQcm9wcyhjb25maWcuc3RlcHMpO1xufTtcblxuRHJpbGxlci5kaXNjaXBsaW5lQ29uZmlncyA9IHt9O1xuXG5EcmlsbGVyLnByb3RvdHlwZSA9IHtcbiAgICBpbml0OiBmdW5jdGlvbiAoZG9udFN0YXJ0KSB7XG4gICAgICAgIHZhciBzdGFydFBvcyA9IHRoaXMuY29uZi5zdGFydFBvc2l0aW9uIHx8IHt9LFxuICAgICAgICAgICAgdGhhdCA9IHRoaXM7XG4gICAgICAgIHRoaXMuZGlzYWJsZWRTdGVwcyA9IHt9O1xuICAgICAgICB0aGlzLmNvbmYuZGlzYWJsZWRTdGVwcy5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgIHRoYXQuZGlzYWJsZWRTdGVwc1tpdGVtXSA9IHRydWU7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmNvb3JkcyA9ICh0aGlzLmNvbmYucHJlc2VydmVQb3NpdGlvbiA/IHRoaXMuY29vcmRzIDogc3RhcnRQb3MuY29vcmRzKSB8fCBbMCwwXTtcbiAgICAgICAgdGhpcy5mcm9udEZvb3QgPSBzdGFydFBvcy5mcm9udEZvb3QgfHwgbnVsbDtcbiAgICAgICAgLy8gaWYgKCdkaXJlY3Rpb24nIGluIHRoaXMpIHtcblxuICAgICAgICAvLyB9XG4gICAgICAgIHRoaXMuZGlyZWN0aW9uID0gKHRoaXMuY29uZi5wcmVzZXJ2ZVBvc2l0aW9uID8gdGhpcy5kaXJlY3Rpb24gOiBzdGFydFBvcy5kaXJlY3Rpb24pO1xuICAgICAgICB0aGlzLmRpcmVjdGlvbiA9IHR5cGVvZiB0aGlzLmRpcmVjdGlvbiA9PT0gJ3VuZGVmaW5lZCcgPyAwIDogdGhpcy5kaXJlY3Rpb247XG4gICAgICAgIHRoaXMubG9uZ0RpcmVjdGlvbiA9IGNvbXBhc3NbdGhpcy5kaXJlY3Rpb25dO1xuICAgICAgICAvL3RoaXMuZGlyZWN0aW9uID0gc3RhcnRQb3MuZGlyZWN0aW9uIHx8IDA7XG4gICAgICAgIHRoaXMuc3RlcENvdW50ID0gdGhpcy5jb25mLnN0ZXBDb3VudDtcbiAgICAgICAgdGhpcy5jb25mLm1pblRpbWUgPSBNYXRoLm1heCh0aGlzLmNvbmYubWluVGltZSwgMC41KTtcbiAgICAgICAgdGhpcy5jb25mLm1heFRpbWUgPSBNYXRoLm1heCh0aGlzLmNvbmYubWF4VGltZSwgdGhpcy5jb25mLm1pblRpbWUpO1xuICAgICAgICB0aGlzLmZpcmUoJ2luaXRpYWxpc2VkJyk7XG4gICAgICAgIGlmICh0aGlzLmNvbmYuYXV0b3BsYXkgJiYgIWRvbnRTdGFydCkge1xuICAgICAgICAgICAgdGhpcy5zdGFydCgpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBfc3RhcnQ6IGZ1bmN0aW9uIChyZXNldCkge1xuICAgICAgICBcbiAgICAgICAgdGhpcy5maXJlKCdzdGFydGVkJyk7XG4gICAgICAgIHRoaXMucnVubmluZyA9IHRydWU7XG4gICAgICAgIHRoaXMuc3RhcnRTZXF1ZW5jZSA9IHRoaXMuY29uZi5zdGFydFNlcXVlbmNlLnNsaWNlKCk7XG4gICAgICAgIHRoaXMuYW5ub3VuY2VTdGVwKHRoaXMuc3RhcnRTZXF1ZW5jZS5zaGlmdCgpKTtcbiAgICAgICAgdGhpcy50YWtlU3RlcCgpO1xuICAgIH0sXG4gICAgc3RhcnQ6IGZ1bmN0aW9uIChyZXNldCkge1xuICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgIGlmIChyZXNldCkge1xuICAgICAgICAgICAgdGhpcy5pbml0KHRydWUpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMucnVubmluZyA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmNvbmYuZGVsYXkpIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRoYXQuX3N0YXJ0KHJlc2V0KTtcbiAgICAgICAgICAgIH0sIHRoaXMuY29uZi5kZWxheSAqIDEwMDApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fc3RhcnQocmVzZXQpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICByZXNldEFuZFN0YXJ0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuc3RvcCh0cnVlKTtcbiAgICAgICAgdGhpcy5zdGFydCh0cnVlKTtcbiAgICB9LFxuICAgIGFubm91bmNlU3RlcDogZnVuY3Rpb24gKHN0ZXApIHtcbiAgICAgICAgaWYgKCF0aGlzLmNvbmYuc3RlcHNbc3RlcF0pIHtcbiAgICAgICAgICAgIHRocm93KCdpbnZhbGlkIHN0ZXAgbmFtZTogJyArIHN0ZXApO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZmlyZSgnc3RlcCcsIHtcbiAgICAgICAgICAgIGRpcmVjdGlvbjogY29tcGFzc1t0aGlzLmRpcmVjdGlvbl0sXG4gICAgICAgICAgICBmcm9udEZvb3Q6IHRoaXMuZnJvbnRGb290LFxuICAgICAgICAgICAgbGFzdFN0ZXA6IHN0ZXAsXG4gICAgICAgICAgICBjb29yZHM6IHRoaXMuY29vcmRzLnNsaWNlKClcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBzdG9wOiBmdW5jdGlvbiAoYWJvcnQpIHtcbiAgICAgICAgaWYgKHRoaXMucnVubmluZyA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZXIpO1xuICAgICAgICAgICAgaWYgKCFhYm9ydCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZW5kU2VxdWVuY2UgPSB0aGlzLmNvbmYuZW5kU2VxdWVuY2Uuc2xpY2UoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnRha2VTdGVwKHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5maXJlKCdzdG9wcGVkJyk7XG4gICAgICAgICAgICB0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgdGFrZVN0ZXA6IGZ1bmN0aW9uIChjbG9zaW5nKSB7XG4gICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgIHN0ZXA7XG4gICAgICAgIFxuICAgICAgICBpZiAoIXRoaXMuc3RlcENvdW50ICYmICFjbG9zaW5nICYmICF0aGlzLnN0YXJ0U2VxdWVuY2UubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zdG9wKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuc3RlcENvdW50ICYmICF0aGlzLnN0YXJ0U2VxdWVuY2UubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLnN0ZXBDb3VudC0tO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBzdGVwID0gdGhpcy5nZXROZXh0U3RlcE5hbWUoY2xvc2luZyk7XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgaWYgKGNsb3NpbmcpIHtcbiAgICAgICAgICAgIGlmIChzdGVwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hZGp1c3RQb3NpdGlvbihzdGVwKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5lbmRTZXF1ZW5jZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC50YWtlU3RlcChjbG9zaW5nKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5hZGp1c3RQb3NpdGlvbihzdGVwKTtcbiAgICAgICAgICAgICAgICB0aGF0LnRha2VTdGVwKCk7XG4gICAgICAgICAgICAgICAgLy8gcmVtZW1iZXIgdG8gZG8gdGhpcyBvbiBzb3VuZCBmaW5pc2ggKG1heWJlPylcbiAgICAgICAgICAgIH0sIHRoaXMuZ2V0VGltZUludGVydmFsKCkpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBnZXROZXh0U3RlcE5hbWU6IGZ1bmN0aW9uIChjbG9zaW5nKSB7XG4gICAgICAgIHZhciBzdGVwO1xuICAgICAgICBpZiAoY2xvc2luZykge1xuICAgICAgICAgICAgc3RlcCA9IHRoaXMuZW5kU2VxdWVuY2UubGVuZ3RoID8gdGhpcy5lbmRTZXF1ZW5jZS5zaGlmdCgpOiB1bmRlZmluZWQ7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGFydFNlcXVlbmNlLmxlbmd0aCkge1xuICAgICAgICAgICAgc3RlcCA9IHRoaXMuc3RhcnRTZXF1ZW5jZS5zaGlmdCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RlcCA9IHRoaXMuZ2V0UmFuZG9tU3RlcCgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghc3RlcCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnZhbGlkYXRlU3RlcChzdGVwKSA/IHN0ZXAgOiB0aGlzLmdldE5leHRTdGVwTmFtZShjbG9zaW5nKTtcbiAgICB9LFxuICAgIGdldFJhbmRvbVN0ZXA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHV0aWxzLnBpY2tSYW5kb21Qcm9wZXJ0eSh0aGlzLmNvbmYuc3RlcHMpO1xuICAgIH0sXG4gICAgdmFsaWRhdGVTdGVwOiBmdW5jdGlvbiAoc3RlcCkge1xuICAgICAgICBpZiAodGhpcy5kaXNhYmxlZFN0ZXBzW3N0ZXBdKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG5ld1Bvc2l0aW9uID0gdGhpcy5hZGp1c3RQb3NpdGlvbihzdGVwLCB0cnVlKTtcbiAgICAgICAgcmV0dXJuIChuZXdQb3NpdGlvblswXSA+PSAwICYmIG5ld1Bvc2l0aW9uWzFdID49IDAgJiYgbmV3UG9zaXRpb25bMV0gPCB0aGlzLmNvbmYuYXJlYVdpZHRoICYmIG5ld1Bvc2l0aW9uWzBdIDwgdGhpcy5jb25mLmFyZWFMZW5ndGgpO1xuICAgIH0sXG4gICAgYWRqdXN0UG9zaXRpb246IGZ1bmN0aW9uIChzdGVwLCBkdW1teSkge1xuICAgICAgICB2YXIgbW92ZU1hdHJpeCxcbiAgICAgICAgICAgIGxlZnRUb1JpZ2h0LFxuICAgICAgICAgICAgZnJvbnRUb0JhY2ssXG4gICAgICAgICAgICBjb29yZHMsXG4gICAgICAgICAgICBjdXJyZW50U3RlcCxcbiAgICAgICAgICAgIGRpcmVjdGlvbixcbiAgICAgICAgICAgIGxvbmdEaXJlY3Rpb24sIFxuICAgICAgICAgICAgZnJvbnRGb290O1xuXG4gICAgICAgIGN1cnJlbnRTdGVwID0gdGhpcy5jb25mLnN0ZXBzW3N0ZXBdO1xuICAgICAgICBpZiAoIWN1cnJlbnRTdGVwKSB7XG4gICAgICAgICAgICAvLyBpZiAoZHVtbXkpIHtcbiAgICAgICAgICAgIC8vICAgICByZXR1cm4gWzEwMDAwMDAwMDAsIDEwMDAwMDAwMDBdO1xuICAgICAgICAgICAgLy8gfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93KCdpbnZhbGlkIHN0ZXAgbmFtZTogJyArIHN0ZXApO1xuICAgICAgICAgICAgLy8gfVxuICAgICAgICB9XG4gICAgICAgIGRpcmVjdGlvbiA9ICh0aGlzLmRpcmVjdGlvbiArICgodGhpcy5mcm9udEZvb3QgPT09IEwgPyAxIDogLTEpICogY3VycmVudFN0ZXAuZGlyZWN0aW9uKSArIDQpICUgNDtcbiAgICAgICAgbG9uZ0RpcmVjdGlvbiA9IGNvbXBhc3NbZGlyZWN0aW9uXTtcbiAgICAgICAgbGVmdFRvUmlnaHQgPSBjdXJyZW50U3RlcC5tb3ZlWzFdICogKHRoaXMuZnJvbnRGb290ICE9PSBSID8gMTogLTEpO1xuICAgICAgICBmcm9udFRvQmFjayA9IGN1cnJlbnRTdGVwLm1vdmVbMF07XG5cbiAgICAgICAgZnJvbnRGb290ID0gICAgY3VycmVudFN0ZXAuZnJvbnRGb290ID09PSBMID8gTCA6XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50U3RlcC5mcm9udEZvb3QgPT09IFIgPyBSIDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRTdGVwLmZyb250Rm9vdCA9PT0gbnVsbCA/IG51bGwgOlxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFN0ZXAuZnJvbnRGb290ID09PSAxID8gKHRoaXMuZnJvbnRGb290ID09PSBSID8gTCA6IFIpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZnJvbnRGb290O1xuICAgICAgICBcbiAgICAgICAgc3dpdGNoICh0aGlzLmRpcmVjdGlvbikge1xuICAgICAgICBcbiAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgbW92ZU1hdHJpeCA9IFtmcm9udFRvQmFjaywgbGVmdFRvUmlnaHRdO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIG1vdmVNYXRyaXggPSBbLWxlZnRUb1JpZ2h0LCBmcm9udFRvQmFja107XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgbW92ZU1hdHJpeCA9IFstZnJvbnRUb0JhY2ssIC1sZWZ0VG9SaWdodF07XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgbW92ZU1hdHJpeCA9IFtsZWZ0VG9SaWdodCwgLWZyb250VG9CYWNrXTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIH1cblxuICAgICAgICBjb29yZHMgPSBbdGhpcy5jb29yZHNbMF0gKyBtb3ZlTWF0cml4WzBdLCB0aGlzLmNvb3Jkc1sxXSArIG1vdmVNYXRyaXhbMV1dO1xuXG4gICAgICAgIGlmIChkdW1teSkge1xuICAgICAgICAgICAgcmV0dXJuIGNvb3JkcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuY29vcmRzID0gY29vcmRzO1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50U3RlcCA9IGN1cnJlbnRTdGVwO1xuICAgICAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSBkaXJlY3Rpb247XG4gICAgICAgICAgICB0aGlzLmxvbmdEaXJlY3Rpb24gPSBsb25nRGlyZWN0aW9uO1xuICAgICAgICAgICAgdGhpcy5mcm9udEZvb3QgPSBmcm9udEZvb3Q7XG4gICAgICAgICAgICB0aGlzLmFubm91bmNlU3RlcChzdGVwKTsgICAgXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfSxcblxuICAgIGdldFRpbWVJbnRlcnZhbDogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgbWluID0gMixcbiAgICAgICAgICAgIGF2YWlsYWJsZUludGVydmFsID0gdGhpcy5jb25mLm1heFRpbWUgLSB0aGlzLmNvbmYubWluVGltZTtcblxuICAgICAgICB2YXIgdGltZSA9IChtaW4gKyAoYXZhaWxhYmxlSW50ZXJ2YWwgKiBNYXRoLnJhbmRvbSgpKSk7XG4gICAgICAgIHRpbWUgPSBNYXRoLm1heChNYXRoLm1pbih0aGlzLmNvbmYubWF4VGltZSwgdGltZSksIHRoaXMuY29uZi5taW5UaW1lKTtcbiAgICAgICAgcmV0dXJuIHRpbWUgKiAxMDAwO1xuXG5cbiAgICAgICAgLy8gdmFyIHRpbWUgPSAoKChhdmFpbGFibGVJbnRlcnZhbCAqIE1hdGgucmFuZG9tKCkpLyh0aGlzLmNvbmYuYXZnV2VpZ2h0ICsgMSkpICsgKHRoaXMuY29uZi5hdmdUaW1lICoodGhpcy5jb25mLmF2Z1dlaWdodC8odGhpcy5jb25mLmF2Z1dlaWdodCArIDEpKSkpICsgdGhpcy5jb25mLm1pblRpbWU7XG5cbiAgICB9LFxuICAgIGVuYWJsZVN0ZXA6IGZ1bmN0aW9uIChzdGVwKSB7XG4gICAgICAgIFxuICAgICAgICB2YXIgc3RlcEluZGV4ID0gdGhpcy5jb25mLmRpc2FibGVkU3RlcHMuaW5kZXhPZihzdGVwKTtcbiAgICAgICAgdGhpcy5kaXNhYmxlZFN0ZXBzW3N0ZXBdID0gZmFsc2U7XG4gICAgICAgIGlmIChzdGVwSW5kZXggPiAtMSkge1xuICAgICAgICAgICAgdGhpcy5jb25mLmRpc2FibGVkU3RlcHMuc3BsaWNlKHN0ZXBJbmRleCwgMSk7XG4gICAgICAgICAgICAvLyBvciBjb3VsZCBqdXN0IGZpcmUgJ3N0ZXBEaXNhYmxlZCdcbiAgICAgICAgICAgIHRoaXMuZmlyZSgnY29uZmlnQ2hhbmdlJywge1xuICAgICAgICAgICAgICAgIGRpc2FibGVkU3RlcHM6IHRoaXMuY29uZi5kaXNhYmxlZFN0ZXBzXG4gICAgICAgICAgICB9KTsgIFxuICAgICAgICB9XG4gICAgfSxcbiAgICBkaXNhYmxlU3RlcDogZnVuY3Rpb24gKHN0ZXApIHtcbiAgICAgICAgdmFyIHN0ZXBJbmRleCA9IHRoaXMuY29uZi5kaXNhYmxlZFN0ZXBzLmluZGV4T2Yoc3RlcCk7XG4gICAgICAgIHRoaXMuZGlzYWJsZWRTdGVwc1tzdGVwXSA9IHRydWU7XG4gICAgICAgIGlmIChzdGVwSW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmYuZGlzYWJsZWRTdGVwcy5wdXNoKHN0ZXApO1xuICAgICAgICAgICAgdGhpcy5maXJlKCdjb25maWdDaGFuZ2UnLCB7XG4gICAgICAgICAgICAgICAgZGlzYWJsZWRTdGVwczogdGhpcy5jb25mLmRpc2FibGVkU3RlcHNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSxcblxuXG4gICAgLy8gPz8/TkVFRCBUTyBXUklURSBURVNUUyBGT1IgdGhpc1xuICAgIC8vICAgICAgICAgICAgIGl0KCdzaG91bGQgYmUgYWZmZWN0ZWQgYnkgbGl2ZSBjaGFuZ2VzIHRvIHRoZSBjb25maWcnLCBmdW5jdGlvbiAoKSB7XG5cbiAgICAvLyAgICAgfSk7XG4gICAgdXBkYXRlU2V0dGluZ3M6IGZ1bmN0aW9uIChjb25mKSB7XG4gICAgICAgIHRoaXMuY29uZiA9IHV0aWxzLmV4dGVuZE9iaih0aGlzLmNvbmYsIGNvbmYpO1xuICAgICAgICBcbiAgICAvLyBkZWZpbmVTdGVwOiBmdW5jdGlvbiAobmFtZSwgY29uZikge1xuICAgIC8vICAgICB0aGlzLnN0ZXBzW25hbWVdID0gY29uZjtcbiAgICAvLyB9LFxuICAgIC8vIHVuZGVmaW5lU3RlcDogZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAvLyAgICAgaWYgKHRoaXMuc3RlcHNbbmFtZV0pIHtcbiAgICAvLyAgICAgICAgIGRlbGV0ZSB0aGlzLnN0ZXBzW25hbWVdO1xuICAgIC8vICAgICB9XG4gICAgfVxufTtcblxuZXZlbnRFbWl0dGVyLmFwcGx5KERyaWxsZXIucHJvdG90eXBlKTtcblxubW9kdWxlLmV4cG9ydHMgPSBEcmlsbGVyOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKSxcbiAgICBhcnJvd0NvZGVzID0geyBcbiAgICBXZXN0OiA4NTkyLFxuICAgIE5vcnRoOiA4NTkzLFxuICAgIEVhc3Q6IDg1OTQsXG4gICAgU291dGg6IDg1OTVcbn0sXG5kZWZhdWx0Q2VsbEh0bWwgPSAnJm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7JztcblxudmFyIFZpc3VhbGlzZXIgPSBmdW5jdGlvbiAoZHJpbGxlciwgZG9tTm9kZUlkKSB7XG4gICAgdGhpcy5jb25mID0gZHJpbGxlci5jb25mO1xuICAgIHRoaXMuZHJpbGxlciA9IGRyaWxsZXI7XG4gICAgdGhpcy5kb21Ob2RlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZG9tTm9kZUlkKTtcbiAgICB0aGlzLmluaXQoKTtcbn07XG5cblZpc3VhbGlzZXIucHJvdG90eXBlID0ge1xuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcblxuICAgICBcbiAgICAgICAgdGhpcy5kcmlsbGVyLm9uKCdpbml0aWFsaXNlZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMucHJpbWUoKTtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIC8vIHRoaXMuZHJpbGxlci5vbignc3RvcHBlZCcsIHRoaXMudW5kcmF3R3JpZCwgdGhpcyk7XG4gICAgICAgIHRoaXMuZHJpbGxlci5vbignc3RlcCcsIGZ1bmN0aW9uIChzdGF0ZSkge1xuICAgICAgICAgICAgaWYodGhpcy5jb25mLmFyZWFXaWR0aCA+IDAgJiYgdGhpcy5jb25mLmFyZWFMZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRQb3NpdGlvbihzdGF0ZS5jb29yZHMsIHN0YXRlLmRpcmVjdGlvbiwgc3RhdGUuZnJvbnRGb290KTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUNhcHRpb24odXRpbHMuY2FtZWxUb1NwYWNlZChzdGF0ZS5sYXN0U3RlcCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICB0aGlzLnByaW1lKCk7XG5cblxuICAgIH0sXG4gICAgcHJpbWU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYodGhpcy5jb25mLmFyZWFXaWR0aCA+IDAgJiYgdGhpcy5jb25mLmFyZWFMZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB0aGlzLnVuZHJhd0dyaWQoKTtcbiAgICAgICAgICAgIHRoaXMuZHJhd0NhcHRpb24oKTtcbiAgICAgICAgICAgIHRoaXMuZHJhd0dyaWQoKTtcbiAgICAgICAgICAgIHRoaXMuc2V0UG9zaXRpb24odGhpcy5kcmlsbGVyLmNvb3JkcywgdGhpcy5kcmlsbGVyLmxvbmdEaXJlY3Rpb24sICdjZW50ZXInKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgZHJhd0NhcHRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5jYXB0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDInKTtcbiAgICAgICAgdGhpcy5jYXB0aW9uLmlubmVySFRNTCA9ICcmbmJzcDsnO1xuICAgICAgICB0aGlzLmRvbU5vZGUuYXBwZW5kQ2hpbGQodGhpcy5jYXB0aW9uKTtcbiAgICB9LFxuICAgIHVwZGF0ZUNhcHRpb246IGZ1bmN0aW9uICh0ZXh0KSB7XG4gICAgICAgIHRoaXMuY2FwdGlvbi5pbm5lckhUTUwgPSB0ZXh0LmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgdGV4dC5zdWJzdHIoMSk7XG4gICAgfSxcbiAgICBkcmF3R3JpZDogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgdGFibGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0YWJsZScpLFxuICAgICAgICAgICAgcm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndHInKSxcbiAgICAgICAgICAgIGNlbGwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZCcpLFxuICAgICAgICAgICAgd2lkdGggPSB0aGlzLmNvbmYuYXJlYVdpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0ID0gdGhpcy5jb25mLmFyZWFMZW5ndGgsXG4gICAgICAgICAgICBpLFxuICAgICAgICAgICAgbmV3Um93LFxuICAgICAgICAgICAgbmV3Q2VsbDtcblxuICAgICAgICB3aGlsZShoZWlnaHQtLSkge1xuICAgICAgICAgICAgbmV3Um93ID0gcm93LmNsb25lTm9kZSgpO1xuICAgICAgICAgICAgdGFibGUuYXBwZW5kQ2hpbGQobmV3Um93KTtcbiAgICAgICAgICAgIGZvcihpPTA7aTx3aWR0aDtpKyspIHtcbiAgICAgICAgICAgICAgICBuZXdDZWxsID0gY2VsbC5jbG9uZU5vZGUoKTtcbiAgICAgICAgICAgICAgICBuZXdDZWxsLmlubmVySFRNTCA9IGRlZmF1bHRDZWxsSHRtbDtcbiAgICAgICAgICAgICAgICBuZXdSb3cuYXBwZW5kQ2hpbGQobmV3Q2VsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5kb21Ob2RlLmFwcGVuZENoaWxkKHRhYmxlKTtcbiAgICAgICAgdGhpcy5ncmlkID0gdGFibGU7XG4gICAgICAgIHRhYmxlLmNsYXNzTmFtZSA9ICdmbG9vcnNwYWNlJztcbiAgICB9LFxuICAgIHVuZHJhd0dyaWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5kb21Ob2RlLmlubmVySFRNTCA9ICcnO1xuICAgIH0sXG4gICAgc2V0UG9zaXRpb246IGZ1bmN0aW9uKGNvb3JkcywgZGlyZWN0aW9uLCBmcm9udEZvb3QpIHtcbiAgICAgICAgXG4gICAgICAgIGlmICh0aGlzLnBvc2l0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLnVuc2hvd1Bvc2l0aW9uKCk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGNlbGwgPSB0aGlzLmdyaWQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3RyJylbKHRoaXMuY29uZi5hcmVhTGVuZ3RoIC0gMSkgLSBjb29yZHNbMF1dXG4gICAgICAgICAgICAgICAgLmdldEVsZW1lbnRzQnlUYWdOYW1lKCd0ZCcpW2Nvb3Jkc1sxXV07XG5cbiAgICAgICAgY2VsbC5jbGFzc05hbWUgPSAnY3VycmVudCAnICsgZGlyZWN0aW9uLnRvTG93ZXJDYXNlKCkgKyAnICcgKyAoZnJvbnRGb290ICYmIGZyb250Rm9vdC50b0xvd2VyQ2FzZSgpKTtcbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IGNvb3JkcztcbiAgICAgICAgLy8gdXAgYXJyb3dcbiAgICAgICAgY2VsbC5pbm5lckhUTUwgPSAnJiM4NTkzOyc7XG4gICAgfSxcbiAgICB1bnNob3dQb3NpdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgY2VsbCA9IHRoaXMuZ3JpZC5nZXRFbGVtZW50c0J5VGFnTmFtZSgndHInKVsodGhpcy5jb25mLmFyZWFMZW5ndGggLSAxKSAtIHRoaXMucG9zaXRpb25bMF1dXG4gICAgICAgICAgICAgICAgLmdldEVsZW1lbnRzQnlUYWdOYW1lKCd0ZCcpW3RoaXMucG9zaXRpb25bMV1dO1xuICAgICAgICBjZWxsLmNsYXNzTmFtZSA9ICcnO1xuICAgICAgICBjZWxsLmlubmVySFRNTCA9IGRlZmF1bHRDZWxsSHRtbDtcbiAgICAgICAgXG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBWaXN1YWxpc2VyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG52YXIgU3RlcFNlbGVjdG9yID0gZnVuY3Rpb24gKGRyaWxsZXIsIGRvbU5vZGVJZCkge1xuICAgIHRoaXMuZHJpbGxlciA9IGRyaWxsZXI7XG4gICAgdGhpcy5kb21Ob2RlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZG9tTm9kZUlkKTtcbiAgICB0aGlzLmluaXQoKTtcbn07XG5cblN0ZXBTZWxlY3Rvci5wcm90b3R5cGUgPSB7XG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgaGVhZGluZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcbiAgICAgICAgaGVhZGluZy50ZXh0Q29udGVudCA9ICdDaG9vc2Ugd2hpY2ggc3RlcHMgdG8gaW5jbHVkZSBpbiB5b3VyIGRyaWxsJyxcbiAgICAgICAgdGhpcy5kb21Ob2RlLmFwcGVuZENoaWxkKGhlYWRpbmcpO1xuICAgICAgICB0aGlzLmNyZWF0ZUlucHV0cygpO1xuICAgIH0sXG4gICAgY3JlYXRlSW5wdXRzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBsYWJlbCxcbiAgICAgICAgICAgIGlucHV0O1xuICAgICAgICBmb3IgKHZhciBrZXkgaW4gdGhpcy5kcmlsbGVyLmNvbmYuc3RlcHMpIHtcbiAgICAgICAgICAgIGxhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKTtcbiAgICAgICAgICAgIGxhYmVsWydmb3InXSA9IGtleTtcbiAgICAgICAgICAgIGxhYmVsLnRleHRDb250ZW50ID0gdXRpbHMuY2FtZWxUb1NwYWNlZChrZXkpO1xuICAgICAgICAgICAgaW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuICAgICAgICAgICAgaW5wdXQuaWQgPSBrZXk7XG4gICAgICAgICAgICBpbnB1dC5uYW1lID0gJ3N0ZXBTZWxlY3Rvcic7XG4gICAgICAgICAgICBpbnB1dC50eXBlID0gJ2NoZWNrYm94JztcbiAgICAgICAgICAgIHRoaXMuZG9tTm9kZS5hcHBlbmRDaGlsZChpbnB1dCk7XG4gICAgICAgICAgICB0aGlzLmRvbU5vZGUuYXBwZW5kQ2hpbGQobGFiZWwpO1xuICAgICAgICAgICAgdGhpcy5iaW5kSW5wdXRUb0RyaWxsZXIoa2V5LCBpbnB1dCk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGJpbmRJbnB1dFRvRHJpbGxlcjogZnVuY3Rpb24gKHN0ZXAsIGlucHV0KSB7XG4gICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgaW5wdXQuY2hlY2tlZCA9IHRoaXMuZHJpbGxlci5jb25mLmRpc2FibGVkU3RlcHMuaW5kZXhPZihzdGVwKSA9PT0gLTE7XG4gICAgICAgIGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBzdGVwSW5kZXg7XG4gICAgICAgICAgICBpZiAoaW5wdXQuY2hlY2tlZCkge1xuICAgICAgICAgICAgICAgIHRoYXQuZHJpbGxlci5lbmFibGVTdGVwKHN0ZXApOyBcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhhdC5kcmlsbGVyLmRpc2FibGVTdGVwKHN0ZXApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN0ZXBTZWxlY3RvcjsiLCJ2YXIgcGlja1JhbmRvbVByb3BlcnR5ID0gZnVuY3Rpb24gKG9iaikge1xuICAgICAgICB2YXIgcmVzdWx0O1xuICAgICAgICB2YXIgY291bnQgPSAwO1xuICAgICAgICBmb3IgKHZhciBwcm9wIGluIG9iaikge1xuICAgICAgICAgICAgaWYgKE1hdGgucmFuZG9tKCkgPCAxIC8gKytjb3VudCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHByb3A7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgICAgICAgIFxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBkZWZpbmVQcm9wcyA9IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgdmFyIHByb3A7XG4gICAgICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgICAgICAgIHByb3AgPSBvYmpba2V5XTtcbiAgICAgICAgICAgIGlmIChwcm9wLl9wcm9wZXJ0eURlZmluaXRpb24pIHtcbiAgICAgICAgICAgICAgICBkZWxldGUgb2JqW2tleV07XG4gICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwga2V5LCBwcm9wKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb2JqO1xuICAgIH0sXG5cbiAgICBleHRlbmRPYmogPSBmdW5jdGlvbiAoYmFzZSkge1xuICAgICAgICB2YXIgZXh0ZW5kZXJzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSxcbiAgICAgICAgICAgIGV4dGVuZGVyO1xuXG4gICAgICAgIGlmICghZXh0ZW5kZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIGJhc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZXh0ZW5kZXJzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgIGV4dGVuZGVyID0gZXh0ZW5kZXJzLnBvcCgpO1xuICAgICAgICAgICAgYmFzZSA9IGV4dGVuZE9iai5hcHBseSh0aGlzLCBBcnJheS5wcm90b3R5cGUuY29uY2F0LmFwcGx5KFtiYXNlXSwgZXh0ZW5kZXJzKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBleHRlbmRlciA9IGV4dGVuZGVyc1swXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAodmFyIGtleSBpbiBleHRlbmRlcikge1xuICAgICAgICAgICAgYmFzZVtrZXldID0gZXh0ZW5kZXJba2V5XTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBiYXNlO1xuICAgIH0sXG4gICAgdG9DYW1lbCA9IGZ1bmN0aW9uICh0ZXh0KSB7XG4gICAgICAgIHJldHVybiB0ZXh0LnJlcGxhY2UoL1xcLVxcdy9nLCBmdW5jdGlvbiAoJDApIHtcbiAgICAgICAgICAgIHJldHVybiAkMC5jaGFyQXQoMSkudG9VcHBlckNhc2UoKTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICB0b0Rhc2hlZCA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgICAgICAgcmV0dXJuIHRleHQucmVwbGFjZSgvW15BLVpdW0EtWl0vZywgZnVuY3Rpb24gKCQwKSB7XG4gICAgICAgICAgICByZXR1cm4gJDAuY2hhckF0KDApICsgJy0nICsgJDAuY2hhckF0KDEpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgZGFzaGVkVG9TcGFjZWQgPSBmdW5jdGlvbiAodGV4dCkge1xuICAgICAgICByZXR1cm4gdGV4dC5yZXBsYWNlKC8tL2csICcgJyk7XG4gICAgfSxcbiAgICBjYW1lbFRvU3BhY2VkID0gZnVuY3Rpb24gKHRleHQpIHtcbiAgICAgICAgcmV0dXJuIGRhc2hlZFRvU3BhY2VkKHRvRGFzaGVkKHRleHQpKTtcbiAgICB9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBwaWNrUmFuZG9tUHJvcGVydHk6IHBpY2tSYW5kb21Qcm9wZXJ0eSxcbiAgICBkZWZpbmVQcm9wczogZGVmaW5lUHJvcHMsXG4gICAgZXh0ZW5kT2JqOiBleHRlbmRPYmosXG4gICAgdG9DYW1lbDogdG9DYW1lbCxcbiAgICB0b0Rhc2hlZDogdG9EYXNoZWQsXG4gICAgZGFzaGVkVG9TcGFjZWQ6IGRhc2hlZFRvU3BhY2VkLFxuICAgIGNhbWVsVG9TcGFjZWQ6IGNhbWVsVG9TcGFjZWRcbn07Il19
;