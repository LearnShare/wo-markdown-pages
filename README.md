wo-markdown-blog
====

Render Markdown files as web pages.

Start
----

+ Fork [this project](https://github.com/LearnShare/wo-markdown-pages), or `npm install wo-markdown-blog`;
+ `npm install` and `bower install`.

Write
----

+ Put all article markdown files in dir 'src/articles/';
+ 'src/articles/readme.md' will show as main page(index).

Release
----

+ Run `gulp`;
+ The site will release to '_dist/'.

+ Run `node build.js` or `iojs build.js` (should after `gulp`);
+ The static pages build to '_build/'.

Dev
----

+ angular.js
+ markdown-it
+ highlight.js
+ less
+ gulp
