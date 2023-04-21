var socket = io.connect('http://localhost:3000/');
socket.on("connect",function() {
  console.log('Client has connected to the server!');
});

socket.on("chat", function(event) {
  console.log('chat');
  console.log(event);
  message = JSON.parse(event)
  document.getElementById('chatbox').innerHTML += '<div class=\"chattext\">' + message.user + ': ' + message.data + "</div>"
  document.getElementById('chatbox').scrollTop = document.getElementById('chatbox').scrollHeight;
});
socket.on("draw", function(event) {
  console.log('draw');
  console.log(event);
  message = JSON.parse(event)
  document.getElementById('cardarea').innerHTML = "<img src=\"" + message.data.src + "\"/>";
});
function sendMessage(event) {
  console.log('sendmessage')
  var inputMessage = document.getElementById('message')
  var room = document.getElementById('room')

  let x = sessionStorage.getItem('login')
  console.log(x);

  let user = JSON.parse(x)

  console.log(inputMessage.value)
  const message = {
    event: "chat",
    data: inputMessage.value,
    user: user.username,
    room: room.value
  }

  socket.emit('chat', JSON.stringify(message))
  inputMessage.value = ""
  event.preventDefault();
}
document.getElementById('input-form').addEventListener('submit', sendMessage);

function drawCard() {
  var room = document.getElementById('room')
  let x = sessionStorage.getItem('login')
  console.log(x);

  let user = JSON.parse(x)

  const message = {
    event: "draw",
    data: '',
    user: user.username,
    room: room.value
  }

  socket.emit('draw', JSON.stringify(message))
}