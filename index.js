/*
Main server file, imports routes and DB connection as modules
*/

// library imports
const express = require('express');
const cors = require('cors');
const { recordRoutes } = require('./routes/record');    // importing for routes

// App definition and initialization
const App = express();
App.use(express.json());
App.use(cors());
const dbo = require('./db/conn');   // importing for DB connection
const PORT = 8080;

// setting routes
App.use('/record', recordRoutes);
App.use('/resetData', require('./db/dummy'));   // misc: to reset DB collections during testing

// App serving
App.listen(PORT, () => {
  dbo.connectToServer(err => {
    if(err) throw err
  });
  console.log('Server running at', PORT);
});