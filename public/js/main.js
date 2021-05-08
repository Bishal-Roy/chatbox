const socket = io();
const chatform = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

//get username and room name

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

//join chatroom
socket.emit('joinRoom', { username, room });

//join room and users
socket.on('roomUsers', ({ room, users }) => {
  outPutRoomName(room);
  outPutUsers(users);
});

//listining the message from server
socket.on('message', (message) => {
  console.log(message);
  outPutMessage(message);

  //scrool down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

chatform.addEventListener('submit', (e) => {
  e.preventDefault();
  //get message text
  const msg = e.target.elements.msg.value;
  //emiting message to the server
  socket.emit('chatMessage', msg);

  //remove value from input
  e.target.elements.msg.value = '';
  //focus on the input section
  e.target.elements.msg.focus();
});

//outPutMessage to dom
function outPutMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `<p class="meta"> ${message.username} <span>${message.time}</span></p>
    <p class="text">${message.text} </p>`;
  document.querySelector('.chat-messages').appendChild(div);
}

//add room name to dom
function outPutRoomName(room) {
  roomName.innerText = room;
}

//add users to dom
function outPutUsers(users) {
  userList.innerHTML = `
    ${users.map((user) => `<li>${user.username}</li>`).join('')}
    `;
}
