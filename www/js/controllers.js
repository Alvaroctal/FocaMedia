angular.module('starter.controllers', [])

.factory('MediaService', function($q, $http) {

  var media = $q.defer();
  var test = [];
  var ip = '';
  var port = '';
  var connected = false;

  var connect = function(ip, port, callBack) { 
    this.ip = ip;
    this.port = port;
    $http.get('http://'+ip+':'+port+'/data/media.db') // usa http://server.meriland.es/media.db para ejecutar como aplicacion
    .success(function(data, status, headers,config){
      media.resolve(data);
      test = data;
      connected = true;
      console.log(data);
      callBack();
    })
    .error(function(data, status, headers,config){
      //media.reject(err);
      connected = false;
      callBack();
    });
  };

  return {
    get: function () {
      return media.promise;
    },
    getMedia: function(type) {
      return test.filter(function (media) { return media.type == type; });
    },
    getById: function(id){
      return test.filter(function (media) { return media._id == id; })[0];
    },
    connected: function (){
      return connected; },
    connect: function (ip, port, callBack){
      connect(ip, port, callBack);
    }
  };
})

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $sce) {

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

  // Create the trailer modal that we will use later
  $ionicModal.fromTemplateUrl('templates/trailer.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modalTrailer = modal;
  });


  // Triggered in the login modal to close it
  $scope.closeTrailer = function() {
    $scope.modalTrailer.hide();
  };

  $scope.showTrailer = function(trailers) {
    $scope.modalTrailer.trailerURL = $sce.trustAsResourceUrl("https://www.youtube.com/embed/" + trailers[0].key);
    $scope.modalTrailer.show();
  };
})

.controller('ConexionCtrl', function($scope, $location, MediaService, $timeout, $ionicLoading) {
  console.log("CONECTAR");
  if(!MediaService.connected()){
    $scope.ipPuertoData = {};

    $scope.cargaShow = function() {
      $ionicLoading.show({
        template: 'Cargando...'
      });
    };

    $scope.cargaError = function(){
      $ionicLoading.show({
        template: 'Error'
      });
    };

    $scope.cargaHide = function(){
      $ionicLoading.hide();
    };

    $scope.closeIpPuerto = function() {
      
    };
    $scope.doIpPuerto = function() {
      console.log('Doing conexion', $scope.ipPuertoData);
      $scope.cargaShow();
      MediaService.connect($scope.ipPuertoData.ip, $scope.ipPuertoData.puerto, function(){
        if(!MediaService.connected()){
          $scope.cargaError();
          $timeout(function() {
            $scope.cargaHide();
          }, 2000);
        }
        else{
          $scope.cargaHide();
          $location.path('/app/movies');
        }
      });
    };
  }
  else{
    $location.path('/app/movies');
  }
})

.controller('MoviesListCtrl', function($scope, $q, MediaService, $location) {
  if(MediaService.connected()){
    $scope.movies = MediaService.getMedia('movie');

    $scope.showSearch = false;
    $scope.toggleSearch = function() {
      $scope.showSearch = !$scope.showSearch;
    };
  }
  else{
    console.log('Movies: No conectado');
    $location.path('/');
  }
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
  };
})

.controller('TrailerCtrl', function($scope, $stateParams, MediaService, $sce) {

  var media = MediaService.get();
  $scope.movies = [];
  $scope.movie = MediaService.getById($stateParams.id);
  $scope.trailer = $sce.trustAsResourceUrl("https://www.youtube.com/embed/" + $scope.movie.data.videos.results[0].key);
});

