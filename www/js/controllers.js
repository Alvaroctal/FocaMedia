angular.module('starter.controllers', [])

.factory('MediaService', function($q, $http) {

  var media = [];

  var connected = false;

  return {
    connect: function (ip, port, callback) {

      $http.get('http://' + ip + ':' + port + '/data/index.json') // usa http://server.meriland.es/media.db para ejecutar como aplicacion
      .success(function(data, status){
        connected = true;
        media = data;

        callback(null, data);
      })
      .error(function(err, status) {
        connected = false;

        callback(err, null);
      });

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

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $sce) {

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
    $scope.trailerURL = $sce.trustAsResourceUrl('https://www.youtube.com/embed/' + trailers[0].key);
    $scope.modalTrailer.show();
  };
})

.controller('ConnectionCtrl', function($scope, $location, $ionicLoading, $http, MediaService) {

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

        console.log('connection err');
      }
    });
  }

  //----------------------------------------------------------------------------
  //  Connection search service
  //----------------------------------------------------------------------------

  $http.get('http://127.0.0.1:8080/services')
      .success(function(data) {
        $scope.connectFunction = "connect(" + data.host + ", " + data.port + ")";

//        la funcion esta apañada para que se conecte a si misma y no al servidor de verdad
//        $scope.connectFunction = "connect(" + data.host + ", 8000)";
        $scope.connectMessage = "Conectarse a "+ data.name;
      })
      .error(function(data) {
        $scope.connectFunction = "";
        $scope.connectMessage = "no se encontraron servidores";
      });
})

.controller('MoviesListCtrl', function($scope, MediaService) {

  //----------------------------------------------------------------------------
  //  Movies Controller
  //----------------------------------------------------------------------------

  $scope.movies = MediaService.getMedia('movie');

  $scope.showSearch = false;
  $scope.toggleSearch = function() {
    $scope.showSearch = !$scope.showSearch;
  }
})

.controller('TvshowsListCtrl', function($scope, MediaService) {

  //----------------------------------------------------------------------------
  //  Tvshows Controller
  //----------------------------------------------------------------------------

  $scope.tvshows = MediaService.getMedia('tvshow');
  $scope.showSearch = false;
  $scope.toggleSearch = function() {
    $scope.showSearch = !$scope.showSearch;
  }
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
