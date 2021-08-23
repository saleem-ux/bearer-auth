'use strict';

const bcrypt = require('bcrypt');
const SECRET = process.env.JWT_SECRET || "super-secret";
const jwt = require('jsonwebtoken');

const userSchema = (sequelize, DataTypes) => {
    const model = sequelize.define('User', {
        username: { type: DataTypes.STRING, allowNull: false, unique: true },
        password: { type: DataTypes.STRING, allowNull: false, },
        token: {
            type: DataTypes.VIRTUAL,
            get() {
                return jwt.sign({ username: this.username, test: 'this is a test payload' }, SECRET);
            },
            set(tokenObj) {
                let token = jwt.sign(tokenObj, SECRET);
                return token;
            }
        }
    });

    model.beforeCreate(async (user) => {
        let hashedPass = bcrypt.hash(user.password, 10);
        user.password = hashedPass;
    });

    // Basic AUTH: Validating strings (username, password) 
    model.authenticateBasic = async function (username, password) {
        const user = await this.findOne({ where: { username } });
        // we need to check if null
        const isValid = await bcrypt.compare(password, user.password)
        if (isValid) { return user; }
        throw new Error('Invalid User');
    }

    // Bearer AUTH: Validating a token
    model.authenticateToken = async function (token) {
        console.log(token);
        console.log(jwt.decode(token));

        try {
            const parsedToken = jwt.verify(token, SECRET);
            //if not verified you need to throw an error
            const user = this.findOne({ where: { username: parsedToken.username } })
            if (user) { return user; }
            throw new Error("User Not Found");
        } catch (e) {
            throw new Error(e.message)
        }
    }

    return model;
}

module.exports = userSchema;