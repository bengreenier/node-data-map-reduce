## Getting started

This repo is set up using [typescript](http://www.typescriptlang.org/), [eslint](https://eslint.org/), [prettier](https://prettier.io/), and [jest](https://jestjs.io/) to ensure quality and usability are top of mind. There's some great tooling for leveraging these things:

- [VS Code](https://code.visualstudio.com/)
- [Extension: Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [Extension: Eslint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

To run the tests or utility, follow these steps:

- Install [Git](https://git-scm.com/)
- Install [Node + NPM](https://nodejs.org/en/)
- Clone this repository

```
git clone https://github.com/bengreenier/node-data-map-reduce
```

- Enter the created directory

```
cd node-data-map-reduce
```

- Install dependencies

```
npm install
```

- Build the source

```
npm run build
```

- Run the tests

```
npm test
```

- Run the utility (note: when running with `npm`, `--` must be used [to separate arguments to the npm process](https://docs.npmjs.com/cli/run-script), from arguments to our process)

```
npm start -- --help
```
