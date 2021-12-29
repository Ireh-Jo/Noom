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

function showRoom() {
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}`;
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

join.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (user) => {
    addMessage(`${user} joined!`);
});

socket.on("bye", (user) => {
    addMessage(`${user} left!`);
});

socket.on("new_message", addMessage);