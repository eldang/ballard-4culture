# ballard-4culture
A webmap of the history of the residents of Old Ballard, funded by the King County 4Culture grant program.

## Note about local testing

[CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) blocks loading .geojson from our /data subdirectory.  So we need to preview this in a local server, as follows:

Open a command line window, go to this folder, type `python -m SimpleHTTPServer 1883` (for Python 2) or `python -m http.server 1883` (for Python 3) or `python3 -m http.server 1883` (to explicitly select Python3 in an environment that also has Python 2 installed), and leave that session running.

Then the page should be available at http://localhost:1883/ (you can change the number in the python command to also change it in the localhost URL).
