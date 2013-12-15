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
