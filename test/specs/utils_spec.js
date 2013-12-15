/*global describe:false, jasmine:false, beforeEach:false, afterEach:false,runs:false,waits:false,expect:false,it:false,spyOn:false */
describe('utils', function () {
    var utils = require('../../src/utils');

    describe('pickRandomProperty', function () {
        it('should return undefined when passed an empty object', function () {
            expect(utils.pickRandomProperty({})).toBeUndefined();
        });
        it('should pick a random property', function () {
           // how to test?
        });
    });

    describe('extendObj', function () {
        var extendObj = utils.extendObj;

        it('should return the original object when no extenders specified', function () {
            var obj = {
                prop: 'test'
            };
            var testObj = extendObj(obj);
            expect(testObj).toBe(obj);
            expect(testObj).toEqual({
                prop: 'test'
            });

        });

        it('should overwrite with props from extending object hierarchically', function () {
            var obj1 = {
                    prop1: 11,
                    prop2: 21,
                    prop3: 31,
                    prop4: 41
                },
                obj2 = {
                    prop2: 22,
                    prop3: 32,
                    prop4: 42
                },
                obj3 = {
                    prop3: 33,
                    prop4: 43
                },
                obj4 = {
                    prop4: 44
                };

            var testObj = extendObj(obj1, obj2, obj3, obj4);
            expect(testObj).toBe(obj1);
            expect(testObj).toEqual({
                prop1: 11,
                prop2: 22,
                prop3: 33,
                prop4: 44
            });

        });

        it('should not alter any of the original objects except the base object', function () {
            var obj1 = {
                    prop1: 11,
                    prop2: 21,
                    prop3: 31,
                    prop4: 41
                },
                obj2 = {
                    prop2: 22,
                    prop3: 32,
                    prop4: 42
                },
                obj3 = {
                    prop3: 33,
                    prop4: 43
                },
                obj4 = {
                    prop4: 44
                };

            extendObj(obj1, obj2, obj3, obj4);

            expect(obj2).toEqual({
                prop2: 22,
                prop3: 32,
                prop4: 42
            });
            expect(obj3).toEqual({
                prop3: 33,
                prop4: 43
            });
            expect(obj4).toEqual({
                prop4: 44
            });

        });

    });

    describe('toCamel', function () {
        it('should change dashes in string to camel-casing', function () {
            expect(utils.toCamel('ab-cd-_$%-ef')).toEqual('abCd_$%Ef');
        });
    });

    describe('toDashed', function () {
        it('should change caps in string to dashes', function () {
            expect(utils.toDashed('abCd_$%Ef')).toEqual('ab-cd_$%-ef');
        });
    });

    describe('dashedToSpaced', function () {
        it('should change dashes in string to spaces', function () {
            expect(utils.dashedToSpaced('ab-cd-_$%-ef')).toEqual('ab cd _$% ef');
        });
    });

    describe('camelToSpaced', function () {
        it('should change caps in string to spaces', function () {
            expect(utils.camelToSpaced('abCd_$%Ef')).toEqual('ab cd_$% ef');
        });
    });

});