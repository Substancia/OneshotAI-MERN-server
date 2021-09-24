const express = require('express');
const { ObjectId } = require('mongodb');

const recordRoutes = express.Router();

const dbo = require('../db/conn');

recordRoutes.post('/', (req, res) => {
  const query = req.body.query;
  const options = { projection: { _id: 1, name: 1 } };
  if(req.body.college != null) {
    dbo.getDB().collection('colleges').find(query, options).toArray((err, result) => {
      if(err) throw err;
      res.json(result);
    });
  } else {
    dbo.getDB().collection('students').find(query, options).toArray((err, result) => {
      if(err) throw err;
      res.json(result);
    });
  }
});

recordRoutes.post('/details', (req, res) => {
  const query = req.body.query;
  dbo.getDB().collection('colleges').findOne(query).toArray((err, result) => {
    if(err) throw err;
    res.json(result);
  });
});

module.exports = recordRoutes;