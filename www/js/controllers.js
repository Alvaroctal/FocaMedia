angular.module('starter.controllers', ['ngSanitize', 'com.2fdevs.videogular', 'com.2fdevs.videogular.plugins.controls', 'com.2fdevs.videogular.plugins.overlayplay', 'com.2fdevs.videogular.plugins.poster', 'com.2fdevs.videogular.plugins.buffering'])

.factory('MediaService', ['$q', '$http', '$ionicLoading', function($q, $http, $ionicLoading) {

  var media = [];
  var address = null;

  return {
    connect: function (ip, port, canceler, callback) {

      $http.get('http://' + ip + ':' + port + '/index', {timeout: canceler}).then(
        function(response) {
          address = ip + ':' + port;
          media = response.data.data;
          callback(null, response.data);
        }, function(response) {
          callback(response, null);
        });
    },
    getMedia: function(type) {
      return type ? media.filter(function (media) { return media.type == type && typeof(media.data) == 'object'}) : media;
    },
    getById: function(id) {
      return media.filter(function (media) { return media.data.id == id })[0];
    },
    watchlist: function(media_type, media_id, watchlist, callback) {
      $ionicLoading.show({ content: 'Loading', animation: 'fade-in', showBackdrop: true, maxWidth: 200, showDelay: 0 });

      $http.post('http://' + address + '/watchlist', { "media_type": media_type, "media_id": media_id, "watchlist": watchlist}).then(function(response) {
        $ionicLoading.hide();
        if (response.data.data) callback(null, response);
        else callback(response, null);
      }, function(response) {
        $ionicLoading.hide();
        callback(response, null);
      });
    },
    getAddress: function() {
      return address;
    }
  }
}])

.controller('AppCtrl', ['$scope', '$ionicModal', '$ionicLoading', '$timeout', '$sce', 'MediaService', function($scope, $ionicModal, $ionicLoading, $timeout, $sce, MediaService) {

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
}])

.controller('ConnectionCtrl', ['$scope', '$location', '$ionicPopup', '$ionicLoading', '$http', '$q', '$ionicLoading', 'MediaService', function($scope, $location, $ionicPopup, $ionicLoading, $http, $q, $ionicLoading, MediaService) {

  //----------------------------------------------------------------------------
  //  Connection Controller
  //----------------------------------------------------------------------------

  $scope.ip = localStorage.getItem("ip");
  $scope.port = localStorage.getItem("port");

  var canceler = $q.defer();

  $scope.cancel = function() {
    canceler.resolve();
  }

  $scope.connect = function(ip, port) {

    $ionicLoading.show({ template: 'Cargando... <button class="button button-clear" style="line-height: normal; min-height: 0; min-width: 0;" ng-click="cancel()"><i class="ion-close-circled"></i></button>' ,  scope: $scope, animation: 'fade-in', showBackdrop: true, maxWidth: 200, showDelay: 0 });

    MediaService.connect(ip, port, canceler.promise, function(err, data) {
      if (! err) {

        // Connection Success
        
        localStorage.setItem("ip", ip); localStorage.setItem("port", port);

        $ionicLoading.hide();
        $location.path('/app/movies');

      }
      else {

        // Connection Error

        canceler = $q.defer();

        $ionicLoading.show({
          template: 'Error de conexion',
          duration: 1000
        });
      }
    });
  }
}])

.controller('MoviesListCtrl', ['$scope', 'MediaService', function($scope, MediaService) {

  $scope.mirrorURL = 'http://' + MediaService.getAddress() + '/mirror';

  //----------------------------------------------------------------------------
  //  Movies Controller
  //----------------------------------------------------------------------------

  $scope.movies = MediaService.getMedia('movie');
  $scope.search = new Object();

  $scope.showSearch = false;
  $scope.showWatchList = false;

  $scope.toggleSearch = function() { $scope.showSearch = !$scope.showSearch;};
  $scope.filterWatchList = function(){ 
    $scope.showWatchList = !$scope.showWatchList;
    if($scope.showWatchList)
      $scope.search.watchlist = true;
    else
      delete $scope.search.watchlist;
  }
}])

.controller('TvshowsListCtrl', ['$scope', 'MediaService', function($scope, MediaService) {

  $scope.mirrorURL = 'http://' + MediaService.getAddress() + '/mirror';

  //----------------------------------------------------------------------------
  //  Tvshows Controller
  //----------------------------------------------------------------------------

  $scope.tvshows = MediaService.getMedia('tvshow');
  $scope.search = new Object();

  $scope.showSearch = false;
  $scope.showWatchList = false;
  
  $scope.toggleSearch = function() { $scope.showSearch = !$scope.showSearch }
  $scope.filterWatchList = function(){ 
    $scope.showWatchList = !$scope.showWatchList;
    if($scope.showWatchList)
      $scope.search.watchlist = true;
    else
      delete $scope.search.watchlist;
  }
}])

