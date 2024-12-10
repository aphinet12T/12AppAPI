const http = require('http')
require('dotenv').config()
const app = require('./app')
const connectDBAppCA = require('./config/dbCVS.js')

const { API_PORT } = process.env
const PORT = process.env.PORT || API_PORT

const server = http.createServer(app)

connectDBAppCA().then(() => {
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch((error) => {
    console.error("Failed to connect to the database:", error);
    process.exit(1);
});