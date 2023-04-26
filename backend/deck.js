const getCards = () => {
  let cards = [];

  let cardId = 0;
  // blue
  for (let i = 0; i < 10; i++) {
    let card = {
      value: cardId++,
      color: "blue",
      src: "/images/blue_" + i + ".png",
      type: "number",
    };
    //console.log(card)
    if (i == 0) {
      cards.push(card);
    } else {
      cards.push(card);
      card.value = cardId++;
      cards.push(card);
    }
  }
  let card = {
    value: cardId++,
    color: "blue",
    src: "/images/blue_picker.png",
    type: "pick2",
  };
  cards.push(card);

  card = {
    value: cardId++,
    color: "blue",
    src: "/images/blue_reverse.png",
    type: "reverse",
  };
  cards.push(card);

  card = {
    value: cardId++,
    color: "blue",
    src: "/images/blue_skip.png",
    type: "reverse",
  };
  cards.push(card);

  // red
  for (let i = 0; i < 10; i++) {
    let card = {
      value: cardId++,
      color: "red",
      src: "/images/red_" + i + ".png",
      type: "number",
    };
    //console.log(card)
    if (i == 0) {
      cards.push(card);
    } else {
      cards.push(card);
      card.value = cardId++;
      cards.push(card);
    }
  }
  card = {
    value: cardId++,
    color: "red",
    src: "/images/red_picker.png",
    type: "pick2",
  };
  cards.push(card);

  card = {
    value: cardId++,
    color: "red",
    src: "/images/red_reverse.png",
    type: "reverse",
  };
  cards.push(card);

  card = {
    value: cardId++,
    color: "red",
    src: "/images/red_skip.png",
    type: "reverse",
  };
  cards.push(card);

  // green
  for (let i = 0; i < 10; i++) {
    let card = {
      value: cardId++,
      color: "green",
      src: "/images/green_" + i + ".png",
      type: "number",
    };
    //console.log(card)
    if (i == 0) {
      cards.push(card);
    } else {
      cards.push(card);
      card.value = cardId++;
      cards.push(card);
    }
  }

  card = {
    value: cardId++,
    color: "green",
    src: "/images/green_picker.png",
    type: "pick2",
  };
  cards.push(card);

  card = {
    value: cardId++,
    color: "green",
    src: "/images/green_reverse.png",
    type: "reverse",
  };
  cards.push(card);

  card = {
    value: cardId++,
    color: "green",
    src: "/images/green_skip.png",
    type: "reverse",
  };
  cards.push(card);

  // yellow
  for (let i = 0; i < 10; i++) {
    let card = {
      value: cardId++,
      color: "yellow",
      src: "/images/yellow_" + i + ".png",
      type: "number",
    };
    //console.log(card)
    if (i == 0) {
      cards.push(card);
    } else {
      cards.push(card);
      card.value = cardId++;
      cards.push(card);
    }
  }

  card = {
    value: cardId++,
    color: "yellow",
    src: "/images/yellow_picker.png",
    type: "pick2",
  };
  cards.push(card);

  card = {
    value: cardId++,
    color: "yellow",
    src: "/images/yellow_reverse.png",
    type: "reverse",
  };
  cards.push(card);

  card = {
    value: cardId++,
    color: "yellow",
    src: "/images/yellow_skip.png",
    type: "reverse",
  };
  cards.push(card);

  return cards;
};

function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;

  // While there are remaining elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

module.exports = { getCards, shuffle };
