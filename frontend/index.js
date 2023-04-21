console.log("Hello from a bundled asset.");

import io from "socket.io-client";

const socket = io();

const messageContainer = document.querySelector("#messages");

socket.on("chat-message", ({ message, sender }) => {
  console.log({ message, sender });

  const display = document.createElement("div");
  const name = document.createElement("span");
  name.innerText = sender;

  const thing = document.createElement("div");
  thing.innerText = message;

  display.appendChild(name);
  display.appendChild(thing);

  messageContainer.append(display);
});

document
  .querySelector("input#chatMessage")
  .addEventListener("keydown", (event) => {
    if (event.keyCode === 13) {
      const message = event.target.value;
      event.target.value = "";

      fetch("/chat/0", {
        method: "post",
        body: JSON.stringify({ message }),
        headers: { "Content-Type": "application/json" },
      });
    }
  });