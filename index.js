var dir = process.env.DIR || __dirname;
require('mkdirp')(dir + '/gif');
require('mkdirp')(dir + '/png');
var Promise = require('bluebird');
var Slack = require('slack-node');
var https = require('https');
var fs = require('fs');
var gm = require('gm');
var download = function(url, name) {
  return new Promise(function(resolve, reject) {
    var gifDest = dir + '/gif/' + name + '.gif';
    var pngDest = dir + '/png/' + name + '.png';
    https.get(url, function(response) {
      Promise.all([
        new Promise(function(resolve, reject) {
          var pngFile = fs.createWriteStream(pngDest);
          gm(response).selectFrame(0).write(pngDest, function(err) {
            if (err) reject(err);
            resolve();
          });
        }),
        new Promise(function(resolve, reject) {
          var gifFile = fs.createWriteStream(gifDest);
          response.pipe(gifFile);
          gifFile.on('finish', function() {
            gifFile.close(resolve);
          });
        })
      ]).then(resolve);
    }).on('error', function(err) {
      fs.unlink(dest);
      reject(err);
    });
  });
};

if (!process.env.TOKEN) return console.log('need env TOKEN');

console.log('Downloading emojis');

new Slack(process.env.TOKEN).api('emoji.list', function(err, resp) {
  Promise.all(Object.keys(resp.emoji).map(function(emoji) {
    return (/alias\:/.test(resp.emoji[emoji])) ? Promise.resolve() :
      download(resp.emoji[emoji], emoji);
  }));
});
