const getCards = () => {
  let cards = [];

  // blue
  for (let i = 0; i < 10; i++) {
    let card = {
      value: i,
      color: 'blue',
      src: "/images/blue_" + i + ".png"
    }
    //console.log(card)
    if (i==0) {
      cards.push(card)
    } else {
      cards.push(card)
      cards.push(card)
    }
  }
  // red
  for (let i = 0; i < 10; i++) {
    let card = {
      value: i,
      color: 'red',
      src: "/images/red_" + i + ".png"
    }
    //console.log(card)
    if (i==0) {
      cards.push(card)
    } else {
      cards.push(card)
      cards.push(card)
    }
  }
  // green
  for (let i = 0; i < 10; i++) {
    let card = {
      value: i,
      color: 'green',
      src: "/images/green_" + i + ".png"
    }
    //console.log(card)
    if (i==0) {
      cards.push(card)
    } else {
      cards.push(card)
      cards.push(card)
    }
  }  
  // yellow
  for (let i = 0; i < 10; i++) {
    let card = {
      value: i,
      color: 'yellow',
      src: "/images/yellow_" + i + ".png"
    }
    //console.log(card)
    if (i==0) {
      cards.push(card)
    } else {
      cards.push(card)
      cards.push(card)
    }
  } 
  return cards
}

module.exports = {getCards};