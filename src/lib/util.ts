import { reduce as conditionalReduce } from 'conditional-reduce'
import { parse as parseUrl } from 'url'
import { Sources } from './models'
import { DataSource, DataType } from './data-sources'
import Sqlite3DataSource from './data-sources/sqlite3'

/**
 * Helper to generate an empty promise
 */
export const makeEmptyPromise = (): Promise<void> => Promise.resolve()

/**
 * Determine the sqlite3 type of a js value
 * @param jsVal value to determine type from
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getSqliteType = (jsVal: any): string => {
  const isInt = (n: number): boolean => {
    return n % 1 === 0
  }

  return conditionalReduce(typeof jsVal, {
    number: () => (isInt(jsVal) ? 'integer' : 'real'),
    string: () => 'text',
    object: () => 'blob',
    boolean: () => 'integer',
    undefined: () => 'null',
  })
}

/**
 * Allocates sources by converting a dictionary of config to actual objects
 * @param sources sources to allocate
 */
export const allocateSources = (sources: Sources): DataSource<string, unknown>[] => {
  return Object.entries(sources).map(pair => {
    const [name, def] = pair
    const url = parseUrl(def.connection)

    if (!url.protocol) {
      throw new Error(`Invalid source definition: ${name}.`)
    }

    const protocolWithoutColon = url.protocol.substr(0, url.protocol.length - 1)
    const urlWithoutProtocol = def.connection.substr('://'.length + protocolWithoutColon.length)

    switch (protocolWithoutColon as DataType) {
      case DataType.sqlite3:
        return new Sqlite3DataSource(name, urlWithoutProtocol)
      default:
        throw new Error(`Unsupported source protocol ${url.protocol} in source ${name}.`)
    }
  })
}
