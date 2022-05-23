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

  const mongoose = require('mongoose');
  mongoose.connect('mongodb://localhost:27017/NodeJS-Api')
    .then(() => console.log('Connected to mongo'))
    .catch((err) => console.error('Pas pu se connecter,', err))
  
const app = express();

const schemaJoi = Joi.object({
    _id: Joi.required(),
    name: Joi.string().min(2).max(50).required(),
    username: Joi.string().min(2).max(50).required(),
    email: Joi.string().max(255).email().required()
});

const userSchema = new mongoose.Schema({
    name: String,
    username: String,
    username: email
});

const User = mongoose.model('User', userSchema);

async function createUser(obj){
    const user = new User(obj);
    const {value, error} = schemaJoi.validate(user._doc);
    console.log(value);
    if (error) {
        console.log(error.details[0].message);
    }
    return await user.save();
}


app.post('/registerMango', (res, req) => {
    createUser({
        name: "Lisa",
        username: "Kos",
        isAdmin: true,
        age: 24
    })
})

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

  app.get('/api/tache', [authToken], (req, res) => {
    const user = Accounts.getOne(req.user.id);

    delete user.password;
    res.json(mapToObj(db.memoryDb));
})

app.get('/api/tache/:id', (req, res) => {
    let id = parseInt(req.params.id)
    res.json(db.memoryDb.get(id));
  })

  app.post('/api/taches', (req, res) => {
    const whoami = Accounts.getOne(req.user.id)
    if (!whoami.isAdmin) return res.status(403).json({erreur: "Vous n'avez pas le droit d'accéder à ça"})
      
    delete user.password; // on ne veut pas transmettre le Hash.
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
    const user = Accounts.getOne(parseInt(req.params.id))
  })

  app.put('/api/tache/:id', (req, res) => {
    const whoami = Accounts.getOne(req.user.id)
    if (!whoami.isAdmin) return res.status(403).json({erreur: "Vous n'avez pas le droit d'accéder à ça"})
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
    const user = Accounts.getOne(parseInt(req.params.id))

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
