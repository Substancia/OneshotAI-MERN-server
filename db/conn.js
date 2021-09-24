const { MongoClient } = require('mongodb');
const URL = 'mongodb+srv://sentienta:mongoSentienta7@cluster0.jih6w.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
const dbname = 'OneshotAI';

const client = new MongoClient(URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// for storing db object
let _db;

module.exports = {
  // connect function
  connectToServer: (callback) => {
    client.connect((err, db) => {
      if(db) {
        _db = db.db(dbname);
        console.log('Successfully connected to MongoDB!');
      }
      return callback(err);
    });
  },

  // getter function
  getDB: () => _db,
};