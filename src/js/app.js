// app define and config
'use strict';

var app = angular.module('app', [
  'ngRoute',
  'ngSanitize'
]);

// route config
app.config([
  '$routeProvider',
  function($routeProvider) {
    $routeProvider
        .when('/', {
          controller: 'ArticleController',
          templateUrl: 'views/article.html'
        })
        .when('/articles/:article*', {
          controller: 'ArticleController',
          templateUrl: 'views/article.html'
        })
        .when('/404', {
          templateUrl: 'views/404.html'
        })

        .otherwise({
          redirectTo: '/404'
        });
  }
]);

// constant values

// article base path
app.constant('ARTICLE_BASE_PATH', './articles/');
