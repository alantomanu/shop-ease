const MongoClient = require('mongodb').MongoClient;
const dotenv = require('dotenv');


dotenv.config();

const state = {
  db: null
};

module.exports.connect = function (done) {
  const url = process.env.MONGODB_URL;
  const dbname = process.env.DB_NAME;

  if (state.db) return done(); 

  MongoClient.connect(url, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
  })
    .then(client => {
      state.db = client.db(dbname);
      console.log('Database connected successfully');
      done();
    })
    .catch(err => {
      console.error('Database connection error:', err);
      done(err);
    });
};

module.exports.get = function () {
  if (!state.db) {
    throw new Error('Database not initialized. Call connect() first.');
  }
  return state.db;
};

module.exports.close = function(done) {
  if (state.db) {
    state.db.close()
      .then(() => {
        state.db = null;
        done();
      })
      .catch(done);
  }
};

