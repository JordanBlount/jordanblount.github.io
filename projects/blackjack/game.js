//let suit = ["♣", "♦", "♥","♠"]
let suit = ["clubs", "diamonds", "hearts", "spades"]
let values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

class Card {
    constructor(suit, value, points) {
        this.suit = suit;
        this.value = value;
        this.points = points;
    }

    isAce() {
        return this.value === "A";
    }

    color() {
        return this.suit == "clubs" || this.suit == "spades" ? "black" : "red";
    }

    // An HTML element created based on the card attributes
    HTML(flipped, color) {
        let cardDiv = document.createElement("div");
        cardDiv.classList.add("card");
        cardDiv.classList.add(this.color());
        cardDiv.classList.add(this.suit);
        if(flipped) {
            cardDiv.classList.add(color === 1 ? "flipped-red" : "flipped-blue");
        }
        cardDiv.dataset.value = `${this.value}`;
        return cardDiv;
    }

    render(player) {
        let container = null;
        if(!player.isDealer) {
            container = document.querySelector('#player-cards');
        } else {
            container = document.querySelector('#dealer-cards');  
        }
        // console.log("Checking container");
        let allSets = container.querySelectorAll('.card-set');
        if(allSets.length !== 0) {
            let setId = allSets.length - 1;
            // console.log("SetID: " + setId);
            let currentSet = allSets[setId];
            if(currentSet.childElementCount == (player.isDealer ? 3 : 4)) {
                let cardSet = document.createElement("div");
                cardSet.classList.add("card-set");
                cardSet.classList.add(`set_${allSets.length + 1}`);
                cardSet.appendChild(this.HTML(player.isDealer, 1));
                container.appendChild(cardSet);
            } else {
                currentSet.appendChild(this.HTML(player.isDealer, 1));
            }
        } else {
            // console.log("No cards. Add 1");
            let cardSet = document.createElement("div");
            cardSet.classList.add("card-set");
            cardSet.classList.add(`set_1`);
            cardSet.appendChild(this.HTML(false, 1));
            container.appendChild(cardSet);
        }
    }
}

class Deck {

    constructor(cards) {
        this.cards = cards;
    }

    shuffle() {
        // Shuffles the deck 2 times
        for(let i = 0; i < 2; i++) {
            // Goes through all 52 cards.
            // FIXME: This logic could be made better, but it works
            for(let j = 0; j < this.cards.length - 1; j++) {
                let loc1 = Math.floor(Math.random() * (j + 1));
                let loc2 = Math.floor(Math.random() * (j + 1));
                let firstCard = this.cards[loc1];
    
                // Swaps the card locations
                this.cards[loc1] = this.cards[loc2];
                this.cards[loc2] = firstCard;
            }
        } 
    }

    // Removes specific card from array
    removeCard(card) {
        this.cards.slice(this.cards.indexOf(card), 1);
    }

    giveCard(card) {
        return this.cards.splice(this.cards.indexOf(card), 1)[0];
    }

    // This removes the card from the top of the deck
    // It return the card that was removed
    pickCardFromTop() {
        return this.cards.shift();
    }

    amountOfCard(cardVal) {
        return this.cards.reduce((total, card) => {
            if(card.value === cardVal) {
                total += 1;
            }
            return total;
        }, 0);
    }

    // Creates the HTML element for a card deck
    HTML(color) {
        let deckDiv = document.createElement("div");
        deckDiv.classList.add("card-deck");
        deckDiv.classList.add(color === 1 ? "red-deck" : "blue-deck");
        return deckDiv;   
    }
}

const createDeck = () => {
    let cards = [];
    cards = suit.flatMap(suit => {
        return values.map(value => {
            return new Card(suit, value, []);
        })
    });
    cards.map(card => {
        if(card.value === "J" || card.value === "Q" || card.value === "K") {
            card.points.push(10);
        } else if(card.value === "A") {
            card.points.push(1, 11);
        } else {
            card.points.push(parseInt(card.value));
        }
    });
    return new Deck(cards);
}

class Chip {
    constructor(value) {
        this.value = value;
    }

    valueToName() {
        let str = '';
        if(this.value === 10) {
            str = "ten";
        } else if(this.value === 20) {
            str = "twenty";
        } else if(this.value === 50) {
            str = "fifty";
        } else if(this.value === 100) {
            str = "hundred";
        }
        return str;
    }

