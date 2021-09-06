const db = require('../models')
const User = db.User
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userController = {
  signIn: async (req, res) => {
    try {
      if (!req.body.email || !req.body.password) {
        throw ('請輸入必填欄位')
      }

      let username = req.body.email
      let password = req.body.password

      let user = await User.findOne({ where: { email: username } })
      if (!user) {
        throw ('查無該用戶')
      }
      if (!bcrypt.compareSync(password, user.password)) {
        throw ('密碼錯誤')
      }

      // 簽發 token
      const payload = { id: user.id }
      const token = jwt.sign(payload, process.env.JWT_SECRET)
      return res.json({
        status: 'success',
        message: '登入成功',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
        }
      })
    } catch (err) {
      console.log(err)
      return res.json({
        status: 'error',
        message: err.message || err
      })
    }
  },
}

module.exports = userController