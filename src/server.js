import http from "http";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {
    cors: {
      origin: ["https://admin.socket.io"],
      credentials: true
    }
});

instrument(wsServer, {
    auth: false
});

function publicRooms() {
    const sids = wsServer.sockets.adapter.sids;
    const rooms = wsServer.sockets.adapter.rooms;

    const publicRooms = [];
    rooms.forEach((room, key) => {
        if(sids.get(key) === undefined) {
            publicRooms.push(`${key} (${room.size})`);
        }
    });

    return publicRooms;
}

function countRoom(roomName) {
    return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on("connection", socket => {
    socket["nickname"] = `Anon-${new Date().getTime()}`;
    socket.emit("nickname_change", socket.nickname);
    socket.emit("room_change", publicRooms());
    socket.onAny((event) => {
        console.log(`Socket Event: ${event}`);
    });
    socket.on("enter_room", (roomName, done) => {
        socket.join(roomName);
        const userCount = countRoom(roomName);
        done(userCount);
        socket.to(roomName).emit("welcome", socket.nickname, userCount);
        wsServer.sockets.emit("room_change", publicRooms());
    });
    socket.on("disconnecting", (reason) => {
        socket.rooms.forEach((room) => {
            socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1);
        });
    });
    socket.on("disconnect", () => {
        wsServer.sockets.emit("room_change", publicRooms());
    });
    socket.on("new_message", (msg, room, done) => {
        socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
        done();
    });
    socket.on("nickname_change", (userName, done) => {
        const sockets = wsServer.sockets.sockets;
        sockets.forEach((key) => {
            if(key.nickname === userName && key.id !== socket.id) {
                userName = `${userName}@`;
            }
        });
        socket["nickname"] = userName;
        done(userName);
    });
    socket.on("leave_room", (roomName, done) => {
        socket.leave(roomName);
        if(countRoom(roomName) > 0) {
            socket.to(roomName).emit("bye", socket.nickname, countRoom(roomName));
        }
        wsServer.sockets.emit("room_change", publicRooms());
        done();
    })
});

/* const sockets = [];
wss.on("connection", (socket) => {
    sockets.push(socket);
    socket["nickname"] = "Anon";
    console.log("Connected to Browser ✅");
    socket.on("close", () => console.log("Disconnected from the Browser ❌"));
    socket.on("message", (msg) => {
        const message = JSON.parse(msg);
        switch(message.type) {
            case "new_message":
                sockets.forEach((aSocket) => aSocket.send(`${socket.nickname}: ${message.payload}`));
                break;
            case "nickname":
                socket["nickname"] = message.payload;
                break;
        }
    });
}); */

httpServer.listen(3000, handleListen);