import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url';
import session from 'express-session';
import moment from 'moment'; 

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

const authRequiredPaths = ['/dashboard','/verify-email'];

const GraduateProgramTrackerList = mongoose.model('GraduateProgramTrackerList');
const GraduateProgramTracker = mongoose.model('GraduateProgramTracker');

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
  const basePath = req.path.split('/')[1];  
  if (authRequiredPaths.includes(`/${basePath}`)) {
    if (!req.session.user) {
      return res.redirect('/login');
    }
  }
  next();
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
  if (req.session.user) {
    res.redirect('/dashboard');
  } else {
    res.render('login');
  }
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
  if (req.session.user) {
    res.redirect('/dashboard');
  } else {
    res.render('register');
  }
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
  try {
      const today = moment().startOf('day');
      const tomorrow = moment(today).add(1, 'days');

      const graduateProgramTrackerLists = await GraduateProgramTrackerList.find({
        user: req.session.user._id 
      }).sort('-createdAt').exec();

      // Find trackers with today's deadline
      const todayTrackers = await GraduateProgramTracker.find({
          user: req.session.user._id,
          deadline: {
              $gte: today.toDate(),
              $lt: tomorrow.toDate()
          }
      }).populate('graduateTrackerList').exec();

      // Format trackers for display
      const formattedTodayTrackers = todayTrackers.map(tracker => ({
          ...tracker._doc,
          deadline: moment(tracker.deadline).format('YYYY-MM-DD'),
          university: tracker.university,
          program: tracker.program,
          link: `/dashboard/${tracker.graduateTrackerList.slug}`
      }));

      // Find recent trackers excluding today
      const recentTrackers = await GraduateProgramTracker.find({
        user: req.session.user._id,
        deadline: { $gte: today.toDate() }  
    }).sort({ deadline: 1 }).limit(10).populate('graduateTrackerList').exec();

      // Format these as well
      const formattedRecentTrackers = recentTrackers.map(tracker => ({
          ...tracker._doc,
          deadline: moment(tracker.deadline).format('YYYY-MM-DD'),
          university: tracker.university,
          program: tracker.program,
          link: `/dashboard/${tracker.graduateTrackerList.slug}`
      }));

      const allTrackers = await GraduateProgramTracker.find({ user: req.session.user._id })
      .populate('graduateTrackerList')
      .exec();

      const calendarTrackers = allTrackers.map(tracker => ({
        ...tracker.toObject(),
        deadline: moment(tracker.deadline).format('YYYY-MM-DD'),
        link: `/dashboard/${tracker.graduateTrackerList.slug}`
      }));

      res.render('dashboard', {
          user: req.session.user,
          lists: graduateProgramTrackerLists,
          todayTrackers: formattedTodayTrackers,
          recentTrackers: formattedRecentTrackers,
          allTrackers: calendarTrackers
      });
  } catch (error) {
      console.error('Dashboard loading failed:', error);
      res.status(500).send('Server error');
  }
});


app.post('/dashboard/create-list', async (req, res) => {
  const { listName } = req.body;
  try {
    const existingList = await GraduateProgramTrackerList.findOne({ name: listName, user: req.session.user._id });
    
    if (existingList) {
      return res.status(400).json({ message: 'List name already exists. Please choose a different name.' });
    }

    const newList = new GraduateProgramTrackerList({
      user: req.session.user._id,
      name: listName
    });
    await newList.save();
    res.json({ message: 'List created successfully!', slug: newList.slug });

  } catch (error) {
    console.error('Error creating new list:', error);
    res.status(500).json({ message: 'Failed to create the list due to server error.' });
  }
});


