
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
})

app.get('/todos/:id', function (req, res) {
    var todoId = parseInt(req.params.id);
    var found = undefined;
    todos.forEach(function (todo) {
        if (todo.id === todoId) 
            found = todo;
    });
    if (found)
        res.json(found);
    else
        res.status(404).send();
});

// POST /todos
app.post("/todos",function (req, res) {
    var body = req.body;
    body["id"] = todoNextId++;
    todos.push(body);
    console.log(body.description);
    res.send(body);
    
});


app.listen(PORT, function () {
    console.log("express listening on port " + PORT);
})