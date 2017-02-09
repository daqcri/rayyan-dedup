#! /usr/bin/env python

# read stdin line by line
# try to convert to ascii, printing error if any
# unidecode line
# write to stdout

from unidecode import unidecode
import sys
import io
import re

input_file = io.open(sys.stdin.fileno(), mode="r", encoding="utf-8")

row = 0
rx = re.compile(".*character(.*) in position ([\d-]+): .*")
while True:
  line = input_file.readline()
  if line == '': break
  row += 1
  try:
    line.encode('ascii')
    sys.stdout.write(line)
  except UnicodeEncodeError, err:
    matches = rx.findall(str(err))[0]
    sys.stderr.write('Non-ASCII character found in line %d column %s: %s\n' % (row, matches[1], matches[0]))
    line = unidecode(line)
    line.encode('ascii') # double checking on unidecode output
    sys.stdout.write(line)
