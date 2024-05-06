const express = require('express');
const logger = require('./logger');
const app = express();
const routes = require('./routes');
const cors = require('cors')
const connectToDatabase = require('./database');
const port = process.env.PORT || 3000;



async function StartServer() {


    
    await connectToDatabase();
    app.use(cors());
    app.use(express.json());

    app.use('/api', routes);

    app.use((err, _, res, __) => {
        logger.error(err.stack);
        res.status(err.statusCode || 500)
        .send({ error: err.message });
    });
    
    // this is a middleware that catches any error thrown in the application and logs it to the console. It also sends a response to the client with the error message and status code.

    app.listen(port, () => {
        logger.info(`Server running on http://localhost:${port}`);
    });
    
}

module.exports = StartServer;