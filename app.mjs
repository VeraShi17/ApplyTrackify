import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url';
import session from 'express-session';

import './config.mjs';
import './db.mjs';
import mongoose from 'mongoose';
import sanitize from 'mongo-sanitize';
import * as auth from './auth.mjs';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const loginMessages = {"PASSWORDS DO NOT MATCH": 'Incorrect password', "USER NOT FOUND": 'User doesn\'t exist'};
const registrationMessages = {"USERNAME ALREADY EXISTS": "Username already exists", "USERNAME PASSWORD TOO SHORT": "Username or password is too short"};

app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// serve static files
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

app.use((req, res, next) => {
  console.log(req.path.toUpperCase(), req.body);
  next();
});

app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
  try {
    const user = await auth.login(
      sanitize(req.body.username), 
      req.body.password
    );
    await auth.startAuthenticatedSession(req, user);
    res.redirect('/dashboard'); 
  } catch(err) {
    console.log(err);
    res.render('login', {message: loginMessages[err.message] ?? 'Login unsuccessful'}); 
  }
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', async (req, res) => {
  try {
    const newUser = await auth.register(
      sanitize(req.body.username), 
      req.body.password
    );
    await auth.startAuthenticatedSession(req, newUser);
    res.redirect('/login'); 
  } catch(err) {
    console.log(err);
    res.render('register', {message: registrationMessages[err.message] ?? 'Registration error'}); 
  }
});

app.listen(process.env.PORT || 3000);