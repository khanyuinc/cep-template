module.exports = function(grunt) {
  var pkg = grunt.file.readJSON('package.json');

  var EXTENSION_NAME = 'com.yourcompany.ext1';
  var AE_EXTENSION_ROOT = '/Library/Application Support/Adobe/CEP/extensions/';
  var LOCAL_DEPLOY_ROOT = AE_EXTENSION_ROOT + EXTENSION_NAME;

  var SOURCE_ROOT = 'src/';
  var BUILD_ROOT = 'build/';
  var EXTENSION_BUILD_ROOT = BUILD_ROOT + 'extension/';
  var SIGN_BIN = BUILD_ROOT + 'bin/'

  // Project configuration.
  grunt.initConfig({
    pkg : pkg,

    clean : {
        options: { force: true },
        prebuild: {
            src: [ BUILD_ROOT ]
        },
        postbuild: {
            src: [ /*EXTENSION_BUILD_ROOT + '*.js'*/ ]
        },
        predeploy: {
            src: [ LOCAL_DEPLOY_ROOT ]
        },
        postdeploy: {
            src: [ ]
        },
        preinstaller: {
          src : [ SIGN_BIN ]
        },
        postinstaller: {
          src : [ SIGN_BIN ]
        }
    },

    copy : {
      common: {
        expand : true, cwd : SOURCE_ROOT, 
        src: ['index.html', 'CSXS/*.xml'], 
        dest: EXTENSION_BUILD_ROOT 
      },
      debug : {
        expand : true, cwd : SOURCE_ROOT, 
        src:['.debug', 'js/**/*.js', 'jscommon/**/*.js', 'jsx/**', 'css/**'], 
        dest: EXTENSION_BUILD_ROOT 
      },
      deploy_local : { 
        expand : true, cwd : EXTENSION_BUILD_ROOT, 
        src : ['**'], 
        dest : LOCAL_DEPLOY_ROOT
      },
      installer_binaries : {
        options : { mode : true },
        files : [
          { expand : true, cwd : 'bin', src : [ 'installer.pmdoc/**/*' ], dest : BUILD_ROOT },
          { expand : true, src : [ 'bin/*', '!bin/*.app'], dest : SIGN_BIN, flatten : true },
        ]
      }
    },

    filearray : {
      options : { on : 'window', variable : 'DYNAMIC_LOAD', prefix : EXTENSION_BUILD_ROOT, },
      debug : { 
        src : [ EXTENSION_BUILD_ROOT + 'jscommon/**/*.js', EXTENSION_BUILD_ROOT + 'jsx/**/*.jsx', '!' + EXTENSION_BUILD_ROOT + 'jsx/**/main.jsx' ], 
        dest : EXTENSION_BUILD_ROOT + 'js/dynamicload.js'
      }
    },

    concat_in_order : {
      release : {
        files : [
          { 
            src : [SOURCE_ROOT + 'js/lib/*.js', SOURCE_ROOT + 'jscommon/*.js', SOURCE_ROOT + 'js/*.js'], 
            dest : EXTENSION_BUILD_ROOT + 'main.js' 
          },
          { 
            src : [SOURCE_ROOT + 'css/*.css'], 
            dest : EXTENSION_BUILD_ROOT + 'css/main.css'
          },
          { 
            src : [SOURCE_ROOT + 'jscommon/**/*.js', SOURCE_ROOT + 'jsx/**/*.jsx'], 
            dest : EXTENSION_BUILD_ROOT + 'jsx/main.jsx' 
          }
        ]
      }
    },

    uglify  : {
      options: { mangle : false, beautify : true, banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n' },
      release : { src:  EXTENSION_BUILD_ROOT + 'main.js', dest: EXTENSION_BUILD_ROOT + 'js/main.min.js' },
    },

    tags : {
      common : { 
        src : [ EXTENSION_BUILD_ROOT + 'jscommon/**/*.js', EXTENSION_BUILD_ROOT + 'js/**/*.js', '!' + EXTENSION_BUILD_ROOT + 'js/templates/**', EXTENSION_BUILD_ROOT + 'css/**/*.css' ], 
        dest : EXTENSION_BUILD_ROOT + 'index.html' 
      }
    },

    processhtml : {
      debug : { src : [ EXTENSION_BUILD_ROOT + 'index.html' ], dest : EXTENSION_BUILD_ROOT + 'index.html' },
      release : { src : [ EXTENSION_BUILD_ROOT + 'index.html' ], dest : EXTENSION_BUILD_ROOT + 'index.html' },
    },

    htmlmin : {
      options : { removeComments: true, collapseWhitespace : true },
      release : { src : EXTENSION_BUILD_ROOT + 'index.html', dest : EXTENSION_BUILD_ROOT + 'index.html' },
    },

    exec : {
      makecert : { cwd : SIGN_BIN, cmd : 'sh makecert.sh' },
      makezxp : { cwd : SIGN_BIN, cmd : 'sh makezxp.sh' },
      unzip_zxp : { cwd : SIGN_BIN, cmd : 'unzip ../extension.zxp -d ../extension.signed'}
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-concat-in-order');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-script-link-tags');
  grunt.loadNpmTasks('grunt-processhtml');
  grunt.loadNpmTasks('grunt-exec');


  grunt.registerMultiTask('filearray', 'Converts a list of files to a JS array', function() {
    var opt = this.options({
      prefix : '',
      on : 'var',
      variable : 'files'
    });

    this.files.forEach(function(file) {
      var arr = [];

      if (opt.on == 'window')
        arr.push('window["' + opt.variable + '"] = ');
      else
        arr.push('var ' + opt.variable + ' = ');

      var files = [];
      var destFile;

      file.src.forEach(function(path)
      {
        files.push(path.substr(opt.prefix.length));
        destFile = file.dest;
      });

      arr.push(JSON.stringify(files));
      arr.push(';');

      grunt.file.write(destFile, arr.join(''));
      grunt.log.writeln('File "' + destFile + '" created.');
    });
  }); 

 grunt.registerTask('build:debug', [
    'clean:prebuild', 
    'copy:common', 
    'copy:debug', 
    'filearray:debug',
    'tags:common', 
    'processhtml:debug', 
    'clean:postbuild' 
  ]);

  grunt.registerTask('build:release', [
    'clean:prebuild', 
    'copy:common', 
    'concat_in_order:release', 
    'uglify:release', 
    'tags:common', 
    'processhtml:release', 
    'htmlmin:release',
    'clean:postbuild'
  ]);

  grunt.registerTask('deploy:local', [
    'clean:predeploy',
    'copy:deploy_local', 
    'clean:postdeploy'
  ]);

  grunt.registerTask('create:installer', [
    'clean:preinstaller', 
    'copy:installer_binaries', 
    'exec:makecert', 
    'exec:makezxp', 
    'exec:unzip_zxp', 
    'clean:postinstaller' 
  ]);

  grunt.registerTask('debug', ['build:debug', 'deploy:local', 'create:installer']);
  grunt.registerTask('release', ['build:release', 'deploy:local', 'create:installer']);

  grunt.registerTask('default', ['debug']);
};
