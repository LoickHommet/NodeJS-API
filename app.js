const express = require('express')
const fs = require('fs')
const path = require('path')
const db = require('./db');
const Collection = require('./Collection');
const Joi = require("joi");
// const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Accounts = new Collection('Accounts');
require('dotenv').config();
if (!process.env.SECRET_KEY) {
    console.log("ERREUR: vous devez créer une variable d'env SECRET_KEY");
    process.exit(1);
  }

const app = express();

const hash = (mdp, salt) =>{
  
    return  mdp = mdp + salt
}
//console.log(hash("test", 123))  

app.use(express.json());

// TACHE

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

  app.put('/api/tache/:id', (req, res) => {
    let id = parseInt(req.params.id)
     const payload = req.body;
    const schema = Joi.object({
        description: Joi.string().min(2).max(50).required(),
        faite : Joi.boolean
    })

    const { value, error} = schema.validate(payload)
    if(error)res.status(400).send({erreur : error.details[0].message})
    else{
        db.memoryDb.set(id, payload);
        res.status(204).json({
            description: value.description,
            faite: value.faite
        })
    }

  })

  app.delete('/api/tache/:id', (req, res) => {
    let id = req.params.id;
    db.memoryDb.delete(id);
  return res.status({ message: 'Deleted' }).end();
  })

  // USER


  function authToken(req, res, next){
    const token = req.header('x-auth-token');
    if (!token) {
        throw new Error('Vous devez vous connecté');
    }
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        console.log(decoded)
        req.user = decoded;
        next();
    } catch (error) {
        throw new Error('Token invalide');
    }
}

  app.post('/register', async (req, res) => {
    const payload = req.body;

    const scheme = Joi.object({
        email: Joi.string().max(255).email().required(),
        password: Joi.string().max(255).required(),
        username: Joi.string().max(255).required()
    });
    const {value: account, error} = scheme.validate(payload);
    if (error) {
        throw new Error(error.details[0].message);
    }

    const {id, found} = Accounts.findByProperty('email', account.email);
    if (found) {
        throw new Error("Un compte existe déja");
    }
    // Hash du mot de passe avec bcrypt
    // const salt = await bcrypt.genSalt(10);
    // const passwordHash = await bcrypt.hash(account.password, salt);
   
    const salt = 1245;
    const passwordHash = hash(account.password, salt)
     account.password = passwordHash;

    Accounts.insertOne(account);

    res.status(201).send('L \' utilisateur est inscrit : ' + account.email);
});


app.post('/login', async (req, res) => {
    const payload = req.body;
    const scheme = Joi.object({
        email: Joi.string().max(255).email().required(),
        password: Joi.string().max(255).required(),
        username: Joi.string().max(255).required()
    });
    const {value, error} = scheme.validate(payload);
    if (error) {
        throw new Error(error.details[0].message);
    }
    const {id, found: account} = Accounts.findByProperty('email', value.email);
    if (!account) {
        throw new Error("Ce compte n'existe pas");
    }
    // Comparaison des hash avec bryct
    // const passwordValid = await bcrypt.compare(payload.password, account.password);
    // if (!passwordValid) {
    //     throw new Error('Mot de passe invalide');
    // }
    const salt = 1245;
    const passwordValid  = payload.password == hash(account.password, salt)
        if (!passwordValid) {
            throw new Error('Mot de passe invalide');
        }

    const token = jwt.sign({id}, process.env.SECRET_KEY);
    res.header('x-auth-token', token).status(200).send("Connexion réussie");
});

module.exports = app;
