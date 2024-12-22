require('dotenv').config();

const mongoose = require('mongoose');

const mongoURI = process.env.MONGO_URL;

const connectToMongo = ()=>{
    mongoose.connect(mongoURI, )
    .then(() => console.log('Successfully connected to elevate-financials database'))

    .catch((err) => { console.error(err); });
}

module.exports = connectToMongo;