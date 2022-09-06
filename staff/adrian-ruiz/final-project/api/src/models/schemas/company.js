const { Schema, Types : {ObjectId} } = require('mongoose')
const user = require('./user')

const company = new Schema({
    name:{
        type: String,
    },

    legalName: {
        type: String
    },

    legalId: {
        type: String,
    },

    admin: {
        type: ObjectId,
        ref: 'User'
        // How to make it required. I need company to create user and I need user to create company??
    },

    users: [{
        type: ObjectId,
        ref: 'User'
    }],

    telephone: {
        type: Number
    },

    companyEmail : {
        type: String
    },

    customerFacingEmail: {
        type: String
    },

    postalAddress: {
        street : {
            type : String,
            req: true
        },
        town : {
            type : String
        },
        state : {
            type: String
        },
        zipCode: {
            type: Number
        },
        country : {
            type : String
        },
        req : false
    },

    physicalAddress: {
        street : {
            type : String,
            req : true
        },
        town : {
            type : String
        },
        state : {
            type: String
        },
        zipCode: {
            type: Number
        },
        country : {
            type : String
        },
        req : false
    },

    sector: {
        type: String,
    },

    website: {
        type: String
    }

})

module.exports = company