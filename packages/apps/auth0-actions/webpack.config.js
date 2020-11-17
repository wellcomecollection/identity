const {resolve} = require('path')

const isDevelopment = process.env.NODE_ENV !== 'production'

const config = {
    entry: {
        getUser: resolve('./src/get-user.ts'),
        login: resolve('./src/login.ts'),
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
