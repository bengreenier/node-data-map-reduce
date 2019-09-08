# node-data-map-reduce

n-tiered map reduce for databases. `ndmr` for short.

![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/bengreenier/node-data-map-reduce)

This project provides one possible way to select data from multiple downstream databases and run a query against the result of all those downstream queries on-demand. For instance:

```
SELECT * FROM users @ https://my-downstream-sql-provider.com
SELECT * FROM pets @ https://your-sql-animal-db.com

SELECT pet_type FROM pets INNER JOIN users ON pets.owner_id=users.id WHERE users.name='ben'
```

In the above example, we'd collect all user records from one source, and all pet records from another. We'd then correlate the two sources, using the pet records `owner_id` and the user records `id`. Finally, we'd select the `pet_type` field from the pet record, where the `name` field from the users record matches `ben`.

This type of scenario is likely not very widely applicable, and is probably only interesting to you if:

- You have many downstream data sources that cannot be moved/centralized for business reasons
- These downstream sources have different schemas
- These downstream sources **are relational data stores**
- You wish to query these data sources as one source

## Usage

```
ndmr [command]

Commands:
  ndmr execute [query]  execute a query

Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
  --config   Path to the configuration file[required] [default: "./config.json"]
```

### Execute

```
ndmr execute [query]

execute a query

Positionals:
  query  the path to a query (JSON file) to execute
                                   [string] [required] [default: "./query.json"]

Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
  --config   Path to the configuration file[required] [default: "./config.json"]
```

## Examples

For example queries and configurations, see the [examples](./examples) directory. Each subdirectory is an example, complete with it's own README.

## Binary Releases

![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/bengreenier/node-data-map-reduce)

To simplify cases when one might simply want to run the examples without needing to build the source,binary releases are provided for Windows, Mac, and Linux on the [Releases Page](https://github.com/bengreenier/node-data-map-reduce/releases/latest).

## Contributing

Open a PR against this repository, or create an Issue.
