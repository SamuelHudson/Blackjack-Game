'use strict';

// Declare app level module which depends on views, and components
angular.module('TestApplication', [
  'ngRoute',
  'TestApplication.controllers',
  'TestApplication.services'
])
.controller('MainController', function($scope) {
})

.config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $routeProvider.
  	when("/blackjack", {templateUrl: "views/blackjack.html", controller: "BlackjackController"}).
  	when("/texas-holdem", {templateUrl: "views/texasholdem.html", controller: "TexasHoldemController"}).
	otherwise({redirectTo: '/'});
}])