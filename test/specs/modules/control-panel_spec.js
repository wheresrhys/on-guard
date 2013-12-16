/*global TestHelpers:false, describe:false, jasmine:false, beforeEach:false, afterEach:false,runs:false,waits:false,expect:false,it:false,spyOn:false */
describe('modules/control-panel', function () {
    var ControlPanel = require('theapp/modules/control-panel'),
        eventEmitter = require('theapp/mixins/event-emitter'),
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