rooms = [];
roomchats = [];

// rooms = [
//   {
//     name: "room1",
//     host: "abc",
//     deck: [],
//     discardPile: [],
//     currentplayer: 0,
//     status: 'Waiting',
//     discardcard: {},
//     reverse: false,
//     password: "",
//     numberOfPlayers: 0,
//     players: [
//       { name: "player1", hands: [] },
//       { name: "asdf", hands: [] },
//     ],
//   }
// ];
// roomchats = [
//   {
//     name: "room1",
//     chats: [
//       {
//         player: "player1",
//         message: "hello",
//       },
//     ],
//   },
// ];

const getRoomByName = (name) => {
  let result = rooms.find((r) => {
    return r.name === name;
  });
  return result;
};

const getRoomChatByName = (name) => {
  let roomchat = roomchats.find((r) => {
    return r.name === name;
  });
  return roomchat;
};

const removeRoomByName = (name) => {
  let index = rooms.findIndex((r) => {
    return r.name === name;
  });
  rooms.splice(index, 1);

  return 1;
};

const getPlayerByRoomAndName = (room, name) => {
  console.log("----getPlayerByRoomAndName----");
  let result = rooms.find((r) => {
    return r.name === room;
  });
  if (result !== undefined) {
    result = result.players.find((p) => {
      return p.name === name;
    });
  }
  return result;
};

const getNextPlayerByRoom = (room) => {
  console.log("----getNextPlayerByRoom----");
  let roomobj = rooms.find((r) => {
    return r.name === room;
  });
  let result = {};
  if (roomobj !== undefined) {
    let i = roomobj.currentplayer;
    if (roomobj.reverse === false) {
      if (roomobj.currentplayer === roomobj.players.length-1) {
        i = 0;
      } else {
        i++;
      }
    } else {
      if (roomobj.currentplayer === 0) {
        i = roomobj.players.length - 1;
      } else {
        i--;
      }
    }
    roomobj.currentplayer = i;
    result = roomobj.players[i];
  }
  return result;
};

const getCurrentPlayerByRoom = (room) => {
  console.log("----getCurrentPlayerByRoom----");
  let roomobj = rooms.find((r) => {
    return r.name === room;
  });
  let result = {};
  if (roomobj !== undefined) {
    let i = roomobj.currentplayer;
    console.log(i);
    result = roomobj.players[i];
  }
  return result;
};

const updateRoomChat = (room, player, message) => {
  console.log("---- updateRoomChat");
  let roomchat = roomchats.find((r) => {
    return r.name === room;
  });
  if (roomchat !== undefined) {
    roomchat.chats.push({ player: player, message, message });
  }
};
module.exports = {
  getRoomByName,
  getRoomChatByName,
  getPlayerByRoomAndName,
  updateRoomChat,
  getNextPlayerByRoom,
  getCurrentPlayerByRoom,
  removeRoomByName
};
