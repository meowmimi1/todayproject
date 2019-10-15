const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const session = require('express-session')
const authRouter = require('./auth/auth-router.js');
const UserRouter = require('./users/userRouter.js');
const KnexSessionStore = require('connect-session-knex')(session)// Don't forget to pass it a the session
const dbConnection = require('./database/dbConfig.js')// Check this is the right path
const server = express();

const sessionConfiguration = {
    name: 'mimicookie',
    secret: process.env.SESSION_SECRET || 'keep it secret, keep it safe',
    cookie: {
        maxAge: 1000 * 60 * 60,
        secure: false, //make true in production
        httpOnly: true, //JS has no access to cookie
    },
    resave: false,
    saveUninitialized: true, // GDPR compliant
    store: new KnexSessionStore({ //don't forget to call new
        knex: dbConnection,
        tablename: 'knexssessions',
        sidfieldname: 'sessionid',
        createtable: true,
        clearInterval: 1000 * 60 * 60
    })
}

server.use(helmet());
server.use(express.json());
server.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}))
server.use(session(sessionConfiguration))

server.use('/api/auth', authRouter);
server.use('/api/users', UserRouter);

server.get('/', (req, res) => {
  res.json({ api: 'up' });
});
server.get('/api/logout', (req, res) => {
    if (req.session) {
      req.session.destroy(err => {
        if (err) {
          res.send('error logging out');
        } else {
          res.send('good bye');
        }
      });
    }
  });
module.exports = server;