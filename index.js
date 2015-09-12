var folder = process.env.DIR || 'gifs';
var Promise = require('bluebird');
var Slack = require('slack-node');
var https = require('https');
var fs = require('fs');
var download = function(url, dest) {
  return Promise.resolve(new Promise(function(resolve, reject) {
    var file = fs.createWriteStream(dest);
    https.get(url, function(response) {
      response.pipe(file);
      file.on('finish', function() {
        file.close(resolve);
      });
    }).on('error', function(err) {
      fs.unlink(dest);
      reject(err);
    });
  }));
};

if (!process.env.TOKEN) return console.log('need env TOKEN');

console.log('Downloading emojis');

new Slack(process.env.TOKEN).api('emoji.list', function(err, resp) {
  Promise.all(Object.keys(resp.emoji).map(function(emoji) {
    return (/alias\:/.test(resp.emoji[emoji])) ? Promise.resolve() :
      download(resp.emoji[emoji], folder+'/'+emoji+'.gif');
  }));
});
