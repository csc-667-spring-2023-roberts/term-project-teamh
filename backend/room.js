rooms = [
  { 
    name: 'room1', 
    host: 'abc', 
    deck: [],
    players: [
      { name: 'player1',
        hands: []
      }, 
      { name: 'asdf',
        hands: []
      }
    ] 
  },
  { name: 'room2', host: 'xyz', deck: [], players: [] },
]
roomchats = [
  { 
    name: 'room1', chats: [
    { 
      player: 'player1',
      message: 'hello'
    }] 
  },
]

const getRoomByName = (name) => {
  let result = rooms.find(r => {
    return r.name === name
  })
  return result
}

const getRoomChatByName = (name) => {
  let roomchat = roomchats.find(r => {
    return r.name === name
  })
  return roomchat
}

const getPlayerByRoomAndName = (room, name) => {
  console.log('----getPlayerByRoomAndName----')
  console.log(room)
  console.log(name)
  console.log(rooms);
  let result = rooms.find(r => {
    console.log(r)
    return r.name === room;
  });
  if (result !== undefined) {
    result = result.players.find(p => {
      console.log(p.name)
      return p.name === name;
    });
  }
  console.log(result)
  return result;
}

const updateRoomChat = (room, player, message) => {
  console.log('---- updateRoomChat')
  let roomchat = roomchats.find(r => {
    return r.name === room
  })
  if (roomchat !== undefined) {
    roomchat.chats.push({player: player, message, message})
    console.log(roomchat)
  }
}
module.exports = {getRoomByName, getRoomChatByName, getPlayerByRoomAndName, updateRoomChat};