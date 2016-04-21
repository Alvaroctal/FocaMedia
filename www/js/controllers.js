angular.module('starter.controllers', [])

.factory('MediaService', function($q, $http) {

  var media = $q.defer();
  var test = [];

  $http.get('http://localhost:8000/data/media.db') // usa http://server.meriland.es/media.db para ejecutar como aplicacion
    .success(function(data, status, headers,config){
      media.resolve(data);
      test = data;
    })
    .error(function(data, status, headers,config){
      media.reject(err);
    });

  return {
    get: function () {
      return media.promise
    },
    getMovies: function() {
      return media.filter(function (el) { return el.type == 'movie' });
    },
    getById: function(id){
      return test.filter(function (el) { return el._id == id })[0];
    }
  }
})

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('MoviesListCtrl', function($scope, $q, MediaService) {

  var media = MediaService.get();
  $scope.movies = [];

  media.then(function(data) {
    $scope.movies = data;
    console.log(data);
  });
})

.controller('MovieCtrl', function($scope, $stateParams, MediaService) {

  var media = MediaService.get();
  $scope.movies = [];
  $scope.movie = MediaService.getById($stateParams.id);
})

.filter('bytes', function() {
  return function(bytes, precision) {
    if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
    if (typeof precision === 'undefined') precision = 1;
    var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
      number = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) +  ' ' + units[number];
  }
});

