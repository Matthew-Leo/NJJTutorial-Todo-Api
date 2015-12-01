
var bcrypt = require('bcrypt');
var _ = require('underscore');
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');
        
var SALT_LEN = 10;
module.exports = function (sequelize, DataTypes) {
    var user = sequelize.define('user',
            {
                email: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    unique: true,
                    validate: {
                        isEmail: true
                    }
                },
                salt: {
                    type: DataTypes.STRING
                },
                password_hash: {
                    type: DataTypes.STRING
                },
                password: {
                    type: DataTypes.VIRTUAL,
                    allowNull: false,
                    validate: {
                        len: [7, 100]
                    },
                    set: function (value) {
                        var salt = bcrypt.genSaltSync(SALT_LEN);
                        var hashedPassword = bcrypt.hashSync(value, salt);
                        this.setDataValue("password", value);
                        this.setDataValue("salt", salt);
                        this.setDataValue("password_hash", hashedPassword);
                    }
                }
            },
    {
        hooks: {
            beforeValidate: function (user, options) {
                if (typeof user.email === "string")
                    user.email = user.email.trim().toLowerCase();
            }
        },
        classMethods: {
            authenticate: function (body) {
                return new Promise(function (resolve, reject) {
                    if (typeof body.email !== "string" || typeof body.password !== "string") {
                        return reject();
                    }
                    user.findOne({
                        where: {
                            email: body.email.toLowerCase()
                        }}).then(function (foundUser) {
                        if (!foundUser || !bcrypt.compareSync(body.password, foundUser.get('password_hash'))) {
                            console.log(!foundUser ? "No User Found" : "Bad password");
                            return reject("bad login credentials");
                        }
                        console.log("OK: authenticate returning user");
                        return resolve(foundUser);
                    }, function (err) {
                        console.log("Other auth error:" + err? JSON.stringify(err) : "not specified");
                        return reject("something screwy");
                    });
                });
            }}, 
                instanceMethods: {
                    toPublicJSON: function () {
                        var json = this.toJSON();
                        return _.pick(json, "email", "id", "email", "createdAt", "updatedAt");
                    },
                    generateToken: function(tokenType) {
                        if(!_.isString(tokenType))
                            return undefined;
                        try {
                            console.log('generationg ' + tokenType + ' token');
                            var plainText = JSON.stringify({id: this.get('id'), type: tokenType});
                            console.log('plainText:' + plainText);
                            var encryptedData = cryptojs.AES.encrypt(plainText, 'abc123!@!').toString();
                            console.log('cipherText:' + encryptedData);
                            var token = jwt.sign({
                                token: encryptedData
                            }, 'qwerty098');
                            console.log(token);
                            return token;
                            
                        } catch (e) {
                            console.log("generateToken encountered error:" + e.toString());
                            return undefined;
                        }
                    }
                }
    });
    return user;
};
