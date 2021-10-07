# Data synchronisation script

## Requirements

* Python 3.9
* A Google account with read access to the data sheet and all the attachment media directories
* That account has to be explicitly added to the list of users authorised to use this app in the Google Cloud Platform console
* [`pipenv`](https://docs.pipenv.org/en/latest/) is strongly recommended, to manage Python dependencies without conflicts with other projects.

## Installation

### Setting up pipenv itself

`pip install --user pipenv` or `pip3 install --user pipenv`

### Installing the Python dependencies

`pipenv install`

## Running

`pipenv run python ./app.py`

You may be asked to log in to Google Drive, if this is the first time you're running the script or if it's been a while.

## Development

### Adding a package to pipenv

`pipenv install newpackage`

### Checking for dangerously outdated dependencies

`pipenv check`

### Freezing versions of the dependencies (*Please do this before a pull request*)

`pipenv lock`
