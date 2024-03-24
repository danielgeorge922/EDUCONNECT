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
  email: String,
  password: String,
  role: String,
  conversations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation'
  }]
});

const conversationSchema = new mongoose.Schema({
  id: { type: Number },
  user: String,
  messages: [{
    user: String,
    text: String,
    timestamp: { type: Date, default: Date.now }
  }]
});

const User = mongoose.model('User', userSchema);
const Conversation = mongoose.model('Conversation', conversationSchema);

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
    const user = await User.findOne({ email: req.body.email });
    if(user) {
      res.status(202).send('Email Taken');
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = new User({
      email: req.body.email,
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
    const user = await User.findOne({ email: req.body.email });
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
        res.json({ email: user.email });
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

app.post('/users/role', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).send('Cannot find user');
    }
    res.status(200).send(user.role);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/conversation', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).send('Unauthorized');
    }
    const user = await User.findById(req.session.userId);
    const conversation = new Conversation({
      id: req.body.id,
      user: req.body.user
    });
    await conversation.save();
    conversation.push({
      text: req.body.text
    })
    user.conversations.push(conversation);
    res.status(201).send();
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/message', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).send('Unauthorized');
    }
    const user = await User.findById(req.session.userId);
  } catch {
    
  }
});

app.get('/conversations', async (req, res) => {
  try {
    const conversations = await Conversation.find();
    res.status(200).json(conversations); 
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).send('Internal Server Error'); 
  }
});

app.get('/users/professors', async (req, res) => {
  try {
    const professors = await User.find({ role: 'professor' });
    res.status(200).json(professors);
  } catch (error) {
    console.error('Error fetching professors:', error);
    res.status(500).send('Internal Server Error');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));