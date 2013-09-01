describe('utils', function () {
    var utils = require('utils');

    describe('pickRandomProperty', function () {
        it('should return undefined when passed an empty object', function () {
            expect(utils.pickRandomProperty({})).toBeUndefined();
        });
        it('should pick a random property', function () {
           // how to test?
        })
    });
    
})