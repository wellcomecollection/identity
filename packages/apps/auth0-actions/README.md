# Auth0 Actions

These are all of the custom actions (aka scripts, aka tasks) that we use in Auth0: there is one for each entry point listed in `actions` inside `webpack.config.js`.

## Build process

Each action must come in the form of a single file containing _only_ a single function (nothing else can be in scope). No module system is used to expose this function, although within the function we have full use of a modern Node environment (ie with CommonJS modules).

To achieve this while still being able to write modern and reusable code, we use Webpack to compile each script into one output file. We expose the default export of each entry point [as a variable](https://webpack.js.org/configuration/output/#expose-a-variable), and then we wrap it in a function using a custom plugin (`TaskWrapperPlugin`) to satisfy the scope requirement of the Auth0 environment.

External modules are provided by the environment (rather than by our own `node_modules`), and must be listed within the Webpack config. The [list of available modules](https://auth0-extensions.github.io/canirequire/) is maintained by Auth0.
