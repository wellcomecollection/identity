const {resolve} = require('path')

const isDevelopment = process.env.NODE_ENV !== 'production'

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
    output: {
        iife: false
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
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.ts', '.tsx']
    }
}

module.exports = config
