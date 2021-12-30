const socket = io();

const welcome = document.querySelector("#welcome");
const join = document.querySelector("#join");
const nickname = document.querySelector("#name");
const room = document.querySelector("#room");
const leaveBtn = document.querySelector(".room__leave");
const roomList = document.querySelector("#roomList");

room.hidden = true;

let roomName;

function addMessage(message) {
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    const aside = room.querySelector("section aside");
    li.innerText = message;
    ul.append(li);
    aside.scrollTop = aside.scrollHeight;
}

function handleMessageSubmit(event) {
    event.preventDefault();
    const input = room.querySelector("#msg input");
    const value = input.value;
    socket.emit("new_message", input.value, roomName, () => {
        addMessage(`You: ${value}`);
    });
    input.value = "";
}

function showRoom(newCount) {
    welcome.hidden = true;
    roomList.hidden = true;
    room.hidden = false;
    changeTitle(newCount);
    const msgForm = room.querySelector("#msg");
    const ul = room.querySelector("section aside ul");
    ul.innerHTML = "";
    msgForm.addEventListener("submit", handleMessageSubmit);
}

function handleRoomSubmit(event) {
    event.preventDefault();
    const roomInput = join.querySelector("input");
    socket.emit("enter_room", roomInput.value, showRoom);
    roomName = roomInput.value;
    roomInput.value = "";
}

function handleRoomClick(event) {
    event.preventDefault();
    const selectRoomName = event.target.innerText.split(" ")[0];
    socket.emit("enter_room", selectRoomName, showRoom);
    roomName = selectRoomName;
}

function handleNicknameSubmit(event) {
    event.preventDefault();
    const nicknameInput = nickname.querySelector("input");
    socket.emit("nickname_change", nicknameInput.value, changeNickname);
    nicknameInput.value = "";
}

function handleLeaveBtnClick(event) {
    event.preventDefault();
    socket.emit("leave_room", roomName, leaveRoom);
}

function changeTitle(newCount) {
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${newCount})`;
}

function changeNickname(userName) {
    const b = document.querySelector("header p b");
    b.innerText = `'${userName}'`;
}

function leaveRoom() {
    welcome.hidden = false;
    roomList.hidden = false;
    room.hidden = true;
}

join.addEventListener("submit", handleRoomSubmit);
nickname.addEventListener("submit", handleNicknameSubmit);
leaveBtn.addEventListener("click", handleLeaveBtnClick);

socket.on("welcome", (user, newCount) => {
    changeTitle(newCount);
    addMessage(`${user} joined!`);
});

socket.on("bye", (user, newCount) => {
    changeTitle(newCount);
    addMessage(`${user} left!`);
});

socket.on("new_message", addMessage);

socket.on("room_change", (rooms) => {
    const openRoomList = document.querySelector("#roomList ul li ul");
    const roomCount = document.querySelector("#roomList ul li a span");
    roomCount.innerText = `(${rooms.length})`;
    openRoomList.innerHTML = "";
    rooms.forEach((room) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = "#";
        a.innerText = room;
        a.addEventListener("click", handleRoomClick);
        li.append(a);
        openRoomList.append(li);
    });
});

socket.on("nickname_change", (user) => {
    changeNickname(user);
});