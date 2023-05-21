socket.on("connect", function () {
  console.log("Client has connected to the server!");
});

socket.on("startgame", function (event) {
  console.log("startgame");
  message = JSON.parse(event);
  window.location.href = "/game?room="+message.room;
});

socket.on("update-cards-left", function (event) {
  console.log("update-cards-left");
  message = JSON.parse(event);
  document.getElementById("cardsleft").innerHTML =
    message.cardsleft + " cards left";
});
socket.on("chat", function (event) {
  console.log("chat");
  message = JSON.parse(event);
  document.getElementById("chatbox").innerHTML +=
    '<div class="chattext">' + message.user + ": " + message.data + "</div>";
  document.getElementById("chatbox").scrollTop =
    document.getElementById("chatbox").scrollHeight;
});
socket.on("waitroom-update", function (data) {
  console.log("waitroom-update");
  room = JSON.parse(data);

  let players = "";
  for (let i = 0; i < room.players.length; i++) {
    players += '<li>' + room.players[i].name + "</li>";
  }

  document.getElementById("players").innerHTML = players;
});
socket.on("gameroom-player-update", function (data) {
  console.log("gameroom-player-update");
  room = JSON.parse(data);

  let x = sessionStorage.getItem("login");
  let user = JSON.parse(x);

  let players = "";
  for (let i = 0; i < room.players.length; i++) {
    let cur = "";
    if (room.currentplayer === i) {
      cur = " <= ";
    }
    if (room.players[i].name === user.username) {
      players += '<li>' + room.players[i].name + " (You) " + cur + "</li>";
    } else {
      players += '<li>' + room.players[i].name + " " + cur + "</li>";
    }
  }

  document.getElementById("players").innerHTML = players;
});
socket.on("draw", function (event) {
  console.log("draw");
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
  const btn = document.getElementById("drawbutton");
  btn.disabled = true;
});

socket.on("discardcard", function (event) {
  console.log("from server: discardcard");
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
  if (message.card.type === "wild" || message.card.type === "wild4") {
    document.getElementById("color").innerText = message.card.color;
  } else {
    document.getElementById("color").innerText = "";
  }
});

socket.on("whosturn", function (event) {
  console.log("from server: whosturn");
  message = JSON.parse(event);

  var room = document.getElementById("room");
  let x = sessionStorage.getItem("login");

  let user = JSON.parse(x);
  const btn = document.getElementById("drawbutton");
  if (user.username === message.player) {
    btn.disabled = false;
  } else {
    btn.disabled = true;
  }
  let cardArea = document.getElementById("cardarea");
  let childs = cardArea.children;
  for (let i = 0; i < childs.length; i++) {
    let el = childs[i];
    el.setAttribute("disabled", btn.disabled);
  }

  if (user.username === message.player) {
    const message = {
      user: user.username,
      room: room.value,
    };
    socket.emit("shouldEndTurn", JSON.stringify(message), (response)=>{
      if (response.status === 'yes') {
        socket.emit("endTurn", JSON.stringify(message));
      }
    });
  }

});

socket.on("gameend", function (message) {
  let payload = JSON.parse(message);
  let x = sessionStorage.getItem("login");
  let user = JSON.parse(x);
  if (user.username === payload.winner) {
    window.location.href = "/winScreen?room=" + payload.room;
  } else {
    window.location.href = "/looseScreen?room=" + payload.room;
  }
});

function sendMessage(event) {
  console.log("sendmessage");
  var inputMessage = document.getElementById("message");
  var room = document.getElementById("room");

  let x = sessionStorage.getItem("login");

  let user = JSON.parse(x);

  const message = {
    data: inputMessage.value,
    user: user.username,
    room: room.value,
  };

  socket.emit("chat", JSON.stringify(message));
  inputMessage.value = "";
  event.preventDefault();
}

function drawCard() {
  var room = document.getElementById("room");
  let x = sessionStorage.getItem("login");
  console.log(x);

  let user = JSON.parse(x);

  const message = {
    data: "",
    user: user.username,
    room: room.value,
  };

  socket.emit("draw", JSON.stringify(message));
}

function discardCard(img, imgsrc, id) {
  var room = document.getElementById("room");
  if (img.getAttribute("disabled") === 'true') 
    return;

  let x = sessionStorage.getItem("login");
  let user = JSON.parse(x);
  
  socket.emit("candiscardcard", JSON.stringify({
      cardid: id,
      room: room.value,
      user: user.username,
    }), (response)=>{
    if (response.status === 'yes') {
      const message = {
        data: {
          imgsrc: imgsrc,
          id: id,
        },
        user: user.username,
        room: room.value,
      };
    
      let cardArea = document.getElementById("cardarea");
      let childs = cardArea.children;
      for (let i = 0; i < childs.length; i++) {
        let el = childs[i];
        if (el.getAttribute("cardid") === id + "") {
          cardArea.removeChild(el);
          break;
        }
      }
      socket.emit("discardcard", JSON.stringify(message));
    }
  });

}
