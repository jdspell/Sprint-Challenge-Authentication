const axios = require('axios');
const bcrypt = require('bcryptjs');

const db = require('../database/dbConfig.js');

const { authenticate } = require('../auth/authenticate');

module.exports = server => {
  server.post('/api/register', register);
  server.post('/api/login', login);
  server.get('/api/jokes', authenticate, getJokes);
};

async function register(req, res) {
  // implement user registration
  try{
    const newUser = req.body;

    newUser.password = bcrypt.hashSync(newUser.password, 8);

    const [id] = await db('users').insert(newUser);

    const user = await db('users')
      .where({ id: id })
      .first();
  
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json(error);
  }
}

async function login(req, res) {
  // implement user login
  try {
    const { username, password } = req.body;

    // const user = await db('users')
    //   .where({ username: username })
    //   .first();
    
    // if(user && bcrypt.compareSync(user.password, password)){ 
    //   res.status(200).json({ message: "logged in" });
    // } else {
    // }

  } catch (error) {
    res.status(500).json(error);
  }
}

function getJokes(req, res) {
  const requestOptions = {
    headers: { accept: 'application/json' },
  };

  axios
    .get('https://icanhazdadjoke.com/search', requestOptions)
    .then(response => {
      res.status(200).json(response.data.results);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error Fetching Jokes', error: err });
    });
}
