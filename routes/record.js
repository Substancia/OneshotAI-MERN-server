// setting Express Router app and db connection
const express = require('express');
const recordRoutes = express.Router();
const dbo = require('../db/conn');

// to add new colleges into courses categorization collection
// (currently used only in dummy data setting)
const addToCourseCategory = colleges => {
  dbo.getDB().collection('catByCourses').findOne({}, (err, result) => {
    if(err) throw err;
    if(result == null) result = {};
    colleges.map(college => {
      college.courses.map(course => {
        if(!(course in result)) result[course] = [];
        result[course].push(college);
      });
    });
    // console.log(result);
    dbo.getDB().collection('catByCourses').updateOne({}, { $set: result }, { upsert: true },
      () => console.log('catByCourses updated!')
    );
  });
}

// setting routes (prefix '/record')
recordRoutes.post('/', (req, res) => {
  const query = req.body.query || {};
  const options = { projection: { _id: 1, name: 1, state: 1 } };
  const college = req.body.college || null;
  if(college == null) {
    dbo.getDB().collection('colleges').find(query, options).toArray((err, result) => {
      if(err) throw err;
      res.json(result);
      console.log('Colleges list served!');
    });
  } else {
    dbo.getDB().collection('students').find({...query, college: college}, options)
      .toArray((err, result) => {
        if(err) throw err;
        res.json(result);
        console.log('Students list served!');
      }
    );
  }
});

recordRoutes.post('/details', (req, res) => {
  const query = req.body.query;
  dbo.getDB().collection('colleges').findOne(query).toArray((err, result) => {
    if(err) throw err;
    res.json(result);
  });
});

recordRoutes.post('/catByCourses', (req, res) => {
  dbo.getDB().collection('catByCourses').findOne({}, { projection: { _id: 0 } }, (err, result) => {
    if(err) throw err;
    res.json(result);
  });
});

// exporting Router
module.exports = { recordRoutes, addToCourseCategory };