angular.module('TestApplication.controllers', [])

.controller('BlackjackController', function($scope, DeckFactory) {

    $scope.Deck = [];

    //template player object
    $scope.player = {
        Number: 0,
        Cards: [],
        Dealer: false,
        Stick: false,
        ChipStack: 100,
        CurrentBet: 5,
        BetComplete: false,
        DealerComplete: false
    }; 
    
    //function for storing selectedPlayer
    $scope.selectPlayer = function(player) {
        $scope.selectedPlayer = player;
    }

    //function for creating the listOfPlayers array
    $scope.createList = function(quan) {
        
        // initalise a list of players
        var listOfPlayers = [];
        
        // loop through quantity and push to list of players, clone player to create the player object
        for (var i = 1; i <= quan; i++) {
            var _player = angular.copy($scope.player);
            _player.Number = i;
            listOfPlayers.push(_player);
        }

        // ammend the lisOfPlayers array to add in a dealer
        var _dealer = angular.copy($scope.player);
        _dealer.Dealer = true;
        _dealer.Number = "Dealer";
        listOfPlayers.push(_dealer);

        return listOfPlayers;
    }

    //function for dealing cards to the players and dealer
    $scope.deal = function() {
        
        //number of rounds dealt
        var dealtRounds = 0;
        
        //go around the players and deal 1 card per time
        while (dealtRounds < 2) {
            
            // loop through all players and give them a card    
            for (var i = 0; i < $scope.listOfPlayers.length; i++) {
                var _player = $scope.listOfPlayers[i];
                $scope.drawCard(_player);
            }
            dealtRounds++;
        }
    }

    //draw a card from the deck
    $scope.drawCard = function(player) {

    player.Cards.push($scope.Deck.shift());
    }

    //function containing the variables to be reset within the startGame function
    $scope.init = function(){
        
        // initalise a list of players
        $scope.listOfPlayers = [];
        
        //varibale containing the selected player for bootstrap tabs
        $scope.selectedPlayer = null;
        $scope.Deck = [];
        
        //empty variables for compareDealer function
        $scope.winningCounter = "";
        $scope.losingCounter = "";
        $scope.tiedCounter = "";
        
        //empty varibale for displaying hands played
        $scope.handsPlayed = 0;
    }

    //function container all other functions needed to get the game properly initialised
    $scope.startGame = function() {
        $scope.init();
        $scope.Deck = DeckFactory.create();
        $scope.Deck = DeckFactory.shuffle($scope.Deck, 100);
        $scope.listOfPlayers = $scope.createList(prompt("How many players are there?", ""))
        $scope.deal();
    }

    //function for controlling the total number in players hand
    $scope.calculateTotalOfCards = function(cardsInHand) {
        var total = 0;
        var aces = 0;

        cardsInHand.forEach(function(card) {
            switch (card.Value) {
                case "ACE":
                    aces++;
                    break;

                case "JACK":
                case "QUEEN":
                case "KING":
                    total += 10;
                    break;

                default:
                    total += parseInt(card.Value); //parsing value string info to integer
                    break;
            };
        });

        if(aces != 0 && total + 11 + (aces - 1) <= 21){
            
            // if we can add an ace as an 11 with the other aces
            total += 11 + (aces - 1);
        } 
        else {
            
            // if not add them as 1
            total += aces;
        };

        return total;
    }

    //function for returning chipstack on bet
    $scope.stake = function(player) {

        //subtract CurrentBet from ChipStack
        player.ChipStack -= player.CurrentBet;
    }

    //function for comparing player hands to dealer hand at the end of the game
    $scope.compareDealer = function(dealer) {

        //initialise variable for dealer's hand
        var dealerHandTotal = $scope.calculateTotalOfCards(dealer);

        //get individual players
        for (var i = 0; i < $scope.listOfPlayers.length; i++) {
            if(!$scope.listOfPlayers[i].Dealer) {

                //initialise variables for player currentbet and chip stack
                var currentPlayer = $scope.listOfPlayers[i];

                //initialise varibale for individual players' hands
                //and number that will update with every loop
                var playerNumber = currentPlayer.Number.toString();
                var playerHandTotal = $scope.calculateTotalOfCards($scope.listOfPlayers[i].Cards);            

                //compare individual players' hands to dealer hand
                //winning conditions
                if (playerHandTotal > dealerHandTotal && playerHandTotal < 22) {

                    //present results in dealer tab using strings
                    $scope.winningCounter += playerNumber + " ";

                    //times CurrentBet by 2 and add to ChipStack
                    currentPlayer.ChipStack += (currentPlayer.CurrentBet * 2);
                }
                else if (dealerHandTotal > 21 && playerHandTotal < 22) {
                    $scope.winningCounter += playerNumber + " ";
                    currentPlayer.ChipStack += (currentPlayer.CurrentBet * 2);
                } 
                //losing conditions
                else if (playerHandTotal < dealerHandTotal && playerHandTotal < 22) {
                    $scope.losingCounter += playerNumber + " ";

                    //subtract CurrentBet from ChipStack
                    currentPlayer.ChipStack - currentPlayer.CurrentBet;
                }
                else if (dealerHandTotal > 21 && playerHandTotal > 21) {
                    $scope.losingCounter += playerNumber + " ";
                    currentPlayer.ChipStack -= currentPlayer.CurrentBet;
                }
                //tied conditions
                else if (playerHandTotal == dealerHandTotal && playerHandTotal < 22) {
                    $scope.tiedCounter += playerNumber + " ";

                    //put CurrentBet back into ChipStack
                    currentPlayer.ChipStack += (currentPlayer.CurrentBet * 1);
                }              
            }

            currentPlayer.CurrentBet = 0;
        }
    }

    //reset the game
    $scope.resetGame = function() {
        
        //loop through players
        for (var i = 0; i < $scope.listOfPlayers.length; i++) {
            
            //find current cards
            $scope.listOfPlayers[i].Cards.forEach(function(card) {
                
                //attain suit and value of the cards
                var card = {
                        Suit: card.Suit,
                        Value: card.Value
                };
                
                //push players' cards to the deck
                $scope.Deck.push(card);
            });

            //wipe the players' cards array
            $scope.listOfPlayers[i].Cards = []; 

            //set the players' stick value back to false
            $scope.listOfPlayers[i].Stick = false;

            //set the players' BetComplete value back to false
            $scope.listOfPlayers[i].BetComplete = false;

            //set DealerComplete back to false
            $scope.listOfPlayers[i].DealerComplete = false;

            //set CurrentBet to minimum 5 but if it is less
            //than 5 set minimum to 0
            if ($scope.listOfPlayers[i].ChipStack < 5) {
                
                //set to 0
                $scope.listOfPlayers[i].CurrentBet = 0;
            }
            else {
                
                //set to 5
                $scope.listOfPlayers[i].CurrentBet = 5;
            }
            
        }

        //initialise the reset
        $scope.handsPlayed++;
        $scope.winningCounter = "";
        $scope.losingCounter = "";
        $scope.tiedCounter = "";
        DeckFactory.shuffle($scope.Deck, 100);        
        $scope.deal();        
    }
})

