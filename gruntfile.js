// Gruntfile.js
module.exports = (grunt) => {
  // Load all grunt tasks matching the ['grunt-*', '@*/grunt-*'] patterns
  require("load-grunt-tasks")(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    dirs: {
      dest: "dest",
      css: "css",
      scss: "scss",
      js: "js",
    },

    // minify / uglify js
    uglify: {
      my_target: {
        files: {
          "<%= dirs.dest %>/jsmain.min.js": ["<%= dirs.js %>/libs/*.js"],
          // '<%= dirs.dest %>/jshome.min.js': [
          // 	'<%= dirs.dest %>/scripts/1.three.min.js',
          // 	'<%= dirs.dest %>/scripts/2.fabric.min.js',
          // 	'<%= dirs.dest %>/scripts/3.orbit-controls.js',
          // 	'<%= dirs.dest %>/scripts/4.config.js',
          // 	'<%= dirs.dest %>/scripts/5.app.js',
          // 	'<%= dirs.dest %>/scripts/6.shaders.js',
          // 	'<%= dirs.dest %>/scripts/7.index.js',
          // 	'<%= dirs.dest %>/scripts/8.grid.js',
          // 	'<%= dirs.dest %>/scripts/9.globe.js',
          // 	'<%= dirs.dest %>/scripts/10.points.js',
          // 	'<%= dirs.dest %>/scripts/11.utils.js'

          // ]
        },
      },
    },
    cssmin: {
      options: {
        keepSpecialComments: 0,
      },
      my_target: {
        files: [
          {
            "<%= dirs.dest %>/stylelibs.min.css": ["<%= dirs.css %>/**/*.css"],
          },
        ],
      },
    },
    sass: {
      dist: {
        options: {
          style: "compressed",
          sourcemap: false,
          // lineNumbers: true
        },
        files: {
          "<%= dirs.dest %>/style.min.css": "<%= dirs.scss %>/style.scss",
        },
      },
    },

    watch: {
      options: {
        livereload: true,
        spawn: false,
      },
      sass: {
        files: "<%= dirs.scss %>/**/**/*.scss",
        tasks: ["sass"],
      },
      // cssmin: {
      //     files: "<%= dirs.css %>/**/*.css",
      //     tasks: ['cssmin']
      // },
      // uglify: {
      //     files: ['<%= dirs.js %>/*.js'],
      //     tasks: ['uglify']
      // },
    },

    browserSync: {
      dev: {
        bsFiles: {
          src: [
            "<%= dirs.dest %>/style.min.css",
            "*.html",
            "<%= dirs.dest %>/*.js",
          ],
        },
        options: {
          watchTask: true,
          server: "./",
        },
      },
    },
  });

  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-contrib-cssmin");
  grunt.loadNpmTasks("grunt-contrib-sass");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-browser-sync");
  grunt.registerTask("default", ["browserSync", "watch"]);
};
