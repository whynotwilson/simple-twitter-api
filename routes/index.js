const userController = require('../controllers/userController')

module.exports = (app) => {
  app.post('/signin', userController.signIn)
  app.post('/signup', userController.signUp)
}
