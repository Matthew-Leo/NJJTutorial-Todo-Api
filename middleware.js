module.exports = function (db) {
    return {
        requireAuthentication: function(req, res, next) {
            var token = req.get('Auth');
            db.user.findByToken(token).then(
                    function (user) {
                        req.user = user;
                        next();
                    },
                    function (err) {
                        console.log("Rejecting request because of authentication error" + (err ?  ":" + err.toString() : "") + ".");
                        res.status(401).send();
                    })
            
        }
    }
    
};

