#!/bin/bash
# ./drun.sh 07  -> generuje i waliduje lekcję Diuny
cd /home/claude/movielang/tools/course-std/dune-1 && export CMODE=b CSLUG=dune-1 CIMG=desert CWORDS=90 PYTHONPATH=.. && for n in "$@"; do python3 d$n.py >/dev/null && python3 ../validate.py /home/claude/movilang/content/std/dune-1/${n}_*.json 2>&1 | grep -v '^==' | sort | uniq -c; done
