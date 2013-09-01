define(function () {

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

    return {
        pickRandomProperty: pickRandomProperty,
        defineProps: defineProps,
        extendObj: extendObj,
        toCamel: toCamel,
        toDashed: toDashed,
        dashedToSpaced: dashedToSpaced,
        camelToSpaced: camelToSpaced
    };
});