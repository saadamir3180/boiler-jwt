const express = require('express');
const logger = require('./logger');
const app = express();
const routes = require('./routes');
const connectToDatabase = require('./database');
const port = process.env.PORT || 3000;



async function StartServer() {

    
    await connectToDatabase();

    app.use(express.json());

    app.use('/api', routes);


    app.listen(port, () => {
        logger.info(`Server running on http://localhost:${port}`);
    });
    
}

module.exports = StartServer;