const express = require('express')
const fs = require('fs')
const path = require('path')
const db = require('./db');



const app = express();

app.use(express.json());

const mapToObj = (m) => {
    return Array.from(m).reduce((obj, [key, value]) => {
      obj[key] = value;
      return obj;
    }, {});
  };

  app.get('/api/tache', (req, res) => {
    res.json(mapToObj(db.memoryDb));
})

app.get('/api/tache/:id', (req, res) => {
    let id = parseInt(req.params.id)
    res.json(db.memoryDb.get(id));
  })





module.exports = app;
