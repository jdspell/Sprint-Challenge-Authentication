const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const db = require('../database/dbConfig.js');

const { authenticate, jwtKey } = require('../auth/authenticate');

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

    const user = await db('users')
      .where({ username: username })
      .first();
    
    if(user && bcrypt.compareSync(password, user.password)){
      
      const token = generateToken(user);
      console.log(token);
      res.status(200).json({ 
        message: "logged in",
        token
      });

    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }

  } catch (error) {
    res.status(500).json(error);
  }
}

function generateToken(user) {
  const payload = {
    subject: user.id,
    username: user.username
  };

  const options = {
    expiresIn: '1d',
  };

  return jwt.sign(payload, jwtKey, options);
};

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
