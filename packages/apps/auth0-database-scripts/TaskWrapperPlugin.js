const {
  Compilation,
  sources: { ConcatSource },
} = require('webpack');
const { execSync } = require('child_process');

const pluginName = 'TaskWrapperPlugin';

// This wraps single-chunk assets in a function named `[chunkName]_wrapper`,
// which assumes that there is a function called `[chunkName]_script` in scope and calls
// it with the same arguments.
//
// It is necessary because auth0 scripts want everything to be wrapped in a single function
class TaskWrapperPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: pluginName,
          stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
        },
        () => {
          const stats = compilation.getStats().toJson();
          const assetSources = compilation.getAssets().reduce(
            (sources, asset) => ({
              ...sources,
              [asset.name]: asset.source,
            }),
            {}
          );
          if (stats.assets) {
            stats.assets
              .filter((asset) => asset.chunks.length === 1)
              .forEach((asset) => {
                const chunkName = asset.chunkNames[0];
                const source = assetSources[asset.name];
                compilation.updateAsset(
                  asset.name,
                  this.wrapSource(source, chunkName)
                );
              });
          }
        }
      );
    });
  }

  wrapSource(source, chunkName) {
    return new ConcatSource(
      this.getDebugHeader(),
      `function ${chunkName}_wrapper(...args) {\n`,
      source,
      `\n${chunkName}_script.apply(this, args);\n}`
    );
  }

  // We add this header to the Auth0 scripts to make it easier to debug
  // what version of the code is actually running.
  // We've had issues in the past where it wasn't obvious if changes were
  // actually being deployed.
  getDebugHeader() {
    try {
      const revision = execSync('git rev-parse HEAD').toString().trim();
      const date = new Date().toISOString();
      return (
        [`// Built from ${revision}`, `// Built at ${date}`].join('\n') + '\n\n'
      );
    } catch (e) {
      console.error("Couldn't parse revision");
      return '';
    }
  }
}

module.exports = TaskWrapperPlugin;
