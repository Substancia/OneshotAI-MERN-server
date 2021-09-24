// library imports
const express = require('express');
const cors = require('cors');

// App definition and initialization
const App = express();
App.use(cors());
const dbo = require('./db/conn');
const PORT = 8080;

// setting routes
App.use('/record', require('./routes/record'));
App.use('/resetData', require('./db/dummy'));

// App serving
App.listen(PORT, () => {
  dbo.connectToServer(err => {
    if(err) throw err
  });
  console.log('Server running at', PORT);
});