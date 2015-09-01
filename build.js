var fs = require('fs-extra'),
    path = require('path'),
    MarkdownIt = require('markdown-it')
    hljs = require('highlight.js');

var articlesRootDir = './src/articles/';
var distDir = './_build/';

var md = new MarkdownIt({
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
md.use(function(md) {
  var prev = md.normalizeLink;
  md.normalizeLink = function(url) {
    if(url.indexOf('http') == 0
        || url.indexOf('mailto') == 0
        || url.indexOf('ftp') == 0) {
      return prev(url);
    }else {
      if(path.extname(url) == '.md'
          || path.extname(url) == '.markdown') {
        if(path.basename(url) == 'readme.md'
            || path.basename(url) == 'readme.markdown') {
          return path.dirname(url)
              + '/index.html';
        }else {
          var index = url.lastIndexOf('.');

          return url.substring(0, index)
              + '.html';
        }
      }
      return url;
    }
  };
});

try {
  fs.removeSync(distDir);
} catch (e) {}

var ignoreFiles = [
  'System Volume Information',
  '$RECYCLE.BIN',
  '$Recycle.Bin'
];

var ignorePattern = /^\..*$/i;

function dirContents(dir) {
  var list = fs.readdirSync(dir);

  var dirs = [];
  var files = [];

  for(var i in list) {
    var item = list[i];

    if(ignorePattern.test(item)
        || ignoreFiles.indexOf(item) >= 0) {
      continue;
    }

    try {
      var stat = fs.statSync(dir
          + '/'
          + item);
      if(stat.isDirectory()) {
        dirs.push({
          name: item,
          type: 'dir'
        });
      }else if(stat.isFile()) {
        files.push({
          name: item,
          type: 'file',
          size: stat.size
        });
      }
    } catch(e) {
      console.log('[' + dir + '/' + item + '] is not a file or dir');
    }
  }

  return {
    dirs: dirs,
    files: files
  };
}

function dirTree(dir) {
  var tree = null;
  // check is dir a directory
  var stat = fs.statSync(dir);
  if(!stat.isDirectory()) {
    console.log(dir, 'is not a directory!');
    return;
  }

  tree = dirContents(dir);

  for(var i in tree.dirs) {
    var item = tree.dirs[i];

    item.contents = dirTree(dir
        + '/'
        + item.name);
  }

  return tree;
}

function fileName(name) {
  var index = name.lastIndexOf('.');

  if(index >= 0) {
    return name.substring(0, index);
  }else {
    return '';
  }
}
function extName(fileName) {
  var index = fileName.lastIndexOf('.');

  if(index >= 0) {
    return fileName.substring(index + 1);
  }else {
    return '';
  }
}

function readContents(dirContents, parentDir) {
  var c = dirContents;
  for(var i in c.dirs) {
    var d = c.dirs[i];

    readContents(d.contents, parentDir + d.name + '/');
  }
  for(var j in c.files) {
    var f = c.files[j];
    var ext = extName(f.name);

    if(ext == 'md'
        || ext == 'markdown') {
      // render and write name.html

      // get html name
      var htmlName = '';
      if(f.name == 'readme.md'
          || f.name == 'readme.markdown') {
        htmlName = 'index.html';
      }else {
        htmlName = fileName(f.name) + '.html';
      }

      var filePath = distDir
          + parentDir.substring(articlesRootDir.length)
          + htmlName;
      
      renderMd(parentDir + f.name, filePath);
    }else {
      var toPath = distDir
          + parentDir.substring(articlesRootDir.length)
          + f.name;
      
      copyFile(parentDir + f.name, toPath);
    }
  }
}

function renderMd(mdPath, htmlPath) {
  try {
    var mdHTML = md.render(fs.readFileSync(mdPath, 'utf8'));
    var cssPath = path.relative(htmlPath, './_build/assets/main.css');
    var contents = pageHtml
        .replace('<!--article-->', mdHTML)
        .replace('./assets/main.css', cssPath.substring(1));

    fs.outputFileSync(htmlPath, contents);
  } catch (e) {}
}

function copyFile(from, to) {
  try {
    fs.copySync(from, to);
  } catch (e) {
    console.log(e);
  }
}

var tree = dirTree(articlesRootDir);

var pageHtml = fs.readFileSync('./src/index.static.html', 'utf8');

readContents(tree, articlesRootDir);

copyFile('./_tmp/css/main.css', './_build/assets/main.css');
copyFile('./src/favicon.ico', './_build/favicon.ico');
