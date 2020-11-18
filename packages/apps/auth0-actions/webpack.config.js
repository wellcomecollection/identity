const {resolve} = require('path')

const config = {
    target: 'node',
    entry: {
        getUser: {
            import: [resolve('./src/get-user.ts')],
            library: {
                type: "this",
                name: "getUser"
            }
        },
        login: resolve('./src/login.ts'),
    },
    externalsType: 'amd-require',
    externals: {
        'got': 'commonjs2 got',
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
                options: {
                    context: __dirname,
                    configFile: 'tsconfig.json'
                }
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.ts', '.tsx']
    }
}

module.exports = config
