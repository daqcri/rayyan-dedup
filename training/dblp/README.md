## DBLP training recipes

### Prepare DBLP dedup training dataset:

Dataset was downloaded from [here](http://dbs.uni-leipzig.de/en/research/projects/object_matching/fever/benchmark_datasets_for_entity_resolution).
However, there were several encoding issues so after some data massaging,
the clean files are placed here as *.csv.gz. Just gunzip before use.

    gunzip *.gz

### Set environment variables

    config=~/Workspace/rayyan/rayyan-dedup-data/config/dedupe-config.json
    model=~/Workspace/rayyan/rayyan-dedup-data/models/arXiv-model.10k

### Dedup (Test the models on DBLP datasets)

    # DBLP-ACM
    time rayyan-dedup dblp-acm.csv --config_file $config --output_file dblp-acm-dedup.csv --skip_training --settings_file $model --write_clusters

    # DBLP-Scholar
    time rayyan-dedup dblp-scholar.csv --config_file $config --output_file dblp-scholar-dedup.csv --skip_training --settings_file $model --write_clusters

### Evaluate (Compute precision and recall)

    # DBLP-ACM
    ./evaluate-model.js DBLP-ACM_perfectMapping.csv dblp-acm-dedup.csv.clusters

    # DBLP-Scholar
    ./evaluate-model.js DBLP-Scholar_perfectMapping.csv dblp-scholar-dedup.csv.clusters
