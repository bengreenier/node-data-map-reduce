import DataInflator from '../data-inflator'
import Sqlite3DataSource from '../data-sources/sqlite3'
import makeImmutableDataSource from '../data-sources'

/* eslint-env node, jest */

describe('DataInflator', () => {
  const simpleDataSource = makeImmutableDataSource('simpleDataSource', () => [
    {
      id: 1,
      name: 'ben',
    },
    {
      id: 2,
      name: 'joni',
    },
  ])

  const complexDataSource = makeImmutableDataSource('complexDataSource', () => [
    {
      id: 1,
      name: 'ben',
      isActiveUser: true,
      birthDate: '1993-03-16T14:48:00.000Z',
      deathDate: '2011-10-05T14:48:00.000Z',
    },
    {
      id: 2,
      name: 'joni',
      isActiveUser: false,
      birthDate: '2010-01-01T14:48:00.000Z',
      deathDate: '2020-10-05T14:48:00.000Z',
    },
    {
      id: 3,
      name: 'mason',
      isActiveUser: true,
      birthDate: '2010-01-01T14:48:00.000Z',
      deathDate: '2020-10-05T14:48:00.000Z',
    },
  ])

  beforeAll(async () => {
    await simpleDataSource.connect()
    await complexDataSource.connect()
  })

  afterAll(async () => {
    await simpleDataSource.disconnect()
    await complexDataSource.disconnect()
  })

  it('should inflate', async () => {
    const sink = new Sqlite3DataSource('sink', ':memory:')
    const instance = new DataInflator(simpleDataSource, sink)

    await sink.connect()
    await instance.inflate('SELECT * FROM data')
    await expect(sink.execute(`SELECT * FROM ${simpleDataSource.name}`)).resolves.toEqual([{ id: 1, name: 'ben' }, { id: 2, name: 'joni' }])
    await sink.disconnect()
  })

  it('should support multiple inflates', async () => {
    const sink = new Sqlite3DataSource('sink', ':memory:')
    const simpleInflator = new DataInflator(simpleDataSource, sink)
    const complexInflator = new DataInflator(complexDataSource, sink)

    await sink.connect()
    await simpleInflator.inflate('SELECT * FROM data')
    await complexInflator.inflate('SELECT * FROM data')
    await expect(
      sink.execute(
        `SELECT * FROM ${simpleDataSource.name} INNER JOIN ${complexDataSource.name} ON ${simpleDataSource.name}.id=${complexDataSource.name}.id WHERE ${simpleDataSource.name}.name='ben'`
      )
    ).resolves.toEqual([{ birthDate: '1993-03-16T14:48:00.000Z', deathDate: '2011-10-05T14:48:00.000Z', id: 1, isActiveUser: 1, name: 'ben' }])
    await sink.disconnect()
  })
})
