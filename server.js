var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;

var todos = [{
        id: 1,
        description: "Meet E for lunch",
        completed: false
    }, {
        id: 2,
        description: "Go to market",
        completed: false
    }, {
        id: 3,
        description: "Master the arcane secrets of time and space",
        completed: true
    }];

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
})


app.listen(PORT, function () {
    console.log("express listening on port " + PORT);
})