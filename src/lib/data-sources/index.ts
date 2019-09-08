/**
 * Represents supported data types that we can execute queries against
 */
export enum DataType {
  static = 'static',
  sqlite3 = 'sqlite3',
  sql = 'sql',
}

/**
 * Represents the core of a data source
 */
export interface DataSource<QueryType, RecordType> {
  /**
   * A unique name for the source
   *
   * This __must be unique__, given that we use it to store data during the aggregation phase
   */
  name: string

  /**
   * The source type
   */
  type: DataType

  /**
   * Connects to the source.
   *
   * This __must be called before execute__ to ensure execute can access the store
   */
  connect(): Promise<void>

  /**
   * Executes a query against the data source, returning results in the type native to the data source
   * @param query a query, represented in the type native to the data source
   */
  execute(query: QueryType): Promise<RecordType>

  /**
   * Runs a statement, that yields no results.
   * @param statement a statement, represented in the type native to the data source
   */
  run(statement: QueryType): Promise<void>

  /**
   * Disconnects from the source.
   */
  disconnect(): Promise<void>
}

/**
 * Provides a quick way to create a data source given a set of static data
 * @param name the unique data source name
 * @param provider the data source immutable data provider
 */
export default function makeImmutableDataSource<QueryType, RecordType>(name: string, provider: () => RecordType): DataSource<QueryType, RecordType> {
  return {
    name,
    type: DataType.static,
    connect: (): Promise<void> => Promise.resolve(),
    disconnect: (): Promise<void> => Promise.resolve(),
    execute: (): Promise<RecordType> => Promise.resolve(provider()),
    run: (): Promise<void> => Promise.resolve(),
  }
}
