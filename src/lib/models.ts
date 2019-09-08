/**
 * A query
 */
export interface Query {
  /**
   * A sqlite3 query that is run after all data queries are run
   *
   * Typically used to aggregate or filter data from the underlying sources
   */
  aggregate: string

  /**
   * A map of data source name, to data source query
   *
   * This defines the underlying data that will be pulled in for the aggregate query to reference
   */
  data: { [name: string]: string }
}

/**
 * Represents a data source that is remotely located
 */
export interface OnlineSource {
  /**
   * A protocol prefixed connection string for a data source
   *
   * Note: the protocol should match a value from @see DataType. For instance, `sqlite3://`
   */
  connection: string
}

/**
 * Represents a data source for testing, that includes data to preload
 */
export interface OfflineSource extends OnlineSource {
  /**
   * The table name to preload into
   *
   * This simulates having a data source with a particular table in it
   */
  table: string

  /**
   * The data to preload
   *
   * Note: each element in the array should have the same layout
   */
  data: unknown[]
}

/**
 * A map of sources, indexed by name, and mapping to a given source type
 */
export type Sources = { [name: string]: OnlineSource | OfflineSource }

/**
 * A configuration
 */
export interface Config {
  /**
   * A map of sources
   */
  sources: Sources
}