app.get('/dashboard/:slug', async (req, res) => {
  try {
    const list = await GraduateProgramTrackerList.findOne({ slug: req.params.slug })
                                  .populate({
                                    path: 'graduateTrackers',  
                                    model: 'GraduateProgramTracker'
                                  })
                                  .exec();

    if (!list) {
      return res.status(404).send('List not found');
    }

    const trackersWithFormattedDates = list.graduateTrackers.map(tracker => ({
      ...tracker.toObject(), 
      deadline: moment(tracker.deadline).format('YYYY-MM-DD') 
    }));

    res.render('trackerList', {
      list: list,
      trackers: trackersWithFormattedDates
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.post('/dashboard/delete-list', async (req, res) => {
  try {
    const { slug } = req.body;
    await GraduateProgramTrackerList.findOneAndDelete({
      slug,
      user: req.session.user._id
    });
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error deleting list:', error);
    res.status(500).send('Error deleting the list');
  }
});

app.post('/dashboard/rename-list', async (req, res) => {
  const { slug, newName } = req.body;

  try {
    const updatedList = await GraduateProgramTrackerList.findOneAndUpdate({
      slug,
      user: req.session.user._id
    }, {
      name: newName
    }, {
      new: true
    });

    if (updatedList) {
      res.status(200).json({ message: 'List renamed successfully' });
    } else {
      res.status(404).json({ error: 'List not found' });
    }
  } catch (error) {
    console.error('Error renaming list:', error);
    res.status(500).json({ error: 'Error renaming the list' });
  }
});


app.get('/dashboard/:slug/create-tracker', async (req, res) => {
  try {
    const list = await GraduateProgramTrackerList.findOne({ slug: req.params.slug });

    if (!list) {
      return res.status(404).send('List not found');
    }
    res.render('createTracker', {
      list: list 
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.post('/dashboard/:slug/create-tracker', async (req, res) => {
  try {
    const { university, program, deadline, submissionStatus, applicationStatus, url, requirements, memo } = req.body;
    const formattedDeadline = moment(deadline, 'YYYY-MM-DD').toDate();
    const list = await GraduateProgramTrackerList.findOne({ slug: req.params.slug });
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    const tracker = new GraduateProgramTracker({
      user: req.session.user._id,
      graduateTrackerList: list._id, 
      university,
      program,
      deadline: formattedDeadline,
      submissionStatus,
      applicationStatus,
      url,
      requirements,
      memo
    });
    await tracker.save();

    list.graduateTrackers.push(tracker._id);
    await list.save();

    res.json({ message: 'Tracker added successfully!', slug: req.params.slug });
  } catch (error) {
    console.error('Failed to create tracker:', error);
    res.status(500).json({ error: 'Failed to create tracker due to server error.' });
  }
});



app.post('/dashboard/:listSlug/:trackerId/delete-tracker', async (req, res) => {
  try {
    await GraduateProgramTracker.findByIdAndDelete(req.params.trackerId);
    res.redirect(`/dashboard/${req.params.listSlug}`);
  } catch (error) {
    console.error('Failed to delete the tracker:', error);
    res.status(500).send('Server error');
  }
});

app.get('/dashboard/:listSlug/:trackerId/edit', async (req, res) => {
  try {
    const tracker = await GraduateProgramTracker.findById(req.params.trackerId).exec();
    if (!tracker) {
      return res.status(404).send('Tracker not found');
    }

    res.render('trackerEdit', {
      listSlug: req.params.listSlug, 
      tracker: tracker
    });
  } catch (error) {
    console.error('Error retrieving the tracker:', error);
    res.status(500).send('Server error');
  }
});

app.post('/dashboard/:listSlug/:trackerId/edit', async (req, res) => {
  const { listSlug, trackerId } = req.params;
  const { university, program, deadline, submissionStatus, applicationStatus, url, requirements, memo } = req.body;

  try {
    const formattedDeadline = moment(deadline, 'YYYY-MM-DD').toDate();

    const updatedTracker = await GraduateProgramTracker.findByIdAndUpdate(
      {_id: trackerId, user: req.session.userId}, {
      university,
      program,
      deadline: formattedDeadline,
      submissionStatus,
      applicationStatus,
      url,
      requirements,
      memo
    }, { new: true }); 

    if (!updatedTracker) {
      res.status(404).send({ error: "Tracker not found" });
    } else {
      res.send({ message: "Tracker updated successfully!", slug: listSlug });
    }
  } catch (error) {
    console.error('Failed to update tracker:', error);
    res.status(500).send({ error: 'Failed to update tracker due to server error.' });
  }
});


app.listen(process.env.PORT || 3000);