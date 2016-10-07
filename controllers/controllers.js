angular.module('TestApplication.controllers', [])

.controller('BlackjackController', function($scope, DeckFactory) {

    //set values for card suit/value and the deck
    $scope.values = ["ACE", "2", "3", "4", "5", "6", "7", "8", "9", "10", "JACK", "QUEEN", "KING"];
    $scope.suits = ["SPADES", "CLUBS", "DIAMONDS", "HEARTS"];
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
                DeckFactory.drawCard(_player, $scope.Deck);
            }
            dealtRounds++;
        }
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
    };

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