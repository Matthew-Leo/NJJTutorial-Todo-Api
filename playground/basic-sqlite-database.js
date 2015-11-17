var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined,
        {
            dialect: 'sqlite',
            storage: __dirname + '/basic-sqlite-database.sqlite'});

var Todo = sequelize.define('todo',
        {
            description: {
                type: Sequelize.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true,
                    len: [1, 250]
                }
            },
            completed: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            }
        });

sequelize.sync().then(function () {
    console.log("Everything is synced");
    return Todo.findById(88);
}).then(function (result) {
    if (result) 
        console.log(result.toJSON());
    else
        console.log("not found");
});
//}).then(function () {
//    console.log("1");
//    return Todo.findOrCreate({where: {description: "Prove the Riemann Hypothesis", completed: false}})
//}).then(function (todo) {
//    console.log("Got:" + JSON.stringify(todo));
//    console.log("2");
//    return Todo.findOrCreate({where: {description: "Prove the Golbach Conjecture", completed: false}})
//}).then(function (todo) {
//    console.log("Got:" + JSON.stringify(todo));
//    console.log("3");
//    return Todo.findOrCreate({where: {description: "Prove P <> NP by couterexample", completed: false}})
//}).then(function (todo) {
//    console.log("Got:" + JSON.stringify(todo));
//    console.log("4");
//    return Todo.findOrCreate({where: {description: "Pick up some milk", completed: true}})
//}).then(function (todo) {
//    console.log("Got:" + JSON.stringify(todo));
//    console.log("5");
//    return Todo.findOrCreate({where: {description: "", completed: true}})
//}).then(function (todo) {
//    console.log("Got:" + JSON.stringify(todo));
//    console.log("That concludes the inserts/selects");
//}).catch (function (e) {
//    console.log("********************************");
//    console.log("Error occurred:" + e);
//    console.log("********************************");
//}).finally(function () {
//    console.log("finished");
//});
