#!/bin/bash
# ./drun.sh 07  -> generuje i waliduje lekcję Mentalisty
cd /home/claude/movielang/tools/course-std/mentalist-1 && export CMODE=b CSLUG=mentalist-1 CIMG=letter CWORDS=100 PYTHONPATH=.. && for n in "$@"; do python3 m$n.py >/dev/null && python3 ../validate.py /home/claude/movilang/content/std/mentalist-1/${n}_*.json 2>&1 | grep -v '^==' | sort | uniq -c; done
