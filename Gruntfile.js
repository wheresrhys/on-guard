/*global module:false,requirejs:false*/
module.exports = function(grunt) {
    'use strict';


    // Project configuration.
    grunt.initConfig({
        
        clean: {
            files: ['dist']
        },

        jshint: {
            options: grunt.file.readJSON('./.jshintrc'),
            lenient: ['Gruntfile.js', 'src/**/*.js', 'test/specs/**/*.js'],
            strict: {
                files: {
                    src: ['Gruntfile.js', 'src/**/*.js', 'test/specs/**/*.js']
                },
                options: {
                    unused: true,
                    maxparams: 3
                }
            }
        },

        jasmine: {
            run: {
                src: ['src/**/*.js', '!src/main.js', '!src/configs/**/*.js'],
                options: {
                    outfile: 'specRunner.html',
                    keepRunner: true,
                    specs: ['test/specs/**/*.js'],
                    helpers: ['test/helpers/**/*.js'],
                    template: require('grunt-template-jasmine-istanbul'),
                    templateOptions: {
                        coverage: 'test/coverage.json',
                        report: [
                            {
                                type: 'html',
                                options: {
                                    dir: 'test/coverage'
                                }
                            },
                            {
                                type: 'text-summary'
                            }
                        ],
                        // 1. don't replace src for the mixed-in template with instrumented sources
                        replace: false,
                        template: require('grunt-template-jasmine-requirejs'),
                        templateOptions: {
                            requireConfig: {
                                // 2. use the baseUrl you want
                                baseUrl: './src/',
                                paths: {
                                    domReady: '../lib/requirejs-domready/domReady'
                                },
                                // 3. pass paths of the sources being instrumented as a configuration option
                                //    these paths should be the same as the jasmine task's src
                                //    unfortunately, grunt.config.get() doesn't work because the config is just being evaluated
                                config: {
                                    instrumented: {
                                        src: grunt.file.expand(['src/**/*.js', 'lib/requirejs-domready/domReady.js'])
                                    }
                                },
                                // 4. use this callback to read the paths of the sources being instrumented and redirect requests to them appropriately
                                callback: function () {
                                    define('instrumented', ['module'], function (module) {
                                        return module.config().src;
                                    });
                                    require(['instrumented'], function (instrumented) {
                                        var oldLoad = requirejs.load;
                                        requirejs.load = function (context, moduleName, url) {
                                            // normalize paths
                                            if (url.substring(0, 1) === '/') {
                                                url = url.substring(1);
                                            } else if (url.substring(0, 2) === './') {
                                                url = url.substring(2);
                                            }
                                            // redirect
                                            if (instrumented.indexOf(url) > -1) {
                                                url = './.grunt/grunt-contrib-jasmine/' + url;
                                            }
                                            return oldLoad.apply(this, [context, moduleName, url]);
                                        };
                                    });
                                }
                            }
                        }
                    }
                }
            }
        },
        watch: {
            files: ['styles/sass/**/*.scss'],
            tasks: 'sass:dev'
        },
        sass: {
            dist: {
                options: {
                    style: 'compressed'
                },
                files: {
                    './dist/styles/css/main.css': './styles/sass/main.scss'
                }
            },
            dev: {
                options: {
                    style: 'expanded'
                },
                files: {
                    './styles/css/main.css': './styles/sass/main.scss'
                }
            }
        },
        requirejs: {
            dist: {
                options: {
                    baseUrl: './src',
                    name: 'main',
                    mainConfigFile: './src/main.js',
                    out: './dist/src/main.js'
                }
            }
        },
        htmlmin: {
            
            dist: {
                options: {                                 // Target options
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: {
                    './dist/index.html': './index.html'
                }
            }
        },
        uglify: {
            dist: {
                src: './lib/requirejs/require.js',
                dest: './dist/lib/requirejs/require.js'
            }
        },
    });


    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');


    
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-connect');
    
    // Default task.
    grunt.registerTask('test', ['jshint:lenient', 'jasmine:run', 'cleanRunner']);
    grunt.registerTask('lint', ['jshint:strict']);
    grunt.registerTask('build', ['test', 'clean', 'sass:dist', 'requirejs:dist', 'htmlmin:dist', 'uglify:dist', 'miscBuildTasks']);

    grunt.registerTask('cleanRunner', function () {
        var fs = require('fs'),
            done = this.async();
        fs.readFile('specRunner.html', 'utf8', function (err, data) {
            if (err) {
                throw err;
            }
            fs.writeFile('specRunner.html', data.replace('url = \'./.grunt/grunt-contrib-jasmine/\' + url;', '').replace('\'.grunt/grunt-contrib-jasmine/grunt-template-jasmine-istanbul/reporter.js\',\'./.grunt/grunt-contrib-jasmine/reporter.js\'', ''), function (err) {
                if (err) {
                    throw err;
                }
                done();
            });
        });
    });

    grunt.registerTask('miscBuildTasks', function () {
        // copy assets
        grunt.file.recurse('./assets', function (path) {
            if (path.indexOf('DS_Store') === -1) {
                grunt.file.copy(path, './dist/' + path);
            }
        });
    });
    // add to teh build process something that creates a spec file for modules not having one built already and then halts the build
    

};
