//environment variables
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
} else { return console.error('You shouldnt use .env files in production'); }

const { resolveInclude } = require('ejs');
const passport = require('passport');
const { connectToDB } = require('./mysql');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const LocalStrategy = require('passport-local').Strategy;

const user = require('./mysql');
user.initDB();

module.exports = function() {
    //===============================================
    //passport session setup ========================
    //===============================================
    passport.serializeUser(function(user, done) {
        done(null, user.username);
    });
    passport.deserializeUser(function(user, done) {
        done(null, user);
    });
    //===============================================
    //passport google login setup ===================
    //===============================================
    passport.use('google', new GoogleStrategy({
        clientID: process.env.GOOGLE_ID,
        clientSecret: process.env.GOOGLE_SECRET,
        callbackURL: "https://duohando.com/google/callback"
      },
      function(accessToken, refreshToken, profile, done) {
            user,connectToDB()
                .then(function() {
                    profile = profile._json;
                    return user.findUser(profile.email)
                        .catch(function() { //user doesnt exist, create profile
                            let fullName = profile.name.split(' ');
                            let prof = [
                                fullName[0], fullName[fullName.length-1],
                                profile.email, null,
                                null,
                                'Google', profile.sub
                            ];
                            return user.addUser(prof);
                        });
                })
                .then(function(row) { return done(null, {username: row.email}); })
                .catch(function(err) {
                    console.log(err);
                    return done(null, false, {message: err});
                });
        }
    ));
    //===============================================
    //passport facebook login setup =================
    //===============================================
    passport.use('facebook', new FacebookStrategy({
        clientID: process.env.FACEBOOK_ID,
        clientSecret: process.env.FACEBOOK_SECRET,
        callbackURL: "https://duohando.com/facebook/callback",
        profileFields: ['id', 'displayName', 'email']
      },
      function(accessToken, refreshToken, profile, done) {
            user,connectToDB()
                .then(function() { 
                    profile = profile._json;
                    return user.findUser(profile.email)
                        .catch(function() { //user doesnt exist, create profile
                            let fullName = profile.name.split(' ');
                            let prof = [
                                fullName[0], fullName[fullName.length-1],
                                profile.email, null,
                                null,
                                'Facebook', profile.id
                            ];
                            return user.addUser(prof);
                        });
                })
                .then(function(row) { return done(null, {username: row.email}); })
                .catch(function(err) {
                    console.log(err);
                    return done(null, false, {message: err});
                });
        }
    ));
    //===============================================
    //passport form login setup =====================
    //===============================================
    passport.use('local-login', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        function(req, email, password, done) {
            console.log(`${email} login attempt`);
            user.connectToDB()
                .then(function() { return user.validEmail(email); })
                .then(function() { return user.validPassword(password); })
                .then(function() { return user.findUser(email); })
                .then(function(row) { return user.comparePassword(password, row.password_hash); })
                .then(function() { return done(null, {username: email}); })
                .catch(function(err) {
                    console.log(err);
                    return done(null, false, {message: err});
                });
        }
    ));
    //===============================================
    //passport form register setup ==================
    //===============================================
    passport.use('local-register', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        function(req, email, password, done) {
            user.connectToDB()
                .then(function() { return user.validEmail(email); })
                .then(function() { return user.validPassword(password); })
                .then(function() { return user.hashPassword(password); })
                .then(function(hash) {
                    let profile = [
                        req.body.firstname, req.body.lastname,
                        email, req.body.phone_num,
                        hash,
                        null, null
                    ];
                    return user.addUser(profile);
                })
                .then(function() { return done(null, {username: email}); })
                .catch(function(err) {
                    console.log(err);
                    return done(null, false, {message: err});
                });
        }
    ));
};