rooms = [
  {
    name: "room1",
    host: "abc",
    deck: [],
    currentplayer: 0,
    status: 'Waiting',
    discardcard: {},
    reverse: false,
    players: [
      { name: "player1", hands: [] },
      { name: "asdf", hands: [] },
    ],
  },
  { name: "room2", host: "xyz", currentplayer: 0, status: 'Waiting', reverse: false, discardcard: {}, deck: [], players: [] },
];
roomchats = [
  {
    name: "room1",
    chats: [
      {
        player: "player1",
        message: "hello",
      },
    ],
  },
];

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

const getPlayerByRoomAndName = (room, name) => {
  console.log("----getPlayerByRoomAndName----");
  //console.log(room);
  //console.log(name);
  //console.log(rooms);
  let result = rooms.find((r) => {
    //console.log(r);
    return r.name === room;
  });
  if (result !== undefined) {
    result = result.players.find((p) => {
      //console.log(p.name);
      return p.name === name;
    });
  }
  //console.log(result);
  return result;
};

const getNextPlayerByRoom = (room) => {
  console.log("----getNextPlayerByRoom----");
  //console.log(room);
  //console.log(rooms);
  let roomobj = rooms.find((r) => {
    //console.log(r);
    return r.name === room;
  });
  let result = {};
  if (roomobj !== undefined) {
    console.log('--------------');
    //console.log(roomobj);
    let i = roomobj.currentplayer;
    console.log(i);
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
    //console.log(roomobj);
    //console.log(i);
    //console.log(roomobj.players[i]);
    result = roomobj.players[i];
  }
  console.log('--------------');
  console.log(result);
  return result;
};

const getCurrentPlayerByRoom = (room) => {
  console.log("----getCurrentPlayerByRoom----");
  let roomobj = rooms.find((r) => {
    return r.name === room;
  });
  let result = {};
  if (roomobj !== undefined) {
    console.log('--------------');
    //console.log(roomobj);
    let i = roomobj.currentplayer;
    console.log(i);
    result = roomobj.players[i];
  }
  console.log('--------------');
  console.log(result);
  return result;
};

const updateRoomChat = (room, player, message) => {
  console.log("---- updateRoomChat");
  let roomchat = roomchats.find((r) => {
    return r.name === room;
  });
  if (roomchat !== undefined) {
    roomchat.chats.push({ player: player, message, message });
    console.log(roomchat);
  }
};
module.exports = {
  getRoomByName,
  getRoomChatByName,
  getPlayerByRoomAndName,
  updateRoomChat,
  getNextPlayerByRoom,
  getCurrentPlayerByRoom
};