    render(loc) {
        let chipDiv = document.createElement("div");
        chipDiv.classList.add('chip');
        chipDiv.classList.add(`chip_${this.valueToName()}`);
        chipDiv.classList.add(`chip_${loc}`);
        return chipDiv;
    }
}

class ChipStack {
    constructor(chips, stackID) {
        this.chips = chips;
        this.stackID = stackID;
    }

    addChip(chip) {
        this.chips.push(chip);
    }

    chipsArr() {
        return this.chips;
    }

    render(flipped) {
        let chipStackDiv = document.createElement("div");
        chipStackDiv.classList.add('chip-stack');
        if(flipped) {
            chipStackDiv.classList.add('chip-stack-flipped');
        }
        chipStackDiv.classList.add(`stack_${this.stackID}`);
        return chipStackDiv;
    }
}

// TODO: Add this variable below and the function to the player class

let chips = [[],[],[],[]];

class Player {

    // TODO: Add chips to player hand instead of cash (make it chip stacks)
    // TODO: Create a method for adding new chips (cash) and adding it into existing chip sets or other ones
    constructor(name, hand, points, cash, chips, chipStacks, bet, betStacks, isDealer) {
        this.name = name;
        this.hand = hand;
        this.points = points;
        this.cash = cash;
        this.chips = chips;
        this.chipStacks = chipStacks;
        this.bet = bet;
        this.betStacks = betStacks;
        this.isDealer = isDealer;
    }

    isDealer() {
        return this.isDealer;
    }

    handTotal() {
        let total = 0;
        
        // Gets the point value for all the cards except for Aces
        total = this.hand.reduce((amount, card) => {
            if(card.value !== "A") {
                amount += card.points[0];
            }
            return amount;
        }, 0);

        // Determine the value of the player's hand. If that value
        // + the value of the amount of Aces (e.g., if there are
        // 2 aces: 11 + 1 or 1 + 1 if the first condition would give
        // the player more than 21)
        let aces = this.amountOfAces();
        if(aces > 0) {
            if((total + 11) > 21) {
                total += aces;
            } else {
                total += 11;
                total += aces - 1; //This accomdates for the value of Aces
            }
        }
        return total; 
    }

    amountOfAces() {
        return this.hand.reduce((total, card) => {
            if(card.value === "A") {
                total += 1;
            }
            return total;
        }, 0); // Has to have an initial value
    }

    hasAces() {
        return this.amountOfAces() > 0;
    }

    isBusted() {
        return this.points > 21;
    }

    isBroke() {
        return this.cash <= 0;
    }

    addPoints(card) {
        // Adds points for all non-Ace cards
        if(card.value !== "A") {
            this.points += card.points[0];
        } else {
            let aces = this.amountOfAces();
            // If there are 1 or more Aces already in the player's hand, add 1 point
            if(aces >= 1) {
                this.points += card.points[0];
            } else {
                // If adding one Ace brings the points above 21, add 1 point only
                if((this.points + 11) > 21) {
                    this.points += card.points[0];
                // otherwise, add 11
                } else {
                    this.points += card.points[1];
                }
            }
        }
    }

    addCards(cards) {
        // If multiple cards are added
        if(Array.isArray(cards)) {
            cards.map(card => {
                // console.log("Added multiple cards");
                this.addPoints(card)
                this.hand.push(card);
                card.render(this);
            });   
        } else {
            // Adds a single card
            // console.log("Added single card");
            this.addPoints(cards);
            this.hand.push(cards);
            cards.render(this);
        }
    }
    
    setBet(bet) {
        this.bet = bet;
    }

    lowerBet(amount) {
        this.bet -= amount;
    }

    raiseBet(amount) {
        this.bet += amount;
    }

    // Checks to see if player can even make a certain bet
    // e.g., player 1 bets 500 (amount) but only has 300 (this.cash). They can not make that bet
    canBet(amount) {
        return this.cash >= amount ? true : false;
    }

    addCash(amount) {
        this.cash += amount;
    }

    removeCash(amount) {
        this.cash -= amount;
    }

