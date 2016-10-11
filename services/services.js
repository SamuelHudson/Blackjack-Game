angular.module('TestApplication.services', [])

.factory('DeckFactory', function() {
	
	 //set values for card suit/value and the deck
    var values = ["ACE", "2", "3", "4", "5", "6", "7", "8", "9", "10", "JACK", "QUEEN", "KING"];
    var suits = ["SPADES", "CLUBS", "DIAMONDS", "HEARTS"];

	return {

		//create a 52 card deck
		create: function() {
        	// create deck of cards  
        	var deck = [];
        	// loop suits
        	for (var i = 0; i < suits.length; i++) {
            	var suit = suits[i];
            	// loop values  
            	for (var j = 0; j < values.length; j++) {
                	var value = values[j];
                	var card = {
                    	Suit: suit,
                    	Value: value
                	};
                	deck.push(card);
            	}
        	}
        	return deck;
    	},

    	//shuffle the created deck
    	shuffle: function(_deck, x) {
        
        	//counter variable
        	var timesShuffled = 0;
        
        	// shuffle deck of cards x amount of times
        	while (x > timesShuffled) {
            	timesShuffled++;
            
            	// In turn take each card out of the deck and place it back in a random position
            	var lastCard = _deck.pop();
            	var firstCard = _deck.shift();
            	var position = Math.floor(Math.random() * _deck.length);
            	_deck.splice(position, 0, lastCard);
            	_deck.splice(position, 0, firstCard);
        	}
        	return _deck;
    	}
	}
})