#!/usr/bin/env node

var csv = require('csv');
var fields = ["id", "title", "journal", "authors", "year", "arXiv_id"];
var abstracts_file = process.argv[2];
if (abstracts_file) {
  fields.push("abstract");
  require('./load-abstracts')(abstracts_file, process_stdin)
}

function process_stdin(abstracts) {
  process.stdout.write(fields.join(",") + "\n");
  process.stdin
    .pipe(csv.parse({delimiter: '\t', relax: true}))
    .pipe(csv.transform(function(row){
      var arxiv_id = row[5].replace(/^arxiv:/, '')
      var abstract = abstracts[arxiv_id] || '';
      row.push(abstract);
      return row;
    }))
    .pipe(csv.stringify({delimiter: ','}))
    .pipe(process.stdout);
}
