#!/usr/bin/env node

var csv = require('csv');
var fields = ["id", "title", "authors", "journal", "year"];
process_stdin();

function process_stdin() {
  process.stdout.write(fields.join(",") + "\n");
  process.stdin
    .pipe(csv.parse({delimiter: '\t', relax: true}))
    .pipe(csv.stringify({delimiter: ','}))
    .pipe(process.stdout);
}
