angular.module('starter.controllers', [])

.factory('MediaService', function($q, $http) {

  var media = [];

  return {
    connect: function (ip, port, callback) {

      $http.get('http://' + ip + ':' + port + '/index').then(
        function(response) {
          media = response.data.data;

          callback(null, response.data);
        }, function(response) {
          callback(response, null);
        });

      console.log('conectar');

      return media.promise;
    },
    getMedia: function(type) {
      return media.filter(function (media) { return media.type == type });
    },
    getById: function(id){
      return media.filter(function (media) { return media.data.id == id })[0];
    }
  }
})

.controller('AppCtrl', function($scope, $ionicModal, $ionicLoading, $timeout, $sce) {

  //----------------------------------------------------------------------------
  //  Modal Trailer
  //----------------------------------------------------------------------------

  $ionicModal.fromTemplateUrl('templates/trailer.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modalTrailer = modal;
  });

  $scope.closeTrailer = function() {
    $scope.modalTrailer.hide();
    $scope.trailerURL = $sce.trustAsResourceUrl('https://www.youtube.com/embed/');
  };

  $scope.showTrailer = function(trailers) {
    if(trailers.length == 0){
      $ionicLoading.show(
      {
        template: 'No hay trailers disponibles',
        duration: 1000
      });
    }
    else{
      $scope.trailerURL = $sce.trustAsResourceUrl('https://www.youtube.com/embed/' + trailers[0].key);
      $scope.modalTrailer.show();
    }
  };
})

.controller('ConnectionCtrl', function($scope, $location, $ionicPopup, $ionicLoading, $http, MediaService) {

  //----------------------------------------------------------------------------
  //  Connection Controller
  //----------------------------------------------------------------------------

  $scope.connect = function(ip, port) {
    MediaService.connect(ip, port, function(err, data) {
      if (! err) {
        // Connection Success

        $location.path('/app/movies');
      }
      else {
        // Connection Error

        $ionicLoading.show({
          template: 'Error de conexion',
          duration: 1000
        });
      }
    });
  }

  //----------------------------------------------------------------------------
  //  Connection search service
  //----------------------------------------------------------------------------
  
  /*var polo = require('polo');
  var apps = polo();
  var service = apps.once('up', function(name, service) {
    console.log(apps.get(name));
  });*/
})

.controller('MoviesListCtrl', function($scope, MediaService) {

  //----------------------------------------------------------------------------
  //  Movies Controller
  //----------------------------------------------------------------------------

  $scope.movies = MediaService.getMedia('movie');

  $scope.showSearch = false;
  $scope.toggleSearch = function() { $scope.showSearch = !$scope.showSearch }
})

.controller('TvshowsListCtrl', function($scope, MediaService) {

  //----------------------------------------------------------------------------
  //  Tvshows Controller
  //----------------------------------------------------------------------------

  $scope.tvshows = MediaService.getMedia('tvshow');
  $scope.showSearch = false;
  $scope.toggleSearch = function() { $scope.showSearch = !$scope.showSearch }
})

.controller('MovieCtrl', function($scope, $stateParams, MediaService) {

  //----------------------------------------------------------------------------
  //  Movie Controller
  //----------------------------------------------------------------------------

  $scope.movie = MediaService.getById($stateParams.id);
})

.controller('TvshowCtrl', function($scope, $stateParams, MediaService) {

  //----------------------------------------------------------------------------
  //  Tvshow Controller
  //----------------------------------------------------------------------------

  $scope.tvshow = MediaService.getById($stateParams.id);
  $scope.currentSeason = $scope.tvshow.data.seasons[0];

  $scope.changeSeason = function (num){
    $scope.currentSeason = $scope.tvshow.data.seasons[num];
  };
  console.log($scope.tvshow);
  console.log($scope.currentSeason);
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