    addChip(value) {
        if(Array.isArray(value)) {
        }
        let chip = new Chip(value);
        switch(value) {
            case 10:
                chips[0].push(chip); 
            break;
            case 20:
                chips[1].push(chip); 
            break;
            case 50:
                chips[2].push(chip); 
            break;
            case 100:
                chips[3].push(chip); 
            break;
        }
        this.renderChip(chip);
    }

    hasChip(val, bettedChips) {
        let has = false;
        let alreadyBetted = bettedChips.filter(chip => chip.value === val);
        switch(val) {
            case 10:
                has = (chips[0].length > alreadyBetted);
            break;
            case 20:
                has = (chips[1].length > alreadyBetted);
            break;
            case 50:
                has = (chips[2].length > alreadyBetted);
            break;
            case 100:
                has = (chips[3].length > alreadyBetted);
            break;
        }
    }

    renderChip(chip) {
        if(!this.areStacksFull()) {
            let chipStack = this.getAvailableStack(chip);
            if(chipStack === null || chipStack === undefined) {
                // Something went wrong here
            } else {
                let playerMoney = document.querySelector('.player-money');
                let chipStackDiv = playerMoney.querySelector(`stack_${chipStack.stackID}`);
                let chipDiv = chip.render(chipStackDiv.childElementCount + 1); // Gets the current amount of children + 1
                chipStackDiv.appendChild(chipDiv);
                chipStack.push(chip); // Adds the chip to our stacks
            }
        }
    }

    // Stack counts are determined here: 12 chips per stack
    getAvailableStack(chip) {
        let stack = null;
        if(this.chipStacks.length > 0) {
            let goodStacks = this.chipStacks.filter(stack => stack.length < 12);

            stack = goodStacks.find(stack, () => {
                return stack.every(chipInStack => chip.value === chipInStack.value);
            }, 0);
    
            if(stack === undefined) {
                stack = goodStacks.find(stack => stack.length < 12);
            }
        } else {
            // There are no current stacks
            stack = [];
            this.chipStacks.push(stack);
        }
        return stack;
    }

    // Amount of stacks that a player can have displayed on screen
    areStacksFull() {
        return chipStacks.length === 6 ? true : false;
    }

    currentCash() {
        return this.cash;
    }

    currentPoints() {
        return this.points;
    }

    currentBet() {
        return this.bet;
    }

    renderChips = (chips, maxPerStack, location) => {
        let x = 0;
        let stackArr = [];
        let stacks = [];
        for(let i = 0; i < chips.length; i++) {
            if(x === maxPerStack) {
                x = 0;
                stacks.push(stackArr);
                stackArr = [];
            }
            if(x === (chips.length - 1)) {
                stacks.push(stackArr);
            }
            stackArr.push(chips[i]);
            x++;
        }
    
        let size = 3; // How many chip stacks go into each money row
        let split = [];
        for (let i = 0;  i < stacks.length; i += size) {
            split.push(stacks.slice(i, i + size))
        }
    
        let moneyContainer = document.createElement('div');
        moneyContainer.classList.add('money-container');
        if(location === "betting_screen") {
            moneyContainer.classList.add('money-container-flipped');
            moneyContainer.id = "betting-money";
        }
    
        split.map((row, i) => {
            let moneyRow = document.createElement('div');
            moneyRow.classList.add("money-row");
            if(location === "betting_screen") {
                moneyRow.classList.add("money-row-flipped");   
            }
            row.map((stack, j) => {
                let chipStack = stack.render(j + 1, location === "betting_screen" ?true : false);
                stack.map((chip, z) => {
                    let chipDiv = chip.render((z + 1)); // Z would be the index + 1
                    chipStack.appendChild(chipDiv);
                });
                moneyRow.appendChild(chipStack);
            });
            moneyContainer.appendChild(moneyRow);
        })
    }
}

class Dealer extends Player {

    constructor(name, hand, points, cash, chips, chipStacks, bet, betStacks, isDealer) {
        super(name, hand, points, cash, chips, chipStacks, bet, betStacks, isDealer);
    }

    dealTwoCards(deck, player) {
        player.addCards([deck.pickCardFromTop(), deck.pickCardFromTop()]); 
    }

    dealCard(deck, player) {
        let card = deck.pickCardFromTop();
        console.log(`${player.name} was given a ${card.suit} [${card.value}]`)
        player.addCards(card);
    }

