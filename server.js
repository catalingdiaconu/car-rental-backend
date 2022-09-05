const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const passport = require('passport')
const passportLocal = require('passport-local').Strategy
const cookieParser = require('cookie-parser')
const bcrypt = require('bcryptjs')
const bodyParser = require('body-parser')
const session = require('express-session')

const app = express();

const User = require('./schema/user');
const Car = require('./schema/car');

mongoose.connect('mongodb://localhost:27017', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Db connected'))
    .catch(err => console.log(err))

// Middleware
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
    cors({
    origin: 'http://localhost:3000/',
    methods: 'GET,POST,PUT,DELETE',
    credentials: true
}))

app.use(session({
    secret: 'secretcode',
    resave: true,
    saveUninitialized: true
}))

app.use(cookieParser('secretcode'))

app.use(passport.initialize());
app.use(passport.session());
require('./passportConfig')(passport);

// End of middleware

//Routes
app.post('/register', (req, res) => {
    User.findOne({ username: req.body.username}, async (err, doc) => {
        if (err) throw err;
        if (doc) res.send('User already exists')
         if (!doc) {
             const hashedPassword = await bcrypt.hash(req.body.password, 10)
             const newUser = new User({
                 username: req.body.username,
                 password: hashedPassword,
                 admin: req.body.admin,
             })
             await newUser.save();
             res.send('User created')
         }
    })
})

app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) throw err;
        if (!user) res.send('No User Exists');
        else {
            req.logIn(user, err => {
                if (err) throw err;
                res.send('Successfully Authenticated');
                console.log(req.user)
            })
        }
    })(req, res, next);
})

app.get('/user', (req, res) => {
    res.send(req.user)
})

app.post('/logout', (req, res,next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
})

app.post('/car', (req, res) => {
    Car.findOne({ name: req.body.name }, async (err, car) => {
        if (err) throw err;
        if (car) res.send('Car already added');
        if (!car) {
            const newCar = new Car ({
                name: req.body.name,
                class: req.body.class,
                type: req.body.type,
                nrDoors: req.body.nrDoors,
                fuel: req.body.fuel,
                bootCapacity: req.body.bootCapacity,
                price: req.body.price,
            })
            await newCar.save();
            res.send('New car added')
        }
    })
})

app.get('/getCars', (req, res) => {
    Car.find({})
        .then(data => {
            res.send(data)
        })
})

// End of routes

app.listen(5000, () => {
    console.log('Server started on port 5000')
})
