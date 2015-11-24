"use strict";

var _ = require("underscore");
var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var db = require('./db.js');



var bodyParser = require('body-parser');
app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.send('TO\0DO API ROOT');
});

// get /todos?completed=true&q=descriptionContains
app.get('/todos', function (req, res) {
    console.log("GET /todos");
    var query = req.query;
    var filter = {where: {}};
    if (query.hasOwnProperty('completed')) {
        var completed;
        if (query.completed === "true")
            completed = true;
        else if (query.completed === "false")
            completed = false;
        else {
            res.status(400).json({error: "invalid value for completed:" + query.completed});
            return;
        }
        filter.where.completed = completed;
    }
    if (query.hasOwnProperty('q') &&
            query.q.trim().length > 0) {
        var lookingFor = query.q.trim().toLowerCase();
        filter.where.description = {$like: "%" + lookingFor + "%"};
    }
    db.todo.findAll(filter).then(function (found) {
        if (!!found)
            res.json(found);
        else
            res.status(404).send();
    }).catch(function (e) {
        res.status(500).json(e);
    })
});


// GET /todos:id
app.get('/todos/:id', function (req, res) {
    var todoId = parseInt(req.params.id);
    console.log("looking for " + todoId);
    db.todo.find({where: {id: todoId}}).then(function (found) {
        console.log(JSON.stringify(found));
        if (!!found)
            res.json(found)
        else
            res.status(404).send();
    }).catch(function (err) {
        console.log(err);
        res.status(500).json(err);
    })
});

// DELETE /todos:id

app.delete('/todos/:id', function (req, res) {
    var todoId = parseInt(req.params.id);
    db.todo.find({where: {id: todoId}}).
            then(function (found) {
                return found.destroy();
            }).
            then(function (found) {
                res.status(200).json(found);
            }).
            catch (function (err) {
                res.status(404).json(err);
            });
});


// POST /todos
app.post("/todos", function (req, res) {
    var body = req.body;
    if (!_.isBoolean(body.completed)
            || !_.isString(body.description)
            || body.description.trim().length === 0) {
        res.status(400).send();
        return;
    }
    var cleanPostedObj = _.pick(body, "description", "completed");
    cleanPostedObj.description = cleanPostedObj.description.trim();
    db.todo.create(cleanPostedObj).then(
            function (newObj) {
                console.log(JSON.stringify(newObj));
                res.status(200).json(newObj);
            }).catch(
            function (err) {
                console.log("Error:");
                console.log(err);
                res.status(400).json(err);
            });
});

// note -- "PUT" in the course API should be "PATCH".
function patchFunc(req, res) {
    var todoId = parseInt(req.params.id);

    var body = req.body;
    var validAttributes = {};
    if (body.hasOwnProperty('completed')
            && _.isBoolean(body.completed)) {
        validAttributes.completed = body.completed
    } else if (body.hasOwnProperty('completed')) {
        res.status(400).json({error: "invalid value type for completed:" + typeof body.completed});
        return;
    }
    if (body.hasOwnProperty('description')
            && _.isString(body.description)
            && body.description.trim().length > 0) {
        validAttributes.description = body.description;
    } else if (body.hasOwnProperty('description')) {
        console.log("bad description")
        res.status(400).json({error: "invalid value type for description:'" + typeof body.description + "'"});
        return;
    }
    // OK now try the update
    db.todo.findById(todoId).
            then(function (found) {
                if (found) {
                    _.extend(found, validAttributes); //could also use update
                    found.save().then(function () {
                        res.status(200).json(found); //wait for db success
                    });
                } else {
                    res.status(404).send();
                }
            }).catch(function (err) {
        console.log(err);
        res.status(400).json(err);
    });
};

/*
 * USERS API
 */
 /**
  * get /users 
  *   body properties:
  *       email 
  */

app.get('/users', function (req, res) {
    console.log("GET /users");
    let filter = {};
    if (req.query.hasOwnProperty("email")) {
		console.log("Adding email filter for " + req.query.email.trim());
		filter.where = {email : req.query.email.trim().toLowerCase()};
	}
	console.log(JSON.stringify(filter));
		
    db.user.findAll(filter).then(function (found) {
        if (!!found)
            res.json(found);
        else
            res.status(404).send();
    }).catch(function (e) {
        res.status(500).json(e);
    })
});

app.get('/users/:id', function (req, res) {
	db.user.findById(req.params.id).then(
	    function (found) {
			if (!!found) {
				res.status(200).json(found);
			} else {
				res.status(404).send();
			}
		},
		function (err) {
			console.log(JSON.stringify(err));
			res.status(400).json(err);
		})
});

// POST /users
app.post('/users', function(req, res) {
    let body = req.body;
    let values = _.pick(body, "email", "password");
    if (values.hasOwnProperty("email")) {
		values.email = values.email;
	}
    db.user.create(values).then(
      function (newObj) {
        res.status(200).send(newObj.toPublicJSON());
      },
      function(err) {
        res.status(400).json(err);
      }
    )
});


// PATCH /todos:id
app.patch('/todos/:id', patchFunc);
// PUT /todos:id
app.put('/todos/:id', patchFunc);

/*
 * set up database
 */
db.sequelize.sync().then(function () {
    try {
        console.log("about to listen on port " + PORT);
        app.listen(PORT, function () {
            console.log("express listening on port " + PORT);
            console.log("NODE_ENV = " + process.env.NODE_ENV);
        });
    } catch (e) {
        console.log("CAUGHT:" + e.toString());
    }
});
