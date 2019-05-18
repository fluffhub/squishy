#!/bin/bash

for file in `ls /home/fluffy/lib`; do
/var/www/go/bin/hostess pkg-lib create $file /home/fluffy/lib/$file
done

for file in `ls /home/fluffy/apps`; do
/var/www/go/bin/hostess pkg-app create $file /home/fluffy/apps/$file
done
