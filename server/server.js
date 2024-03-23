const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const uuidv4 = require('uuid').v4;

const MONGODB_PASS = "QSSm7bp22JU2KUV2";

if (!MONGODB_PASS) {
  console.error('MongoDB password is not provided in the environment variable.');
  process.exit(1); 
}

const app = express();
app.use(express.json());
const corsOptions = {
  origin: 'http://localhost:5173', 
  credentials: true,
};
app.use(cors(corsOptions));


const mongoURI = `mongodb+srv://andrewlaskin:QSSm7bp22JU2KUV2@cluster0.e0ivcci.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
mongoose
  .connect(mongoURI, {})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

const db = mongoose.connection;

const userSchema = new mongoose.Schema({
  name: String,
  password: String,
  role: String,
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }]
});

const questionSchema = new mongoose.Schema({
  id: { type: Number },
  user: String,
  question: String,
  answer: String,
  timestamp: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
const Question = mongoose.model('Question', questionSchema);

app.use(session({
  secret: 'secret', 
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, 
    httpOnly: true, 
  },
}));

const sessions = {};

app.post('/users', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = new User({
      name: req.body.name,
      password: hashedPassword,
      role: req.body.role
    });
    await newUser.save();
    res.status(201).send();
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/users/login', async (req, res) => {
  try {
    const user = await User.findOne({ name: req.body.name });
    if (!user) {
      return res.status(400).send('Cannot find user');
    }

    const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
    if (isPasswordValid) {
      const sessionId = uuidv4();
      req.session.userId = user._id; 
      sessions[sessionId] = user;
      res.set('Set-Cookie', `sessionId=${sessionId}`);
      res.send('Success');
    } else {
      res.send('Not Allowed');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/users/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    } else {
      res.clearCookie('sessionId');
      res.send('Logged out successfully');
    }
  });
});

app.get('/users/profile', async (req, res) => {
  try {
    if (req.session && req.session.userId) {
      const user = await User.findById(req.session.userId);
      if (user) {
        res.json({ name: user.name });
      } else {
        res.status(404).send('User not found');
      }
    } else {
      res.status(401).send('Unauthorized');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/question', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).send('Unauthorized');
    }
    const user = await User.findById(req.session.userId);
    const question = new Question({
      id: req.body.id,
      user: req.body.user,
      question: req.body.question,
      answer: null,
    });
    await question.save();
    user.questions.push(question);
    user.role = "Student";
    res.json(user);
    // res.status(201).send();
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
