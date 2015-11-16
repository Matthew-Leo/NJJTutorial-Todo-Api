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
    var queryParams = req.query;
    var filteredTodos = todos;
    console.log(JSON.stringify(queryParams));
    if (queryParams.hasOwnProperty('completed')) {
        var completed;
        if (queryParams.completed === "true") 
            completed = true;
        else if (queryParams.completed === "false")
            completed = false;
        else {
            res.status(400).json({error : "invalid value for completed:" + queryParams.completed});
            return;
        }
        console.log("Getting values with completed " + completed);
        console.log(JSON.stringify(filteredTodos));
        filteredTodos = _.where(filteredTodos,{completed : completed});
        console.log(JSON.stringify(filteredTodos));
    }
    res.json(filteredTodos);
});


// GET /todos:id
app.get('/todos/:id', function (req, res) {
    var todoId = parseInt(req.params.id);
    var found = _.findWhere(todos, {id: todoId});
    if (found)
        res.json(found);
    else
        res.status(404).send();
});

// DELETE /todos:id
app.delete('/todos/:id', function (req, res) {
    var todoId = parseInt(req.params.id);
    var found = _.findWhere(todos, {id: todoId});
    if (found) {
        todos = _.without(todos, found)
        res.json(found);
    } else
        res.status(404).json({error: "No todo found with id:" + req.params.id});
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

// note -- "PUT" in the course API should be "PATCH".
function patchFunc(req, res) {
    var todoId = parseInt(req.params.id);
    var found = _.findWhere(todos, {id: todoId});
    if (!found) {
        console.log("Did not find id " + todoId);
        res.status(404).send();
        return;
    }

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
        console.log("setting description")
        validAttributes.description = body.description;
    } else if (body.hasOwnProperty('description')) {
        console.log("bad description")
        res.status(400).json({error: "invalid value type for completed:'" + body.description + "'"});
        return;
    }
    console.log(JSON.stringify(validAttributes));
    _.extend(found, validAttributes);
    res.status(200).json(found);

}
;


// PATCH /todos:id
app.patch('/todos/:id', function (req, res) {
    console.log("Calling patch");
    patchFunc(req, res);
});
// PUT /todos:id
app.put('/todos/:id', function (req, res) {
    console.log("Calling put");
    patchFunc(req, res);
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
