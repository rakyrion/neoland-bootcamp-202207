const { runWithErrorHandling } = require('../../utils')
const { users: {registerUser} } = require('../../logic')
const logger = require('../../logger')(module)

function registerUserHandler(req, res){
    runWithErrorHandling(async () => {
        const { body: { name, email, password, companyId, role } } = req

        await registerUser(name, email, password, companyId, role)

        res.status(201).send()
    
    }, res, logger)
}

module.exports = registerUserHandler