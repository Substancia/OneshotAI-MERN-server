// setting Express Router app and db connection
const express = require('express');
const { ObjectId } = require('mongodb');
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

const searchCollege = async (query, options, res) => {
  var searchFields = 2;
  while(searchFields > 0) {
    await new Promise((resolve, reject) => {
      dbo.getDB().collection('colleges').find(query, options).toArray((err, result) => {
        if(err) throw err;
        if(result.length > 0) {
          res.json(result);
          console.log('Searched college served!');
          return;
        }
        if(Buffer.isBuffer(query.name) || /^[0-9A-F]{24}$/i.test(query.name)) {
          query = { ...query, _id: ObjectId(query.name) };
          delete query.name;
          resolve();
        } else {
          res.json([]);
          return;
        }
      });
    }).then(searchFields -= 1);
  }
  res.json([]);
}

// setting routes (prefix '/record')
recordRoutes.post('/', (req, res) => {
  var query = req.body.query || {};
  const options = { projection: { _id: 1, name: 1, state: 1 } };
  const college = req.body.college || null;
  const student = req.body.student || null;
  if('type' in req.body && req.body.type === 'searchKey') {
    searchCollege(query, options, res);
  }
  else if(college == null && student == null) {
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
  var collection = '';
  if(req.body.collection === 'college') collection = 'colleges';
  else if(req.body.collection === 'student') collection = 'students';
  dbo.getDB().collection(collection).findOne(query, (err, result) => {
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

recordRoutes.post('/getSimilarColleges', (req, res) => {
  var selectedCollege = {};
  dbo.getDB().collection('colleges').findOne({ name: req.body.college.name }, (err, result) => {
    if(err) throw err;
    selectedCollege = result;
    dbo.getDB().collection('colleges').find({ state: selectedCollege.state }).toArray((err, result2) => {
      if(err) throw err;
      var similar = [];
      result2.map(college => {
        if(Math.abs(college.students - selectedCollege.students) <= 100)
          if(selectedCollege.courses.some(course => college.courses.includes(course)))
            if(college.name !== req.body.college.name)
              similar.push(college);
      });
      res.json({ similar: similar });
    });
  });
});

recordRoutes.post('/getNumberOfColleges', async (req, res) =>
  res.json({ count: await dbo.getDB().collection('colleges').count() })
);

// exporting Router
module.exports = { recordRoutes, addToCourseCategory };