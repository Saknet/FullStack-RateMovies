const morgan = require('morgan')

morgan.token('type', function (req) { return JSON.stringify(req.body)})
  
const tokenExtractor = (request, response, next) => {
    const authorization = request.get('authorization')
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        request.token = authorization.substring(7)
    }
    next()
}

const error = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

module.exports = {
    tokenExtractor,
    morgan,
    error
}