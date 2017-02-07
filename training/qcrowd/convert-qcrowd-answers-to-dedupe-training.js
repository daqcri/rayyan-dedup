#!/usr/bin/env node
unidecode = require('unidecode');

/*
This is how to generate the input file to this script:

heroku pg:psql postgresql-lively-59913 --app qcrowd

-- pull all non conflicting answers
\copy (select questionid, string_agg(content, ',') like '%Yes%' from answer where questionid not in (select questionid from (select questionid, string_agg(content, ',') as content from answer group by questionid having count(*) > 1) sub where content like '%Yes%' and content like '%No%') group by questionid order by questionid) to qcrowd-answers.tsv;

-- pull all questions having non conflicting answers
\copy (select id, content from question where id not in (select questionid from (select questionid, string_agg(content, ',') as content from answer group by questionid having count(*) > 1) sub where content like '%Yes%' and content like '%No%') order by id) to qcrowd-questions.tsv;

-- combine answers with questions so that duplicates appear first
paste qcrowd-answers.tsv qcrowd-questions.tsv | cut -f2,4 | sort -r > qcrowd-combined.tsv
*/

// check args
var nargs = process.argv.length - 2;
var with_abstracts = nargs >= 1 && process.argv[2] == 'abstracts'

var readline = require('readline');

process_stdin();

function process_stdin() {
  // read stdin 
  process.stderr.write("Waiting for <qcrowd-q-and-a-combined-file> in STDIN...\n");

  var rl = readline.createInterface({
    input: process.stdin
  });

  write_header();

  var dups_in = 0, dups_out = 0, is_first = true, last_type = 't';
  rl.on('line', function(line){
    dups_in++;
    var tabs = line.split(/\t/);
    var answer = tabs[0];
    if (answer != last_type) {
      last_type = answer;
      write_middle();
      is_first = true;
    }
    var question = JSON.parse(tabs[1].replace(/\\\\"/g, '\\\"'))
    if (question.relationship && question.relationship.match(/.+duplicate.+/)) {
      dups_out++;
      write_pair(question.source, question.target, is_first);
      is_first = false;
    }
  })

  rl.on('close', function(){
    write_footer();
    process.stderr.write("Read " + dups_in + " lines from stdin, wrote " + dups_out + " tuple pairs to stdout\n");
  })

  function write_pair(tuple1, tuple2, is_first) {
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
      const fields = ["title", "authors", "year", "journal"];
      matches = tuple.match(/\[Title: (.*)\] \[Authors: (.*)\] \[Year: (.*)\] \[journal:(.*)\] \[Abstract:(.*)\]/)
      if (!matches) throw new Error("Invalid question: " + tuple);
      var obj = {};
      for (var i = 0; i < fields.length; i++)
        obj[fields[i]] = safe_unidecode(matches[i + 1]) || null;
      if (with_abstracts)
        obj.abstract = safe_unidecode(matches[5]) || null;
      return obj;
    }

    function safe_unidecode(str) {
      // unidecode is sometimes buggy for this: 'Ã®'
      // https://github.com/FGRibreau/node-unidecode/issues/16
      var ret;
      while(str != (ret = unidecode(str)))
        str = ret;
      return ret;
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

