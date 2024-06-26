import mongoose from 'mongoose';
// import mongooseSlugPlugin from 'mongoose-slug-plugin';
import slug from 'mongoose-slug-updater';

mongoose.plugin(slug);

mongoose.connect(process.env.DSN);

// User model
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  hash: { type: String, required: true }, 
  email: { type: String, required: false }, 
  graduateProgramTrackerLists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GraduateProgramTrackerList'}],
  slug: { type: String, required: true, default: function() { return this.username; } }
});

// Graduate Program Tracker List model
const GraduateProgramTrackerList = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  graduateTrackers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GraduateProgramTracker'}],
  slug: { type: String, slug: "name", unique: true, slugPaddingSize: 4 }
}, { timestamps: true });

// Graduate Program Tracker model
const GraduateProgramTracker = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  graduateTrackerList: { type: mongoose.Schema.Types.ObjectId, ref: 'GraduateProgramTrackerList', required: true },
  university: { type: String, required: true },
  program: { type: String, required: true },
  deadline: { type: Date, required: true },
  submissionStatus: { type: String, required: true },
  applicationStatus: { type: String, required: true },
  url: { type: String, required: true },
  requirements: { type: String, required: true },
  memo: String,
}, { timestamps: true });

// User.plugin(mongooseSlugPlugin, {tmpl: '<%=username%>'});
// GraduateProgramTrackerList.plugin(mongooseSlugPlugin, {tmpl: '<%=name%>'});

// Register the models
mongoose.model('User', UserSchema);
mongoose.model('GraduateProgramTrackerList', GraduateProgramTrackerList);
mongoose.model('GraduateProgramTracker', GraduateProgramTracker);
