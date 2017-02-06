## qcrowd training recipes

### Pull input file from qcrowd-server

    heroku pg:psql postgresql-lively-59913 --app qcrowd

    -- START SQL
    -- pull all non conflicting answers
    \copy (select questionid, string_agg(content, ',') like '%Yes%' from answer where questionid not in (select questionid from (select questionid, string_agg(content, ',') as content from answer group by questionid having count(*) > 1) sub where content like '%Yes%' and content like '%No%') group by questionid order by questionid) to qcrowd-answers.tsv;

    -- pull all questions having non conflicting answers
    \copy (select id, content from question where id not in (select questionid from (select questionid, string_agg(content, ',') as content from answer group by questionid having count(*) > 1) sub where content like '%Yes%' and content like '%No%') order by id) to qcrowd-questions.tsv;
    -- END SQL

    # combine answers with questions so that duplicates appear first
    paste qcrowd-answers.tsv qcrowd-questions.tsv | cut -f2,4 | sort -r > qcrowd-combined.tsv

### Create a qcrowd training file that dedupe can understand

    # without abstracts
    ./convert-qcrowd-answers-to-dedupe-training.js < qcrowd-combined.tsv > qcrowd-training.json

    # with abstracts
    ./convert-qcrowd-answers-to-dedupe-training.js abstracts < qcrowd-combined.tsv > qcrowd-training.abs.json

### Train a dedupe model

    # without abstracts
    model=rayyan-dedupe-model
    rm $model
    time ../../rayyan-dedup --review_id <X,Y,Z> --training_file qcrowd-training.json --config_file ../../config/dedupe-config.json --settings_file $model
    
    # with abstracts
    model=rayyan-dedupe-model.abs
    rm $model
    time ../../rayyan-dedup --review_id <X,Y,Z> --with_abstracts --training_file qcrowd-training.abs.json --config_file ../../config/dedupe-config.abs.json --settings_file $model

### Test the dedupe model on unseen data

    # without abstracts
    model=rayyan-dedupe-model
    time ../../rayyan-dedup --review_id <XYZ> --config_file ../../config/dedupe-config.json --skip_training --settings_file $model
    
    # with abstracts
    model=rayyan-dedupe-model.abs
    time ../../rayyan-dedup --review_id <XYZ> --with_abstracts --config_file ../../config/dedupe-config.abs.json --skip_training --settings_file $model
