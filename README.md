# rayyan-dedup

Command line tools for using the [dedupe python library](https://github.com/datamade/dedupe) for deduplicating Rayyan review articles.

`rayyan-dedup` - takes review id and identifies duplicates.

[![Build Status](https://travis-ci.org/daqcri/rayyan-dedup.png?branch=master)](https://travis-ci.org/daqcri/rayyan-dedup)

## Installation and dependencies

We recommend using [virtualenv](http://virtualenv.readthedocs.org/en/latest/virtualenv.html) and [virtualenvwrapper](http://virtualenvwrapper.readthedocs.org/en/latest/install.html) for working in a virtualized development environment. [Read how to set up virtualenv](http://docs.python-guide.org/en/latest/dev/virtualenvs/).

Once you have virtualenvwrapper set up,

```bash
git clone git@github.com:daqcri/rayyan-dedup.git
cd rayyan-dedup
. virtualenvwrapper.sh
mkvirtualenv rayyan-dedup
pip install -r requirements.txt
```

## Training

Check `training` sub-directory for more information on training with arXiv or qcrowd data.

## Usage

Database connection string should be set in environment before invoking `rayyan-dedup`:

    export DATABASE_URL=postgres://user:password@host:port/database

On heroku, `DATABASE_URL` is automatically set when Heroku PostgresQL add-on is provisioned.

    # without abstracts
    model=models/arXiv-model.10k
    time ./rayyan-dedup --review_id <XYZ> --config_file config/dedupe-config.json --skip_training --settings_file $model
    
    # with abstracts
    model=models/arXiv-model.10k.abs
    time ./rayyan-dedup --review_id <XYZ> --with_abstracts --config_file config/dedupe-config.abs.json --skip_training --settings_file $model

Results are stored in the database.

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