    dealACard(deck, card, player) {
        let crd = deck.giveCard(card);
        console.log(`${player.name} was given a ${crd.suit} [${crd.value}]`)
        player.addCards(crd);
    }

    flip() {
        let container = document.querySelector('#dealer-cards');  
        let allSets = Array.from(container.querySelectorAll('.card-set'));
        allSets.map(set => {
            let items = Array.from(set.childNodes);
            items.map(card => {
                // TODO: Add a global variable to change the game color
                card.classList.remove("flipped-red");
            });
        });
    }

}

let player1 = null;
let dealer = null;
let currentTurn = 1;
let round = 1;
let deck = null;
let gameStarted = false;

const whosTurnIsIt = () => {
    // A way of seeing who is currently going
    return  currentTurn == 1 ? player1 : dealer;
}

const changeTurns = () => {
    if(currentTurn === 1) {
         currentTurn = 2; 
         dealerMove();
         // Update game to show whose turn it is
    } else {
        currentTurn = 1;
        // Update game to show whose turn it is
    }
}

const hit = (player) => {
    if(!player.isBusted()) {
        dealer.dealCard(deck, player);
        if(!player.isDealer) {
            updatePoints(player.points);
            playSound('button');
        } else {

        }
        // Checks to see if you have busted ater receiving a card
        if(player.isBusted()) {
            // TODO: Add a function to reveal the dealer's cards
            checkForRoundWinner();
        }
    } else {
        // This should never happen technically
        // ACTUALLY, this should happen if the button and pressed and you are busted
        checkForRoundWinner();
    }
}

const stay = (player) => {
    if(!player.isBusted()) {
        console.log(`${player.name} chose to stay!`);
        // This means that the dealer has ended their turn and the game should now check to see who won
        if(!player.isDealer) {
            playSound('button');
        }
        if(player.isDealer) {
            // TODO: Add a function to reveal the dealer's cards
            checkForRoundWinner();
        } else {
            // Changes the turn over to the next player (dealer)
            changeTurns();
        }
    } else {
        checkForRoundWinner();
    }
}

const setupGame = (firstGame) => {
    player1 = new Player("Player 1", [], 0, 1250, [], [], 0, [], false);
    dealer = new Dealer("House", [], 0, 0, [], [], 0, [], true);
    deck = createDeck();
    deck.shuffle();
    gameStarted = true;
    updateCash(player1.currentCash());

    console.log("Game was setup");
    console.log("Current Round: " + round);

    setGameButtons();
    dealer.dealTwoCards(deck, player1);
    updatePoints(player1.points);
    dealer.dealTwoCards(deck, dealer);
    playSound('card shuffle');
}

const dealerMove = () => {
    // This allows the computer to keep making choices until it bust or chooses to stay
    let savedRound = round;
    while(!dealer.isBusted()) {
        if(savedRound === round) {
            let choice = Math.floor(Math.random() * 2);
            if(choice === 0) {
                hit(dealer);
            } else {
                stay(dealer);
                break;
            }   
        } else {
            // This makes the loop stop completely because it was causing a problem
            // where the computer was still trying to go even after the round ended (doing actions from previous round)
            console.log("The loop successfully ended");
            break;
        }
    }
}

// TODO: Add a check for when someone busts here instead of it being in the "hit" function
// FIXME: Make sure that this is accurately checking for when the player (or dealer) beats the other
// without going over 21.
const checkForRoundWinner = () => {
    if(!player1.isBroke()) {
        if(!player1.isBusted() && dealer.isBusted()) {
            player1.addCash(player1.currentBet());
            openResultScreen(`${dealer.name} busted!`);
        } else if(player1.isBusted() && !dealer.isBusted()) {
            player1.removeCash(player1.currentBet());
            if(round % 3 === 0) {
                playSound("bust");
            }
            openResultScreen("You busted!");
        } else if(player1.points === 21) {
            player1.addCash(player1.currentBet())
            openResultScreen("Blackjack!");
            playSound("sheesh");
        } else if(dealer.points === 21) {
            player1.removeCash(player1.currentBet());
            openResultScreen("Dealer got 21!");
        } else {
            // Neither player has busted
            if(player1.points > dealer.points && !player1.isBusted()) {
                // Player wins
                // Send "You win message"
                // Update module or buttons (to be able to prompt for next round)
                player1.addCash(player1.currentBet());
                openResultScreen("You win!");
                playSound('round won');
            } else if(dealer.points > player1.points && !dealer.isBusted()) {
                // Dealer wins
                // Send "You lose message"
                // Update module or buttons (to be able to prompt for next round)
                player1.removeCash(player1.currentBet());
                openResultScreen("You lose!");
            } else if(player1.points === dealer.points) {
                // It's a tie
                // Player loses no money
                openResultScreen("It's a tie!");
            }
        }
    } else {
        console.log("SHOULD NOT");
        checkIfOver();
    }
}


