// controller: Article
'use strict';

app.controller('ArticleController', [
  '$scope',
  '$routeParams',
  '$location',
  'ARTICLE_BASE_PATH',
  'ArticleService',
  function($scope, $routeParams, $location,
      ARTICLE_BASE_PATH, ArticleService) {
    $scope.md = window.markdownit({
      html: true,
      langPrefix: 'hljs ',
      highlight: function(str, lang) {
        if(lang
            && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(lang, str).value;
          }catch (e) {}
        }

        try {
          return hljs.highlightAuto(str).value;
        }catch (e) {}

        return '';
      }
    });

    $scope.article = '';

    $scope.loading = true;

    // get article path, readme.md as index
    $scope.articlePath = $routeParams.article
        || 'readme.md';
    $scope.articlePath = ARTICLE_BASE_PATH
        + $scope.articlePath;
    // get articlePath's dir
    var articleDir = '';
    var index = $scope.articlePath.lastIndexOf('/');
    if(index >= 0) {
      articleDir = $scope.articlePath.substring(0, index + 1);
    }

    // fix relative path
    $scope.md.use(function(md) {
      var prev = md.normalizeLink;
      md.normalizeLink = function(url) {
        if(url.indexOf('http') == 0
            || url.indexOf('mailto') == 0
            || url.indexOf('ftp') == 0) {
          return prev(url);
        }else {
          if(url.indexOf('.md') == url.length - 3
              || url.indexOf('.markdown') == url.length - 9) {
            var dir = articleDir;
            if(articleDir.indexOf('../') == 0) {
              dir = articleDir.substring(3);
            }
            return '#/'
                + dir
                + url;
          }
          return articleDir + url;
        }
      };
    });

    ArticleService.get($scope.articlePath)
        .success(function(data, status) {
          $scope.article = $scope.md.render(data);

          $scope.loading = false;
        })
        .error(function(data, status) {
          if(status == 404) {
            location.href = '#/404';
          }

          $scope.loading = false;
        });
  }
]);
