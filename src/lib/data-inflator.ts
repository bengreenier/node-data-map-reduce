import debug from 'debug'
import { DataSource } from './data-sources'
import { getSqliteType } from './util'

const log = debug('ndmr.inflator')

/**
 * Inflates data from one source into another, using a defined query
 *
 * Note: currently it's enforced that queries must be strings to simplify our logic
 */
export default class DataInflator<TSourceRecord, TDestRecord> {
  /**
   * Data source
   */
  private from: DataSource<string, TSourceRecord>

  /**
   * Data destination
   */
  private to: DataSource<string, TDestRecord>

  /**
   * Ctor
   * @param from the source data
   * @param to the dest data
   */
  constructor(from: DataSource<string, TSourceRecord>, to: DataSource<string, TDestRecord>) {
    this.from = from
    this.to = to
  }

  /**
   * Inflate data from @see this.from into @see this.to
   * @param query the query that selects data
   */
  public async inflate(query: string): Promise<void> {
    const res = await this.from.execute(query)
    // widen the type to always be an array
    const resWiden = (Object.prototype.hasOwnProperty.call(res, 'length') ? res : [res]) as unknown[]

    // assume each entry has the same structure
    const assumedSchema = this.describeObjectStructure(resWiden[0])
    const hasError = resWiden.some(e => this.describeObjectStructure(e).schema.length !== assumedSchema.schema.length)

    // if our assumption is wrong, fail
    if (hasError) {
      throw new Error(`Incorrect assumption. Schema is not always consistent.`)
    }

    try {
      await this.to.run(`CREATE TABLE '${this.from.name}' (${assumedSchema.schema})`)
    } catch (ex) {
      log('table already exists, continuing')
    }

    // we need to create a consistent view of the data, to manipulate
    // we conform to an array of record objects
    // we then escape strings and convert booleans
    // finally, we stringify all these, and insert them into this.to
    // TODO(bengreenier): reuse logic from below function
    const ops = resWiden
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((v: any) =>
        Object.values(v)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((s: any) => {
            if (typeof s === 'string') {
              return `'${s}'`
            }
            if (typeof s === 'boolean') {
              return s ? 1 : 0
            }
            return s
          })
          .join(',')
      )
      .map(v => {
        return this.to.run(`INSERT INTO '${this.from.name}' VALUES (${v})`)
      })

    // we must wait for all those operations to run, before returning
    await Promise.all(ops)
  }

  /**
   * Describe the object structure of any in sqlite3 terms
   * @returns {schema: string, values: string} the sqlite3 schema string, and the values string
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private describeObjectStructure = (obj: any): { schema: string; values: string } => {
    const tuples = Object.getOwnPropertyNames(obj).map(name => [name, getSqliteType(obj[name]), obj[name]])
    return {
      schema: tuples.map(p => `${p[0]} ${p[1]}`).join(','),
      values: tuples
        .map(p => {
          if (typeof p[2] === 'string') {
            return `'${p[2]}'`
          }
          if (typeof p[2] === 'boolean') {
            return p[2] ? 1 : 0
          }
          return p[2]
        })
        .join(','),
    }
  }
}
