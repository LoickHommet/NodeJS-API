const request = require("supertest");
const db = require("../db");
const app = require("../app");
const { isTypedArray } = require("util/types");

const mapToObj = (m) => {
    return Array.from(m).reduce((obj, [key, value]) => {
      obj[key] = value;
      return obj;
    }, {});
  };

describe('API Taches', ()=> {
    beforeEach(()=> {
        db['memoryDb'] = new Map();
        db['id'] = 0;
        db['memoryDb'].set(db['id']++, { description: "Tache 1",  faite: false }) 
        db['memoryDb'].set(db['id']++, { description: "Tache 2",  faite: false })
        db['memoryDb'].set(db['id']++, { description: "Tache 3",  faite: false })
    })

    it('GET api name', async ()=> {
        const res   = await request(app)
            .get("/api/tache")
            .expect(200)
            .expect("content-type", /json/);
        expect(JSON.parse(res.text)).toMatchObject(mapToObj(db.memoryDb));
    })


})