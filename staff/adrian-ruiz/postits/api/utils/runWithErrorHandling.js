const { RegexError, AuthError, NotFoundError, DuplicityError, FormatError } = require('errors')
const { JsonWebTokenError, TokenExpiredError, NotBeforeError} = require('jsonwebtoken')

async function runWithErrorHandling(callback, res, logger) {
    try {
        await callback()
    } catch (error) {
        if (error instanceof TypeError || error instanceof FormatError || error instanceof RegexError)
            res.status(400).json({ error: error.message })
        else if (error instanceof DuplicityError)
            res.status(409).json({ error: error.message })
        else if (error instanceof AuthError || error instanceof NotFoundError)
            res.status(401).json({ error: error.message })
        else if (error instanceof JsonWebTokenError || error instanceof TokenExpiredError || error instanceof NotBeforeError)
            res.status(401).json({ error: 'Token not valid' })
        else res.status(500).json({ error: 'System error' })

        logger.error(error)
    }
}

module.exports = runWithErrorHandling

