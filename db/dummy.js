/*
Misc. module: To populate with randomized dummy data.
*/

// set of locations (colleges) to randmoize from
var locations = [
  {
    country: 'India',
    states: [
      {
        state: 'Kerala',
        cities: ['Thrissur', 'Ernakulam', 'Calicut', 'Trivandrum', 'Palakkad', 'Wayanad'],
      },
      {
        state: 'Tamil Nadu',
        cities: ['Chennai', 'Mahabalipuram', 'Tanjavore', 'Kanjipuram', 'Coimbatore'],
      },
      {
        state: 'Karnataka',
        cities: ['Banaglore', 'Hosur', 'Mysore', 'Bailakuppe', 'Mangalore'],
      },
    ],
  },
];
// set of courses (colleges) to randomize from
var courses = ['Computer Science', 'Electronics', 'IT', 'Science', 'Arts', 'Mechanics'];
// set of skills (students) to randomize from
var skills = ['C++', 'Java', 'C', 'Python', 'Javascript', 'R', 'Mathematica', 'Matlab', 'Ruby', 'Lisp'];

// creating a list of 100 colleges with randomized data
var colleges = [];
for(var i = 0; i < 99; ++i) {
  var state = locations[0]['states'][Math.floor(3 * Math.random())];
  colleges.push({
    name: 'College' + ('0' + i).slice(-2),
    year: Math.floor(Math.random() * 60 + 1950),
    city: state.cities[Math.floor(Math.random() * state.cities.length)],
    state: state.state,
    country: 'India',
    students: 100,
    courses: courses.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * courses.length)),
  });
}

// adding a single college from a new state
colleges.push({
  name: 'College99',
  year: Math.floor(Math.random() * 60 + 1950),
  city: 'Pune',
  state: 'Maharashtra',
  country: 'India',
  students: 100,
  courses: courses.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * courses.length)),
});

// creating a list of 10000 students (100 per college) with randomized data
var students = [];
for(i = 0; i < 100*colleges.length; ++i) {
  var college = 'College' + ('0' + Math.floor(i / 100)).slice(-2);
  students.push({
    name: 'Student' + i,
    college: college,
    year: Math.floor(Math.random() * 20 + 2000),
    collegeId: 'COL' + college.slice(-2) + 'S' + ('0' + Math.floor(i)).slice(-2),
    skills: skills.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * skills.length)),
  });
}

const express = require('express');
const Reset = express.Router();
const dbo = require('./conn');
const { addToCourseCategory } = require('../routes/record');

// setting API endpoint to reset data in DB
Reset.get('/', (req, res) => {
  // dropping and writing 'colleges' collection
  dbo.getDB().listCollections({name: 'colleges'}).next(async (err, collinfo) => {
    if(collinfo)
    await dbo.getDB().collection('colleges').drop(err => {
      if(err) throw err;
      console.log('Dropped collection "colleges"!');
    });
    dbo.getDB().collection('colleges').insertMany(colleges, (err, result) => {
      if(err) throw err;
      console.log(result.insertedCount + ' documents inserted into collection "colleges"!');
    });
  });

  // dropping and writing 'students' collection
  dbo.getDB().listCollections({name: 'students'}).next(async (err, collinfo) => {
    if(collinfo)
    await dbo.getDB().collection('students').drop(err => {
      if(err) throw err;
      console.log('Dropped collection "students"!');
    });
    dbo.getDB().collection('students').insertMany(students, (err, result) => {
      if(err) throw err;
      console.log(result.insertedCount + ' documents inserted into collection "students"!');
    });
  });

  // dropping and writing collection with data on college categories by courses offered
  dbo.getDB().listCollections({name: 'catByCourses'}).next(async (err, collinfo) => {
    if(collinfo)
    await dbo.getDB().collection('catByCourses').drop(err => {
      if(err) throw err;
      console.log('Dropped collection "catByCourses"!');
      addToCourseCategory(colleges);
    });
  });
  
  res.json({ status: 'Success', colleges: 100, students: 100*100 });
});

module.exports = Reset;