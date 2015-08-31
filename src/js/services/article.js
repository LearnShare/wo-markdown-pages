// service: Article
'use strict';

app.service('ArticleService', [
  '$http',
  '$q',
  function($http, $q) {
    return {
      get: function(path) {
        return $http.get(path);
      }
    };
  }
]);
