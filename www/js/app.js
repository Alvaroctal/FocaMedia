// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.search', {
    url: '/search',
    views: {
      'menuContent': {
        templateUrl: 'templates/search.html'
      }
    }
  })

  .state('app.connection', {
    url: '/connection',
    views: {
      'menuContent': {
        templateUrl: 'templates/connection.html',
        controller: 'ConnectionCtrl'
      }
    }
  })

  .state('app.movies', {
    url: '/movies',
    views: {
      'menuContent': {
        templateUrl: 'templates/movies.html',
        controller: 'MoviesListCtrl'
      }
    }
  })

  .state('app.tvshows', {
    url: '/tvshows',
    views: {
      'menuContent': {
        templateUrl: 'templates/tvshows.html',
        controller: 'TvshowsListCtrl'
      }
    }
  })

  .state('app.movie', {
    url: '/movies/:id',
    views: {
      'menuContent': {
        templateUrl: 'templates/movie.html',
        controller: 'MovieCtrl'
      }
    }
  })

  .state('app.tvshow', {
    url: '/tvshows/:id',
    views: {
      'menuContent': {
        templateUrl: 'templates/tvshow.html',
        controller: 'TvshowCtrl'
      }
    }
  })

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/connection');
});
