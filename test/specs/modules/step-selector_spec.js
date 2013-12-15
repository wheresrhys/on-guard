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