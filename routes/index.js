const userController = require('../controllers/userController')

const multer = require('multer')
const upload = multer({ dest: 'temp/' })

const authenticated = require('../middleware/authenticated')

module.exports = (app) => {
  app.get('/get_current_user', authenticated, userController.getCurrentUser)
  app.get('/get_current_user_followings', authenticated, userController.getCurrentUserFollowings)
  app.get('/users/:id', authenticated, userController.getUser)
  app.put('/users/:id', authenticated, upload.single('avatar'), userController.putUser)
  app.post('/signin', userController.signIn)
  app.post('/signup', userController.signUp)
}
