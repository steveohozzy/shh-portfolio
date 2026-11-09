export const BOARD_SPACES = [
  {
    "stage": 0,
    "x": 12.0,
    "y": 11.5,
    "kind": "start",
    "id": null,
    "t": "START",
    "a": "",
    "fx": null
  },
  {
    "stage": 0,
    "x": 26.5,
    "y": 6.3,
    "kind": "space",
    "id": null,
    "t": "You see your friend Robin",
    "a": "Move to Robin's Roost",
    "fx": {
      "type": "goto",
      "to": "roost"
    }
  },
  {
    "stage": 0,
    "x": 40.5,
    "y": 9.3,
    "kind": "space",
    "id": null,
    "t": "Pull a silly face to",
    "a": "Move 1 space",
    "fx": {
      "type": "move",
      "n": 1
    }
  },
  {
    "stage": 0,
    "x": 48.0,
    "y": 16.8,
    "kind": "landmark",
    "id": "roost",
    "t": "Robin's Roost",
    "a": "",
    "fx": null
  },
  {
    "stage": 0,
    "x": 38.0,
    "y": 25.2,
    "kind": "space",
    "id": null,
    "t": "",
    "a": "",
    "fx": null
  },
  {
    "stage": 0,
    "x": 25.5,
    "y": 24.0,
    "kind": "space",
    "id": null,
    "t": "Do an impression of a bird to",
    "a": "Move 2 spaces",
    "fx": {
      "type": "move",
      "n": 2
    }
  },
  {
    "stage": 0,
    "x": 14.5,
    "y": 29.4,
    "kind": "space",
    "id": null,
    "t": "You found a present",
    "a": "Move 1 space",
    "fx": {
      "type": "move",
      "n": 1
    }
  },
  {
    "stage": 0,
    "x": 12.2,
    "y": 38.4,
    "kind": "space",
    "id": null,
    "t": "",
    "a": "",
    "fx": null
  },
  {
    "stage": 0,
    "x": 28.5,
    "y": 41.4,
    "kind": "space",
    "id": null,
    "t": "You got distracted by snacks",
    "a": "Miss a turn",
    "fx": {
      "type": "miss"
    }
  },
  {
    "stage": 0,
    "x": 44.0,
    "y": 35.0,
    "kind": "space",
    "id": null,
    "t": "",
    "a": "",
    "fx": null
  },
  {
    "stage": 0,
    "x": 55.0,
    "y": 32.4,
    "kind": "space",
    "id": null,
    "t": "You tripped over",
    "a": "Move back 1 space",
    "fx": {
      "type": "move",
      "n": -1
    }
  },
  {
    "stage": 0,
    "x": 68.0,
    "y": 32.0,
    "kind": "space",
    "id": null,
    "t": "",
    "a": "",
    "fx": null
  },
  {
    "stage": 0,
    "x": 81.0,
    "y": 33.6,
    "kind": "space",
    "id": null,
    "t": "Wiggle like a jelly to",
    "a": "Move 2 spaces",
    "fx": {
      "type": "move",
      "n": 2
    }
  },
  {
    "stage": 0,
    "x": 88.5,
    "y": 42.6,
    "kind": "space",
    "id": null,
    "t": "",
    "a": "Swap places with another player",
    "fx": {
      "type": "swap"
    }
  },
  {
    "stage": 0,
    "x": 74.0,
    "y": 45.6,
    "kind": "space",
    "id": null,
    "t": "",
    "a": "",
    "fx": null
  },
  {
    "stage": 0,
    "x": 67.5,
    "y": 52.8,
    "kind": "space",
    "id": null,
    "t": "You took a wrong turn",
    "a": "Go back to Robin's Roost",
    "fx": {
      "type": "goto",
      "to": "roost"
    }
  },
  {
    "stage": 0,
    "x": 51.5,
    "y": 49.8,
    "kind": "space",
    "id": null,
    "t": "",
    "a": "",
    "fx": null
  },
  {
    "stage": 0,
    "x": 42.5,
    "y": 54.0,
    "kind": "space",
    "id": null,
    "t": "You find a trail of acorns",
    "a": "Move to Squirrel Birch",
    "fx": {
      "type": "goto",
      "to": "birch"
    }
  },
  {
    "stage": 0,
    "x": 26.5,
    "y": 53.4,
    "kind": "space",
    "id": null,
    "t": "",
    "a": "",
    "fx": null
  },
  {
    "stage": 0,
    "x": 17.5,
    "y": 63.0,
    "kind": "space",
    "id": null,
    "t": "You found a present",
    "a": "Move 1 space",
    "fx": {
      "type": "move",
      "n": 1
    }
  },
  {
    "stage": 0,
    "x": 24.5,
    "y": 72.0,
    "kind": "space",
    "id": null,
    "t": "",
    "a": "",
    "fx": null
  },
  {
    "stage": 0,
    "x": 28.5,
    "y": 78.6,
    "kind": "landmark",
    "id": "birch",
    "t": "Squirrel Birch",
    "a": "",
    "fx": null
  },
  {
    "stage": 0,
    "x": 42.0,
    "y": 82.5,
    "kind": "space",
    "id": null,
    "t": "",
    "a": "",
    "fx": null
  },
  {
    "stage": 0,
    "x": 50.0,
    "y": 79.2,
    "kind": "space",
    "id": null,
    "t": "Do 3 star jumps to",
    "a": "Move 2 spaces",
    "fx": {
      "type": "move",
      "n": 2
    }
  },
  {
    "stage": 0,
    "x": 58.5,
    "y": 72.6,
    "kind": "space",
    "id": null,
    "t": "You dropped a present",
    "a": "Move back 3 spaces",
    "fx": {
      "type": "move",
      "n": -3
    }
  },
  {
    "stage": 1,
    "x": 8.0,
    "y": 81.0,
    "kind": "landmark",
    "id": "foxhole",
    "t": "Fabian's Foxhole",
    "a": "",
    "fx": null
  },
  {
    "stage": 1,
    "x": 26.5,
    "y": 91.7,
    "kind": "wisdom",
    "t": "Pick up a Squishy Wisdom card",
    "a": "Answer a dumpling question",
    "fx": {
      "type": "wisdom"
    }
  },
  {
    "stage": 1,
    "x": 30.5,
    "y": 82.0,
    "kind": "space",
    "id": null,
    "t": "",
    "a": "",
    "fx": null
  },
  {
    "stage": 1,
    "x": 35.1,
    "y": 73.7,
    "kind": "space",
    "id": "lost",
    "t": "You get lost & take the left tunnel",
    "a": "Take the left tunnel",
    "fx": {
      "type": "leftTunnel"
    }
  },
  {
    "stage": 1,
    "x": 36.6,
    "y": 63.4,
    "kind": "space",
    "id": null,
    "t": "You visit your friend Bella",
    "a": "Move to Bella's Burrow",
    "fx": {
      "type": "goto",
      "to": "bella"
    }
  },
  {
    "stage": 1,
    "x": 37.6,
    "y": 54.8,
    "kind": "wisdom",
    "t": "Pick up a Squishy Wisdom card",
    "a": "Answer a dumpling question",
    "fx": {
      "type": "wisdom"
    }
  },
  {
    "stage": 1,
    "x": 40.0,
    "y": 46.1,
    "kind": "space",
    "id": null,
    "t": "",
    "a": "",
    "fx": null
  },
  {
    "stage": 1,
    "x": 39.4,
    "y": 36.4,
    "kind": "space",
    "id": "nap",
    "t": "You need a nap",
    "a": "Move back to Fabian's Foxhole",
    "fx": {
      "type": "goto",
      "to": "foxhole"
    }
  },
  {
    "stage": 1,
    "x": 43.1,
    "y": 28.5,
    "kind": "space",
    "id": null,
    "t": "You found a present",
    "a": "Move 1 space",
    "fx": {
      "type": "move",
      "n": 1
    }
  },
  {
    "stage": 1,
    "x": 44.3,
    "y": 18.8,
    "kind": "landmark",
    "id": "bella",
    "t": "Bella's Burrow",
    "a": "",
    "fx": null
  },
  {
    "stage": 1,
    "x": 51.1,
    "y": 9.2,
    "kind": "wisdom",
    "t": "Pick up a Squishy Wisdom card",
    "a": "Answer a dumpling question",
    "fx": {
      "type": "wisdom"
    }
  },
  {
    "stage": 1,
    "x": 65.3,
    "y": 9.6,
    "kind": "space",
    "id": null,
    "t": "",
    "a": "",
    "fx": null
  },
  {
    "stage": 1,
    "x": 76.0,
    "y": 11.8,
    "kind": "space",
    "id": null,
    "t": "Do a dance move to",
    "a": "Move 2 spaces",
    "fx": {
      "type": "move",
      "n": 2
    }
  },
  {
    "stage": 1,
    "x": 85.0,
    "y": 19.3,
    "kind": "space",
    "id": null,
    "t": "",
    "a": "Choose any player to move back 2 spaces",
    "fx": {
      "type": "chooseBack",
      "n": 2
    }
  },
  {
    "stage": 1,
    "x": 81.9,
    "y": 27.2,
    "kind": "space",
    "id": null,
    "t": "",
    "a": "",
    "fx": null
  },
  {
    "stage": 1,
    "x": 76.7,
    "y": 35.1,
    "kind": "wisdom",
    "t": "Pick up a Squishy Wisdom card",
    "a": "Answer a dumpling question",
    "fx": {
      "type": "wisdom"
    }
  },
  {
    "stage": 1,
    "x": 69.5,
    "y": 41.5,
    "kind": "space",
    "id": null,
    "t": "",
    "a": "",
    "fx": null
  },
  {
    "stage": 1,
    "x": 62.8,
    "y": 48.2,
    "kind": "space",
    "id": null,
    "t": "You forgot the presents",
    "a": "Move back to Bella's Burrow",
    "fx": {
      "type": "goto",
      "to": "bella"
    }
  },
  {
    "stage": 1,
    "x": 74.8,
    "y": 54.2,
    "kind": "wisdom",
    "t": "Pick up a Squishy Wisdom card",
    "a": "Answer a dumpling question",
    "fx": {
      "type": "wisdom"
    }
  },
  {
    "stage": 1,
    "x": 82.5,
    "y": 61.0,
    "kind": "space",
    "id": null,
    "t": "",
    "a": "",
    "fx": null
  },
  {
    "stage": 1,
    "x": 76.4,
    "y": 67.5,
    "kind": "space",
    "id": null,
    "t": "You found a present",
    "a": "Move 1 space",
    "fx": {
      "type": "move",
      "n": 1
    }
  },
  {
    "stage": 1,
    "x": 63.4,
    "y": 71.0,
    "kind": "space",
    "id": null,
    "t": "",
    "a": "",
    "fx": null
  },
  {
    "stage": 1,
    "x": 55.4,
    "y": 77.6,
    "kind": "wisdom",
    "t": "Pick up a Squishy Wisdom card",
    "a": "Answer a dumpling question",
    "fx": {
      "type": "wisdom"
    }
  },
  {
    "stage": 1,
    "x": 64.0,
    "y": 83.2,
    "kind": "space",
    "id": null,
    "t": "",
    "a": "",
    "fx": null
  },
  {
    "stage": 1,
    "x": 85.6,
    "y": 82.0,
    "kind": "landmark",
    "id": "otter",
    "t": "Well done! You found",
    "a": "Oakley's Otter Den",
    "fx": null
  },
  {
    "stage": 2,
    "x": 25.9,
    "y": 82.5,
    "kind": "space",
    "id": null,
    "t": "",
    "a": "",
    "fx": null
  },
  {
    "stage": 2,
    "x": 38.8,
    "y": 87.7,
    "kind": "space",
    "id": null,
    "t": "You found a present",
    "a": "Move 1 space",
    "fx": {
      "type": "move",
      "n": 1
    }
  },
  {
    "stage": 2,
    "x": 53.0,
    "y": 89.0,
    "kind": "space",
    "id": null,
    "t": "",
    "a": "",
    "fx": null
  },
  {
    "stage": 2,
    "x": 66.8,
    "y": 88.6,
    "kind": "space",
    "id": null,
    "t": "Run on the spot to",
    "a": "Move to Sledgehog Hill",
    "fx": {
      "type": "goto",
      "to": "sledge"
    }
  },
  {
    "stage": 2,
    "x": 80.0,
    "y": 86.0,
    "kind": "space",
    "id": null,
    "t": "Oops, you slipped",
    "a": "Move back 4 spaces",
    "fx": {
      "type": "move",
      "n": -4
    }
  },
  {
    "stage": 2,
    "x": 85.6,
    "y": 76.3,
    "kind": "space",
    "id": null,
    "t": "",
    "a": "",
    "fx": null
  },
  {
    "stage": 2,
    "x": 83.1,
    "y": 68.4,
    "kind": "space",
    "id": null,
    "t": "Do an impression of Santa to",
    "a": "Move 2 spaces",
    "fx": {
      "type": "move",
      "n": 2
    }
  },
  {
    "stage": 2,
    "x": 72.0,
    "y": 62.3,
    "kind": "landmark",
    "id": "sledge",
    "t": "Sledgehog Hill",
    "a": "",
    "fx": null
  },
  {
    "stage": 2,
    "x": 57.3,
    "y": 60.5,
    "kind": "space",
    "id": null,
    "t": "",
    "a": "",
    "fx": null
  },
  {
    "stage": 2,
    "x": 44.3,
    "y": 58.8,
    "kind": "space",
    "id": null,
    "t": "Pull a silly face to",
    "a": "Move forward 2 spaces",
    "fx": {
      "type": "move",
      "n": 2
    }
  },
  {
    "stage": 2,
    "x": 30.5,
    "y": 58.8,
    "kind": "space",
    "id": null,
    "t": "",
    "a": "Swap places with another player",
    "fx": {
      "type": "swap"
    }
  },
  {
    "stage": 2,
    "x": 18.5,
    "y": 57.0,
    "kind": "space",
    "id": null,
    "t": "",
    "a": "",
    "fx": null
  },
  {
    "stage": 2,
    "x": 14.8,
    "y": 46.5,
    "kind": "space",
    "id": null,
    "t": "You took a wrong turn",
    "a": "Move back 1 space",
    "fx": {
      "type": "move",
      "n": -1
    }
  },
  {
    "stage": 2,
    "x": 29.3,
    "y": 43.4,
    "kind": "space",
    "id": null,
    "t": "You found a present",
    "a": "Move 1 space",
    "fx": {
      "type": "move",
      "n": 1
    }
  },
  {
    "stage": 2,
    "x": 41.9,
    "y": 43.0,
    "kind": "space",
    "id": null,
    "t": "",
    "a": "",
    "fx": null
  },
  {
    "stage": 2,
    "x": 55.7,
    "y": 43.4,
    "kind": "space",
    "id": null,
    "t": "Do an impression of a sheep to",
    "a": "Move to the Lamb Shed",
    "fx": {
      "type": "goto",
      "to": "lamb"
    }
  },
  {
    "stage": 2,
    "x": 69.3,
    "y": 42.8,
    "kind": "space",
    "id": null,
    "t": "You got stuck in the snow",
    "a": "Miss a turn",
    "fx": {
      "type": "miss"
    }
  },
  {
    "stage": 2,
    "x": 74.5,
    "y": 33.8,
    "kind": "space",
    "id": null,
    "t": "",
    "a": "",
    "fx": null
  },
  {
    "stage": 2,
    "x": 63.7,
    "y": 28.1,
    "kind": "space",
    "id": null,
    "t": "Pat your head & rub your tummy to",
    "a": "Move 1 space",
    "fx": {
      "type": "move",
      "n": 1
    }
  },
  {
    "stage": 2,
    "x": 49.9,
    "y": 26.8,
    "kind": "space",
    "id": null,
    "t": "A reindeer gives you a lift",
    "a": "Move 2 spaces",
    "fx": {
      "type": "move",
      "n": 2
    }
  },
  {
    "stage": 2,
    "x": 37.6,
    "y": 25.9,
    "kind": "space",
    "id": null,
    "t": "",
    "a": "",
    "fx": null
  },
  {
    "stage": 2,
    "x": 34.8,
    "y": 16.2,
    "kind": "landmark",
    "id": "lamb",
    "t": "The Lamb Shed",
    "a": "",
    "fx": null
  },
  {
    "stage": 2,
    "x": 46.5,
    "y": 10.5,
    "kind": "space",
    "id": null,
    "t": "You took a wrong turn",
    "a": "Move back 5 spaces",
    "fx": {
      "type": "move",
      "n": -5
    }
  },
  {
    "stage": 2,
    "x": 58.5,
    "y": 7.9,
    "kind": "space",
    "id": null,
    "t": "",
    "a": "",
    "fx": null
  },
  {
    "stage": 2,
    "x": 73.3,
    "y": 11.4,
    "kind": "finish",
    "id": "cottage",
    "t": "Well done! You found",
    "a": "Santa's Cottage",
    "fx": null
  },
  {
    "stage": 1,
    "x": 15.4,
    "y": 65.8,
    "kind": "wisdom",
    "t": "Pick up a Squishy Wisdom card",
    "a": "Answer a dumpling question",
    "fx": {
      "type": "wisdom"
    },
    "branch": true
  },
  {
    "stage": 1,
    "x": 12.8,
    "y": 58.0,
    "kind": "space",
    "id": null,
    "t": "",
    "a": "",
    "fx": null,
    "branch": true
  },
  {
    "stage": 1,
    "x": 14.2,
    "y": 51.3,
    "kind": "space",
    "id": null,
    "t": "You get scared",
    "a": "Move back 3 spaces",
    "fx": {
      "type": "move",
      "n": -3
    },
    "branch": true
  },
  {
    "stage": 1,
    "x": 14.2,
    "y": 43.4,
    "kind": "space",
    "id": null,
    "t": "Hop on one leg to",
    "a": "Move 2 spaces",
    "fx": {
      "type": "move",
      "n": 2
    },
    "branch": true
  },
  {
    "stage": 1,
    "x": 16.0,
    "y": 35.0,
    "kind": "space",
    "id": null,
    "t": "",
    "a": "",
    "fx": null,
    "branch": true
  }
] as const;