const resetForNewRound = () => {
    player1.hand = [];
    // player1.bet = 0;
    player1.points = 0;

    dealer.hand = [];
    dealer.points = 0;
    currentTurn = 1;

    p1Cards.innerHTML = "";
    dCards.innerHTML = "";

    deck = createDeck();
    deck.shuffle();

    dealer.dealTwoCards(deck, player1);
    updatePoints(player1.points);
    dealer.dealTwoCards(deck, dealer);
}

const totalReset = () => {
    player = null;
    dealer = null;
    deck = null;
    currentTurn = 1;
    round = 1;
    gameStarted = false;
    bettedChips = []; // Makes sure that there are no chips still being betted once whole game is over

    p1Cards.innerHTML = "";
    dCards.innerHTML = "";
    // Open intro screen
    // openStartScreen();
}

const nextRound = () => {
    round++;
    console.log("Current Round: " + round);
    updateCash(player1.currentCash());
    updateBet(player1.currentBet());
    removeDealerPoints();
    resetForNewRound();
}

const checkIfOver = () => {
    // Logic for if player reachs a certain amount of cash or if plays 8 rounds successfully
    if(player1.isBroke()) {
        gameOver();
    } else if(player1.currentCash() === 2000) { //round === 8 || 
        gameOver();
    } else {
        nextRound();
    }
}

const gameOver = () => {
    if(player1.isBroke()) {
        // You lost the game!
        // Play again?
        displayEndScreen(false);
    } else {
        // Show winning screen!
        // Play again?
        displayEndScreen(true);
    }
}

//
//
// All of my displaying logic is written down below
//
//
//


let startScreen = document.querySelector('#start-screen');
let startBtn = document.querySelector("#start-btn");

let rules = document.getElementById("rules");
let rulesScreen = document.getElementById("rules-screen");
let closeRulesBtn = document.getElementById("close-rules-btn");
let rulesBtn = document.getElementById('rules-btn');

const openStartScreen = () => {
    startScreen.classList.add('show');
    startBtn.addEventListener('click', startGame, { once: true}); // Should be clicked only once
}

const startGame = () => {
    startScreen.classList.remove('show');

    // Game is initiated here!
    // Put in game setup stuff here

    // Stops someone from messing up the game if they somehow reopen the initial screen
    if(gameStarted === false) {
        setupGame(true);
    }

    // Enable betting buttons instead of "Hit" and "Hold"
}

const openRulesScreen = () => {
    let gameRules = `
    This is Blackjack. You are the player. The House is the computer. The rules of the game
    are very simple. Whoever gets closer to 21 (or gets 21) wins OR whoever does not bust first
    will win the round. There are 8 rounds in total. If you successfully stay alive without losing
    all of your money during these 8 rounds, you will win the game. You also win if you reach $2000.

    Good luck!
    `;
    rules.innerHTML = gameRules;
    rulesScreen.classList.add('show');
}

const closeRulesScreen = () => {
    rules.innerHTML = "You have found an Easter Egg!";
    rulesScreen.classList.remove('show');
}

rulesBtn.addEventListener('click', openRulesScreen);
closeRulesBtn.addEventListener('click', closeRulesScreen);

let btnsContainer = document.querySelector("#btns");
let betBtn = null;
let hitBtn = null;
let stayBtn = null;
let nextBtn = null;

let betInput = document.querySelector("#betting-amount");
let cashAmt = document.querySelector("#player-currentMoney");
let p1Points = document.querySelector("#player-points");
let dPoints = document.querySelector("#dealer-points");

let p1Cards = document.querySelector("#player-cards");
let dCards = document.querySelector("#dealer-cards");

