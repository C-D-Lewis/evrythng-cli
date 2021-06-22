# @chris-lewis/evrythng-cli

Fork of [`evrythng/evrythng-cli`](https://github.com/evrythng/evrythng-cli).

> Requires Node.js version 10 or greater

- [Installation](#installation)
- [Usage and Help](#usage-and-help)
- [Authentication](#authentication)
- [Useful examples](#useful-examples)
- [Plugin API](#plugin-api)
- [Architecture](#architecture)
- [Running Tests](#running-tests)

Command Line Interface (CLI) for managing credentials and working with the
[EVRYTHNG API](https://developers.evrythng.com) from a terminal or scripts with
ease. For example, all Thngs with the `device` tag!

```shell
$ evrythng thngs list --filter tags=device
```

See what's possible:

```shell
# See all commands, options, and switches
$ evrythng

# See all operations for a given resource type, such as Thngs:
$ evrythng thngs
```

Manage multiple API keys:

```shell
# Add a new API key to saved config
$ evrythng keys add personal us <some key>

# See saved keys
$ evrythng keys list

# or use in scripts
$ export OPERATOR_API_KEY=$(evrythng keys personal read)
```


## Installation

Install the `npm` module globally as a command:

```shell
$ npm i -g @chris-lewis/evrythng-cli
```

Then add at least one API key using an Operator API Key available
from the 'Account Settings' page of the
[EVRYTHNG Dashboard](https://dashboard.evrythng.com):

> This is automatically requested when first run.

```shell
$ evrythng keys add $name $region $apiKey
```

For example:

> Key truncated for brevity.

```shell
$ evrythng keys add prod us AGiWrH5OteA4aHiM...
```


## Usage and Help

After installation, the global `npm` module can be used directly. In general,
the argument structure is:

```shell
$ evrythng <command> <params>... [<payload>] [<switches>...]
```

For example, creating a new product:

```shell
$ evrythng products create '{"name":"Some Fancy New Product"}'
```

Run `evrythng` to see all commands, switches, and options.

Some resources and operation types have short aliases. For example, to list
Thngs:

```shell
$ evrythng t l
```


## Authentication

Authentication is provided in two ways:

1. Using the `keys` command to store API Keys (Operator or Access Token)
   associated with different accounts and regions in the user's
   `~/.evrythng-cli-config` file. Request will be sent with the currently
   selected key.

   ```shell
   # Select a stored key
   evrythng keys personal-eu use

   # Use in a command
   evrythng places list --per-page 10
   ```

2. Using the `--api-key` switch to either override the currently selected
   operator's API key, or provide a required key (such as the Application API
   Key when creating Application Users). An existing operator's name chosen
   when using `keys add` is also accepted.

   > Key truncated for brevity.
   
   ```shell
   # Use a raw key
   evrythng accounts list --api-key AGiWrH5OteA4aHiM...

   # Or another saved operator by name
   evrythng accounts list --api-key personal-eu
   ```

> You must add at least one key before you can begin using the CLI. You'll
> be guided the first time if you forget.

All API keys refer to a 'region' - an API URL where they exist in the EVRYTHNG
Platform. See all available regions:

```shell
$ evrythng region list
```

Or even add your own!

```shell
$ evrythng region add test https://test.example.com
```


## Useful Examples

Read all places with IDs and names:

```shell
$ evrythng places list --summary
```

Read a Thng with a unique identifier, for use in a script:

```bash
#!/bin/bash

THNG_ID=$(evrythng thngs gs1:21:test-serial-1 read --field id)

echo $THNG_ID
```

Export places to CSV file:

```shell
$ evrythng places list --to-csv places.csv --per-page 100 --to-page 10
```

Create products from a CSV file:

```shell
$ evrythng products create --from-csv products.csv
```


## Plugin API

The EVRYTHNG CLI allows plugins to be created and installed in order to
add/extend custom functionality as the user requires. These plugins are provided
with an `api` parameter that contains methods and data they can use to implement
additional functionality, such as adding new commands.

Some example plugins can be
[found on GitHub](https://github.com/search?q=evrythng-cli-plugin).


### Plugin Requirements

In order to be considered a plugin, its `npm` module must meet the following:

* Be installed in the same directory as the CLI, as will be the case when
  installed globally with `-g` or as a project dependency (i.e: in
  `node_modules`).
* Have a package name beginning the prefix `evrythng-cli-plugin-`.
* Have a single source file identifiable when it is `require`d, such as setting
  `main` in its `package.json`.
* That file must export a single function, which is provided the `api` parameter
  (see below). Asynchronous functions are not currently supported.

An example of such a plugin is shown below. The basic directory structure is:

```
- evrythng-cli-plugin-greeter
  - package.json (with main: index.js)
  - index.js
```

`index.js` exports a single function that will be run when it is loaded:

```js
module.exports = (api) => {
  // Require minimum evrythng-cli version 1.6.0
  api.requireVersion('1.6.0');

  // Define a new command: 'greet $name'
  const newCommand = {
    about: 'Greet someone',
    firstArg: 'greet',
    operations: {
      greetSomeoneByName: {
        execute: ([name]) => console.log(`\nHello there, ${name}!`),
        pattern: '$name',
      },
    },
  };

  // Register the new command
  api.registerCommand(newCommand);
};
```

In the example above, a new command `greet` is added with one operation that
is provided the remaining arguments, in the same way as regular built-in
commands. This is validated against a schema before being loaded - it must match
the structure of the above example.

The example command added in the example is then available as usual when using
the CLI:

```shell
$ evrythng greet Charles
```
```
Hello there, Charles!
```


### Plugin API

The `api` parameter provided to a plugin's exported function contains the
following usable methods and data:

* `registerCommand()` - Register a new command.
* `getOptions()` - Retrieve an object describing the user's `options` from the
  CLI configuration file, which defines the persistent `options` preferences.
* `getSwitches()` - Retrieve an object describing the currently active switches.
* `getConfig()` - Get a `get()`/`set()` interface to the config file.
* `runCommand()` - Run a CLI command using a list of string arguments, such as
  `['thngs', 'list']`.
* `version` - String of the current running `evrythng-cli` version.
* `requireVersion()` - Require a semver compatible version of `evrythng-cli` to
  load the plugin.
* `getScope()` - Obtain an evrythng.js Operator or Access Token scope for the
  currently selected key.


## Architecture

### Launch Parameters

The structure of launch parameters is as follows:

```
$ evrythng <command> <params>... [<payload>] [<switches>...]
```

A command is implemented by adding to `commands.js`, and must have the following
exported structure:

```js
module.exports = {
  about,
  firstArg,
  operations,
}
```

For example:

```js
module.exports = {
  about: 'View rate limit information',
  firstArg: 'rate-limits',
  operations: {
    read: {
      execute: async () => http.get('/rateLimits'),
      pattern: 'read',
    },
  },
};
```

This is so that a command can safely implements its functionality using
parameters that were provided to it. A command is selected when all arguments
match the `pattern` provided by any given `operations` item, including keywords
such as `$id` or `$type`.

If no command is matched, the help text is displayed. If a command is not fully
matched, but the arguments do start with a module's `firstArg`, the syntax
for the module's `operations` is printed to help guide the user.

So for example, the `thngs $id read` command:

```shell
$ evrythng thngs UnghCKffVg8a9KwRwE5C9qBs read
```
would receive all tokens after its own name as `args` when the operation is
called (i.e: all arguments matched its `pattern`):

```js
['UnghCKffVg8a9KwRwE5C9qBs', 'read']
```

and is implemented thus:

```js
module.exports = {
  about: 'Work with Thng resources.',
  firstArg: 'thngs',
  operations: {
    readThng: {
      execute: async ([id]) => http.get(`/thngs/${id}`),
      pattern: '$id read',
    },
  },
};
```

This architecture allows easy extension for subcommands of existing commands,
or as entirely new commands that are all agnostic to each other.


### Requests

HTTP requests are performed using the `post`, `get`, `put`, and `delete` methods
exported by `src/modules/http.js`.

Switches that affect pre- and post-request behavior (such as printing extra
logs, applying query params, or formatting the API response) are handled
transparently in this module, so the commands do not have to handle them
themselves.


### Switches

Any launch parameter that begins with `--` is treated as a switch, and is
extracted from the launch parameters by `switches.js` in the `apply()` method
before the remaining `args` are provided to the matched command.

After `apply()` is called, a switch's state in any given invocation can be
determined as shown below for an example command:

```shell
$ evrythng thngs list --with-scopes
```

```js
const switches = require('../modules/switches');

if (switches.SCOPES) {
  // --with-scopes was specified
}
```

If a switch is configured in `SWITCH_LIST` to be given with a value
(`hasValue`), it is made available as `value`. This is specified at invocation
time as follows:

```shell
$ evrythng thngs list --filter tags=test
```

The value would be read in code as:

```js
const filter = switches.FILTER;

if (filter) {
  console.log(`Filter value was ${filter}`);
}
```

```
Filter value was tags=test
```


### Automatic Payloads

The EVRYTHNG CLI uses the
[`evrythng-swagger` `npm` module](https://www.npmjs.com/package/evrythng-swagger)
to allow interactive building of `POST` request payloads using the `definitions`
provided by the EVRYTHNG `swagger.json` API description. This is invoked with
the `--build` switch:

```
$ evrythng thngs create --build
```

The CLI then asks for each field in the `definition` (that is not marked as
`readOnly`) specified in the command that implements `payloadBuilder.build()`,
in this case `ThngDocument`:

```js
createThng: {
  execute: async ([, json]) => {
    const payload = await util.buildPayload('ThngDocument', json);
    return http.post('/thngs', payload);
  },
  pattern: 'create $payload',
},
```

The user is then asked to input their values, including sub-objects such as
`customFields`:

```shell
$ evrythng thngs create --build
```
```
Provide values for each field (or leave blank to skip):

1/7: name (string): My New Thng
2/7: tags (comma-separated list of string): cli,generated,objects
3/7: description (string): This Thng was created interactively
4/7: customFields (object, leave 'key' blank to finish)
  key: origin
  value: evrythng-cli
  key:
5/7: identifiers (object, leave 'key' blank to finish)
  key: serial
  value: 432897
  key:
6/7: product (string):
7/7: collections (comma-separated list of string):

{
  "id": "U5AgdeSQBg8aQKawwHsxkbcs",
  "createdAt": 1530278943537,
  "customFields": {
    "origin": "evrythng-cli"
  },
  "tags": [
    "cli",
    "generated",
    "objects"
  ],
  "updatedAt": 1530278943537,
  "name": "My New Thng",
  "description": "This Thng was created interactively",
  "identifiers": {
    "serial": "432897"
  }
}
```


## Running Tests

Run `npm test` to run the Mocha tests in the `tests` directory.

Afterwards, see `reports/index.html` for code coverage results.
