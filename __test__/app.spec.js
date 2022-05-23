const request = require("supertest");
const db = require("../db");
const app = require("../app");



describe('API Taches', ()=> {
    beforeEach(()=> {
        db['memoryDb'] = new Map();
        db['id'] = 0;
        db['memoryDb'].set(db['id']++, { description: "Tache 1",  faite: false }) 
        db['memoryDb'].set(db['id']++, { description: "Tache 2",  faite: false })
        db['memoryDb'].set(db['id']++, { description: "Tache 3",  faite: false })
    })

    


})