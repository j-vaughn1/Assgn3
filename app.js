var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var authJwtController = require('./auth_jwt');
var User = require('./Users');
var Movies = require('./Movies');
var Actor = require('./Actors');
var jwt = require('jsonwebtoken');
mongoose.connect('mongodb://Jordan:abc@ds257808.mlab.com:57808/vaughnapi3');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

router.route('/postjwt')
    .post(authJwtController.isAuthenticated, function (req, res) {
            console.log(req.body);
            res = res.status(200);
            if (req.get('Content-Type')) {
                console.log("Content-Type: " + req.get('Content-Type'));
                res = res.type(req.get('Content-Type'));
            }
            res.send(req.body);
        }
    );

router.route('/users/:userId')
    .get(authJwtController.isAuthenticated, function (req, res) {
        var id = req.params.userId;
        User.findById(id, function(err, user) {
            if (err) res.send(err);

            var userJson = JSON.stringify(user);
            // return that user
            res.json(user);
        });
    });

router.route('/users')
    .get(authJwtController.isAuthenticated, function (req, res) {
        User.find(function (err, users) {
            if (err) res.send(err);
            // return the users
            res.json(users);
        });
    });

router.get('Movies', function(req, res){

    Movies.find(function (err, Movies){
    if (err) res.send(err);

        res.json(Movies);
});


});

router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please pass username and password.'});
    }
    else {
        var user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;
        // save the user
        user.save(function(err) {
            if (err) {
                // duplicate entry
                if (err.code == 11000)
                    return res.json({ success: false, message: 'A user with that username already exists. '});
                else
                    return res.send(err);
            }

            res.json({ message: 'User created!' });
        });
    }
});

router.post('/signin', function(req, res) {
    var userNew = new User();
    userNew.name = req.body.name;
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    User.findOne({ username: userNew.username }).select('name username password').exec(function(err, user) {
        if (err) res.send(err);

        user.comparePassword(userNew.password, function(isMatch){
            if (isMatch) {
                var userToken = {id: user._id, username: user.username};
                var token = jwt.sign(userToken, process.env.SECRET_KEY);
                res.json({success: true, token: 'JWT ' + token});
            }
            else {
                res.status(401).send({success: false, msg: 'Authentication failed. Wrong password.'});
            }
        });


    });
});

router.post('/Movies', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please enter: Title, Year Released, Genre, and Three actors and their character names.'});
    }
    else {
        var Film = new Movies();
        Film.title = req.body.title;
        Film.year = req.body.year;
        Film.Genre = req.body.Genre;
        var Actor1 = new Actor();
        Actor1.ActorName = req.body.ActorName;
        Actor1.CharacterName = req.body.CharacterName;
        var Actor2 = new Actor();
        Actor2.ActorName = req.body.ActorName;
        Actor2.CharacterName = req.body.CharacterName;
        var Actor3 = new Actor();
        Actor3.ActorName = req.body.ActorName;
        Actor3.CharacterName = req.body.CharacterName;
        var ActorGroup = [Actor1, Actor2, Actor3];
        Film.Actor = req.body.ActorGroup;

        // save the user
        Film.save(function(err) {
            if (err) {
                // duplicate entry
                if (err.code == 11000)
                    return res.json({ success: false, message: 'A Movie with that info already exists. '});
                else
                    return res.send(err);
            }

            res.json({ message: 'Movie created!' });
        });
    }
});

router.route('/Movies/:title') //get the movie with this title

    .get(function(req, res){

    })

    .put(function(req, res){
        Movies.findById(req.params.title, function(err, Movies) {
            if (err) res.send(err);

            //update the movie's info
            if(req.body.title) Movies.title = req.body.title;
            if(req.body.year) Movies.year = req.body.year;
            if(req.body.Genre) Movies.Genre = req.body.Genre;
            for(var i =0; i<3; i++)
            {
                if (req.body.Actor.ActorName) Movies.Actor[i].ActorName = req.body.Actor.ActorName;
                if (req.body.Actor.CharacterName) Movies.Actor[i].CharacterName = req.body.Actor.CharacterName;
            }

        });
    });

router.route('/Movies/:title')
    .get(function(req, res){

    })

    .put(function(req, res){

    })

    .delete(function(req, res){
        Movies.remove({
            _id: req.params.title
        }, function(err, Movies){
            if(err) return res.send(err);

            res.json({messsage: 'Movie was deleted.'});

        });
});

app.use('/', router);
app.listen(process.env.PORT || 8080);
console.log("listeningOn: "  + process.env.PORT || 8080);