var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');

//CONSTANTS
const MESSAGE_PREFIX = 10;

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console(), {
  colorize: true,
});
logger.level = 'debug';

// Initialize Discord Bot
var bot = new Discord.Client({
  token: auth.token,
  autorun: true,
});

let firstChoice = '';
let firstPlayer = '';
let gameInProgress = false;

bot.on('ready', function(evt) {
  logger.info('Connected');
  logger.info('Logged in as: ');
  logger.info(bot.username + ' - (' + bot.id + ')');
});

bot.on('message', function(user, userID, channelID, message, rawEvent) {
  if (message.indexOf('!roshambo ') === 0) {
    let choice = message.substring(MESSAGE_PREFIX);
    if (isValidChoice(choice)) {
      if (gameInProgress) {
        bot.sendMessage({
          to: channelID,
          message: calculateWinner(
            firstChoice.toUpperCase(),
            choice.toUpperCase(),
            firstPlayer,
            user
          ),
        });
        gameInProgress = false;
        firstChoice = '';
        firstPlayer = '';
      } else {
        firstChoice = choice;
        firstPlayer = user;
        gameInProgress = true;
        //Hide the choice!
        bot.deleteMessage({ messageID: rawEvent.d.id, channelID }, () => {
          console.log('deleting message');
        });
        bot.sendMessage({
          to: channelID,
          message: `${user} is playing Roshambo and is waiting for a challenger! Type '!roshambo rock, paper, or scissors'`,
        });
      }
    } else {
      bot.sendMessage({
        to: channelID,
        message: `${user}, that is not a valid option! Please use rock, paper, or scissors`,
      });
    }
  }
});

function isValidChoice(choice) {
  let choiceUpper = choice.toUpperCase();
  if (
    choiceUpper === 'ROCK' ||
    choiceUpper === 'PAPER' ||
    choiceUpper === 'SCISSORS'
  )
    return true;
  return false;
}

function calculateWinner(choiceOne, choiceTwo, userOne, userTwo) {
  console.log(choiceOne, choiceTwo);
  switch (choiceOne) {
    case 'ROCK':
      if (choiceTwo === 'ROCK') return `${userOne} and ${userTwo} have tied!`;
      if (choiceTwo === 'PAPER') return `${userTwo} is the winner!`;
      if (choiceTwo === 'SCISSORS') return `${userOne} is the winner!`;
    case 'PAPER':
      if (choiceTwo === 'ROCK') return `${userOne} is the winner!`;
      if (choiceTwo === 'PAPER') return `${userOne} and ${userTwo} have tied!`;
      if (choiceTwo === 'SCISSORS') return `${userTwo} is the winner!`;
    case 'SCISSORS':
      if (choiceTwo === 'PAPER') return `${userOne} is the winner!`;
      if (choiceTwo === 'SCISSORS')
        return `${userOne} and ${userTwo} have tied!`;
      if (choiceTwo === 'ROCK') return `${userTwo} is the winner!`;
    default:
      return 'Something went wrong :(';
  }
}
