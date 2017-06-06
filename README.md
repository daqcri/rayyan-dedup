# rayyan-dedup-training

Command line tools for using the [dedupe python library](https://github.com/datamade/dedupe) for deduplicating Rayyan review articles.

`rayyan-dedup` - takes review id and identifies duplicates.

## Installation and dependencies

We recommend using [virtualenv](http://virtualenv.readthedocs.org/en/latest/virtualenv.html) and [virtualenvwrapper](http://virtualenvwrapper.readthedocs.org/en/latest/install.html) for working in a virtualized development environment. [Read how to set up virtualenv](http://docs.python-guide.org/en/latest/dev/virtualenvs/).

Once you have virtualenvwrapper set up,

```bash
git clone git@github.com:daqcri/rayyan-dedup-training.git
# or if you prefer https:
git clone https://github.com/daqcri/rayyan-dedup-training
cd rayyan-dedup-training
. virtualenvwrapper.sh
# first time
mkvirtualenv rayyan-dedup-training
# later on
workon rayyan-dedup-training
pip install -r requirements.txt
python setup.py develop
```

## Training

Check `training` sub-directory for more information on training with arXiv or qcrowd data.

## Usage

Database connection string should be set in environment before invoking `rayyan-dedup`:

    export DATABASE_URL=postgres://user:password@host:port/database

On heroku, `DATABASE_URL` is automatically set when Heroku PostgresQL add-on is provisioned.

    # without abstracts
    model=models/arXiv-model.10k
    time rayyan-dedup --review_id <XYZ> --job_id <N> --config_file config/dedupe-config.json --skip_training --settings_file $model
    
    # with abstracts
    model=models/arXiv-model.10k.abs
    time rayyan-dedup --review_id <XYZ> --job_id <N> --with_abstracts --config_file config/dedupe-config.abs.json --skip_training --settings_file $model

Results are stored in the database in the corresponding job with id <N>.

## Testing

Unit tests of core csvdedupe functions
```bash
pip install -r requirements-test.txt
nosetests
```

## Community
* [Dedupe Google group](https://groups.google.com/forum/?fromgroups=#!forum/open-source-deduplication)
* IRC channel, #dedupe on irc.freenode.net

## Errors and Bugs

This is a fork from the original [csvdedupe](https://github.com/datamade/csvdedupe).

If something is not behaving intuitively, it is a bug, and should be reported.
Report it [here](https://github.com/datamade/csvdedupe/issues).

## Patches and Pull Requests
We welcome your ideas! You can make suggestions in the form of [github issues](https://github.com/datamade/csvdedupe/issues) (bug reports, feature requests, general questions), or you can submit a code contribution via a pull request.

How to contribute code:

- Fork the project.
- Make your feature addition or bug fix.
- Send us a pull request with a description of your work! Don't worry if it isn't perfect - think of a PR as a start of a conversation, rather than a finished product.

## Copyright and Attribution

Copyright (c) 2016 DataMade. Released under the [MIT License](https://github.com/datamade/csvdedupe/blob/master/LICENSE.md).