const setGameButtons = (firstGame) => {
    if(firstGame === "not") {

    } else if(firstGame === "removeNext") {
        btnsContainer.removeChild(nextBtn);   
    }
    if(betBtn === null) {
        betBtn = document.createElement('button');
        betBtn.classList.add('game-btn');
        betBtn.classList.add('bet-btn');
        betBtn.innerHTML = "Bet";
    }
    betBtn.addEventListener('click', finalizeBet);
    btnsContainer.appendChild(betBtn);

    // Adds event listener to the input field as well
    betInput.addEventListener('click', openBettingScreen);
}

const changeGameButtons = (betting) => {
    if(betting === "not") {
        btnsContainer.removeChild(betBtn);
        betBtn.removeEventListener('click', openBettingScreen);

        // Removes hover effect from betting amount so that the player does not think
        // they can bet anymore if they mouseover it
        betInput.classList.add('no-hover');
        betInput.removeEventListener('click', openBettingScreen);

        if(hitBtn === null && stayBtn === null) {
            hitBtn = document.createElement('button');
            stayBtn = document.createElement('button');
    
            hitBtn.classList.add('game-btn');
            hitBtn.innerHTML = "Hit";
    
            stayBtn.classList.add('game-btn');
            stayBtn.innerHTML = "Stay";
        }
        
        hitBtn.addEventListener('click', hitAction);
        stayBtn.addEventListener('click', stayAction);

        btnsContainer.appendChild(hitBtn);
        btnsContainer.appendChild(stayBtn);
    } else if(betting === "next") {
        btnsContainer.removeChild(hitBtn);
        btnsContainer.removeChild(stayBtn);
        hitBtn.removeEventListener('click', hitAction);
        stayBtn.removeEventListener('click', stayAction); 

        if(nextBtn === null) {
            nextBtn = document.createElement('button');
            nextBtn.classList.add('game-btn');
            nextBtn.innerHTML = "Next";
        }
        btnsContainer.appendChild(nextBtn);
    } else {
        setGameButtons();
    }
}

const hitAction = () => {
    hit(player1);
}

const stayAction = () => {
    stay(player1);
}

const updateBet = (amount) => {
    betInput.innerHTML = `$${amount}`;
}

const updateCash = (amount) => {
    //betInput.innerHTML = `$${amount}`;
    cashAmt.innerHTML = `$${amount}`;
}

const updatePoints = (amount) => {
    p1Points.innerHTML = `${amount}`;
}

const updateDealerPoints = (amount) => {
    dPoints.classList.add('show');
    dPoints.innerHTML = `${amount}`;
}

const removeDealerPoints = () => {
    dPoints.classList.remove('show');
    dPoints.innerHTML = ``;
}   

const setGameBoard = () => {
    let deckContainer = document.querySelector("");
}

let gameOverlay = document.querySelector('#game-overlay');
let bettingOverlay = document.querySelector('#betting-overlay');
let currentMoney = document.querySelector('#current-money');
let currentBet = document.querySelector('#current-bet');
let bettingContainer = document.querySelector('#betting-container');


let bettingChipBtns = Array.from(document.querySelector('#betting-chip-btns').children);
let bettingBtns = document.querySelector('#betting-btns');
let lowerOrRaiseBtn = bettingBtns.querySelector("#lowerOrRaise");
let placeBet = bettingBtns.querySelector("#place-bet");

let changeLowerOrRaiseBtn = () => {
    let raise = lowerOrRaiseBtn.classList.contains("raise");
    if(raise) {
        lowerOrRaiseBtn.classList.remove('raise');
        lowerOrRaiseBtn.classList.add('lower');
    } else {
        lowerOrRaiseBtn.classList.remove('lower');
        lowerOrRaiseBtn.classList.add('raise');
    }
    playSound('toggle');
}

const changeDirection = () => {
    changeLowerOrRaiseBtn();
}

const placeBetAction = () => {
    closeBettingScreen();
    // Actions to place a bet and enable "Bet" button to start round
}

let bettedChips = [];
let renderedChips = [];

