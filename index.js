// library imports
const express = require('express');
const cors = require('cors');
const { recordRoutes } = require('./routes/record');

// App definition and initialization
const App = express();
App.use(express.json());
App.use(cors());
const dbo = require('./db/conn');
const PORT = 8080;

// setting routes
App.use('/record', recordRoutes);
App.use('/resetData', require('./db/dummy'));

// App serving
App.listen(PORT, () => {
  dbo.connectToServer(err => {
    if(err) throw err
  });
  console.log('Server running at', PORT);
});