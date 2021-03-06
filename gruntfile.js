/**
 * Created by anderson.santos on 18/01/2016.
 */
module.exports = function (grunt) {
    grunt.initConfig({
            options: {
                srcFiles: [
                    //"src/NamespaceDeclares.js",
                    "src/InterfaceAndEvents.js",
                    "src/TableHelpers.js",
                    "src/RZTableWidget.Sorting.js",
                    "src/RZTableWidget.renderingHelpers.js",
                    "src/RZTableWidget.setupHelpers.js",
                    "src/RZTableWidget.runtimeHelpers.js",
                    "src/RZTableWidget.Internals.js",
                    "src/CellRenderers/*.js",
                    "src/RZTableWidget.js"
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
                            "lib/jquery-2.1.4.min.js",
                            "lib/jasmine-query.js",
                            "lib/RZClientEngine-0.0.1.min.js"
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
                    dest: "dist/rztablewidget.js"
                }
            },
            uglify: {
                options: {
                    mangle: false
                },
                js: {
                    files: {
                        "dist/rztablewidget.min.js": ['dist/rztablewidget.js']
                    }
                }
            },
            copy: {
                test: {
                    src: 'dist/RZTableWidget.js',
                    dest: 'test/src/RZTableWidget.js'
                },
                test_lib:{
                    cwd: 'lib',
                    src: '*.js',
                    dest: 'test/lib',
                    expand:true
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
            less:{
                dev:{
                    options:{
                        compress:false
                    },
                    files:{
                        'dist/rztablewidget.css':'src/theme/RZTableWidget.less'
                    }
                }
            },
            cssmin:{
                options: {
                    shorthandCompacting: false,
                    roundingPrecision: -1
                },
                target: {
                    files: {
                        'dist/rztablewidget.min.css': ['dist/rztablewidget.css']
                    }
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
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-cssmin');


    grunt.registerTask('default', ['concat','less','cssmin','uglify', 'copy:test','copy:test_lib', 'copy:test_template']);
    grunt.registerTask('test', ['jasmine']);

};