const addChipToBetted = (chip) => {
    if(bettedChips.length > 0) {
        let currStack = bettedChips[bettedChips.length - 1];
        let loc = currStack.stackID + 1;

        // Add chip to stack
        currStack.chips.push(chip);

        // Checks to see if the current stack is full
        if(currStack.chips.length === 10) {
            // render current chip
            renderBettedChip(chip, currStack);

            //console.log("This stack is now full");

            // Creates a new stack
            let newStack = new ChipStack([], loc);
            bettedChips.push(newStack);
        } else {
            // Renders chip as normal
            renderBettedChip(chip, currStack);
        }
    } else {
        // Create initial chip stack and add the chip to it
        let stack = new ChipStack([], 1);
        stack.chips.push(chip);
        bettedChips.push(stack);
        renderBettedChip(chip, stack);
    }
}

const renderBettedChip = (chip, chipStack) => {
    // This means that we have a stack already in there
    let rows = Array.from(bettingContainer.children);
    if(bettingContainer.children.length > 0) {
        let lastRow = rows[rows.length - 1];
        let lastRowArray = Array.from(lastRow.children);
        let lastStack = lastRowArray[lastRowArray.length - 1];
        let availableRow = null;
        if(lastStack.children.length < 10) {
            availableRow = lastRow;
        } else {
            if(lastRow.children.length < 3) { // We set the max amount of stacks that can appear on the screen
                availableRow = lastRow;
            } else {
                availableRow = createNewRow(rows.length + 1);
            }
        }
        if(availableRow === lastRow) {
            if(lastStack.children.length === 10) {
                let newStack = chipStack.render(true);
                newStack.appendChild(chip.render(newStack.children.length + 1));
                availableRow.appendChild(newStack);
                renderedChips.push(chip);
            } else {
                let stackDiv = lastRowArray[lastRowArray.length - 1];
                stackDiv.appendChild(chip.render(stackDiv.children.length + 1));
                renderedChips.push(chip);
            }
        } else { // IF it is a new row
            if(rows.length !== 2) { // Limited to only two money rows
                let newStackDiv = chipStack.render(true);
                newStackDiv.appendChild(chip.render(1));
                availableRow.appendChild(newStackDiv);
                bettingContainer.append(availableRow);
                renderedChips.push(chip);
            }
        }        
    } else { // We don't have any rows
        if(rows.length !== 2) { // Limited to only two money rows 
            let chipStackDiv = chipStack.render(true);
            let moneyRow = createNewRow(1);
            chipStackDiv.appendChild(chip.render(1))
            moneyRow.appendChild(chipStackDiv);
            bettingContainer.appendChild(moneyRow);
            renderedChips.push(chip);
        }
    }
}

const removeChips = (chip) => {

}

const createNewRow = (loc) => {
    let moneyRow = document.createElement('div');
    moneyRow.classList.add("money-row");
    moneyRow.classList.add("money-row-flipped");
    moneyRow.classList.add(`row_${loc}`);
    return moneyRow;    
}

const chipBtn = (e) => {
    let raise = lowerOrRaiseBtn.classList.contains('raise') ? true : false;
    let chipBtn = e.target
    let chipValue = chipBtn.dataset.value;
    addChipToBetted(new Chip(parseInt(chipValue)));
    playSound("chip 1");
    // if(raise) {
    //     if(player1.canBet(chipValue)) {

    //     } else {
    //         // Do not do anything
    //     }
    //     if(!player1.hasChip(chipValue, bettedChips)) {
    //         chipBtn.removeEventListener('click', chipBtn);
    //     }
    // } else {

    // }
}

const openBettingScreen = () => {
    gameOverlay.classList.add("show");
    bettingOverlay.classList.add("show");

    currentMoney.innerHTML = `$${player1.currentCash()}`
    currentBet.innerHTML = `$${player1.currentBet()}`

    lowerOrRaiseBtn.addEventListener('click', changeDirection);
    placeBet.addEventListener('click', placeBetAction);
    
    bettingChipBtns.map(btn => {
        btn.addEventListener('click', chipBtn);
    });
}

const closeBettingScreen = () => {
    //changeGameButtons(false);
    gameOverlay.classList.remove("show");
    bettingOverlay.classList.remove("show");

    lowerOrRaiseBtn.removeEventListener('click', changeDirection);
    placeBet.removeEventListener('click', placeBetAction);
    bettingChipBtns.map(btn => {
        btn.removeEventListener('click', chipBtn);
    });
}

