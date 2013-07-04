module.exports = function (grunt) {
	var pkg =  grunt.file.readJSON('package.json');
	grunt.initConfig({
		pkg : grunt.file.readJSON('package.json'),
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			build: {
				src: 'src/jquery.l2box.js',
				dest: 'build/jquery.l2box.min.js'
			}
		},
		watch: {
			uglify: {
				files: ['src/*.js'],
				tasks: ['uglify']
			}
		}
	});

	var taskName;
	for(taskName in pkg.devDependencies) {
		if(taskName.substring(0, 6) == 'grunt-') {
			grunt.loadNpmTasks(taskName);
		}
	}

	grunt.registerTask('default', ['watch']);
	grunt.registerTask('js', ['uglify']);
};
