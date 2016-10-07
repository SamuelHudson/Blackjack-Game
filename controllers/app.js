'use strict';

// Declare app level module which depends on views, and components
angular.module('TestApplication', [
  'ngRoute',

  'TestApplication.controllers',
])
.controller('MainController', function($scope) {
})

.config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $routeProvider.
  	when("/", {templateUrl: "views/blackjack.html", controller: "BlackjackController"}).
	otherwise({redirectTo: '/'});
}])