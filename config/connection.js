const mongoClient = require('mongodb').MongoClient;
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const state = {
  db: null
};

module.exports.connect = function (done) {
  const url = process.env.MONGODB_URL;
  const dbname = process.env.DB_NAME;

  mongoClient.connect(url, { useUnifiedTopology: true }, (err, data) => {
    if (err) return done(err);
    state.db = data.db(dbname);
    done();
  });
};

module.exports.get = function () {
  return state.db;
};

