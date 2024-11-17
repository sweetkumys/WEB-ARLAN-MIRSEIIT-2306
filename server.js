const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('./models/User');
const Portfolio = require('./models/Portfolio');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Set EJS as templating engine
app.set('view engine', 'ejs');

// Passport configuration
passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      const user = await User.findOne({ username });
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      if (user.verificationCode) {
        // Handle 2FA logic here
        return done(null, false, { message: 'Verification required.' });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

app.use(passport.initialize());
app.use(passport.session());

// Basic routes
app.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const financialResponse = await axios.get(`https://api.polygon.io/v2/aggs/ticker/AAPL/prev?adjusted=true&apiKey=${process.env.ALPHA_VANTAGE_API_KEY}`);
    const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=London&appid=${process.env.NEWS_API_KEY}`);

    res.render('index', {
      financialData: financialResponse.data,
      weatherData: weatherResponse.data
    });
  } catch (err) {
    console.log(err);
    res.status(500).send('Error fetching data.');
  }
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/verify', (req, res) => {
  res.render('verify');
});

app.get('/portfolio', ensureAuthenticated, async (req, res) => {
  const portfolios = await Portfolio.find();
  res.render('portfolio', { portfolios });
});

app.get('/portfolio/new', ensureAuthenticated, checkRole('admin'), (req, res) => {
  res.render('new-portfolio');
});

app.post('/portfolio', ensureAuthenticated, checkRole('admin'), async (req, res) => {
  const { title, description, images } = req.body;
  const portfolio = new Portfolio({ title, description, images: images.split(',') });
  await portfolio.save();
  res.redirect('/portfolio');
});

app.get('/portfolio/:id/edit', ensureAuthenticated, checkRole('admin'), async (req, res) => {
  const portfolio = await Portfolio.findById(req.params.id);
  res.render('edit-portfolio', { portfolio });
});

app.post('/portfolio/:id', ensureAuthenticated, checkRole('admin'), async (req, res) => {
  const { title, description, images } = req.body;
  await Portfolio.findByIdAndUpdate(req.params.id, { title, description, images: images.split(','), updatedAt: Date.now() });
  res.redirect('/portfolio');
});

app.post('/portfolio/:id/delete', ensureAuthenticated, checkRole('admin'), async (req, res) => {
  await Portfolio.findByIdAndDelete(req.params.id);
  res.redirect('/portfolio');
});

// Handle POST requests for login
app.post('/login', async (req, res, next) => {
  passport.authenticate('local', async (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect('/login');
    }
    if (user.verificationCode) {
      return res.redirect('/verify');
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.redirect('/');
    });
  })(req, res, next);
});

// Handle POST requests for registration
app.post('/register', async (req, res) => {
  const { username, password, firstName, lastName, age, gender, email, twoFactorAuth } = req.body;
  try {
    const verificationCode = crypto.randomBytes(3).toString('hex').toUpperCase();
    const user = new User({ 
      username, 
      password, 
      firstName, 
      lastName, 
      age, 
      gender, 
      email,
      twoFactorAuth: twoFactorAuth === 'on',
      verificationCode
    });
    await user.save();

    // Send welcome email with verification code
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to Portfolio Platform',
      text: `Hello ${firstName},\n\nWelcome to the Portfolio Platform!\n\nYour verification code is: ${verificationCode}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    res.redirect('/verify');
  } catch (err) {
    console.log(err);
    res.redirect('/register');
  }
});

// Handle POST requests for verification
app.post('/verify', async (req, res) => {
  const { username, verificationCode } = req.body;
  try {
    const user = await User.findOne({ username, verificationCode });
    if (!user) {
      return res.status(400).send('Invalid verification code.');
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Clear verification code
    user.verificationCode = null;
    await user.save();

    res.json({ token });
  } catch (err) {
    console.log(err);
    res.status(500).send('Server error.');
  }
});

// Check if 2FA is enabled for a user
app.get('/check-2fa', async (req, res) => {
  const { username } = req.query;
  const user = await User.findOne({ username });
  res.json({ twoFactorAuth: user ? user.twoFactorAuth : false });
});

// Middleware to ensure user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

// Middleware to check user role
function checkRole(role) {
  return function (req, res, next) {
    if (req.isAuthenticated() && req.user.role === role) {
      return next();
    }
    res.redirect('/');
  };
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});