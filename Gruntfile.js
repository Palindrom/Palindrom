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
          'puppet.min.js': 'src/puppet.js',
          'puppet-dom.min.js': 'src/puppet-dom.js'
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
        files: ['package.json', 'src/puppet.js', 'src/puppet-dom.js'],
        commit: true,
        commitMessage: '%VERSION%',
        commitFiles: ['package.json', 'src/puppet.js', 'src/puppet-dom.js'],
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
