console.log("Hello from a bundled asset.");

const webSocket = new WebSocket('ws://localhost:3001/');
webSocket.onmessage = (event) => {
  console.log(event)
  message = JSON.parse(event.data)
  console.log(message)

  if (message.event == "chat") {

    document.getElementById('chatbox').innerHTML += '' + message.user + ': ' + message.data + "<br/>"
  }
  if (message.event == "socket") {
    console.log('connected to socket')
  }
  if (message.event == "draw") {
    console.log("draw")
    console.log(message.data.src)
    //var oldscrollHeight = $("#chatbox")[0].scrollHeight - 20; 
    document.getElementById('cardarea').innerHTML = "<img src=\"" + message.data.src+ "\"/>" ;
    document.getElementById('chatbox').scrollTop = document.getElementById('chatbox').scrollHeight;
  }
  console.log(message);
};
webSocket.addEventListener("open", () => {
  console.log("We are connected");
});
function sendMessage(event) {
  console.log('sendmessage')
  var inputMessage = document.getElementById('message')

  let x = sessionStorage.getItem('login')
  console.log(x);

  let user = JSON.parse(x)

  console.log(inputMessage)
  const message = {
    event: "chat",
    data: inputMessage.value,
    user: user.username
  }

  webSocket.send(JSON.stringify(message))
  inputMessage.value = ""
  event.preventDefault();
}
document.getElementById('input-form').addEventListener('submit', sendMessage);