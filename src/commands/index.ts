import { CommandBuilder } from 'yargs'
import { Config } from '../lib/models'

/**
 * Arguments that are constant, parsed in ../index
 */
interface RootArgs {
  config: Config
}

/**
 * Defines the shared interface a command-line command must adhere to
 */
export interface Command<InputArgs, OutputArgs> {
  /**
   * The name (and optional structure) of the command
   *
   * See yargs for more info
   */
  command: string

  /**
   * The description (for help) of the command
   */
  describe: string

  /**
   * The yargs command builder that defines the cli interaction
   */
  builder: CommandBuilder<InputArgs, OutputArgs>

  /**
   * The handler that will execute when this command is issued
   */
  handler: (args: OutputArgs & RootArgs) => void
}
