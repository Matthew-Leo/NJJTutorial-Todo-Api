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
var User = sequelize.define("user",
        {email: Sequelize.STRING}
);

Todo.belongsTo(User);
User.hasMany(Todo);

sequelize.sync().then(function () {
    console.log("Everything is synced");
    return Todo.findById(88);
}).then(function (result) {
    if (result)
        console.log(result.toJSON());
    else
        console.log("not found");
});
User.findById(1).then(
        function (user) {
            user.getTodos({where: {completed: false}}).then(function (todos) {
               console.log("\nTODOS for user 1:\n=================");
               todos.forEach(function (todo) {
                   console.log(JSON.stringify(todo));
               });
               return new Promise(function (resolve, reject) {resolve("I am happy");});
            }).then(function () {console.log("DONE\n\n")});
        }, function (err) {
          console.log(err);  
        }).then(function () {console.log("DONEDONE")});

//User.create({
//    email: "user@example.com"
//}).then(
//        function () {
//            return Todo.create({
//                description: "Clean Yard"
//            })
//        }
//).then (
//    function (todo) {
//        User.findById(1).then(function (user) {
//          user.addTodo(todo);  
//        })
//    }
//);