const finalizeBet = () => {
    player1.setBet(250);
    playSound("bet set");
    // let bet = player1.currentBet();

    // // Checks to see if your bet is not 0 && you can actually bet that 
    // // amount
    // if(bet === 0 && player1.canBet(bet)) {
    //     console.log("LOL");
    // } else {
    //     // Will not let you do anything
    //     // TODO: Add some logic here that gives a visual cue
    //     console.log("LOLOL");
    // }
    changeGameButtons("not");
}

// const displayOnGameOverlay = (screen) => {
//     // Removes all previous screen that were being displayed
//     if(gameOverlay.children.length > 0) {
//         let oldScreen = gameOverlay.children[0];
//         oldScreen.classList.remove("show");
//         gameOverlay.removeChild(oldScreen);
//     }
//     gameOverlay.appendChild(screen);
// }

let winnerOrLoser = document.querySelector('#winnerOrLoser');
let finalText = document.querySelector('#finalText');
let playAgain = document.querySelector('#play-again');

const displayEndScreen = (won) => {
    gameOverlay.classList.add('show');
    winnerOrLoser.classList.add('show');
    if(won) {
        finalText.innerHTML = "You have won the game!";
        playSound('victory');
    } else {
        finalText.innerHTML = "You went completely broke!";
    }
    playAgain.addEventListener('click', closeEndScreen);
}

const closeEndScreen = () => {
    gameOverlay.classList.remove('show');
    winnerOrLoser.classList.remove('show');
    updateDealerPoints(0);
    totalReset()
    setupGame(false);
}

let resultScreenIsOpen = false;
let resultScreen = document.querySelector('#results-overlay');
let result = document.querySelector('#result');
let surface = document.querySelector('#surface')

const openResultScreen = (resultText) => {
    result.innerHTML = resultText;
    resultScreen.classList.add("show");

    // Any game logic to happen right before a round is reset
    dealer.flip();
    updateCash(player1.currentCash());
    updateDealerPoints(dealer.currentPoints());
    changeGameButtons("next");

    surface.addEventListener('click', closeResultScreen);
}

const closeResultScreen = (target) => {
    if(resultScreen.classList.contains('show')) {
        if(resultScreenIsOpen) {
            resultScreenIsOpen = false;
            resultScreen.classList.remove("show");
            surface.removeEventListener('click', closeResultScreen);

            // Logic to check if game has ended.
            setGameButtons("removeNext"); // Removes the next button and returns the Bet button
            checkIfOver();
        } else {
            resultScreenIsOpen = true;
        }
    }
}

let sound_bet_set = document.querySelector('#sound-bet_set');
let sound_chip_1 = document.querySelector('#sound-chip_1');
let sound_dealing_cards = document.querySelector('#sound-dealing_cards');
let sound_card_shuffle = document.querySelector('#sound-card_shuffle');
let sound_bust = document.querySelector('#sound-bust');
let sound_sheesh = document.querySelector('#sound-sheesh');
let sound_victory = document.querySelector('#sound-victory');
let sound_button = document.querySelector('#sound-button');
let sound_round_won = document.querySelector('#sound-round_won');
let sound_toggle = document.querySelector('#sound-toggle');

const playSound = (name) => {
    switch(name) {
        case "bet set":
            sound_bet_set.currentTime = 0;
            sound_bet_set.play();
            break;
        case "chip 1":
            sound_chip_1.currentTime = 0;
            sound_chip_1.play();
            break;
        case "dealing cards":
            sound_dealing_cards.currentTime = 0;
            sound_dealing_cards.play();
            break;
        case "card shuffle":
            sound_card_shuffle.currentTime = 0;
            sound_card_shuffle.play();
            break;
        case "bust":
            sound_bust.currentTime = 0;
            sound_bust.play();
            break;
        case "sheesh":
            sound_sheesh.currentTime = 0;
            sound_sheesh.play();
            break;
        case "victory":
            sound_victory.currentTime = 0;
            sound_victory.play();
            break;
        case "button":
            sound_button.currentTime = 0;
            sound_button.play();
            break;
        case "round won":
            sound_round_won.currentTime = 0;
            sound_round_won.play();
            break;
        case "toggle":
            sound_toggle.currentTime = 0;
            sound_toggle.play();
            break;
    }
}

openStartScreen();