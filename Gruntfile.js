module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);
    
    grunt.initConfig({
        mustache: {
            main: {
                src: './*.mustache',
                dest: 'dist/template.js',
                options: {
                    prefix: 'export default ',
                    postfix: ';'
                }
            }
        },

        browserify: { // полученные require оборачивает чтобы работало в браузере
            main: {
                options: {
                   transform: [['babelify', { presets: ['es2015'] }]] //babelify кроме прочего преобразует import в require
                },
                files: {
                    './dist/index.js': ['index.js']
                }
            }
        }

    });

    grunt.registerTask('default', ['mustache', 'browserify']);  //чтобы можно было запускать просто grunt
};