#!/usr/bin/perl

my $prog = '/var/www/go/bin/membrane';

open(PROG, "| $prog") || die "Can't run '$prog': $!\n";
print PROG "$file\n";
close(PROG);
exit 0
