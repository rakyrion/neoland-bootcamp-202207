const { Schema, Types : { ObjectId } } = require('mongoose')

const user = new Schema({
    name:{
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    company: {
        type: ObjectId,
        required: true,
        ref: 'Company'
    },

    rol: {
        type: String,
        enum: ['admin', 'accountant', 'employer'],
        required: true
    }

})

module.exports = user