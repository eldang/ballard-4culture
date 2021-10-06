# Data synchronisation script

## Installation

[`pipenv`](https://docs.pipenv.org/en/latest/) is strongly recommended, to manage Python dependencies without conflicts with other projects.

### Setting up pipenv itself

`pip install --user pipenv` or `pip3 install --user pipenv`

### Installing the Python dependencies

`pipenv install`

## Running

`pipenv run python ./app.py`

## Development

### Adding a package to pipenv

`pipenv install newpackage`

### Checking for dangerously outdated dependencies

`pipenv check`

### Freezing versions of the dependencies (*Please do this before a pull request*)

`pipenv lock`
