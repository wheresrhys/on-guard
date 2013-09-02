/*global describe:false, jasmine:false, beforeEach:false, afterEach:false,runs:false,waits:false,expect:false,it:false,spyOn:false */
describe('modules/driller', function () {
    
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
                    coords: driller.coords[0] + ':' + driller.coords[1]
                });
            });


        });

        describe('step selection' , function () {
            describe('bursts', function () {

            });
            describe('disabling and enabling steps', function () {

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

            it('should gradually speed up when specfied', function () {

            });

        });

    });

});