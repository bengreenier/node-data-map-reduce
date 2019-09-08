import { readFileSync } from 'fs'
import { Command } from '.'
import { Query, OfflineSource, OnlineSource } from '../lib/models'
import { allocateSources } from '../lib/util'
import Sqlite3DataSource from '../lib/data-sources/sqlite3'
import makeImmutableDataSource, { DataSource } from '../lib/data-sources'
import DataInflator from '../lib/data-inflator'

/**
 * Execute command input
 */
interface InputArgs {
  /**
   * A query file, containing a JSON document of a query
   *
   * This defines the command line arguments a user will give
   */
  query: string
}

/**
 * Execute command output, usually a projection of the input
 *
 * This defines the projection that our code will actually use
 */
interface OutputArgs {
  query: Query
}

/**
 * loads a source, connecting and (if needed) loading test data
 * @param source the source to load
 * @param target the target data/config definition
 */
const preloadSource = async (source: DataSource<string, unknown>, target: OnlineSource | OfflineSource): Promise<void> => {
  // open the source
  await source.connect()

  // if we have test data, load it
  if (Object.prototype.hasOwnProperty.call(target, 'data')) {
    const offlineSourceTarget = target as OfflineSource
    const input = makeImmutableDataSource(offlineSourceTarget.table, () => offlineSourceTarget.data)
    await input.connect()
    const offlineInflator = new DataInflator(input, source)

    // note: all is ignored - could pass any string
    // TODO(bengreenier): api mismatch
    await offlineInflator.inflate('all')
    await input.disconnect()
  }
}

/**
 * Runs a query against source, pulling the resulting data into sink
 * @param source the source to query from
 * @param query the query
 * @param sink the source to write to
 */
const queryToSink = async (source: DataSource<string, unknown>, query: string, sink: DataSource<string, unknown>): Promise<void> => {
  // run the query, pulling in the results
  const sinkInflator = new DataInflator(source, sink)
  await sinkInflator.inflate(query)
}

// the yargs command that this file will export
// defining the main behavior of this component
const command: Command<InputArgs, OutputArgs> = {
  command: 'execute [query]',
  describe: 'execute a query',
  builder: instance => {
    return instance
      .positional('query', {
        describe: 'the path to a query (JSON file) to execute',
        type: 'string',
      })
      .default('query', './query.json')
      .coerce('query', arg => {
        return JSON.parse(readFileSync(arg).toString()) as Query
      })
      .demandOption('query')
  },
  handler: args => {
    const requiredSources = allocateSources(args.config.sources).filter(s => args.query.data[s.name])
    const sink = new Sqlite3DataSource('sink', ':memory:')

    sink
      // connect to the sink
      .connect()
      .then(() =>
        Promise.all(
          requiredSources.map(s =>
            // preload the source (connect, and load test data if needed)
            preloadSource(s, args.config.sources[s.name])
              // query the source, into the sink
              .then(() => queryToSink(s, args.query.data[s.name], sink))
              // disconnect from the source
              .then(() => s.disconnect())
          )
        )
      )
      // run the aggregate query over the sink
      .then(() => sink.execute(args.query.aggregate))
      .then(result => {
        // disconnect from the sink async, but don't lose the value
        return sink.disconnect().then(() => result)
      })
      .then(
        result => {
          // log the result
          // eslint-disable-next-line no-console
          console.log(result)
        },
        err => {
          // eslint-disable-next-line no-console
          console.error(err)
        }
      )
  },
}

// The execute command
export default command
