const express = require('express');
require('express-async-errors');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();


const app = express();

app.use(express.json());






app.listen(3000, '127.0.0.1', () => {
    console.log("Server ecoute")
})

module.exports = app;