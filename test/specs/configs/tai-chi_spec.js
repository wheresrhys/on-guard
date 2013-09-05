/*global describe:false, jasmine:false, beforeEach:false, afterEach:false,runs:false,waits:false,expect:false,it:false,spyOn:false */
describe('configs/tai-chi', function () {
    var Driller = require('modules/driller'),
        taiChiConfig = require('configs/tai-chi'),
        driller;

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
        driller.adjustPosition('step');
        expect(driller.fire).toHaveBeenCalledWith('step', {
            direction: 'North',
            frontFoot: 'Right',
            lastStep: 'step',
            coords: [2, 1]
        });
    });

    it('should correctly define a back move', function () {
        driller.adjustPosition('back');
        expect(driller.fire).toHaveBeenCalledWith('step', {
            direction: 'North',
            frontFoot: 'Right',
            lastStep: 'back',
            coords: [0, 1]
        });
    });

    it('should correctly define a shift move', function () {
        driller.adjustPosition('shift');
        expect(driller.fire).toHaveBeenCalledWith('step', {
            direction: 'East',
            frontFoot: 'Right',
            lastStep: 'shift',
            coords: [1, 1]
        });
    });

    it('should correctly define a switch move', function () {
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
        driller.adjustPosition('outside');
        expect(driller.fire).toHaveBeenCalledWith('step', {
            direction: 'North',
            frontFoot: 'Right',
            lastStep: 'outside',
            coords: [1, 0]
        });
    });

    it('should correctly define a turn move', function () {
        driller.adjustPosition('turn');
        expect(driller.fire).toHaveBeenCalledWith('step', {
            direction: 'East',
            frontFoot: 'Left',
            lastStep: 'turn',
            coords: [1, 0]
        });
    });

    it('should correctly define a onGuard move', function () {
        driller.adjustPosition('onGuard');
        expect(driller.fire).toHaveBeenCalledWith('step', {
            direction: 'North',
            frontFoot: 'Left',
            lastStep: 'onGuard',
            coords: [1, 1]
        });
    });

    it('should correctly define a wuChi move', function () {
        driller.adjustPosition('wuChi');
        expect(driller.fire).toHaveBeenCalledWith('step', {
            direction: 'North',
            frontFoot: null,
            lastStep: 'wuChi',
            coords: [1, 1]
        });
    });

});