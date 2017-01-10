# Generator-StanLee-WPTheme

[Yeoman](http://yeoman.io/) generator for a WordPress starter theme (using [StanLee](https://github.com/tomtomgo92/StanLee)) with [Gulp](http://gulpjs.com/) and other good stuff. This will install the last version of `StanLee` and optionally a Gulp setup ready for development and production.

Générateur [Yeoman](http://yeoman.io/) pour un thème de démarrage de WordPress (Utilisant [StanLee](https://github.com/tomtomgo92/StanLee)). Utilise [Gulp](http://gulpjs.com/) et d'autres bonnes choses. Cela permet d'installer la dernière version de `StanLee` et optionnellement une configuration de Gulp prêt au développement et la production.

Installation Version [FRANCAISE](https://github.com/tomtomgo92/StanLee-WPTheme-Generator/wiki/Installation)


## Installation

##### Install required tools `yo` and `gulp`:

```bash
npm install -g yo gulp
```

##### Install `generator-stanlee-wptheme`:

```bash
npm install -g generator-stanlee-wptheme
```

### Run

##### Create a new directory, and go into:

```bash
mkdir my-new-theme && cd $_
```

##### Run `yo stanlee-wptheme`, and fill the info:

```bash
yo stanlee-wptheme
```

## Gulp usage

- Run `gulp` to watch for changes

- Run `gulp build` to build your theme for production (you will find a `my-new-theme.zip` file in `my-new-theme/dist/`)

- (Optional) Run `gulp build-clean` before `gulp build` to cleanup the `my-new-theme/dist/` folder


## Bower usage || Utilisation de Bower

- Run `bower install --save <package>` to install frontend dependencies

- Run `gulp wiredep` to include SCSS file in `/sass/style.scss`

## License

[MIT](http://opensource.org/licenses/MIT)
Copyright (c) 2016 [Thomas & Mathilde]
