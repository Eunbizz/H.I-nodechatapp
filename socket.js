const SocketIO = require("socket.io");
const moment = require("moment");
const jwt = require("jsonwebtoken");
var db = require("./models/index");

module.exports = (server) => {
    const io = SocketIO(server, {
        path: "/socket.io",
        cors:{
            origin: "*",
            methods:["GET", "POST"]
        },
    });

    io.on("connection", async (socket) => {
        const req = socket.request;
        const socketId = socket.id;
        const userIP = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    
        // 채팅방 입장 처리 이벤트
        socket.on("chatEntry", async (channelId, nickname) => {
            socket.join(channelId); // 채널에 입장
            socket.emit("chatEntry", nickname); // 나 자신에게 입장 메시지 전송
            socket.to(channelId).emit("chatEntry", nickname); // 나를 제외한 다른 사용자에게 입장 메시지 전송
        });
    });

}