import mongoose from 'mongoose';

// User model
const User = new mongoose.Schema({
  // maybe username, hash, email could be addressed by plugin
  username: { type: String, required: true },
  hash: { type: String, required: true }, 
  email: { type: String, required: true }, 
  graduateProgramTrackerLists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GraduateProgramTrackerList'}],
  jobTrackerLists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'JobTrackerList'}]
});

// Graduate Program Tracker List model
const GraduateProgramTrackerList = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  graduateTrackers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GraduateProgramTracker'}]
});

// Graduate Program Tracker model
const GraduateProgramTracker = new mongoose.Schema({
  graduateTrackerList: { type: mongoose.Schema.Types.ObjectId, ref: 'GraduateProgramTrackerList', required: true },
  university: { type: String, required: true },
  program: { type: String, required: true },
  deadline: { type: Date, required: true },
  submissionStatus: { type: String, required: true },
  applicationStatus: { type: String, required: true },
  url: { type: String, required: true },
  requirements: { type: String, required: true },
  memo: String,
});

// Job Tracker List model
const JobTrackerList = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  jobTrackers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'JobTracker'}]
});

// Job Tracker model
const JobTracker = new mongoose.Schema({
  jobTrackerList: { type: mongoose.Schema.Types.ObjectId, ref: 'JobTrackerList', required: true },
  company: { type: String, required: true },
  position: { type: String, required: true },
  location: { type: String, required: true },
  deadline: { type: Date, required: true },
  submissionStatus: { type: String, required: true },
  applicationStatus: { type: String, required: true },
  url: { type: String, required: true },
  qualifications: { type: String, required: true },
  memo: String,
});

// Register the models
mongoose.model('User', User);
mongoose.model('GraduateProgramTrackerList', GraduateProgramTrackerList);
mongoose.model('GraduateProgramTracker', GraduateProgramTracker);
mongoose.model('JobTrackerList', JobTrackerList);
mongoose.model('JobTracker', JobTracker);

// TODO: Add the rest of your database setup here (e.g., connection setup, model registration, etc.)
