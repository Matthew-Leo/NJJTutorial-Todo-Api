var bcrypt = require('bcrypt');
var _ = require('underscore');
const SALT_LEN = 10;

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('user',
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
                    set: function(value) {
						var salt = bcrypt.genSaltSync(SALT_LEN);
						var hashedPassword = bcrypt.hashSync(value,salt);
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
				instanceMethods: {
					toPublicJSON: function () {
						var json = this.toJSON();
						return _.pick(json,"email","id","email","createdAt", "updatedAt");
					}
				}
			});

};
