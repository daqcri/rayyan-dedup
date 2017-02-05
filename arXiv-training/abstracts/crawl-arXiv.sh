#!/bin/bash

docs=`dirname $0`/../arXiv.docs

if [ ! -f $docs ]; then
  echo "Please download arXiv.docs file and place it in $docs before running this script"
  exit 1
fi

# crawl arXiv for abstracts
cut -f6 $docs | cut -d: -f2- | sort | uniq > arXiv.ids
split -l 300 arXiv.ids
baseurl=http://export.arxiv.org/api/query?id_list=
for i in x*; do curl -f -v $baseurl`cat $i | xargs | tr " " ","`\&max_results=300 -o $i.xml || break; done

# verify returned ids
for i in *.xml; do ids=`basename $i .xml`; grep "<id>" $i | grep "/abs/" | sed -E 's}^ +<id>http://arxiv.org/abs/(.+)v[0-9]+</id>$}\1}g' > $ids.out; diff $ids $ids.out; done
# the previous command should output nothing if all ids are crawled correctly with strictly the same requsted order

