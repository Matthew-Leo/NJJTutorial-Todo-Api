var Sequelize = require('sequelize');
var dbType = process.env.NODE_ENV || "development";
var sequelize =
        (dbType === "production") ? 
        new Sequelize(process.env.DATABASE_URL, {
            dialect: 'postgres'
        })
        :
        new Sequelize(undefined, undefined, undefined,
                {
                    dialect: 'sqlite',
                    storage: __dirname + '/data/dev-todo-api.sqlite'
                })
        ;

var db = {};

db.todo = sequelize.import(__dirname + '/models/todo.js');
db.user = sequelize.import(__dirname + '/models/user.js');
db.Sequelize = Sequelize;
db.sequelize = sequelize;

console.log("Setting up 1 to many");
db.todo.belongsTo(db.user);
db.user.hasMany(db.todo);

module.exports = db;

        