.controller('MovieCtrl', ['$scope', '$stateParams', 'MediaService', function($scope, $stateParams, MediaService) {

  $scope.mirrorURL = 'http://' + MediaService.getAddress() + '/mirror';

  //----------------------------------------------------------------------------
  //  Movie Controller
  //----------------------------------------------------------------------------

  $scope.watchlistWorking = false;
  $scope.movie = MediaService.getById($stateParams.id);
  $scope.watchlist = function() {
    var watchlist = $scope.movie.watchlist ? false : true;
    $scope.watchlistWorking = true;
    MediaService.watchlist('movie', $scope.movie.data.id, watchlist, function(err, data) {
      if (!err) {
        $scope.movie.watchlist = watchlist;
      } else {
        console.log(err);
      }
      $scope.watchlistWorking = false;
    });
  }
}])

.controller('TvshowCtrl', ['$scope', '$stateParams', 'MediaService', function($scope, $stateParams, MediaService) {

  $scope.mirrorURL = 'http://' + MediaService.getAddress() + '/mirror';

  //----------------------------------------------------------------------------
  //  Tvshow Controller
  //----------------------------------------------------------------------------

  $scope.dropStatus = null;
  $scope.watchlistWorking = false;
  $scope.tvshow = MediaService.getById($stateParams.id);

  $scope.getSeasonData = function(seasons, season_number) {
    return seasons.filter(function (season) { return season.season_number == season_number })[0];
  }

  $scope.watchlist = function() {
    var watchlist = $scope.tvshow.watchlist ? false : true;
    $scope.watchlistWorking = true;
    MediaService.watchlist('tv', $scope.tvshow.data.id, watchlist, function(err, data) {
      if (!err) {
        $scope.tvshow.watchlist = watchlist;
      } else {
        console.log(err);
      }
      $scope.watchlistWorking = false;
    });
  }

  $scope.showMore = function() { $scope.dropStatus = $scope.dropStatus ? null : 'down' };
}])

.controller('TvshowSeasonCtrl', ['$scope', '$stateParams', 'MediaService', function($scope, $stateParams, MediaService) {

  $scope.mirrorURL = 'http://' + MediaService.getAddress() + '/mirror';

  //----------------------------------------------------------------------------
  //  Season Controller
  //----------------------------------------------------------------------------

  $scope.tvshow = MediaService.getById($stateParams.id);
  $scope.season = $scope.tvshow.local.seasons.find(function(season) { return season.number == $stateParams.season})
  $scope.seasonData = $scope.tvshow.data.seasons.find(function(season) { return season.season_number == $stateParams.season})
}])

.controller('TvshowEpisodeCtrl', ['$scope', '$stateParams', 'MediaService', function($scope, $stateParams, MediaService) {

  //----------------------------------------------------------------------------
  //  Episode Controller
  //----------------------------------------------------------------------------

  $scope.tvshow = MediaService.getById($stateParams.id);
  $scope.episode = $scope.tvshow.local.seasons.find(function(season) { return season.number == $stateParams.season}).episodes.find(function(episode) { return episode.number == $stateParams.episode})
  $scope.episodeData = $scope.tvshow.data.seasons.find(function(season) { return season.season_number == $stateParams.season}).episodes.find(function(episode) { return episode.episode_number == $stateParams.episode})
}])

.controller('StatsCtrl', ['$scope', 'MediaService', function($scope, MediaService) {

  $scope.mirrorURL = 'http://' + MediaService.getAddress() + '/mirror';

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
        total += $scope.tvshows[i]['data']['seasons'][j]['episodes'].length * $scope.tvshows[i]['data']['episode_run_time'][0];
      }
    }
    return Math.floor(total / 60);
  }
}])

.controller('PlayerController', ['$scope', '$sce', '$location', '$stateParams', '$http', '$timeout', 'MediaService', function ($scope, $sce, $location, $stateParams, $http, $timeout, MediaService) {

  $scope.mirrorURL = 'http://' + MediaService.getAddress() + '/mirror';

  var controller = this;
  var url = 'http://' + MediaService.getAddress() + '/mirror/watch/' + ($scope.$parent.movie ? 'movie-' + $stateParams.id : 'tvshow-' + $stateParams.id + '-' + $stateParams.season + '-' + $stateParams.episode);

  console.log(url);

  controller.config = {
    isLive: true,
    sources: [
      {src: $sce.trustAsResourceUrl(url + '.mp4'), type: "video/mp4"}
    ],
    theme: "www/lib/videogular-themes-default/videogular.css",
    plugins: {
      poster: "http://" + MediaService.getAddress() + "/mirror/t/p/w780" + ($scope.$parent.movie ? $scope.$parent.movie.data.backdrop_path : ($scope.$parent.episodeData.still_path ? $scope.$parent.episodeData.still_path : $scope.$parent.tvshow.data.backdrop_path))
    }
  };
  controller.onPlayerReady = function(API) {
    controller.API = API;
  };
  controller.onComplete = function() {
    console.log('completo');
  };
}])

.filter('bytes', function() {
  return function(bytes, precision) {
    if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
    if (typeof precision === 'undefined') precision = 1;
    var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
      number = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) +  ' ' + units[number];
  }
});
