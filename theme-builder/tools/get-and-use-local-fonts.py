#!/usr/bin/env python3

import re
import urllib.request

input  = "_fontbox.scss.in"
output = "_fontbox.scss"
fontpath = "fonts/"

def readURL(url):
    # woff2, with different files for different unicode ranges
    #r = urllib.request.urlopen(urllib.request.Request(url, None, {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/74.0.3729.169 Chrome/74.0.3729.169 Safari/537.36'}))
    # woff but seems smaller....
    r = urllib.request.urlopen(urllib.request.Request(url, None, {'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:28.0) Gecko/20100101 Firefox/28.0'}))
    return r.read()

def writeFile(path, content):
    with open(path, 'wb') as f:
        f.write(content)

with open(input, 'r') as f, open(output, 'w') as outputF:
    for line in f:
        line = line[:-1] # remove eol
        if re.match(r'^ *@import url', line):
            url = re.sub(r'^ *@import url\(([^)]*)\);.*', r'\1', line)
            remote = readURL(url).decode('utf-8')
            def processUrlInRemote(x):
                fonturl = x.group(1)
                if fonturl.startswith("'") or fonturl.startswith('"'):
                    fonturl = fonturl[1:-1]
                protocolrelatived = re.sub(r'url\(https?://', r'url(https://', x.group(0))
                format = x.group(2)
                fontfilename = re.sub(r'.*/', '', fonturl)
                print('fonturl', fonturl)
                if (fonturl.startswith('/')):
                    fonturl = re.sub(r'([^:]*://[^/]*/).*', r'\1', url) + fonturl
                    print('fonturl', fonturl)
                fontfilecontent = readURL(fonturl)
                targetFile = fontpath+fontfilename
                writeFile(targetFile, fontfilecontent)
                print('GOT:'+fontfilename)
                return 'url({}) {}, {}'.format(targetFile, format, protocolrelatived)
            updatedRemote = re.sub(r'url\(([^)]*)\) +(format\([^)]*\))', processUrlInRemote, remote)
            outputF.write(updatedRemote)
        else:
            outputF.write(line)
