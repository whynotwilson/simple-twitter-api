const tweetController = require('../controllers/tweetController')
const userController = require('../controllers/userController')

const multer = require('multer')
const upload = multer({ dest: 'temp/' })

const authenticated = require('../middleware/authenticated')

module.exports = (app) => {
  app.get('/get_current_user', authenticated, userController.getCurrentUser)
  app.get('/get_current_user_followings', authenticated, userController.getCurrentUserFollowings)

  app.get('/', authenticated, (req, res) => res.redirect('/tweets'))
  app.get('/tweets', authenticated, tweetController.getTweets)
  app.post('/tweets', authenticated, tweetController.postTweet)
  app.get('/users/:id', authenticated, userController.getUser)
  app.put('/users/:id', authenticated, upload.single('avatar'), userController.putUser)
  app.get('/users/:id/tweets', authenticated, userController.getTweets)

  app.post('/signin', userController.signIn)
  app.post('/signup', userController.signUp)
}
