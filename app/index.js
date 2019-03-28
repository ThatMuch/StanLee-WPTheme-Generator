var Generator = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var _ = require('lodash');
var fs = require('fs');
var del = require('del');
var download = require('download');
var downloadStatus = require('download-status');
var walk = require('walk');
var path = require('path');

module.exports = class extends Generator {
  prompting() {
      this.log(yosay(
        '(test gulp insert) With great power comes great ' + chalk.red('theme generator!')
      ));

      return this.prompt(
        [
          {
            type: 'input',
            name: 'proxy',
            message: 'Localhost address',
            default: 'localhost'
          },
					{
						type: 'input',
						name: 'domain',
						message: 'If you want to add a domain site',
						default: ''
				},
          {
            type: 'input',
            name: 'themename',
            message: 'Theme Name',
            default: 'Theme Name'
          },
          {
            type: 'input',
            name: 'themeSlug',
            message: 'Theme Slug',
            default: 'Theme Slug'
          },
          {
            type: 'input',
            name: 'themeuri',
            message: 'Theme URI',
            default: 'https://thatmuch.fr'
          },
          {
            type: 'input',
            name: 'author',
            message: 'Author',
            default: 'ThatMuch'
          },
          {
            type: 'input',
            name: 'authoruri',
            message: 'Author URI',
            default: 'https://thatmuch.fr'
          },
          {
            type: 'input',
            name: 'authoremail',
            message: 'Author Email',
            default: 'social@thatmuch.fr'
          },
          {
            type: 'input',
            name: 'description',
            message: 'Description',
            default: 'Description'
          },
          {
            type: 'input',
            name: 'bugreport',
            message: 'Bug Report',
            default: 'https://example.com/bugreport/'
          },
          {
            type: 'confirm',
            name: 'gitignore',
            message: 'Would you like to add a ' + chalk.white('.gitignore') + ' file?',
            default: true
          },
          {
            type: 'confirm',
            name: 'editorconfig',
            message: 'Would you like to add a ' + chalk.white('.editorconfig') + ' file?',
            default: true
          },
					{
						type: 'confirm',
						name: 'stylelintrc',
						message: 'Would you like to add a ' + chalk.white('.stylelintrc') + ' file?',
						default: true
				},
          {
            type: 'confirm',
            name: 'gulpsetup',
            message: 'Would you like to setup a Gulp configuration ready to use?',
            default: true
          }
      ]
    ).then((answers) => {
              this.proxy = answers.proxy;
              this.domain = answers.domain;
              this.themeName = answers.themeName;
              this.themeSlug = answers.themeSlug;
              this.themeURI = answers.themeURI;
              this.author = answers.author;
              this.authorURI = answers.authorURI;
              this.authorEmail = answers.authorEmail;
              this.description = answers.description;
              this.bugreport = answers.bugreport;
              this.gitignore = answers.gitignore;
              this.stylelintrc = answers.stylelintrc;
              this.gulpsetup = answers.gulpsetup;
      });
  }

  writing() {
// Download Stanlee theme
    var done = this.async();
		var dir = this.destinationRoot();
    var unusedFiles = ['.travis.yml', 'codesniffer.ruleset.xml', 'README.md'];

      this.log(chalk.yellow('\nLet\'s grab the latest version of Stanlee...'));

        Promise.all([
          'github.com/ThatMuch/stanLee-wordpress/archive/master.tar.gz'
        ].map(x => download(x, '.', {
    extract: true,
    strip: 1
  }))).then(() => {
    this.log(chalk.blue('End download!'));
  }).then(() => {
    // Delete unused files
    this.log(chalk.yellow('\nDeleting some unused files...'));

    unusedFiles = _.map(unusedFiles, function (file) {
      return dir + '/' + file;
    });

    del(unusedFiles).catch(function (error) {
        done(error);
      })
      .then(paths => {
        this.log(chalk.cyan(paths.join('\n')));
        done();
      });
    this.log(chalk.blue('Done!'));
  }).then(() => {
    // Parsing theme files
    var _this = this;
    var walker;
    var options;
    options = {
      followLinks: false
    };
    this.log(chalk.yellow('\nParsing theme files...'));

    walker = walk.walk('.');

    this.log(chalk.white('Please wait...'));

    walker.on("file", function (root, fileStats, next) {
      var filePath = root + '/' + fileStats.name;

      if (path.extname(fileStats.name) == '.php' || path.extname(fileStats.name) == '.scss') {
        fs.readFile(filePath, 'utf8', function (err, data) {
          if (err) {
            done(error);
          }

          var result;

          result = data.replace(/'_s'/g, "'" + _this.themeSlug + "'");
          result = data.replace(/'_a'/g, "'" + _this.author + "'");
          result = result.replace(/_s_/g, _this.themeSlug + "_");
          result = result.replace(/ _s/g, ' ' + _this.themeName);
          result = result.replace(/ _a/g, ' ' + _this.author);
          result = result.replace(/_s-/g, _this.themeSlug + '-');


          fs.writeFile(filePath, result, 'utf8', function (err) {
            if (err) {
              done(error);
            }
          });

          next();
        });
      } else if (path.extname(fileStats.name) == '.css' || fileStats.name == 'style.scss' || fileStats.name == 'woocommerce.scss' || fileStats.name == 'theme.scss') {
        fs.readFile(filePath, 'utf8', function (err, data) {
          if (err) {
            done(error);
          }

          var result;

          result = data.replace(/(Theme Name: )(.+)/g, '$1' + _this.themeName);
          result = result.replace(/(Theme URI: )(.+)/g, '$1' + _this.themeURI);
          result = result.replace(/(Author: )(.+)/g, '$1' + _this.author);
          result = result.replace(/(Author URI: )(.+)/g, '$1' + _this.authorURI);
          result = result.replace(/(Description: )(.+)/g, '$1' + _this.description);
          result = result.replace(/(Text Domain: )(.+)/g, '$1' + _this.themeSlug);
          result = result.replace(/_s is based on Underscores/g, _this.themeName + ' is based on Underscores');
          fs.writeFile(filePath, result, 'utf8', function (err) {
            if (err) {
              done(error);
            }
          });

          next();
        });
      } else if (fileStats.name === 'readme.txt') {
        fs.readFile(filePath, 'utf8', function (err, data) {
          if (err) {
            done(error);
          }

          var result;

          result = data.replace(/=== _s ===/g, '=== ' + _this.themeName + ' ===');
          result = result.replace(/A starter theme called _s, or underscores./g, _this.description);
          result = result.replace(/(== Description ==\n\n)(.+)/g, '$1' + 'Long description here');
          result = result.replace(/== Frequently Asked Questions ==[\s\S]*?== Credits ==/g, '== Credits ==');

          fs.writeFile(filePath, result, 'utf8', function (err) {
            if (err) {
              done(error);
            }
          });

          next();
        });
      } else if (fileStats.name === '_s.pot') {
        fs.readFile(filePath, 'utf8', function (err, data) {
          if (err) {
            done(error);
          }

          var result;

          result = data.replace(/Copyright (C) 2018 ThatMuch/g, 'Copyright (C) 2018 ' + _this.author);
          result = result.replace(/Project-Id-Version: _s/g, 'Project-Id-Version: ' + _this.themeName);
          result = result.replace(/Report-Msgid-Bugs-To: https:\/\/wordpress.org\/tags\/_s/g, 'Report-Msgid-Bugs-To: ' + _this.bugreport);
          result = result.replace(/Language-Team: LANGUAGE <LL@li\.org>/g, 'Language-Team: ' + _this.author + '<' + _this.authorEmail + '>');
          result = result.replace(/@ _s/g, '@ ' + _this.themeSlug);

          fs.writeFile(filePath, result, 'utf8', function (err) {
            if (err) {
              done(error);
            }
          });

          fs.rename(filePath, './languages/' + _this.themeSlug + '.pot');

          next();
        });
      } else {
        next();
      }
    });

    walker.on("error", function (root, nodeStatsArray, next) {
      done(error);
      next();
    });

    walker.on("end", function () {
      done();
    });

    this.log(chalk.blue('Parsing done!'));
  });

  this.log(chalk.yellow('\nCopying configuration files...'));
		if (this.gitignore) {
			this.fs.copy(
				this.templatePath('_gitignore'),
				this.destinationPath('.gitignore')
			);
		}
		if (this.editorconfig) {
			this.fs.copy(
				this.templatePath('_editorconfig'),
				this.destinationPath('.editorconfig')
			);
		}

		if (this.stylelintrc) {
			this.fs.copy(
				this.templatePath('_stylelintrc'),
				this.destinationPath('.stylelintrc')
			);
		}
		if (this.gulpsetup) {
			this.fs.copyTpl(
				this.templatePath('_package.json'),
				this.destinationPath('package.json'), {
					package_name: this.themeSlug,
					package_description: this.description,
					package_author: this.author,
					proxy_address: this.proxy,
					proxy_domain: this.domain,
					theme_name: this.themeName,
					theme_domain: this.themeSlug,
					theme_bugreport: this.bugreport,
					author_uri: this.authorURI,
					author_email: this.authorEmail
				}
			);

			this.fs.copyTpl(
				this.templatePath('_gulpfile.js'),
				this.destinationPath('gulpfile.js'), {
          theme_domain: this.themeSlug,
          proxy_address: this.proxy,
          package_name: this.themeSlug,
          theme_bugreport: this.bugreport,
          author_email: this.authorEmail,
          author: this.author
				}
			);
  }
  this.log(chalk.blue('Done!'));
}
writing() {
  const pkgJson = {
    devDependencies: {
      gulp: '^3.9.1'
    }
  };

  // Extend or create package.json file in destination path
  this.fs.extendJSON(this.destinationPath('package.json'), pkgJson);
}

  install() {
      if (this.gulpsetup) {
        this.log(chalk.yellow('\nInstalling required packages...'));

        this.npmInstall(['gulp-concat'], { 'saveDev': true });
        this.npmInstall(['gulp-rename'], { 'saveDev': true });
        this.npmInstall(['gulp-order'], { 'saveDev': true });
        this.npmInstall(['browser-sync'], { 'saveDev': true });
        this.npmInstall(['gulp-sass'], { 'saveDev': true });
        this.npmInstall(['gulp-clean-css'], { 'saveDev': true });
        this.npmInstall(['gulp-autoprefixer'], { 'saveDev': true });
        this.npmInstall(['gulp-csscomb'], { 'saveDev': true });
        this.npmInstall(['gulp-wp-pot'], { 'saveDev': true });
        this.npmInstall(['gulp-rev'], { 'saveDev': true });
        this.npmInstall(['gulp-uglify'], { 'saveDev': true });
        this.npmInstall(['gulp-notify'], { 'saveDev': true });
        this.npmInstall(['gulp-plumber'], { 'saveDev': true });
        this.npmInstall(['gulp-watch'], { 'saveDev': true });
        this.npmInstall(['del'], { 'saveDev': true });
        this.npmInstall(['gulp-zip'], { 'saveDev': true });
        this.npmInstall(['run-sequence'], { 'saveDev': true });

        this.npmInstall(['animate.css'], { 'saveDev': false });
        this.npmInstall(['bootstrap'], { 'saveDev': false });
        this.npmInstall(['hamburgers'], { 'saveDev': false });
        this.npmInstall(['normalize.css'], { 'saveDev': false });
        this.npmInstall(['wowjs'], { 'saveDev': false });
      }

  }

  end() {
      this.log(chalk.green('\nAll Done!!\n------------------------\n'));
      if (this.gulpsetup) {
        this.log('\nRun ' + chalk.green('gulp') + ' to start the development and ' + chalk.green('gulp build') + ' to create a zip file in ' + chalk.white('dist/' + this.themeSlug + '.zip') + ' ready for production.');
      }

  }
};
