module.exports = function(grunt) {

  grunt.initConfig({
    uglify: {
      options: {
        preserveComments: "some"
          //banner: grunt.file.read('banner.txt') + '// @version: <%= buildversion %>'
          //mangle: false, beautify: true, compress: false
      },
      default: {
        src: ['src/puppet.js'],
        dest: 'puppet.min.js'
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
        files: ['package.json', 'bower.json', 'src/puppet.js', 'puppet.min.js'],
        commit: true,
        commitMessage: '%VERSION%',
        commitFiles: ['package.json', 'bower.json', 'src/puppet.js', 'puppet.min.js'],
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
};