const { Telegraf } = require('telegraf')
const commandParts = require('telegraf-command-parts')
const router = require('./commandRouter.js')
const express = require('express')
var appSession = require('express-session')
const passport = require('passport')
const TelegramStrategy = require('passport-telegram-login').Strategy

const config = require('./config.js')

const app = express()
const bot = new Telegraf(config.botToken)
const session = require('telegraf/session')
const bodyParser = require('body-parser')

var db = require('./db.js')

// PassportJS setup
passport.use(new TelegramStrategy({
    botToken: config.botToken
}))

passport.serializeUser(function(user, done) {
    console.log('serializeUser', user);
    done(null, JSON.stringify(user));
});

passport.deserializeUser(function(serialized, done) {
    console.log('deserializeUser', serialized);
    done(null, JSON.parse(serialized));
});

// Bot Code
bot.use(session())
bot.use(commandParts())
bot.on('text', (ctx) => {
    if(ctx.state.command) {
        router.router(ctx) // Command Router
    }
})
bot.launch()

// App Code

app.set('view engine', 'hbs');

app.use(express.static('./'));

// app.use(require('cookie-parser')());
app.use(appSession({ secret: "cats" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
    if(req.user) {
        db.select("*").from("reminders").where("uid", req.user.id).then(rows => {
            reminders = []
            rows.forEach((item) => {
                curDate = new Date(item.date)
                day = curDate.getDay()
                days = ['Sunday', 'Monday', 'Tuesday', 'Thursday', 'Wednesday', 'Friday', 'Saturday']
                console.log(days[day])
                reminders.push({
                    id: item.id,
                    name: item.name,
                    date: item.date,
                    time: item.time,
                    recurrence: item.recurrence,
                    day: days[day]
                })
            })
            res.render('index', {
                user: req.user,
                reminders: reminders,
                config
            })
        })

    }
    else {
        res.redirect('/login')
    }
});

app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/action/new_reminder', (req, res) => {
    if(req.user) {
        console.log(req.body)
        console.log(req.user)
        db('reminders').insert({uid: req.user.id, name: req.body.name, date: req.body.date, time: req.body.time, recurrence: req.body.recurrence}).then((result) => {
            res.status(200)
            res.redirect('/')
        })
    }
    else {
        res.redirect('/login')
    }

})

app.post('/action/delete_reminder', (req, res) => {
    if(req.user) {
        db("reminders").del().where("id", req.body.delete).then(() => {
            res.redirect('/')
        })
    }
})



app.get('/auth/telegram-login/callback', passport.authenticate('telegram-login', { session: true,  successRedirect: '/' }))

app.listen(3000, () => console.log('Example app listening on port 3000!'))
