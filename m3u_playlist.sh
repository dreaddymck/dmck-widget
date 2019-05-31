#!/bin/bash
# convert folder containing mp3 files into a basic m3u playlist
#
cd /home/user/Music/mp3/

M3UTMP="m3u.tmp"
M3U="play.m3u"
URL="http://localhost/music/"
touch $M3U;

# ls -tr *.mp3 |
ls *.mp3 | sort -V |
while read filename; do
  # do work with $filename
  echo $filename
  echo $URL$(perl -MURI::Escape -e 'print uri_escape($ARGV[0]);' "$filename") >> $M3U;
done

cp $M3UTMP $M3U
rm $M3UTMP

