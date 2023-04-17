console.log("Hello from a bundled asset.");

const webSocket = new WebSocket('ws://localhost:3001/');
webSocket.onmessage = (event) => {
  console.log(event)
  message = JSON.parse(event.data)
  if (message.event == "chat" || message.event == "socket") {
    document.getElementById('chatbox').innerHTML += 'Message from server: ' + message.data + "<br>"
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
  var inputMessage = document.getElementById('message')
  webSocket.send(inputMessage.value)
  inputMessage.value = ""
  event.preventDefault();
}
document.getElementById('input-form').addEventListener('submit', sendMessage);