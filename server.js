var _ = require("underscore");
var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;


var todos = []; // start with empty todos list
var todoNextId = 1;

var bodyParser = require('body-parser');
app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.send('TODO API ROOT');
});

app.get('/todos', function (req, res) {
    res.json(todos);
});

app.get('/todos/:id', function (req, res) {
    var todoId = parseInt(req.params.id);
    var found = _.findWhere(todos, {id: todoId});
    if (found)
        res.json(found);
    else
        res.status(404).send();
});

app.delete('/todos/:id', function (req, res) {
    var todoId = parseInt(req.params.id);
    var found = _.findWhere(todos, {id: todoId});
    if (found) {
        todos = _.without(todos,found)
        res.json(found);
    } else
        res.status(404).json({error:"No todo found with id:" + req.params.id});
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
    cleanPostedObj["id"] = todoNextId++;
    todos.push(cleanPostedObj);
    console.log(cleanPostedObj.description);
    res.send(cleanPostedObj);

});


try {
    console.log("about to listen on port " + PORT);
app.listen(PORT, function () {
    console.log("express listening on port " + PORT);
});
} catch (e) {
    console.log("CAUGHT:" + e.toString());
} finally {
    console.log("Done with listening");
}
