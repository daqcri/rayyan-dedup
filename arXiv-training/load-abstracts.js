#!/usr/bin/env node

module.exports = function loadAbstracts(abstracts_file, callback){
  var fs = require('fs');
  var readline = require('readline');
  rl = readline.createInterface({
    input: fs.createReadStream(abstracts_file)
  });
  var abstracts = {};
  rl.on("line", function(line){
    var tabs = line.split('\t');
    abstracts[tabs[0]] = tabs[1];
  })
  rl.on("close", function(){
    callback(abstracts);
  })
}
