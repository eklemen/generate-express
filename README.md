![generate-express logo](assets/generate-express-small.png)

## Generate an Express app from the command line

Tired of searching for the right boilerplate repo? Generate your next ExpressJS project from the command line, and pick the options you need to fit your next project.

*Now with Typescript support!*

## Features
* Code in ES6+ or Typescript
* Interactive CLI prompts walk you through each option to customize your build (no more inline flags)
* Choose your own database starter configs (`mongojs`, `mongo + mongoose`, `sequelize`, or `none`)
* Optional caching configs for Redis
* File watcher via `nodemon` to transpile code on change 

### Coming soon
* Ability to specify SQL dialect for `sequelize` (postgres, mysql, sqlite, etc.)
* More CLI options for more packages
* Testing: starting with `jest` will add configs for other frameworks eventually
* More testing of this framework itself

## Quick Start
```sh
npx generate-express myCoolProject
```
* You can download [npx here](https://www.npmjs.com/package/npx) by running `npm i -g npx`
* [Example of generated project structure](#example-project-structure)
* **Dependencies are installed automatically**

### Start your Express.js server
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

### Example project structure
```
MyCoolApp
└── server
    ├── app.js
    ├── bin
    │   └── www.js
    ├── controllers
    │   └── userController.js
    ├── models
    │   ├── User.js
    │   └── index.js
    └── routes
        ├── hello.js
        ├── index.js
        └── users.js

```

## Contributions
Feel free to raise an issue or create a Pull Request if you see ways that can improve this library.

### Current Contributors
[![](https://sourcerer.io/fame/smaharj1/eklemen/generate-express/images/0)](https://sourcerer.io/fame/smaharj1/eklemen/generate-express/links/0)[![](https://sourcerer.io/fame/smaharj1/eklemen/generate-express/images/1)](https://sourcerer.io/fame/smaharj1/eklemen/generate-express/links/1)[![](https://sourcerer.io/fame/smaharj1/eklemen/generate-express/images/2)](https://sourcerer.io/fame/smaharj1/eklemen/generate-express/links/2)[![](https://sourcerer.io/fame/smaharj1/eklemen/generate-express/images/3)](https://sourcerer.io/fame/smaharj1/eklemen/generate-express/links/3)[![](https://sourcerer.io/fame/smaharj1/eklemen/generate-express/images/4)](https://sourcerer.io/fame/smaharj1/eklemen/generate-express/links/4)[![](https://sourcerer.io/fame/smaharj1/eklemen/generate-express/images/5)](https://sourcerer.io/fame/smaharj1/eklemen/generate-express/links/5)[![](https://sourcerer.io/fame/smaharj1/eklemen/generate-express/images/6)](https://sourcerer.io/fame/smaharj1/eklemen/generate-express/links/6)[![](https://sourcerer.io/fame/smaharj1/eklemen/generate-express/images/7)](https://sourcerer.io/fame/smaharj1/eklemen/generate-express/links/7)

#### Inspired by
[Express'](https://www.npmjs.com/package/express) application generator.

## License

[MIT](LICENSE)
