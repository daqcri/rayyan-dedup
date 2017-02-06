## arXiv training recipes

### Download arXiv dedup training dataset:

    git clone git@github.com:JamesAHammerton/arxivDeduplicationDataset.git
    cd arxivDeduplicationDataset
    unzip arXiv500K_released.zip
    for i in arXiv.docs arXiv.duplicates arXiv.nonDuplicates; do cp -v $i ..; done
    
### Crawl arXiv for abstracts

    cd abstracts
    # crawl arXiv API in batches
    ./crawl-arXiv.sh
    # parse XML responses created by previous crawling
    for i in *.xml; do ./parse-arXiv-abstracts.js $i; done > abstracts.tsv
    cd ..
    
### Cut a sample from dedup dataset to play with

    head -10000 arXiv.docs > arXiv.docs.10k
    head -100000 arXiv.docs > arXiv.docs.100k

### Create an arXiv training file that dedupe can understand

    # without abstracts
    cat arXiv.duplicates arXiv.nonDuplicates | time ./convert-arXiv-dups-to-dedupe-training.js arXiv.docs.10k > arXiv-training.10k.json

    # with abstracts
    cat arXiv.duplicates arXiv.nonDuplicates | time ./convert-arXiv-dups-to-dedupe-training.js arXiv.docs.10k abstracts/abstracts.tsv > arXiv-training.10k.abs.json

### Convert arXiv input TSV to CSV with headers (and abstracts)

    # without abstracts
    ./tsv2csv.js < arXiv.docs.10k > arXiv.docs.10k.csv
    ./tsv2csv.js < arXiv.docs.100k > arXiv.docs.100k.csv
    
    # with abstracts
    ./tsv2csv.js abstracts/abstracts.tsv < arXiv.docs.10k > arXiv.docs.10k.abs.csv
    ./tsv2csv.js abstracts/abstracts.tsv < arXiv.docs.100k > arXiv.docs.100k.abs.csv

### Train a dedupe model

    # without abstracts
    model=mymodel.10k
    rm $model
    time ../../rayyan-dedup arXiv.docs.10k.csv --training_file arXiv-training.10k.json --config_file ../../config/dedupe-config.json --output_file arXiv.docs.10k.dedup.csv --settings_file $model
    
    # with abstracts
    model=mymodel.10k.abs
    rm $model
    time ../../rayyan-dedup arXiv.docs.10k.abs.csv --training_file arXiv-training.10k.abs.json --config_file ../../config/dedupe-config.abs.json --output_file arXiv.docs.10k.abs.dedup.csv --settings_file $model

### Test the dedupe model on unseen data

    # without abstracts
    model=mymodel.10k
    time ../../rayyan-dedup arXiv.docs.100k.csv --config_file ../../config/dedupe-config.json --output_file arXiv.docs.100k.dedup.csv --skip_training --settings_file $model
    
    # with abstracts
    model=mymodel.10k.abs
    time ../../rayyan-dedup arXiv.docs.100k.abs.csv --config_file ../../config/dedupe-config.abs.json --output_file arXiv.docs.100k.abs.dedup.csv --skip_training --settings_file $model
