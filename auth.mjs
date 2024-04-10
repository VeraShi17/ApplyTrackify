import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const User = mongoose.model('User');

const startAuthenticatedSession = (req, user) => {
    return new Promise((fulfill, reject) => {
      req.session.regenerate((err) => {
        if (!err) {
          req.session.user = user; 
          fulfill(user);
        } else {
          reject(err);
        }
      });
    });
};

const endAuthenticatedSession = req => {
    return new Promise((fulfill, reject) => {
        req.session.destroy(err => err ? reject(err) : fulfill(null));
    });
};

const register = (username, password) => {
    return new Promise(async (fulfill, reject) => {
      if (username.length <= 8 || password.length <= 8) {
        return reject({ message: 'USERNAME PASSWORD TOO SHORT' });
      }
  
      try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
          return reject({ message: 'USERNAME ALREADY EXISTS' });
        }
  
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
  
        const newUser = new User({
          username,
          hash
        });
  
        await newUser.save();
        fulfill(newUser);
      } catch (error) {
        reject(error);
      }
    });
};
  
const login = (username, password) => {
    return new Promise(async (fulfill, reject) => {
      try {
        const user = await User.findOne({ username });
        if (!user) {
          return reject({ message: "USER NOT FOUND" });
        }
  
        const passwordsMatch = bcrypt.compareSync(password, user.hash);
        if (!passwordsMatch) {
          return reject({ message: "PASSWORDS DO NOT MATCH" });
        }
  
        fulfill(user);
      } catch (error) {
        reject(error);
      }
    });
};
  
export {
    startAuthenticatedSession,
    endAuthenticatedSession,
    register,
    login
};
  