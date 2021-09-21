# Generator-StanLee-WPTheme

[Yeoman](http://yeoman.io/) generator for a WordPress starter theme (using [StanLee](https://github.com/ThatMuch/stanLee-wordpress)) with [Gulp](http://gulpjs.com/) and other good stuff. This will install the last version of `StanLee` and optionally a Gulp setup ready for development and production.

## Installation

##### Install required tools `yo` and `gulp`:

```bash
npm install -g yo gulp
```

##### Install `generator-stanlee`:

```bash
npm install -g generator-stanlee
```

### Run

##### Create a new directory, and go into:

```bash
mkdir my-new-theme && cd $_
```

##### Run `yo stanlee`, and fill the info:

```bash
yo stanlee
```

## Usage

- Run `npm start` to start the project and watch changes

- Run `npm run zip` to build your theme for production (you will find a `my-new-theme.zip` file in `my-new-theme/dist/`)


## Bower usage || Utilisation de Bower

- Run `bower install --save <package>` to install frontend dependencies

## License

[MIT](http://opensource.org/licenses/MIT)
Copyright (c) 2021 [THATMUCH]
