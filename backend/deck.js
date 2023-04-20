const getCards = () => {
  let cards = [];

  for (let i = 0; i < 10; i++) {
    let card = {
      value: i,
      color: 'blue',
      src: "/images/blue_" + i + ".png"
    }
    console.log(card)
    cards.push(card)
  }

  return cards
}

module.exports = {getCards};