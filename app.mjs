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

const authRequiredPaths = ['/dashboard'];

const GraduateProgramTrackerList = mongoose.model('GraduateProgramTrackerList');

app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
}));
app.use(express.json());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// serve static files
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  if(authRequiredPaths.includes(req.path)) {
    if(!req.session.user) {
      res.redirect('/login'); 
    } else {
      next(); 
    }
  } else {
    next(); 
  }
});

app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

app.use((req, res, next) => {
  console.log(req.path.toUpperCase(), req.body);
  next();
});

app.get('/', (req, res) => {
  res.redirect('/dashboard');
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

app.get('/dashboard', async (req, res) => {
  const graduateProgramTrackerLists = await GraduateProgramTrackerList.find({}).sort('-createdAt').exec();
  res.render('dashboard', {user: req.session.user, lists: graduateProgramTrackerLists});
});

app.post('/create-list', async (req, res) => {
  const { listName } = req.body;
  try {
    const existingList = await GraduateProgramTrackerList.findOne({ name: listName, user: req.session.user._id });
    
    if (existingList) {
      req.session.error = 'List name already exists. Please choose a different name.';
      return res.redirect('/dashboard');
    }

    const newList = new GraduateProgramTrackerList({
      user: req.session.user._id,
      name: listName
    });
    await newList.save();
    res.redirect(`/dashboard/${newList.slug}`);

  } catch (error) {
    console.error('Error creating new list:', error);
    res.redirect('/dashboard');
  }
});


app.get('/dashboard/:slug', async (req, res) => {
  try {
    const list = await GraduateProgramTrackerList.findOne({ slug: req.params.slug })
                                  .populate('user')
                                  .exec();

    if (!list) {
      return res.status(404).send('List not found');
    }

    res.render('trackerList', {

    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.post('/delete-list', async (req, res) => {
  try {
    const { slug } = req.body;
    await GraduateProgramTrackerList.findOneAndDelete({ slug });
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error deleting list:', error);
    res.status(500).send('Error deleting the list');
  }
});

app.post('/rename-list', async (req, res) => {
  const { slug, newName } = req.body;
  console.log('body:',req.body);

  try {
    const updatedList = await GraduateProgramTrackerList.findOneAndUpdate(
      { slug }, 
      { name: newName }, 
      { new: true } // return the new one
    );

    if (updatedList) {
      res.status(200).send('List renamed successfully');
      console.log('List renamed successfully');
    } else {
      console.log('no list');
      res.status(404).send('List not found');
      
    }
  } catch (error) {
    console.log('error');
    console.error('Error renaming list:', error);
    res.status(500).send('Error renaming the list');
  }
});

app.listen(process.env.PORT || 3000);