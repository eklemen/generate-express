Express-Generator-Plus

#### Heavily inspired by
[Express'](https://www.npmjs.com/package/express) application generator.

![but wait theres more](assets/waitTheresMore.gif "So much more...")

## New features
* ES6+ support (including import/export) with latest babel support
* New interactive CLI prompts (no more flags)
* Choose your own database starter configs (`mongojs`, `mongo + mongoose`, `sequelize`, or `none`)
* Api-only option to exclude views and public directory, or pick from one of the original view engines offered by express-generator
* File watcher via `nodemon` to transpile code on change 

### Coming soon
* More database configs, including dynamodb and aurora
* Depricating less popular view engines
* More CLI options for more packages
* Testing: starting with `jest` will add configs for other frameworks eventually
* Testing this framework itself

## Installation

```sh
$ npm install -g express-generator-plus
```

## Quick Start

The quickest way to get started with express is to utilize the executable `express(1)` to generate an application as shown below:

Create the app:

```bash
$ exgen myCoolProject
```

Install dependencies:

```bash
$ cd myCoolProject
$ npm install
```

Start your Express.js app at `http://localhost:3000/`:

```bash
# run with file watch (development)
$ npm run watch:dev

# run as production
$ npm start

# run as development
$ npm run dev
```


## License

[MIT](LICENSE)
