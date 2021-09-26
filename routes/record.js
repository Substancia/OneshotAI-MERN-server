/*
Module to handle routes, DB queries and other backend operations.
Routes send differnt filtered lists of records, details of specific college/student,
colleges categorized by courses offered, colleges similar to specified college,
and total number of records in 'colleges' collection in DB.
*/

const express = require('express');
const { ObjectId } = require('mongodb');
const recordRoutes = express.Router();
const dbo = require('../db/conn');

// To add new colleges into courses categorization collection.
// Iterating through list of colleges, an object adds each college into its
// properties (named with each course name) and stores the single object in a
// collection named 'catByCourses'.
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
    dbo.getDB().collection('catByCourses').updateOne({}, { $set: result }, { upsert: true },
      () => console.log('catByCourses updated!')
    );
  });
}

// function to search in DB for college with matching name/ID.
// Searches in fields name and ID in collection for a search key match.
const searchCollege = async (query, options, res) => {
  var comparisons = [{ name: query.name }];
  // checking if search key can be a valid string, then converts to ObjectId
  if(Buffer.isBuffer(query.name) || /^[0-9A-F]{24}$/i.test(query.name)) {
    comparisons.push({ _id: ObjectId(query.name) });
  }
  // searches in collections with a $or operator on list of 2 field match conditions
  dbo.getDB().collection('colleges').find({ $or: comparisons }).toArray((err, result) => {
    if(err) throw err;
    res.json(result);
  });
}

/*
  setting routes (prefix '/record')
*/

// conditionally searches collection colleges/students with received query
// and returns list of matching records
recordRoutes.post('/', (req, res) => {
  var query = req.body.query || {};
  const options = { projection: { _id: 1, name: 1, state: 1 } };
  const college = req.body.college || null;
  const student = req.body.student || null;
  // handling search (name/ID) operation
  if('type' in req.body && req.body.type === 'searchKey') {
    searchCollege(query, options, res);
  }
  // searches collection 'colleges' if no college/student is selected in FE
  else if(college == null && student == null) {
    dbo.getDB().collection('colleges').find(query, options).toArray((err, result) => {
      if(err) throw err;
      res.json(result);
      console.log('Colleges list served!');
    });
  // searches collection 'students' if a college/student is selected in FE
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

// finds and returns details of specific college/student received as parameter
recordRoutes.post('/details', (req, res) => {
  const query = req.body.query;
  var collection = '';
  // deciding whether to search in 'colleges' or 'students'
  if(req.body.collection === 'college') collection = 'colleges';
  else if(req.body.collection === 'student') collection = 'students';
  dbo.getDB().collection(collection).findOne(query, (err, result) => {
    if(err) throw err;
    res.json(result);
  });
});

// returns the single object in 'catByCourses' collection which holds categorized
// lists of colleges by courses offered
recordRoutes.post('/catByCourses', (req, res) => {
  dbo.getDB().collection('catByCourses').findOne({}, { projection: { _id: 0 } }, (err, result) => {
    if(err) throw err;
    res.json(result);
  });
});

// searches 'colleges' for colleges similar to college receive as parameter
recordRoutes.post('/getSimilarColleges', (req, res) => {
  var selectedCollege = {};
  // searching for rest of info of college name received as parameter
  dbo.getDB().collection('colleges').findOne({ name: req.body.college.name }, (err, result) => {
    if(err) throw err;
    selectedCollege = result;
    // finding all colleges from same location
    dbo.getDB().collection('colleges').find({ state: selectedCollege.state }).toArray((err, result2) => {
      if(err) throw err;
      var similar = [];
      // finding colleges with similar number of students
      result2.map(college => {
        if(Math.abs(college.students - selectedCollege.students) <= 100)
          // finding colleges that offer common courses
          if(selectedCollege.courses.some(course => college.courses.includes(course)))
            if(college.name !== req.body.college.name)
              similar.push(college);
      });
      res.json({ similar: similar });
    });
  });
});

// returns total number of colleges in DB (for charts purposes)
recordRoutes.post('/getNumberOfColleges', async (req, res) =>
  res.json({ count: await dbo.getDB().collection('colleges').count() })
);

// exporting Router
module.exports = { recordRoutes, addToCourseCategory };