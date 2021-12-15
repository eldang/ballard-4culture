# ballard-4culture
A webmap of the history of the residents of Old Ballard, funded by the King County 4Culture grant program.

## Note about local testing

[CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) blocks loading .geojson from our /data subdirectory.  So we need to preview this in a local server, as follows:

Open a command line window, go to this folder, type `python -m SimpleHTTPServer 1883` (for Python 2) or `python -m http.server 1883` (for Python 3) or `python3 -m http.server 1883` (to explicitly select Python3 in an environment that also has Python 2 installed), and leave that session running.

Then the page should be available at http://localhost:1883/ (you can change the number in the python command to also change it in the localhost URL).

## Content Security Policy settings for a web server

Depending on individual server settings, this project may need some [CSP configuration](https://content-security-policy.com/) on its host.  **Important: this behaviour may also be browser-specific** because the major browsers do not have consensus on which parts of the CSP spec they support, so it is essential to test a deployment in multiple browsers.

If the map does not appear, check the javascript console.  If CSP is the issue, there will be one or more errors referencing `Content Security Policy`.  In this case, try the following:

1. If the web server is Apache, directly copy the [.htaccess](.htaccess) file in this project to the same directory as [index.html](index.html).  If it's a different server, apply the same CSP directives in that server's syntax.
2. That should dramatically reduce the number of errors.  But there may still be complaints about a `blob:https:DOMAINNAME/RANDOMSTRING` worker file.  In that instance, set the Content Security Policy `"worker-src 'self' blob:;"` *for the entire site*.  This is necessary because Mapbox spawns workers which appear to be at the site's root directory, even if this map is hosted in a subdirectory.
