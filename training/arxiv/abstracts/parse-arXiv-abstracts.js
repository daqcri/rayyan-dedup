#!/usr/bin/env node

var fs = require('fs')
var parseString = require('xml2js').parseString;

// check args
var nargs = process.argv.length - 2;
if (nargs < 1) {
  console.log("USAGE: ", process.argv[0], process.argv[1], "<arXiv.api.xml.response.file>");
  process.exit(1);
}

var input_file = process.argv[2];

fs.readFile(input_file, function(err, data) {
  if (err) throw err;
  parseString(data, function (err, js) {
    var entries = js.feed.entry;
    // id tag example: http://arxiv.org/abs/0704.0007v2
    var regex = /^http:\/\/arxiv\.org\/abs\/(.+)v\d+$/;
    for(var i = 0; i < entries.length; i++) {
      var entry = entries[i];
      if (entry.id && entry.summary) {
        var id = entry.id[0].match(regex)[1];
        var summary = entry.summary[0].replace(/\s+/g, " ")
        process.stdout.write(id + "\t" + summary + "\n")
      }
    }
  })
});

