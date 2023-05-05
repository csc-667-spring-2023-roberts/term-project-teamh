var socket = io.connect("http://localhost:3000/");
socket.on("connect", function () {
  console.log("Client has connected to the server!");
});

socket.on("startgame", function (event) {
  console.log("startgame");
  console.log(event);
  message = JSON.parse(event);
  window.location.href = "/game?room="+message.room;
});

socket.on("chat", function (event) {
  console.log("chat");
  console.log(event);
  message = JSON.parse(event);
  document.getElementById("chatbox").innerHTML +=
    '<div class="chattext">' + message.user + ": " + message.data + "</div>";
  document.getElementById("chatbox").scrollTop =
    document.getElementById("chatbox").scrollHeight;
});
socket.on("draw", function (event) {
  console.log("draw");
  console.log(event);
  message = JSON.parse(event);
  const imgElement = document.createElement("img");
  imgElement.src = message.data.src;
  imgElement.style.width = "98px";
  imgElement.style.height = "136px";
  imgElement.setAttribute("cardid", message.data.cardId);
  imgElement.setAttribute("disabled", false);
  imgElement.setAttribute(
    "onclick",
    `discardCard(this, this.src, ${message.data.cardId})`
  );
  document.getElementById("cardarea").append(imgElement);
  // document.getElementById('cardarea').innerHTML = "<img src=\"" + message.data.src + "\"/>";
});

socket.on("discardcard", function (event) {
  console.log("from server: discardcard");
  console.log(event);
  message = JSON.parse(event);
  console.log(message);
  const imgElement = document.createElement("img");
  imgElement.src = message.cardimg;
  imgElement.style.width = "98px";
  imgElement.style.height = "136px";
  imgElement.id = "discardimg";
  imgElement.setAttribute("cardid", message.cardid);
  let old = document.getElementById("discardimg");
  document.getElementById("discardpile").removeChild(old);
  document.getElementById("discardpile").append(imgElement);
});

socket.on("whosturn", function (event) {
  console.log("from server: whosturn");
  console.log(event);
  message = JSON.parse(event);
  console.log(message);

  let x = sessionStorage.getItem("login");
  console.log(x);

  let user = JSON.parse(x);
  const btn = document.getElementById("drawbutton");
  console.log(btn);
  if (user.username === message.player) {
    console.log(user.username + " playing now")
    btn.disabled = false;
  } else {
    btn.disabled = true;
  }
  console.log(btn);
  let cardArea = document.getElementById("cardarea");
  let childs = cardArea.children;
  console.log(childs);
  for (let i = 0; i < childs.length; i++) {
    let el = childs[i];
    console.log(el.getAttribute("disabled"));
    el.setAttribute("disabled", btn.disabled);
  }

});

function sendMessage(event) {
  console.log("sendmessage");
  var inputMessage = document.getElementById("message");
  var room = document.getElementById("room");

  let x = sessionStorage.getItem("login");
  console.log(x);

  let user = JSON.parse(x);

  console.log(inputMessage.value);
  const message = {
    event: "chat",
    data: inputMessage.value,
    user: user.username,
    room: room.value,
  };

  socket.emit("chat", JSON.stringify(message));
  inputMessage.value = "";
  event.preventDefault();
}
//document.getElementById('input-form').addEventListener('submit', sendMessage);

function drawCard() {
  var room = document.getElementById("room");
  let x = sessionStorage.getItem("login");
  console.log(x);

  let user = JSON.parse(x);

  const message = {
    event: "draw",
    data: "",
    user: user.username,
    room: room.value,
  };

  socket.emit("draw", JSON.stringify(message));
}

function discardCard(img, imgsrc, id) {
  var room = document.getElementById("room");
  console.log(img.getAttribute("disabled"));
  if (img.getAttribute("disabled") === 'true') 
    return;

  console.log('-------');

  socket.emit("candiscardcard", JSON.stringify({
      cardid: id,
      room: room.value,
    }), (response)=>{
    console.log(response);
    if (response.status === 'ok') {
      console.log('-------2');
      console.log(id);
      let curDiscardCard = document.getElementById("discardimg");
      let discardCardId = curDiscardCard.getAttribute("cardid");
      console.log("discardCardId:" + discardCardId);
      
      let x = sessionStorage.getItem("login");
      let user = JSON.parse(x);
      console.log(user);
      const message = {
        event: "discard",
        data: {
          imgsrc: imgsrc,
          id: id,
        },
        user: user.username,
        room: room.value,
      };
    
      let cardArea = document.getElementById("cardarea");
      let childs = cardArea.children;
      console.log(childs);
      for (let i = 0; i < childs.length; i++) {
        let el = childs[i];
        console.log(el.getAttribute("cardid"));
        if (el.getAttribute("cardid") === id + "") {
          console.log("discard card" + id);
          cardArea.removeChild(el);
          break;
        }
      }
      socket.emit("discardcard", JSON.stringify(message));
    }
  });

}
