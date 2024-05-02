import { Categories, Difficulty } from "./constants";
import { faker } from "@faker-js/faker";

export class Rooms {
  private rooms: { [roomId: string]: Room };

  constructor() {
    this.rooms = {};
  }

  getRoom = (roomId: string) => this.rooms[roomId];

  initialiseNewRoom = () => {
    const id = `${faker.word.adjective()}-${faker.word.noun()}`;
    this.rooms[id] = new Room(id);
    return this.rooms[id];
  };

  removeRoom = (roomId: string) => {
    if (Boolean(this.rooms[roomId])) {
      delete this.rooms[roomId];
    }
  };
}

export type Player = {
  id: string;
  name: string;
  isTurn: boolean;
  eliminated: boolean;
  winCount: number;
};

export class Room {
  private roomId: string;
  private players: {
    [playerId: string]: Player;
  };
  // The boolean in usedLetters denotes whether the letter can be de-selected
  // This is the case when it is the current player's turn and they have not
  // ended their turn yet
  private usedLetters: {
    [letter: string]: boolean;
  };
  private countdown: {
    started: boolean;
    timer: NodeJS.Timer | undefined;
    time: number;
  };
  private currentPlayerIndex: number;
  private locked: boolean;
  private isInTextMode: boolean;
  private textModeWords: string[];
  private gameWinCount: number = 1;
  constructor(roomId: string) {
    this.roomId = roomId;
    this.players = {};
    this.usedLetters = {};
    this.countdown = {
      started: false,
      timer: undefined,
      time: 10,
    };
    this.currentPlayerIndex = 0;
    this.locked = false;
    this.isInTextMode = false;
    this.textModeWords = [];
  }

  getId = () => this.roomId;
  getPlayers = () => this.players;
  getUsedLetters = () => this.usedLetters;
  getCountdown = () => this.countdown;
  getCurrentPlayer = () =>
    this.players[Object.keys(this.players)[this.currentPlayerIndex]];
  getNumberOfPlayers = () => Object.keys(this.players).length;
  getIsLocked = () => this.locked;
  getCategory = () => {
    const difficultyKeys = Object.keys(Difficulty);
    const randomDifficultyIndex = Math.floor(
      Math.random() * difficultyKeys.length,
    );
    const difficulty = difficultyKeys[randomDifficultyIndex] as Difficulty;
    const categories = Categories[difficulty];
    const randomCategoriesIndex = Math.floor(
      Math.random() * (categories.length - 1),
    );
    const category = categories[randomCategoriesIndex];
    return category;
  };

  lockRoom = () => {
    this.locked = true;
  };
  unlockRoom = () => {
    this.locked = false;
  };

  addPlayer = (playerId: string, name: string) => {
    this.players[playerId] = {
      id: playerId,
      name,
      isTurn: false,
      eliminated: false,
      winCount: 0,
    };
  };
  addUsedLetter = (letter: string) => {
    // if the letter is already used and its value is true, remove it from the list
    if (letter in this.usedLetters) {
      if (this.usedLetters[letter] === true) {
        this.removeUsedLetter(letter);
      }
    } else {
      this.usedLetters[letter] = true;
    }
    return this.usedLetters;
  };
  removeUsedLetter = (letter: string) => {
    if (letter in this.usedLetters) {
      delete this.usedLetters[letter];
    }
  };
  resetCountdown = () => {
    clearInterval(this.countdown.timer);
    this.countdown = {
      started: false,
      timer: undefined,
      time: 10,
    };
  };
  resetUsedLetters = () => {
    this.usedLetters = {};
  };
  resetTextModeWords = () => {
    this.textModeWords = [];
  };
  setLetterUnselectable = (letter: string) => {
    this.usedLetters[letter] = false;
  };
  getIsInTextMode = () => this.isInTextMode;
  setIsInTextMode = (isInTextMode: boolean) => {
    this.isInTextMode = isInTextMode;
  };
  getTextModeWords = () => this.textModeWords;
  addTextModeWord = (word: string) => {
    this.textModeWords.push(word);
  };
  setNextPlayer = () => {
    const playerIds = Object.keys(this.players);
    const playerPlayingValues = Object.values(this.players);
    let nextPlayerIndex = this.currentPlayerIndex + 1;
    if (nextPlayerIndex > playerIds.length - 1) {
      nextPlayerIndex = 0;
    }
    let previousPlayerIndex = playerPlayingValues.findIndex((v) => v.isTurn);
    if (previousPlayerIndex >= 0) {
      const previousPlayer = playerIds[previousPlayerIndex];
      this.players[previousPlayer].isTurn = false;
    }
    var nextPlayer = playerIds[nextPlayerIndex];
    this.players[nextPlayer].isTurn = true;
    this.currentPlayerIndex = nextPlayerIndex;
  };
  removePlayer = (playerId: string) => {
    if (Boolean(this.players[playerId])) {
      delete this.players[playerId];
    }
  };
  eliminateCurrentPlayer = () => {
    this.getCurrentPlayer().eliminated = true;
    return this.getCurrentPlayer();
  };
  getRemainingPlayerCount = () => {
    return Object.keys(this.players).filter((k) => !this.players[k].eliminated)
      .length;
  };
  getRemainingPlayer = () => {
    const remainingPlayerKey = Object.keys(this.players).filter(
      (k) => !this.players[k].eliminated,
    )[0];
    return this.players[remainingPlayerKey];
  };
  increasePlayerWinCount = (playerId: string) => {
    this.players[playerId].winCount++;
  };
  endRound = () => {
    // reset the countdown
    this.resetCountdown();
    // reset usedLetters
    this.resetUsedLetters();
    // reset all players eliminated status
    Object.keys(this.players)
      .filter((k) => this.players[k].eliminated)
      .forEach((v) => (this.players[v].eliminated = false));
    // reset all textMode words
    this.resetTextModeWords();
  };
  setGameWinCount = (count: number) => {
    this.gameWinCount = count;
  };
  getGameWinner = (): Player | null => {
    const gameWinnerKey = Object.keys(this.players)
      .filter((k) => this.players[k].winCount === this.gameWinCount)
      .map((k) => k)[0];
    if (!gameWinnerKey) {
      return null;
    }
    return this.players[gameWinnerKey];
  };
  hasGameWinner = () => {
    return Boolean(this.getGameWinner());
  };
  endGame = () => {
    this.resetCountdown();
    // reset usedLetters
    this.resetUsedLetters();
    // reset all players eliminated status
    Object.keys(this.players)
      .filter((k) => this.players[k].eliminated)
      .forEach((v) => {
        this.players[v].eliminated = false;
        this.players[v].winCount = 0;
      });
    // reset all textMode words
    this.resetTextModeWords();
  };
}
