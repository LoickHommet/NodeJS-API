const request = require("supertest");
const db = require("../db");
const app = require("../app");
const Accounts = require("../app");
const { isTypedArray } = require("util/types");

const mapToObj = (m) => {
    return Array.from(m).reduce((obj, [key, value]) => {
      obj[key] = value;
      return obj;
    }, {});
  };

describe.skip('API Taches', ()=> {
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

    it("GET /api/tache:id ", async () => {
        const res = await request(app)
          .get("/api/tache/1")
          .expect(200)
          .expect("content-type", /json/);
        expect(JSON.parse(res.text)).toMatchObject(db.memoryDb.get(1));
      });


    it.skip("POST /api/taches", async () => {
        let tache = { description: "Tache 4",  faite: false };
        let id = db.id;
        const res = await request(app)
            .post("/api/taches")
            .send(tache)
            .expect(201)
            .expect("content-type", /json/);

        expect(db.memoryDb.get(id)).toMatchObject(tache);
    });

    // it.each([{description:"T"},{faite: false} , {description:''}, {faite:""}, {description: "tache 7"}, {faite: "pas bon"}])(
    //     "GET /api/tache:id avec joi",
    //     async(invalidObjet)=> {
    //         let idDebut = db.id;
    //         const result = await request(app)
    //             .post("/api/taches")
    //             .send(invalidObjet)
    //             .expect(400)
    //         let idFin = db.id;
    //             expect(idFin).toBe(idDebut);
    //     }
    //    );

       it.skip("PUT /api/tache/:id ", async () => {
        let modification = { description: "Tache Modififier",  faite: true };
        const res = await request(app)
          .put("/api/tache/1")
          .send(modification)
          .expect(204);
        expect(modification).toMatchObject(db.memoryDb.get(1));
      });

       it.each([{description:"T"},{faite: false} , {description:''}, {faite:""}, {description: "tache 7"}, {faite: "pas bon"}])
       ("PUT /api/tache/:id ", async () => {
        async(invalidObjet)=> {
                    let idDebut = db.id;
                    const result = await request(app)
                        .put("/api/taches/1")
                        .send(invalidObjet)
                        .expect(400)
                    let idFin = db.id;
                        expect(idFin).toBe(idDebut);
                }
      });
      
      it.skip("DELETE /api/tache/:id ", async () => {
        const res = await request(app)
        delete('api/tache/2')
        .expect(401)
        .expect("content-type", /json/);
      
      });


})


describe('POST /register', () => {
    it.each([
        {email: "helloWorld", password: "1234", username: "loolo"},
        {email: "AQS", password: "", username: "loolo"},
        {email: "blopi@dz", username: "loolo"},
        {email: "dzadzad", passworde: "456", username: "loick"}
    ])("Should refuse without inserting it", async (objectTest) => {
        const idDebut = Accounts.id;
        const result = await request(app)
            .post('/register')
            .send(objectTest)
            .expect(400);
        const idFin = Accounts.id;
        expect(idFin).toBe(idDebut);
    });
});

describe('POST /login', () => {
    it.each([
        {email: "example@example.com", password: "1234", username: "loick"},
        {email: "example1@example.com", password: "1234", username: "loick"},
        {email: "example2@example.com", password: "1234", username: "loick"}
    ])('Should Cannot connect', async (objectTest) => {
        const register = await request(app)
            .post("/register")
            .send(objectTest)
            .expect(201);
        objectTest.password = "";
        const login = await request(app).post("/login").send(objectTest).expect(400);
    });
});