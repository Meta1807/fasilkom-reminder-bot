var knex = require('knex')({
    client: 'mysql',
    connection: {
      host : '127.0.0.1',
      user : 'USERNAME',
      password : 'PASSWORD',
      database : 'fasilkom-reminder'
    }
});

module.exports = knex