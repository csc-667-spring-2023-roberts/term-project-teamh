console.log("Hello from a bundled asset.");

const webSocket = new WebSocket('ws://localhost:3001/');
webSocket.onmessage = (event) => {
  console.log(event)
  message = JSON.parse(event.data)
  console.log(message)

  if (message.event === "socket") {
    console.log('connected to socket')
  }
  if (message.event === 'chat') {
    document.getElementById('chatbox').innerHTML += '<div class=\"chattext\">' + message.user + ': ' + message.data+ "</div>"
    document.getElementById('chatbox').scrollTop = document.getElementById('chatbox').scrollHeight;
  }
  if (message.event === 'draw') {
    document.getElementById('cardarea').innerHTML = "<img src=\"" + message.data.src + "\"/>";
  }
};
webSocket.addEventListener("open", () => {
  console.log("We are connected");
});
function sendMessage(event) {
  console.log('sendmessage')
  var inputMessage = document.getElementById('message')
  var room = document.getElementById('room')

  let x = sessionStorage.getItem('login')
  console.log(x);

  let user = JSON.parse(x)

  console.log(inputMessage)
  const message = {
    event: "chat",
    data: inputMessage.value,
    user: user.username,
    room: room.value
  }

  webSocket.send(JSON.stringify(message))
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

  webSocket.send(JSON.stringify(message))
}