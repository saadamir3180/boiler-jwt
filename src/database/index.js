require('dotenv').config();
const mongoose = require('mongoose');
const logger = require('../logger');
mongoose.Promise = global.Promise;

async function connectToDatabase() {
    try{

        const user = process.env.DB_USER;
        const password = process.env.DB_PASS;
        const dbhost = process.env.DB_HOST;
        const dbCluster = process.env.DB_CLUSTER;

        const connectionString = `mongodb+srv://${user}:${password}@${dbhost}/?retryWrites=true&w=majority&appName=${dbCluster}`;


        await mongoose.connect(connectionString, { 
            serverSelectionTimeoutMS: 5000,
        });
        logger.info("Database connected");

    }
    catch(err){
        logger.error(err);
    }
}

module.exports = connectToDatabase;