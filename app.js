require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const path = require('node:path');
const userController = require('./controllers/userController');
const LocalStrategy = require('passport-local').Strategy;
const db = require('./db/queries');
const bcrypt = require('bcryptjs');

passport.use(
    new LocalStrategy(async (username, password, done) => {
        try {
            const user = await db.getUserByUsername(username);

            if (!user) {
                return done(null, false, { message: 'Incorrect username' });
            }

            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                return done(null, false, { message: 'Incorrect password' });
            }
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    })
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await db.getUserById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});

app.get('/sign-up', userController.signUpGet);
app.post('/sign-up', userController.signUpPost);
app.get('/log-in', (req, res) => res.render('log-in-form'));
app.post(
    '/log-in',
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/log-in'
    })
);
app.get('/log-out', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect('/');
    });
});

app.get('/join', (req, res) => {
    if (!req.user) return res.redirect('/log-in');
    res.render('join-form');
});

app.post('/join', async (req, res, next) => {
    const SECRET_PASSCODE = 'odin';

    if (req.body.passcode === SECRET_PASSCODE) {
        try {
            await db.updateUserStatus(req.user.id);
            res.redirect('/');
        } catch (err) {
            return next(err);
        }
    } else {
        res.send("Wrong passcode! <a href='/join'> Try again</a>");
    }
})

app.get('/', async (req, res, next) => {
    try {
        const messages = await db.getAllMessages();
        res.render('index', { messages: messages });
    } catch (err) {
        next(err);
    }
});

app.get('/new-message', (req, res) => {
    if (!req.user) return res.redirect('/log-in');
    res.render('new-message');
});

app.post('/new-message', async (req, res, next) => {
    try {
        await db.insertMessage(req.body.title, req.body.text, req.user.id);
        res.redirect('/');
    } catch (err) {
        next(err);
    }
});

app.post('/message/:id/delete', async (req, res, next) => {
    if (req.user && req.user.is_admin) {
        try {
            await db.deleteMessage(req.params.id);
            res.redirect('/');
        } catch (err) {
            next(err);
        }
    } else {
        res.status(403).send('Unauthorized');
    }
});

app.get('/admin', (req, res) => res.render('admin-form'));

app.post('/admin', async (req, res, next) => {
    if (req.body.adminCode === 'secret-admin-pass') {
        await db.promoteToAdmin(req.user.id);
        res.redirect('/');
    } else {
        res.send('Wrong code!');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));