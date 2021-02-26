module.exports = {
    initLoginRoutes: initLoginRoutes
}

function initLoginRoutes(app, passport) {
    app.post('/register', function(req, res, next) {
        passport.authenticate('local-register', function(err, user, info) {
            if (!user) {
                return res.json(info);
            } else {
                return res.json({});
            }
        })(req, res, next);
    });
    
    app.post('/login', function(req, res, next) {
        passport.authenticate('local-login', function(err, user, info) {
            if (!user) {
                return res.json(info);
            } else {
                if (user.secret !== null) {
                    //dont login but save user info in session temporarily
                    req.session.temp = user;
                    req.session.save();
                    return res.json({twoFactor: true});
                } else {
                    req.logIn(user, function(err) {
                        if (err) { return res.json(err); }
                        return res.json({name: req.session.passport.user.name });
                    });
                }
            }
        })(req, res, next);
    });
    app.get('/login', function(req, res) {
        res.json({loggedIn: (req.session.passport !== undefined)})
    });

    app.get('/google', passport.authenticate('google', { scope: ['email', 'profile'] }));
    app.get('/google/callback', function(req, res, next) {
        passport.authenticate('google', function(err, user, info) {
            if (!user) {
                return res.redirect(`https://duohando.com/loginSignup?err=${encodeURIComponent(info.error)}`);
                
            } else {
                req.logIn(user, function(err) {
                    if (err) return res.redirect(`https://duohando.com/loginSignup?err=${encodeURIComponent(err)}`);
                    return res.redirect("https://duohando.com/dashboard");
                });
            }
        })(req, res, next);
    });

    app.get('/facebook', passport.authenticate('facebook', { scope: 'email' }));
    app.get('/facebook/callback', function(req, res, next) {
        passport.authenticate('facebook', function(err, user, info) {
            if (!user) {
                return res.redirect(`https://duohando.com/loginSignup?err=${encodeURIComponent(info.error)}`);
            } else {
                req.logIn(user, function(err) {
                    if (err) return res.redirect(`https://duohando.com/loginSignup?err=${encodeURIComponent(err)}`);
                    return res.redirect("https://duohando.com/dashboard");
                });
            }
        })(req, res, next);
    });
}