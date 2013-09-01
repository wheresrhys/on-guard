/*global describe:false, jasmine:false, beforeEach:false, afterEach:false,runs:false,waits:false,expect:false,it:false,spyOn:false */
describe('driller', function () {
    
    var Driller = require('modules/driller'),
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
                rotateRight: {
                    frontFoot: 0,
                    move: [0, 0],
                    direction: 1
                },
                rotateLeft: {
                    frontFoot: 0,
                    move: [0, 0],
                    direction: -1
                },
                back: {
                    frontFoot: 1,
                    move: [-1, 0],
                    direction: 0 
                },
                side1: {
                    frontFoot: 0,
                    move: [0, 1],
                    direction: 0 
                },
                side2: {
                    frontFoot: 0,
                    move: [0, -1],
                    direction: 0 
                },
                // rotateRight: {
                //     frontFoot: 1,
                //     move: [-1, 0],
                //     direction: 0
                // },
                // rotateLeft: {
                //     frontFoot: 0,
                //     move: [-1, 0],
                //     direction: 0
                // },
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
                },
                // shift: {
                //     frontFoot: 1,
                //     move: [0, 0],
                //     direction: -1 // indicates turning away from front foot
                // },
                // 'switch': {
                //     frontFoot: 1,
                //     move: [0, 0],
                //     direction: 0
                // },
                // inside: {
                //     frontFoot: 0,
                //     move: [0, 1],
                //     direction: 0
                // },
                // outside: {
                //     frontFoot: 0,
                //     move: [0, -1],
                //     direction: 0
                // },
                // onGuard: {
                //     _propertyDefinition: true,
                //     enumerable: false,
                //     value: {
                //         frontFoot: 'Left',
                //         move: [0, 0],
                //         direction: 0
                //     }
                // },
                // wuChi: {
                //     _propertyDefinition: true,
                //     enumerable: false,
                //     value: {
                //         frontFoot: false,
                //         move: [0, 0],
                //         direction: 0
                //     }
                // }
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
                spyOn(window, 'setTimeout').andCallFake(function (callback, delay) {
                    callback();
                });
            });

            afterEach(function () {
                driller.stop();
            });
            
            it('should allow resetting to initial position', function () {
                spyOn(driller, 'init').andCallThrough();
                driller.direction = 'test';
                driller.conf.startSequence = ['noChange'];
                driller.start(true);
                expect(driller.init).toHaveBeenCalled();
                expect(driller.direction).toBe(0);
            });

            it('should fire the start event', function () {
                var started = false;
                driller.on('started', function () {
                    started = true;
                });
                driller.start();
                expect(started).toBeTruthy();
            });

            it('should leave the start sequence in conf unchanged', function () {
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
                    driller.start();
                    expect(steps).toEqual(['noChange', 'step', 'specialStep1']);
                });

                it('should continue with more steps after starting sequence completed', function () {
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
                    driller.conf.startSequence = ['notAStep'];
                    expect(function () {
                        driller.start();
                    }).toThrow();
                });

                it('shouldn\'t allow invalid subsequent step names', function () {
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
                    startSequence: ['noChange']
                });

            });

            it('should move forwards and backwards relative to the given direction', function () {
                driller.direction = 0;
                driller.adjustPosition('step');
                expect(driller.coords).toEqual([1,0]);
                driller.direction = 1;
                driller.adjustPosition('step');
                expect(driller.coords).toEqual([1,1]);
                driller.direction = 2;
                driller.adjustPosition('step');
                expect(driller.coords).toEqual([0, 1]);
                driller.direction = 3;
                driller.adjustPosition('step');
                expect(driller.coords).toEqual([0,0]);

                driller.direction = 0;
                driller.adjustPosition('back');
                expect(driller.coords).toEqual([-1,0]);
                driller.direction = 1;
                driller.adjustPosition('back');
                expect(driller.coords).toEqual([-1,-1]);
                driller.direction = 2;
                driller.adjustPosition('back');
                expect(driller.coords).toEqual([0, -1]);
                driller.direction = 3;
                driller.adjustPosition('back');
                expect(driller.coords).toEqual([0,0]);

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
                driller.adjustPosition('rotateRight');
                expect(driller.direction).toEqual(1);
                driller.frontFoot = 'Right';
                driller.adjustPosition('rotateRight');
                expect(driller.direction).toEqual(0);
                driller.adjustPosition('rotateLeft');
                expect(driller.direction).toEqual(1);
                driller.frontFoot = 'Left';
                driller.adjustPosition('rotateLeft');
                expect(driller.direction).toEqual(0);
            });

            it('should choose move sideways based on frontFoot and current direction', function () {
                driller.frontFoot = 'Left';
                driller.adjustPosition('side1');
                expect(driller.coords).toEqual([0,1]);
                driller.frontFoot = 'Right';
                driller.adjustPosition('side1');
                expect(driller.coords).toEqual([0,0]);
                 
                driller.frontFoot = 'Left';
                driller.adjustPosition('side2');
                expect(driller.coords).toEqual([0,-1]);
                driller.frontFoot = 'Right';
                driller.adjustPosition('side2');
                expect(driller.coords).toEqual([0,0]);

                driller.direction = 1;
                driller.frontFoot = 'Left';
                driller.adjustPosition('side2');
                expect(driller.coords).toEqual([1,0]);
            });

        });

        describe('step selection' , function () {
            describe('disabling and enabling steps', function () {

            });
        });
        

    });
});