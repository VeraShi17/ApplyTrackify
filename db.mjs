import mongoose from 'mongoose';
import mongooseSlugPlugin from 'mongoose-slug-plugin';

mongoose.connect(process.env.DSN);

// User model
const User = new mongoose.Schema({
  // maybe username, hash, email could be addressed by plugin
  username: { type: String, required: true },
  hash: { type: String, required: true }, 
  email: { type: String, required: false }, 
  graduateProgramTrackerLists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GraduateProgramTrackerList'}],
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

// Register the models
mongoose.model('User', User);
mongoose.model('GraduateProgramTrackerList', GraduateProgramTrackerList);
mongoose.model('GraduateProgramTracker', GraduateProgramTracker);
