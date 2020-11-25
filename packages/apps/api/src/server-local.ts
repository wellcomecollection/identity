import app from './app';
import * as http from "http";
import * as process from "process";

const WECO_IDENTITY_API_PORT = process.env.WECO_IDENTITY_API_PORT ?? 8081;

const server = http.createServer(app).listen(WECO_IDENTITY_API_PORT, function () {
    console.log(`Server running on http://localhost:${WECO_IDENTITY_API_PORT}`);
});

server.on("error", e => {
    console.error(`Server encountered an error: ${e}`);
})
