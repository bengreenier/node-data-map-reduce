import yargs from 'yargs'
import { readFileSync } from 'fs'
import { Config } from './lib/models'

const pkg = JSON.parse(readFileSync(`${__dirname}/../package.json`).toString())

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { argv } = yargs
  .help()
  .scriptName(pkg.name)
  .version(pkg.version)
  .describe({
    config: 'Path to the configuration file',
  })
  .default({
    config: './config.json',
  })
  .coerce('config', (arg: string) => {
    return JSON.parse(readFileSync(arg).toString()) as Config
  })
  .demandOption('config')
  .recommendCommands()
  .commandDir(`${__dirname}/commands`, {
    visit: commandObject => {
      // support default exports, if present
      if (!commandObject.command && commandObject.default && commandObject.default.command) {
        return commandObject.default
      }
      return commandObject
    },
  })
