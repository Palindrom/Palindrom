module.exports = function(grunt) {

  grunt.initConfig({
    uglify: {
      options: {
        sourceMap: true,
        sourceMapName: 'puppet.min.js.map',
        sourceMapIncludeSources: true,
        preserveComments: "some"
        //banner: grunt.file.read('banner.txt') + '// @version: <%= buildversion %>'
        //mangle: false, beautify: true, compress: false
      },
      default: 
        {src: ['src/puppet.js'], dest: 'puppet.min.js'}
      
      
    },
  });    
grunt.loadNpmTasks('grunt-contrib-uglify');
};
