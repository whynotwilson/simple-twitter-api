const Websocket = require("ws");
let server = require("http").createServer();

const jwt = require("jsonwebtoken");
const db = require("./models");
const Message = db.Message;

const webSocketServer = {
  listen: (app, port) => {
    let onlineUsers = {};

    const authenticated = function (info) {
      const token = info.req.headers["sec-websocket-protocol"];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      info.req.userId = decoded.id;
      if (decoded.id) {
        return true;
      } else {
        return false;
      }
    };

    const wss = new Websocket.Server({
      clientTracking: true,
      noServer: true,
      verifyClient: authenticated,
    });

    server.on("request", app);

    wss.broadcastOnlineUsers = function () {
      const onlineUsersId = Object.values(onlineUsers).map(
        (user) => user.currentUserId
      );
      wss.clients.forEach((client) =>
        client.send(
          JSON.stringify({
            onlineUsersId,
          })
        )
      );
    };

    wss.deleteOnlineUser = function (id) {
      delete onlineUsers[id];
    };

    server.on("upgrade", function (request, socket, head) {
      wss.handleUpgrade(request, socket, head, function (ws) {
        wss.emit("connection", ws, request);
      });
    });

    wss.on("connection", (ws, req) => {
      const chattingUserId = Number(req.url.split("=")[1]);

      let isNewUser = Array.from(wss.clients)
        .map((c) => c.currentUserId)
        .includes(req.userId).length
        ? false
        : true;

      if (isNewUser) {
        onlineUsers[req.userId] = ws;
      }

      // close duplicated old webSocket
      Array.from(wss.clients).forEach((client) => {
        if (
          client.currentUserId === req.userId &&
          client.chattingUserId === chattingUserId
        ) {
          client.close();
        }
      });

      ws.currentUserId = req.userId;
      ws.chattingUserId = chattingUserId;

      console.log("Client connected");
      console.log("ws.currentUserId: " + ws.currentUserId);
      console.log("ws.chattingUserId: " + ws.chattingUserId);
      console.log("");

      wss.broadcastOnlineUsers();

      ws.on("message", async (data) => {
        try {
          let message = await Message.create({
            senderId: ws.currentUserId,
            receiverId: ws.chattingUserId,
            message: data.toString(),
          });

          Object.entries(onlineUsers).forEach(([key, user]) => {
            if (user.currentUserId === ws.chattingUserId) {
              user.send(
                JSON.stringify({
                  message: message.dataValues,
                })
              );
            }
          });

          ws.send(
            JSON.stringify({
              status: "success",
              message: message.dataValues,
            })
          );
        } catch (err) {
          console.log(err);
          ws.send(
            JSON.stringify({
              status: "error",
              message: message.dataValues || data.toString(),
            })
          );
        }
      });

      ws.on("close", () => {
        console.log("Close connected");
        console.log("ws.currentUserId: " + ws.currentUserId);
        console.log("ws.chattingUserId: " + ws.chattingUserId);
        console.log("");

        wss.deleteOnlineUser(ws.currentUserId);
        wss.broadcastOnlineUsers();
      });

      ws.on("error", (error) => {
        console.log("wss error: " + error);
      });
    });

    server.listen(port, function () {
      console.log(`Listening on ${port}`);
    });
  },
};

module.exports = webSocketServer;
