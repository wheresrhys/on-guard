/*global module:false*/

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    
    clean: {
      files: ['dist']
    },

    concat: {
      // options: {
      //   separator: ';',
      //   banner: '<%= banner %>',
      //   stripBanners: true
      // },
      dist: {
        src: ['src/<%= pkg.name %>.js'],
        dest: 'dist/jquery.<%= pkg.name %>.js'
      }
    },

    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: '<%= concat.dist.dest %>',
        dest: 'dist/jquery.<%= pkg.name %>.min.js'
      }
    },

    jshint: {
      files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
      options: {
        jshintrc: '.jshintrc'
      }
    }
    // watch: {
    //   files: '<config:lint.files>',
    //   tasks: 'lint qunit'
    // }
    //     watch: {
    //   gruntfile: {
    //     files: '<%= jshint.gruntfile.src %>',
    //     tasks: ['jshint:gruntfile']
    //   },
    //   src: {
    //     files: '<%= jshint.src.src %>',
    //     tasks: ['jshint:src', 'qunit']
    //   },
    //   test: {
    //     files: '<%= jshint.test.src %>',
    //     tasks: ['jshint:test', 'qunit']
    //   },
    // },
  });


  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  //grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  
  // Default task.
  grunt.registerTask('test', ['jshint', 'jasmine']);
  grunt.registerTask('build', ['clean', 'concat', 'uglify']);
  grunt.registerTask('default', ['test', 'build']);

};


// var fileSystem = require('fs'),
//     moduleList = require('./modules-list.js'),
//     getHelpers = function (env) {
//         return [
//             'lib/q.js',
//             'hcom-tools/jasmine-jq.js',
//             'hcom-tools/prerequesits.js',
//             'hcom-tools/hcom-test.js',
//             'hcom-tools/hcom-test.dependencies.js',
//             'hcom-tools/hcom-test.' + env + '.js',
//             'hcom-tools/hcom-test.suite.js',
//             'hcom-tools/customMatchers.js'
//         ];
//     },
//     vendor = {
//         desktop: [
//             '../lib/jquery-1.8.3.js'
//         ],
//         mobile: [
//             '../lib/mobile/zepto.js'
//         ]
//     }

// module.exports = function(grunt){

//     'use strict';

//     function getFileList(patterns) {
//         var files = [];
//         patterns.forEach(function (pattern) {

//             files = Array.prototype.concat.apply(files, grunt.file.expand( pattern ).map(function(file) { 
//                 return file.split('/').pop().replace(/(_test)?\.js/, '');
//             }));
//         })
//         return files;
//     }
//     function getSpecs (env) {
//         return [
//             'hcom-tools/toolsTests.js',
//             'specs/shared/**/*_test.js',
//             'specs/' + env + '/**/*_test.js'
//         ]
//     }

//     function getSrc (env) {
//         var src = Array.prototype.concat.apply(moduleList.shared.map(function (src) {
//                 return '../hcom/' + src;
//             }), moduleList[env].map(function (src) {
//                 return '../hcom/' + src;
//             }))

//         // if (env === 'desktop') {
//         //     src = src.concat('../hcom/common/**/*.js');
//         // }
//         return src;
//     }



//     function buildTestConfig (env, runnerOnly) {
//         var options = {
//             specs: getSpecs(env),
//             vendor: vendor[env],
//             helpers: getHelpers(env)
//         };

//         // Branch so that the specrunner html page doesn't contain the wrapped versions of the source files used by istanbul 
//         if (runnerOnly) {
//             options.keepRunner = true;
//             options.outfile = env + 'SpecRunner.html'
//         } else {
//             options.keepRunner = false;
//             options.template = require('grunt-template-jasmine-istanbul');
//             options.templateOptions = {
//                 coverage: 'coverage/coverage-desktop.json',
//                 report: {
//                     type: (grunt.option('target') === 'staging') ? 'cobertura': 'html',
//                     options: {
//                         dir: 'coverage/coverage-' + env
//                     }
//                 }
//             };
//         }
        
//         return {
//             src: getSrc(env),
//             options: options
//         }
//     }
    
//     var myLibsPattern = ['../hcom/**/*.js'];

//     /* Selective file linting */
//     // // Gets the earliest file creation date, so we can ignore linting on files not recently modified
//     // var filterSince = (function () {    

//     //     // on linux, at least, ctime is not retained after subsequent modifications,
//     //     // so find the date/time of the earliest-created file matching the filter pattern
//     //     var creationTimes = grunt.file.expand( myLibsPattern ).map(function(f) { 
//     //         return new Date(fileSystem.lstatSync(f).ctime).getTime() 
//     //     });

//     //     var earliestCreationTime = Math.min.apply(Math, creationTimes);
//     //     // hack: allow for 3 minutes to check out from repo
//     //     return (new Date(earliestCreationTime)).getTime() + (3 * 60 * 1000);

//     // })();
    
//     grunt.initConfig({
//         pkg: grunt.file.readJSON('package.json'),

//         jasmine: {
//             desktop: buildTestConfig('desktop'),
//             mobile: buildTestConfig('mobile'),
//             desktopRunner: buildTestConfig('desktop', true),
//             mobileRunner: buildTestConfig('mobile', true)
//         }
//         // jshint: {
//         //   sincecheckout: {
//         //     src: grunt.option('folder') ? ['../hcom/' + grunt.option('folder') + '/**/*.js']: myLibsPattern,
//         //     // filter based on whether it's newer than our repo creation time
//         //     filter: function(filepath) {
//         //       return (fileSystem.lstatSync(filepath).mtime > filterSince);
//         //     },
//         //   },
//         //   options: {
//         //         jshintrc: 'jshintrc'
//         //     }
//         // }

//     });




//     // grunt.registerTask('sLint', 'asdas', function () {

//     //     var pattern = grunt.option('folder') ? ['../hcom/' + grunt.option('folder') + '**/*.js']: myLibsPattern;

//     // })
//     grunt.registerTask('missingSpecs', 'Missing specs list', function (env, limit) {
//         var specs = getFileList(getSpecs(env)),
//             src = getFileList(getSrc(env)),
//             missingSpecs = [];

//         for (var file in src) {
//             if (specs.indexOf(src[file]) === -1) {
//                 missingSpecs.push(src[file]);
//             }
//         }
//         if (missingSpecs.length) {
//             console.log(
//                 '\n******************************************************************************************************\n' +
//                 '*** The following common js files aren\'t covered by any tests. They won\'t write themselves, y\'know ***\n' +
//                 '******************************************************************************************************\n'
//                 );
//             missingSpecs.sort(function () {
//                 return Math.random() - 0.5;
//             }).slice(0,limit).forEach(function (file) {
//                 console.log(file);
//             });
//         }

//     })
    
//     grunt.loadNpmTasks('grunt-contrib-jshint');
//     grunt.loadNpmTasks('grunt-contrib-jasmine');
//     // grunt.loadNpmTasks('grunt-contrib-uglify');

//     //grunt.registerTask('lint', ['jshint:sincecheckout']);
//     //grunt.registerTask('dev', ['jshint', 'jasmine']);
//     grunt.registerTask('desktop', ['jasmine:desktop', 'jasmine:desktopRunner:build', 'missingSpecs:desktop:10']);
//     grunt.registerTask('mobile', ['jasmine:mobile', 'jasmine:mobileRunner:build', 'missingSpecs:mobile:10']);
//     grunt.registerTask('buildRunners', ['jasmine:desktopRunner:build', 'jasmine:mobileRunner:build'])
//     grunt.registerTask('default', ['desktop', 'mobile']);

// };




