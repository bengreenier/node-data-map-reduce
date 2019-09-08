import sqlite3 from 'sqlite3'
import debug from 'debug'
import { DataSource, DataType } from '.'
import { makeEmptyPromise } from '../util'

export type Sqlite3Query = string
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Sqlite3Record = any[]

/**
 * Debug logging instance
 * Enable with DEBUG=ndmr.sqlite3 environment variable
 */
const log = debug(`ndmr.${DataType.sqlite3}`)

/**
 * Run a query against a database, and capture the result as a promise
 * @param db the database to query
 * @param hasResults does the query yield results
 * @param query the query to run
 */
const runQueryAsync = (db: sqlite3.Database, hasResults: boolean, query: Sqlite3Query): Promise<Sqlite3Record> => {
  return new Promise((resolve, reject) => {
    db[hasResults ? 'all' : 'run'](query, (runError: Error | null, res: sqlite3.RunResult) => {
      if (runError) {
        reject(runError)
      } else if (!res) {
        resolve()
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const resArr = (Object.prototype.hasOwnProperty.call(res, 'length') ? res : [res]) as any[]
        resolve(resArr)
      }
    })
  })
}

/**
 * Closes a database, capturing the result as a promise
 * @param db the database to close
 */
const closeDbAsync = (db: sqlite3.Database): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.close(err => {
      if (err) reject(err)
      else resolve()
    })
  })
}

/**
 * Sqlite3 data source
 */
export default class Sqlite3DataSource implements DataSource<Sqlite3Query, Sqlite3Record> {
  public name: string

  public type = DataType.sqlite3

  private connectionString: string

  private db?: sqlite3.Database

  public constructor(name: string, connectionString: string) {
    this.name = name
    this.connectionString = connectionString
  }

  public connect(): Promise<void> {
    log(`${this.name}.connect: ${this.connectionString}`)

    if (!this.db) {
      this.db = new sqlite3.Database(this.connectionString)
    }
    return makeEmptyPromise()
  }

  public async execute(query: Sqlite3Query): Promise<Sqlite3Record> {
    log(`${this.name}.execute(${query})`)

    if (!this.db) {
      throw new Error('Must call connect() before execute()')
    }

    return runQueryAsync(this.db, true, query)
  }

  public async run(query: Sqlite3Query): Promise<void> {
    log(`${this.name}.run(${query})`)

    if (!this.db) {
      throw new Error(`Must call connect() before run()`)
    }

    await runQueryAsync(this.db, false, query)
  }

  public async disconnect(): Promise<void> {
    log(`${this.name}.disconnect`)

    if (!this.db) {
      throw new Error('Must call connect() before disconnect()')
    }

    await closeDbAsync(this.db)

    this.db = undefined
  }
}
