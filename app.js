const express = require('express')
const fs = require('fs')
const path = require('path')
const db = require('./db');
const Joi = require("joi");


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

  app.post('/api/taches', (req, res) => {
    const payload = req.body
    const schema = Joi.object({
        description: Joi.string().min(2).max(50).required(),
        faite : Joi.boolean
    })

    const { value, error} = schema.validate(payload)
    if(error)res.status(400).send({erreur : error.details[0].message})
    else{
        db.memoryDb.set(db['id']++, payload);
        res.status(201).json({
            description: value.description,
            faite: value.faite
        })
    }

  })




module.exports = app;