.controller('TexasHoldemController', function($scope, DeckFactory) {

    //global deck variable
    $scope.Deck = [];

    //template player object
    $scope.player = {
        Name: "",
        Cards: [],
        ChipStack: 100,
        raiseAmount: 0,
        Fold: false
    };

    //steve and pete players
    $scope.Steve = {
        Name: "Steve",
        Cards: [],
        ChipStack: 100,
        Auto: false
    };

    $scope.Pete = {
        Name: "Pete",
        Cards: [],
        ChipStack: 100,
        Auto: false
    };

    //dealer player
    $scope.Dealer = {
        Name: "Dealer",
        Cards: []
    };

    //tablepot varibale
    $scope.tablePot = 0;

    //current circulating bet
    $scope.tableBet = 1;

    //winnings earned
    $scope.totalWinnings = 0;

    //game completed
    $scope.GameComplete = false;

    //assigning user response to player name 
    $scope.name = function() {
        var name = prompt("What is your name?", "");
        $scope.player.Name = name;
    }

    //draw a card from the deck
    $scope.drawCardTH = function(player) {
        player.Cards.push($scope.Deck.shift());
    }

    //function for dealing cards to the players and dealer
    $scope.dealTH = function() {
        
        //number of rounds dealt
        var dealtRounds = 0;
        
        //go around the players and deal 1 card per time
        while (dealtRounds < 2) {
            
            //deal player, Steve and Pete 2 cards
            $scope.drawCardTH($scope.player);
            $scope.drawCardTH($scope.Steve);
            $scope.drawCardTH($scope.Pete);

            dealtRounds++;
        }

        //deal the dealer 3 cards
        while (dealtRounds < 5) {
            $scope.drawCardTH($scope.Dealer);

            dealtRounds++;
        }
    }

    //function for controlling betting
    $scope.playerBet = function(player) {

        //playerBet var to store accurate amount
        //being taken to player's chipstack
        var playerBet = 0;

        //put table bet with playerbet
        playerBet = $scope.tableBet;

        //subtract playerBet from player's chipstack
        player.ChipStack -= playerBet;

        //add playerBet to tableBet
        $scope.tableBet += playerBet;

        //add tableBet to tablePot
        $scope.tablePot += $scope.tableBet;
    }

    //function containing the variables to be reset within the startGameTH function
    $scope.init = function(){
        
        //reset player's cards
        $scope.player.Cards = [];
        $scope.Steve.Cards = [];
        $scope.Pete.Cards = [];
        $scope.Dealer.Cards = [];

        //reset steve and pete auto
        $scope.Steve.Auto = false;
        $scope.Pete.Auto = false;

        //reset fold
        $scope.player.Fold = false;
        
        //reset the deck
        $scope.Deck = [];
        
        //tablepot varibale
        $scope.tablePot = 0;

        //current circulating bet
        $scope.tableBet = 1;

        //winnings earned
        $scope.totalWinnings = 0;
    }

    //steve and pete function to play the game autonomously
    $scope.autonomousTH = function(_player) {
       
       //variables for suit and value
        var suit = "";
        var value = "";

        //variables for suit and value of table cards
        var dealerSuit = "";
        var dealerValue = "";

        //variables for suit and value matches
        var suitMatches = 0;
        var valueMatches = 0;

        //loop through the player's cards array and obtain the suit and value
        _player.Cards.forEach(function(card) {
            suit = card.Suit;
            value = card.Value;

            $scope.Dealer.Cards.forEach(function(_card) {
                dealerSuit = _card.Suit
                dealerValue = _card.Value;

                //if the player's cards suit and value are equal to the
                //table cards then increase match counters
                if(suit == dealerSuit) {
                    suitMatches++;
                }
                else if (value == dealerValue) {
                    valueMatches++;
                }
            })
        })

        //make sure that the current player isn't Pete
        if(_player == $scope.Steve) {
            
            //confirm that steve has completed his turn
            $scope.Steve.Auto = true;

            //if the counters count 3 or more matches then increase the current bet
            if(suitMatches > 2 || valueMatches > 2) {
                $scope.playerBet(_player);
            }
        }
        //else its pete
        else if (_player == $scope.Pete) {
            
            //confirm that pete has completed his turn
            $scope.Pete.Auto = true;            
            
            //examine matches and then continue on to dealer
            if(suitMatches > 2 || valueMatches > 2) {
                $scope.playerBet(_player);
            }

            //call dealer function
            $scope.dealerTH();
        }
    }                

    //start game function that populates player object, correctly sets all variables
    //and collects initial bets
    $scope.startGameTH = function(){
        //reset variables
        $scope.init();

        //create and shuffle the deck
        $scope.Deck = DeckFactory.create();
        $scope.Deck = DeckFactory.shuffle($scope.Deck, 100);

        //deal each player two cards
        $scope.dealTH();

        //start with Steve
        $scope.autonomousTH($scope.Steve);
    }

    //player Check function
    $scope.playerCheck = function() {
        
        //move left to Pete
        $scope.autonomousTH($scope.Pete);
    }

    //player Call function
    $scope.playerCall = function() {

        //add this to current bet and pot and reduce from chipstack
        $scope.playerBet($scope.player);

        //continue on to Pete
        $scope.autonomousTH($scope.Pete);
    }

    //player Fold function
    $scope.playerFold = function() {
        
        //discard cards in hand
        $scope.player.Cards.forEach(function(card) {
            
            //create card
            var _card = {
                Suit: card.Suit,
                Value: card.Value
            };

            //push card back to deck
            $scope.Deck.push(_card);
        });

        //move on to Pete
        $scope.autonomousTH($scope.Pete);
    }

    //function for player raise
    $scope.playerRaise = function() {

        //variable for player.raiseamount
        var amount = $scope.player.raiseAmount;

        //minus amount from chipstack
        $scope.player.ChipStack -= amount;

        //add amount to tablebet
        $scope.tableBet += amount;

        //add amount to tablepot
        $scope.tablePot += amount;

        //move on to pete
        $scope.autonomousTH($scope.Pete);
    }

    //dealer function deals the 4th and river autonomously after pete
    //and goes back to steve
    $scope.dealerTH = function() {

        //confirm that both steve and pete have had their turns
        if ($scope.Steve.Auto == true && $scope.Pete.Auto == true) {

            //confirm that there are 3 cards on the table
            if ($scope.Dealer.Cards.length == 3) {

                //deal the 4th
                $scope.Dealer.Cards.push($scope.Deck.shift());

                //reset steve and pete auto to false
                $scope.Steve.Auto = false;
                $scope.Pete.Auto = false;

                //move on to steve
                $scope.autonomousTH($scope.Steve);
            } 

            //if there are 4 cards on the table
            else if ($scope.Dealer.Cards.length == 4) {

                //deal the river
                $scope.Dealer.Cards.push($scope.Deck.shift());

                //reset steve and pete auto to false
                $scope.Steve.Auto = false;
                $scope.Pete.Auto = false;

                //move on to steve
                $scope.autonomousTH($scope.Steve);
            }

            //if there are 5 cards on the table then
            //call a comparison function to compare dealer
            //hands and pay out the pot
            else if ($scope.Dealer.Cards.length == 5) {

                //set game complete to true
                $scope.GameComplete = true;

                //call comparison function
                $scope.compareTH($scope.Steve);
                $scope.compareTH($scope.player);
                $scope.compareTH($scope.Pete);
            }
        }
    }    

    //function to judge the player's hand against opponents
    $scope.compareTH = function(_player) {

        //counter variables
        var suitCounter = 0;
        var valueCounter = 0;

        //obtain player cards
        _player.Cards.forEach(function(card) {

            //variables for suit and value
            var plaCardSuit = card.Suit;
            var plaCardValue = card.Value;

            //obtain table cards
            $scope.Dealer.Cards.forEach(function(_card) {

                //variables for suit and value
                //of table cards
                var deaCardSuit = _card.Suit;
                var deaCardValue = _card.Value;

                if (plaCardSuit == deaCardSuit) {
                    suitCounter++;
                }
                if (plaCardValue == deaCardValue) {
                    valueCounter++;
                }

            })
        })

        //compare the two cards in the players hand
        for (var i = 0; i < _player.Cards.length; i++) {

            //obtain value and suit of first card
            var handSuit = _player.Cards[i].Suit;
            var handValue = _player.Cards[i].Value;
        }

        //compare this to the other card in the hand
        if (handSuit == _player.Cards[0].Suit) {
            suitCounter++;
        }
        if (handValue == _player.Cards[0].Value) {
            valueCounter++;
        }

        //compare the 5 cards on the table
        for (var j = 0; j < $scope.Dealer.Cards.length; j++) {

            //obtain value and suit of the first card
            var dealSuit = $scope.Dealer.Cards[0].Suit;
            var dealValue = $scope.Dealer.Cards[0].Value;

            if (dealSuit == $scope.Dealer.Cards[j].Suit) {
                suitCounter++;
            }
            if (dealValue == $scope.Dealer.Cards[j].Value) {
                valueCounter++;
            }
        }

        console.log(suitCounter);
        console.log(valueCounter);

        switch(true) {
            case (valueCounter == 1):
                console.log("1 Pair!");
                break;
            case (valueCounter == 2):
                console.log("2 Pair!");
                break;
            case (valueCounter == 3):
                console.log("Three of a kind!");
                break;
            case (valueCounter == 5):
                console.log("Four of a kind!");
                break;
            case (suitCounter == 9):
                console.log("Flush!");
                break;
            case (valueCounter == 2 && valueCounter == 3):
                console.log("Full house!");
                break;
            default:
                console.log("Nothing");
                break;
        }
    }

    //payout function 
    $scope.payoutTH = function() {
        //code
    }

})

