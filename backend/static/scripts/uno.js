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
  const imgElement = document.createElement('img');
  imgElement.src = message.data.src;
  imgElement.style.width = "98px";
  imgElement.style.height = "136px";
  imgElement.setAttribute("onclick", `discardCard(this.src, ${message.data.value})`);
  document.getElementById('cardarea').append(imgElement);
  // document.getElementById('cardarea').innerHTML = "<img src=\"" + message.data.src + "\"/>";
});

socket.on("discardcard", function(event) {
  console.log('discardcard');
  console.log(event);
  message = JSON.parse(event)
  console.log(message);
  const imgElement = document.createElement('img');
  imgElement.src = message.cardimg;
  imgElement.style.width = "98px";
  imgElement.style.height = "136px";
  imgElement.id = "discardimg";
  old = document.getElementById('discardimg');
  document.getElementById('discardpile').removeChild(old);
  document.getElementById('discardpile').append(imgElement);
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

function discardCard(imgsrc, id) {
  var room = document.getElementById('room');
  let x = sessionStorage.getItem('login');
  let user = JSON.parse(x);;
  console.log(user);
  const message = {
    event: "discard",
    data: {
      imgsrc: imgsrc,
      id: id
    },
    user: user.username,
    room: room.value
  }
  socket.emit('discardcard', JSON.stringify(message));
}