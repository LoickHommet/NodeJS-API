db = {
    memoryDb: new Map(),
    id:0,
    description:"",
    faite: false
  
  }
  
  // populate
  db['memoryDb'].set(db['id']++, { description: "Tache 1",  faite: false }) 
  db['memoryDb'].set(db['id']++, { description: "Tache 2",  faite: false })
  db['memoryDb'].set(db['id']++, { description: "Tache 3",  faite: false })
  
  module.exports = db