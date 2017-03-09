#!/usr/bin/env node

// check args
var nargs = process.argv.length - 2;
if (nargs < 2) {
  console.log("USAGE: ", process.argv[0], process.argv[1], "<ground-truth.csv> <file.clusters>");
  process.exit(1);
}

var readline = require('readline');

var ground_file = process.argv[2];
var clusters_file = process.argv[3];

process_ground(ground_file);

function process_ground(ground_file) {
  // read ground_file
  var fs = require('fs');
  var parse = require('csv-parse');
  var parser = parse({delimiter: ','});
  var ground = {}, cols;
  var input = fs.createReadStream(ground_file);

  parser.on('readable', function(){
    while(cols = parser.read()){
      ground[cols[0]] = cols[1];
    }
  });

  parser.on('error', function(err){
    process.stderr.write(err.message + "\n");
  });

  parser.on('finish', function(){
    process.stderr.write(Object.keys(ground).length + " lines read from ground file\n");
    process_clusters(ground, clusters_file);
  });

  input.pipe(parser);
}

function process_clusters(ground, clusters_file) {
  // read clusters_file
  var rl = readline.createInterface({
    input: require('fs').createReadStream(clusters_file)
  });

  // compute tp and fp from clusters
  var clusters = 0, tp = 0, fp = 0, fn = 0;
  rl.on('line', function (line) {
    clusters++;
    var cols = line.split(/,/);
    var pairs = get_pairs(cols);
    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i];
      if (ground[pair[0]] == pair[1]) {
        tp++;
        delete ground[pair[0]];
      }
      else if (ground[pair[1]] == pair[0]) {
        tp++;
        delete ground[pair[1]];
      }
      else
        fp++;
    }
  });
  rl.on('close', function() {
    process.stderr.write(clusters + " clusters read from clusters file\n");
    // compute fn from remaining pairs in ground
    fn = Object.keys(ground).length;
    // print_ground(ground, fn);
    // ready to compute precision and recall
    compute_precision_recall(tp, fp, fn);
  });
}

function print_ground(ground, length) {
  for (var k in ground)
    console.log(k, ground[k])
}

function get_pairs(arr) {
  const regex = /^([^:]+):(.+)/
  var ret = [];
  for (var i = 0; i < arr.length; i++)
    for (var j = i + 1; j < arr.length; j++) {
      var a = arr[i].match(regex), b = arr[j].match(regex)
      if (a == null)
        process.stderr.write(arr[i] + " did not match src_id regex!\n")
      if (b == null)
        process.stderr.write(arr[j] + " did not match src_id regex!\n")
      if (a[1] != b[1])
        ret.push([a[2], b[2]]);
    }
  return ret;
}

function compute_precision_recall(tp, fp, fn) {
  console.log("tp", tp, "fp", fp, "fn", fn)
  var precision = tp * 1.0 / (tp + fp);
  var recall = tp * 1.0 / (tp + fn);
  process.stdout.write("precision: " + precision + ", recall: " + recall + "\n");
}
