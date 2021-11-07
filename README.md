# Simple-twitter-vue

<br/>

# 專案介紹

#### 本專案為增進個人開發能力所設置，使用前後端分離，本專案為後端部分，負責提供 api

<br/>

前端部分請前往 https://github.com/whynotwilson/simple-twitter-vue

<br/>

伺服器架設在 Heroku 上，https://simple-twitter-project-api.herokuapp.com/

<br/>

內容是一個社群網站，可在上面查看個人及他人頁面、發表心情貼文、留言、點讚、追蹤以及七種進階功能

1.  Hashtag - 已完成
2.  聊天功能 - 已完成
3.  小鈴鐺(即時通知)
4.  @ 好友
5.  打卡
6.  分享貼文
7.  封鎖

<br/><br/>

### 系統架構圖

![系統架構圖](/public/images/系統架構圖.jpg)

<br/><br/>

# 建構環境

- node
- express
- mysql
- sequelize

<br/><br/>

# 安裝專案

```
git clone https://github.com/whynotwilson/simple-twitter-api.git
cd simple-twitter-api
npm install
npx sequelize db:migrate
npx sequelize db:seed:all
nodemon app
```
