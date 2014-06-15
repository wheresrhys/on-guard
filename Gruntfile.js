/*global global:true,module:false,requirejs:false*/
module.exports = function(grunt) {
    'use strict';

    var config = {},
        allSrcs = ['./Gruntfile.js', './src/**/*.js', './test/**/*.js'];

    grunt.loadNpmTasks('grunt-contrib-clean');
    config.clean = {
        files: ['dist', 'tmp']
    };

    grunt.loadNpmTasks('grunt-contrib-uglify');
    config.uglify = {
        dist: {
            src: './dist/bundle.js',
            dest: './dist/bundle.js'
        }
    };

    grunt.loadNpmTasks('grunt-contrib-jasmine');
    config.jasmine = {
        run: {
            src: ['tmp/bundle.src.js'],
            options: {
                outfile: 'specRunner.html',
                keepRunner: true,
                // helpers: ['test/helpers/**/*.js']
                template: require('grunt-template-jasmine-istanbul'),
                templateOptions: {
                    replace: false,
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
                },

                specs: ['tmp/bundle.test.js']//,
                //helpers: ['test/helpers/**/*.js']
            }
        }
    };

    grunt.loadNpmTasks('grunt-contrib-jshint');
    config.jshint = {
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
    };

    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    config.htmlmin = {
        dist: {
            options: {                                 // Target options
                removeComments: true,
                collapseWhitespace: true
            },
            files: {
                './dist/index.html': './index.html'
            }
        }
    };

    grunt.loadNpmTasks('grunt-contrib-watch');
    config.watch = {
        sass: {
            files: ['styles/sass/**/*.scss'],
            tasks: 'sass:dev'
        },
        js: {
            files: ['src/**/*.js'],
            tasks: 'browserify:dev'
        }
    };

    grunt.loadNpmTasks('grunt-contrib-sass');
    config.sass = {
        dist: {
            options: {
                style: 'compressed',
                bundleExec: true
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
    };

    grunt.loadNpmTasks('grunt-browserify');
    config.browserify = {
        prod: {
            options: {
                debug: false
            },
            files: {
                'dist/bundle.js': ['./src/main.js']
            }
        },
        dev: {
            options: {
                debug: true
            },
            files: {
                'bundle.js': ['./src/main.js']
            }
        },
        src: {
            files: {
                'dist/bundle.src.js': ['./src/**/*.js', '!./src/main.js']
            },
            options: {
                debug: false,
                aliasMappings: {
                    cwd: './src/',      // Src matches are relative to this path.
                    src: ['**/*.js'], // Actual pattern(s) to match.
                    dest: './theapp/'
                }
            }
        },
        instrumented: {
            files: {
                'tmp/bundle.src.js': ['./dist/instrument/src/**/*.js', '!./dist/instrument/src/main.js']
            },
            options: {
                debug: false,
                aliasMappings: {
                    cwd: './dist/instrument/src/',      // Src matches are relative to this path.
                    src: ['**/*.js'], // Actual pattern(s) to match.
                    dest: './theapp/'
                }
            }
        },
        test: {
            options: {
                debug: false,
                external: grunt.file.expand('src/**/*').map(function (item) {return item.replace(/\.js$/, '').replace('src/', 'theapp/');})
            },
            files: {
                'tmp/bundle.test.js': ['test/**/*.js']
            }
        }
    };

    grunt.loadNpmTasks('grunt-istanbul');
    config.instrument = {
        files: ['./src/**/*.js', '!./src/main.js'],
        options: {
            lazy: false,
            basePath: 'dist/instrument/'
        }
    };

    grunt.initConfig(config);

    grunt.registerTask('test', ['instrument', 'browserify:instrumented', 'browserify:src', 'browserify:test', 'jshint:lenient', 'jasmine:run', 'cleanRunner']);
    grunt.registerTask('lint', ['jshint:strict']);
    grunt.registerTask('build', ['test', 'clean', 'browserify:prod', 'sass:dist', 'htmlmin:dist', 'uglify:dist', 'miscBuildTasks']);

    grunt.registerTask('cleanRunner', function () {
        var fs = require('fs'),
            done = this.async();
        fs.readFile('specRunner.html', 'utf8', function (err, data) {
            if (err) {
                throw err;
            }
            fs.writeFile('specRunner.html', data
                .replace('src=".grunt/grunt-contrib-jasmine/dist', 'src="./dist')
                .replace('src="./tmp', 'src="./dist')
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

    grunt.registerTask('heroku', ['build']);
};
