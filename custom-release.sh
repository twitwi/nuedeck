#!/bin/bash

lasttry=""
function try() {
    lasttry="$@"
    echo -e '… \033[1;32m'"$@"'\033[0m'
}

function ok() {
    echo -e '\033[F\033[1;32m✓ \033[0m'
}
function OK() {
    echo -e '\033[1;32m✓ '"$lasttry"'\033[0m'
}



set -e

try "Checking there is at least 1 param (output)"
if test $# = 0 ; then
    echo "Examples:"
    echo "  $0 release/"
    echo "  $0 release/ no-npm"
    echo "  $0 release/ no-npm recreate"
    echo "All options?"
    cat $0 | grep ' h[a]s ' | sed 's@.*h[a]s \([^ ]*\) @    \1\n@g' | grep -v '^[^ ]'
fi

test $# -gt 0
ok

try "Digesting parameters"
o="$1"
shift
params=" $@ "
function has() {
    echo ${params} | grep -q "$1"
}
ok

if has recreate ; then
    if test -d "$o" ; then
        try "Removing safe things"
        rm -rf "$o/nuedeck/fonts"
        rm  -f "$o/nuedeck/nuedeck-deps.js"
        ok
        try "Security check that we don't have too much content left $o"
        test 200000 -gt $(du -bc "$o"|tail -1|awk '{print $1}')
        ok
        copio=$(mktemp --tmpdir -d nuedeck-release-backup-$(date +%s)-XXX)
        try "Moving $o away into $copio"
        mv "$o" "$copio"
        ok
    fi
    try "Creating $o"
    mkdir -p "$o"
    ok
else
    try "Testing for existence of output folder '$o'"
    test -d "$o"
    ok
fi


if ! has no-npm ; then
    try "Building with npm"
    npm run build
    OK
fi


try "Copying to $o"
mkdir -p "$o"/nuedeck
cp dist/js/app.*.js "$o"/nuedeck/nuedeck.js
cp dist/js/chunk-vendors.*.js "$o"/nuedeck/nuedeck-deps.js
cp public/template.html "$o"/example.html
cat public/test.css node_modules/katex/dist/katex.min.css > "$o"/nuedeck/nuedeck-theme.css # take from the node_modules to have the proper fonts/ path

mkdir -p "$o"/nuedeck/fonts
if ! has no-theme-fonts ; then
    cat public/test.css|grep 'url(fonts/'|sed 's@.*url(fonts/\([^)]*\)).*@theme-builder/build/fonts/\1@g' | xargs cp -t "$o"/nuedeck/fonts/
elif has all-theme-fonts ; then
    cp -t "$o"/nuedeck/fonts/ theme-builder/build/fonts/*
fi
if ! has no-katex-fonts ; then
    cp node_modules/katex/dist/fonts/* "$o"/nuedeck/fonts
fi
ok

try "Showing the output tree"
tree -sh "$o"
OK
