angular.module('starter.controllers', [])

.factory('MediaService', function($q, $http) {

  var media = [];

  return {
    connect: function (ip, port, loading, callback) {
      loading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
      });
      $http.get('http://' + ip + ':' + port + '/index').then(
        function(response) {
          media = response.data.data;
          loading.hide();
          callback(null, response.data);
        }, function(response) {
          loading.hide();
          callback(response, null);
        });
    },
    getMedia: function(type) {
      return type ? media.filter(function (media) { return media.type == type && typeof(media.data) == 'object'}) : media;
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

  $scope.ip = '127.0.0.1';
  $scope.port = 14123;

  $scope.connect = function(ip, port) {
    MediaService.connect(ip, port, $ionicLoading, function(err, data) {
      if (! err) {
        // Connection Success

        $location.path('/app/tvshows');
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
  console.log($scope.movie);
})

.controller('TvshowCtrl', function($scope, $stateParams, MediaService) {

  //----------------------------------------------------------------------------
  //  Tvshow Controller
  //----------------------------------------------------------------------------
  var drop = false;

  $scope.tvshow = MediaService.getById($stateParams.id);
  $scope.currentSeason = $scope.tvshow.data.seasons[0];
  $scope.getSeasonData = function(seasons, season_number) {
    return seasons.filter(function (season) { return season.season_number == season_number })[0];
  }

  $scope.changeSeason = function (num){
    $scope.currentSeason = $scope.tvshow.data.seasons[num];
  };

  $scope.showMore = function(){
    document.getElementById("overview").className = drop ? 'drop' : 'dropDown';
    drop = !drop;
  };
})

.controller('TvshowSeasonCtrl', function($scope, $stateParams, MediaService) {

  //----------------------------------------------------------------------------
  //  Tvshow Controller
  //----------------------------------------------------------------------------
  getSeasonData = function(seasons, season_number) {
    return seasons.filter(function (season) { return season.season_number == season_number })[0];
  }

  $scope.tvshow = MediaService.getById($stateParams.id);
  $scope.seasonNum = $stateParams.season;
  $scope.season = $scope.tvshow.local.seasons[$stateParams.season];
  $scope.seasonData = getSeasonData($scope.tvshow.data.seasons, $scope.season.number);
})

.controller('TvshowEpisodeCtrl', function($scope, $stateParams, MediaService) {

  //----------------------------------------------------------------------------
  //  Movie Controller
  //----------------------------------------------------------------------------

  getEpisodeData = function(episodes, episode_number) {
    return episodes.filter(function (episode) { return episode.episode_number == episode_number })[0];
  }

  $scope.tvshow = MediaService.getById($stateParams.id);
  $scope.episode = $scope.tvshow.local.seasons[$stateParams.season].episodes[$stateParams.episode];
  $scope.episodeData = getEpisodeData($scope.tvshow.data.seasons[$scope.episode.season].episodes, $scope.episode.number);
  console.log($scope.tvshow);
})

.controller('StatsCtrl', function($scope, $stateParams, MediaService) {

  //----------------------------------------------------------------------------
  //  Stats Controller
  //----------------------------------------------------------------------------

  $scope.movies = MediaService.getMedia('movie');
  $scope.tvshows = MediaService.getMedia('tvshow');

  $scope.sumMoviesSizes = function() {
    var total = 0;
    for ( var i = 0, _len = $scope.movies.length; i < _len; i++ ) {
      total += $scope.movies[i]['local']['size'];
    }
    return total;
  }

  $scope.sumMoviesHours = function() {
    var total = 0;
    for ( var i = 0, _len = $scope.movies.length; i < _len; i++ ) {
      total += $scope.movies[i]['data']['runtime'];
    }
    return Math.floor(total / 60);
  }

  $scope.sumSeasons = function() {
    var total = 0;
    for ( var i = 0, _leni = $scope.tvshows.length; i < _leni; i++ ) {
      for ( var j = 0, _lenj = $scope.tvshows[i]['local']['seasons'].length; j < _lenj; j++ ) {
        total ++;
      }
    }
    return total;
  }

  $scope.sumEpisodes = function() {
    var total = 0;
    for ( var i = 0, _leni = $scope.tvshows.length; i < _leni; i++ ) {
      for ( var j = 0, _lenj = $scope.tvshows[i]['local']['seasons'].length; j < _lenj; j++ ) {
        total += $scope.tvshows[i]['local']['seasons'][j]['episodes'].length;
      }
    }
    return total;
  }

  $scope.sumTvShowsSizes = function() {
    var total = 0;
    for ( var i = 0, _leni = $scope.tvshows.length; i < _leni; i++ ) {
      for ( var j = 0, _lenj = $scope.tvshows[i]['local']['seasons'].length; j < _lenj; j++ ) {
        for ( var k = 0, _lenk = $scope.tvshows[i]['local']['seasons'][j]['episodes'].length; k < _lenk; k++ ) {
          total += $scope.tvshows[i]['local']['seasons'][j]['episodes'][k]['size'];
        }
      }
    }
    return total;
  }

  $scope.sumTvShowsHours = function() {
    var total = 0;
    for ( var i = 0, _leni = $scope.tvshows.length; i < _leni; i++ ) {
      for ( var j = 0, _lenj = $scope.tvshows[i]['data']['seasons'].length; j < _lenj; j++ ) {
        total += $scope.tvshows[i]['data']['seasons'][j]['episodes'].length * $scope.tvshows[i]['data']['episode_run_time'][0]
      }
    }
    return Math.floor(total / 60);
  }
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
