module.exports = function(grunt) {

    // Подгружаем все таски
    require('load-grunt-tasks')(grunt);

    // Project configuration.
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        vars: {
            deploy_dir: '~/.tmp',
            production_ip: '5.200.37.60'
        },

        rsync: {
            options: {
                args: ["--verbose"],
                recursive: true,
                syncDest: true
            },
            deploy: {
                options: {
                    args: [
                        "--verbose",
                        "--exclude=node_modules/*",
                        "--exclude=.git*",
                        "--exclude=.idea/",
                        "--exclude=.tmp/",
                        "--exclude=.DS_Store"
                    ],
                    src: '.',
                    dest: '<%= vars.deploy_dir %>',
                    host: "<%= vars.production_ip %>",
                    syncDestIgnoreExcl: true
                }
            }
        },

        // Запуск скрипта разворачивания приложения
        shell: {

            // Запуск скрипта для инициализации приложения
            run_script: {
                command: "ssh www-data@<%= vars.production_ip %> 'bash <%= vars.deploy_dir %>/run_script.sh'",
                options: {
                    stdout: true,
                    stderr: true,
                    failOnError: true
                }
            }
        }
    });

    // Регистрируем задачу для deploy в production
    grunt.registerTask('deploy', [
        'rsync:deploy',
        'shell:run_script'
    ]);
};