const socket = io();

const welcome = document.querySelector("#welcome");
const join = document.querySelector("#join");
const room = document.querySelector("#room");

room.hidden = true;

let roomName;

function addMessage(message) {
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.append(li);
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
    room.hidden = false;
    changeTitle(newCount);
    const msgForm = room.querySelector("#msg");
    msgForm.addEventListener("submit", handleMessageSubmit);
}

function handleRoomSubmit(event) {
    event.preventDefault();
    const roomInput = join.querySelector("input:nth-child(1)");
    const nameInput = join.querySelector("input:nth-child(2)");
    socket.emit("enter_room", roomInput.value, nameInput.value, showRoom);
    roomName = roomInput.value;
    roomInput.value = "";
    nameInput.value = "";
}

function changeTitle(newCount) {
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${newCount})`;
}

join.addEventListener("submit", handleRoomSubmit);

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
    const roomList = welcome.querySelector("ul");
    roomList.innerHTML = "";
    rooms.forEach((room) => {
        const li = document.createElement("li");
        li.innerText = room;
        roomList.append(li);
    });
});