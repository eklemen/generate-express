![logo](assets/generate-express-horizontal.png "generate-express logo")

## Generate an Express app from the command line

#### Heavily inspired by
[Express'](https://www.npmjs.com/package/express) application generator.

![but wait theres more](assets/waitTheresMore.gif "So much more...")

## Features
* ES6+ support (including import/export) with latest babel support
* Interactive CLI prompts to customize your build (no more flags)
* Choose your own database starter configs (`mongojs`, `mongo + mongoose`, `sequelize`, or `none`)
* Api-only option to exclude views and public directory, or pick from one of the original view engines offered by express-generator
* File watcher via `nodemon` to transpile code on change 

### Coming soon
* More database configs, including dynamodb and aurora
* Deprecating less popular view engines
* More CLI options for more packages
* Testing: starting with `jest` will add configs for other frameworks eventually
* More testing of this framework itself

## Quick Start
```sh
npx generate-express myCoolProject
```
You can download [npx here](https://www.npmjs.com/package/npx) by running `npm i -g npx`


### Install dependencies:

```sh
$ cd myCoolProject
$ npm install
```

### Start your Express.js
```sh
# run with file watch (development)
$ npm run start
```
#### Default routes
```
localhost:3001/api
localhost:3001/api/users
```

### Other `npm` scripts
```sh
# run with file watch (development)
$ npm run start

# run as production
$ npm run prod

# create prod build to /dist
$ npm run build
```


## License

[MIT](LICENSE)
