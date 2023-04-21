rooms = [
  { name: 'room1', host: 'abc', players: [{ name: 'player1' }] },
  { name: 'room2', host: 'xyz', players: [] },
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
module.exports = {getRoomByName, getRoomChatByName, updateRoomChat};