const userController = require('../controllers/userController')

module.exports = (app) => {
  app.post('/signin', userController.signIn)
}
