const MongoClient = require('mongodb').MongoClient;
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const state = {
  db: null
};

const dbURI = process.env.MONGODB_URL;
const dbName = process.env.DB_NAME;

MongoClient.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(client => {
        console.log('Connected to Database');
        const db = client.db(dbName);
        state.db = db;
    })
    .catch(error => {
        console.error('Error in DB connection:', error);
    });

module.exports.connect = function (done) {
  const url = process.env.MONGODB_URL;
  const dbname = process.env.DB_NAME;

  MongoClient.connect(url, { useUnifiedTopology: true }, (err, data) => {
    if (err) return done(err);
    state.db = data.db(dbname);
    done();
  });
};

module.exports.get = function () {
  return state.db;
};

