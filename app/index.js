'use strict';
var Generator = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var _ = require('lodash');
var fs = require('fs');
var del = require('del');
var download = require('download');
var walk = require('walk');
var path = require('path');

module.exports = class extends Generator {
  prompting() {
      this.log(yosay(
        'With great power comes great a' + chalk.red('theme generator!')
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
						name: 'domainName',
						message: 'If you want to add a domain site',
						default: ''
				},
          {
            type: 'input',
            name: 'themeName',
            message: 'Theme Name',
            default: 'StanLee'
          },
          {
            type: 'input',
            name: 'themeSlug',
            message: 'Theme Slug',
            default: 'stanlee'
          },
          {
            type: 'input',
            name: 'themeURI',
            message: 'Theme URI',
            default: 'http://stanlee.thatmuch.fr/'
          },
          {
            type: 'input',
            name: 'author',
            message: 'Author',
            default: 'ThatMuch'
          },
          {
            type: 'input',
            name: 'authorURI',
            message: 'Author URI',
            default: 'https://thatmuch.fr'
          },
          {
            type: 'input',
            name: 'authorEmail',
            message: 'Author Email',
            default: 'social@thatmuch.fr'
          },
          {
            type: 'input',
            name: 'description',
            message: 'Description',
            default: 'A great Wordrpress theme'
          },
          {
            type: 'input',
            name: 'bugreport',
            message: 'Bug Report',
            default: 'https://example.com/bugreport/'
          },
          {
            type: 'confirm',
            name: 'gulpsetup',
            message: 'Would you like to setup a Gulp configuration ready to use?',
            default: true
          }
      ],

    ).then((answers) => {
            this.proxy = answers.proxy;
      this.domainName = answers.domainName;
              this.themeName = answers.themeName;
              this.themeSlug = answers.themeSlug;
              this.themeURI = answers.themeURI;
              this.author = answers.author;
              this.authorURI = answers.authorURI;
              this.authorEmail = answers.authorEmail;
              this.description = answers.description;
              this.bugreport = answers.bugreport;
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
          result = result.replace(/_a_/g, ' ' + _this.author);
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

          result = data.replace(/Copyright (C) 2018 ThatMuch/g,'Copyright (C) ' + new Date().getFullYear()+ ' ' + _this.author);
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
		if (this.gulpsetup) {
			this.fs.copyTpl(
				this.templatePath('_package.json'),
				this.destinationPath('package.json'), {
					package_name: this.themeSlug,
					package_description: this.description,
					package_author: this.author,
					proxy_address: this.proxy,
          proxy_domain: this.domainName,
					theme_name: this.themeName,
					theme_domain: this.themeSlug,
					theme_bugreport: this.bugreport,
					author_uri: this.authorURI,
					author_email: this.authorEmail
				}
			);

			this.fs.copyTpl(
				this.templatePath('_wpgulp.config.js'),
        this.destinationPath('wpgulp.config.js'), {
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

  const pkgJson = {
    devDependencies: {
      gulp: '^4.0.0'
    }
  };

  // Extend or create package.json file in destination path
  this.fs.extendJSON(this.destinationPath('package.json'), pkgJson);
}



  end() {
      this.log(chalk.green('\nAll Done!!\n------------------------\n'));
      if (this.gulpsetup) {
        this.log('\nRun ' + chalk.green('npm start') + ' to start the development and ' + chalk.green('npm run zip') + ' to create a zip file in ' + chalk.white('dist/' + this.themeSlug + '.zip') + ' ready for production.');
      }

  }
};
