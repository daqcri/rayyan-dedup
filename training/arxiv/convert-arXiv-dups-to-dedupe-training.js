#!/usr/bin/env node
unidecode = require('unidecode');

// check args
var nargs = process.argv.length - 2;
if (nargs < 1) {
  console.log("USAGE: ", process.argv[0], process.argv[1], "<arXiv.docs.file> [<abstracts.tsv>]");
  process.exit(1);
}

var readline = require('readline');

var abstracts_file = process.argv[3];

process_docs_file(process.argv[2]);

function process_docs_file(docs_file) {
  // read docs.file
  var rl = readline.createInterface({
    input: require('fs').createReadStream(docs_file)
  });

  var dict = {};
  rl.on('line', function (line) {
    var tabs = line.split(/\t/);
    var id = tabs[0];
    dict[id] = tabs;
  });
  rl.on('close', function() {
    process.stderr.write(Object.keys(dict).length + " lines read from docs file\n");
    if (abstracts_file)
      require('./load-abstracts')(abstracts_file, function(abstracts){
        process_stdin(dict, abstracts);
      })
    else
      process_stdin(dict);
  });
}

function process_stdin(dict, abstracts) {
  // read stdin 
  process.stderr.write("Waiting for <arXiv.duplicates.file.concat.nonDuplicates.file> in STDIN...\n");

  var rl = readline.createInterface({
    input: process.stdin
  });

  write_header();

  var dups_in = 0, dups_out = 0, is_first = true, last_type = 'duplicate';
  rl.on('line', function(line){
    dups_in++;
    var tabs = line.split(/\t/);
    var id1 = tabs[0], id2 = tabs[1];
    if (tabs[2] != last_type) {
      last_type = tabs[2];
      write_middle();
      is_first = true;
    }
    if (typeof dict[id1] != 'undefined' && typeof dict[id2] != 'undefined') {
      dups_out++;
      write_pair(id1, id2, is_first);
      is_first = false;
    }
  })

  rl.on('close', function(){
    write_footer();
    process.stderr.write("Read " + dups_in + " lines from duplicates file, wrote " + dups_out + " tuple pairs to stdout\n");
  })

  function write_pair(id1, id2, is_first) {
    var tuple1 = dict[id1], tuple2 = dict[id2];
    var obj = {
      "__class__": "tuple",
      "__value__": [
        tuple_arr_to_obj(tuple1),
        tuple_arr_to_obj(tuple2)
      ]
    }

    if (!is_first) process.stdout.write(",\n");
    process.stdout.write(JSON.stringify(obj));

    function tuple_arr_to_obj(tuple){
      const fields = ["id", "title", "journal", "authors", "year", "arXiv_id"];
      var obj = {};
      for (var i = 0; i < tuple.length; i++)
        obj[fields[i]] = unidecode(tuple[i]) || null;
      if (abstracts)
        obj.abstract = unidecode(abstracts[tuple[5].replace(/^arxiv:/, '')]) || null;
      return obj;
    }
  }

  function write_header() {
    process.stdout.write('{"match":[\n');
  }

  function write_middle() {
    process.stdout.write('\n],"distinct":[\n');
  }

  function write_footer() {
    process.stdout.write('\n]}\n');
  }
}

