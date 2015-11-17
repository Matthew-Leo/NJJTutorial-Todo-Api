var _ = require("underscore");
var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var db = require('./db.js');



var bodyParser = require('body-parser');
app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.send('TODO API ROOT');
});

// get /todos?completed=true&q=descriptionContains
app.get('/todos', function (req, res) {
    console.log("GET /todos");
    var queryParams = req.query;
    var filter = {where: {}};
    if (queryParams.hasOwnProperty('completed')) {
        var completed;
        if (queryParams.completed === "true")
            completed = true;
        else if (queryParams.completed === "false")
            completed = false;
        else {
            res.status(400).json({error: "invalid value for completed:" + queryParams.completed});
            return;
        }
        filter.where.completed = completed;
    }
    if (queryParams.hasOwnProperty('q') &&
            queryParams.q.trim().length > 0) {
        var lookingFor = queryParams.q.trim().toLowerCase();
        filter.where.description = {$like: "%" + lookingFor + "%"};
    }
    db.todo.findAll(filter).then(function (found) {
        res.json(found);
    }).catch(function (e) {
        res.status(400).json(e);
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
            catch(function (err) {
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
        res.status(400).json({error: "invalid value type for description:'" + body.description + "'"});
        return;
    }
    // OK now try the update
    db.todo.findById(todoId).
            then(function (found) {
                _.extend(found, validAttributes); //could also use update
                found.save().then(function () {
                    res.status(200).json(found); //wait for db success
                });
            }).catch(function (err) {
        console.log(err);
        res.status(400).json(err);
    });
}
;


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
        });
    } catch (e) {
        console.log("CAUGHT:" + e.toString());
    }
});

