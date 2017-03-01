module.exports = function(grunt) {

  grunt.initConfig({
    uglify: {
      options: {
        preserveComments: "some"
          //banner: grunt.file.read('banner.txt') + '// @version: <%= buildversion %>'
          //mangle: false, beautify: true, compress: false
      },
      default: {
        files: {
          'palindrom.min.js': 'src/palindrom.js',
          'palindrom-dom.min.js': 'src/palindrom-dom.js'
        }
      }


    },
    watch: {
      all: {
        options: {
          livereload: true
        },
        files: [
          '*.html',
          '**/*.js',
          '**/*.html',
          'examples/**/*.html'
        ],
      },
    },
    bump: {
      options: {
        files: ['package.json', 'src/palindrom.js', 'src/palindrom-dom.js', 'palindrom-dom.min.js', 'palindrom.min.js'],
        commit: true,
        commitMessage: '%VERSION%',
        commitFiles: ['package.json', 'src/palindrom.js', 'src/palindrom-dom.js', 'palindrom-dom.min.js', 'palindrom.min.js'],
        createTag: true,
        tagName: '%VERSION%',
        tagMessage: 'Version %VERSION%',
        push: false,
        // pushTo: 'origin',
        globalReplace: false,
        prereleaseName: false,
        regExp: false
      }
    },

  });
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-bump');

  grunt.registerTask('release', "Uglify and bump", function(target) {
    grunt.task.run('uglify', target ? 'bump:' + target : 'bump');
  });
};
