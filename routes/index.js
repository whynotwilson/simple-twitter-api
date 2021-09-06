const userController = require('../controllers/userController')


const authenticated = require('../middleware/authenticated')

module.exports = (app) => {
  app.get('/users/:id', authenticated, userController.getUser)
  app.post('/signin', userController.signIn)
  app.post('/signup', userController.signUp)
}
