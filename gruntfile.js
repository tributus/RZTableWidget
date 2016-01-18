/**
 * Created by anderson.santos on 18/01/2016.
 */
module.exports = function (grunt) {
    grunt.initConfig({
            options: {
                srcFiles: [
                    "src/NamespaceDeclares.js",
                    "src/RuteZangada.js",
                    "src/WidgetEngine.js"
                ],
                test: {
                    getFilesToTest: function () {
                        return this.generateFileRefs('test/src/*.js', 'src');
                    },
                    getSpecs: function () {
                        return this.generateFileRefs('test/spec/*.spec.js', 'spec');
                    },
                    getLibs: function () {
                        var $this = this;
                        var libs = [
                            "lib/jquery-2.1.4.min.js"
                        ];
                        var output = '';
                        libs.forEach(function (it) {
                            output += $this.generateFileRefs(it, 'lib');
                        });
                        return output;
                    },
                    generateFileRefs: function (src, dest) {
                        var basestr = '<script type="text/javascript" src="#/*"></script>\n    ';
                        var jsDeclarations = '';
                        grunt.file.expand({}, src).forEach(function (path) {
                            var fileParts = path.split('/');
                            var fileName = fileParts[fileParts.length - 1];
                            jsDeclarations += basestr.replace("*", fileName).replace("#", dest);
                        });
                        return jsDeclarations;
                    }
                }
            },
            concat: {
                dist: {
                    src: ['<%= options.srcFiles %>'],
                    dest: "dist/RZClientEngine.js"
                }
            },
            uglify: {
                options: {
                    mangle: false
                },
                my_target: {
                    files: {
                        "dist/RZClientEngine.min.js": ['dist/RZClientEngine.js']
                    }
                }
            },
            copy: {
                test: {
                    src: 'dist/RZClientEngine.js',
                    dest: 'test/src/RZClientEngine.js'
                },
                test_template: {
                    options: {
                        processContent: function (content) {
                            return grunt.template.process(content);
                        }
                    },
                    src: 'test/template/SpecRunner.html.ejs',
                    dest: 'test/SpecRunner.html'
                }
            },
            jasmine: {
                src: 'test/src/*.js',
                options: {
                    specs: 'test/spec/*.spec.js',
                    helpers: 'test/specs/helpers/*.js',
                    vendor:['test/lib/*.js']
                }
            }
        }
    );
// Plugins do Grunt
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jasmine');


    grunt.registerTask('default', ['concat', 'uglify', 'copy:test', 'copy:test_template']);
    grunt.registerTask('test', ['jasmine']);

};