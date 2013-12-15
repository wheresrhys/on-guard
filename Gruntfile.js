/*global module:false,requirejs:false*/
module.exports = function(grunt) {
    'use strict';

    var allSrcs = ['./Gruntfile.js', './src/**/*.js', './test/**/*.js'];
    // Project configuration.
    grunt.initConfig({
        
        clean: {
            files: ['dist']
        },

        jshint: {
            options: grunt.file.readJSON('./.jshintrc'),
            lenient: allSrcs,
            strict: {
                files: {
                    src: allSrcs
                },
                options: {
                    unused: true,
                    maxparams: 3
                }
            }
        },

        jasmine: {
            run: {
                src: ['dist/bundle.src.js'],
                options: {
                    outfile: 'specRunner.html',
                    keepRunner: true,
                    specs: ['dist/bundle.test.js'],
                    helpers: ['test/helpers/**/*.js'],
                    template: require('grunt-template-jasmine-istanbul'),
                    templateOptions: {
                        coverage: 'reports/coverage.json',
                        report: [
                            {
                                type: 'html',
                                options: {
                                    dir: 'reports/coverage'
                                }
                            },
                            {
                                type: 'text-summary'
                            }
                        ]
                    }
                }
            }
        },
        watch: {
            sass: {
                files: ['styles/sass/**/*.scss'],
                tasks: 'sass:dev'
            },
            js: {
                files: ['src/**/*.js'],
                tasks: 'browserify:dev'
            }
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
        browserify: {
            prod: {
                options: {
                    debug: false
                },
                files: {
                    'dist/bundle.min.js': ['./src/main.js']
                }
            },
            dev: {
                options: {
                    debug: true
                },
                files: {
                    'dist/bundle.js': ['./src/main.js']
                }
            },
            src: {
                files: {
                    'dist/bundle.src.js': ['./src/**/*.js']
                },
                options: {
                    debug: true,
                    aliasMappings: {
                        src: ['./src/**/*.js']
                    }
                }
            },
            test: {
                options: {
                    debug: true,
                    external: ['../../../src/**/*.js', '../../src/**/*.js']
                },
                files: {
                    'dist/bundle.test.js': ['test/**/*.js']
                }
            }
        }
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
    grunt.loadNpmTasks('grunt-browserify');
    
    // Default task.
    grunt.registerTask('test', ['browserify:src', 'browserify:test', 'jshint:lenient', 'jasmine:run', 'cleanRunner']);
    grunt.registerTask('lint', ['jshint:strict']);
    grunt.registerTask('build', ['test', 'clean', 'sass:dist', 'requirejs:dist', 'htmlmin:dist', 'uglify:dist', 'miscBuildTasks']);

    grunt.registerTask('cleanRunner', function () {
        var fs = require('fs'),
            done = this.async();
        fs.readFile('specRunner.html', 'utf8', function (err, data) {
            if (err) {
                throw err;
            }
            fs.writeFile('specRunner.html', data.replace('src=\'./.grunt/grunt-contrib-jasmine/\'dist', './dist')
                .replace('\'.grunt/grunt-contrib-jasmine/grunt-template-jasmine-istanbul/reporter.js\',\'./.grunt/grunt-contrib-jasmine/reporter.js\'', ''), function (err) {
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
