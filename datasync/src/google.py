import logging
import os

from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials

logger = logging.getLogger(__name__)




# from https://developers.google.com/drive/api/v3/quickstart/python
def auth(scopes: [str], log: str) -> Credentials:
    logger.setLevel(log)
    creds = None
    credsFile = 'tokens/credentials.json'
    tokenFile = 'tokens/token.json'
    if os.path.exists(tokenFile):
        creds = Credentials.from_authorized_user_file(tokenFile, scopes)
    if creds and creds.valid:
        logger.debug('Using existing Google login session')
    else:
        if creds and creds.expired and creds.refresh_token:
            logger.debug('Refreshing existing Google login')
            creds.refresh(Request())
        else:
            logger.info(
                'No existing Google login session found, so you\'ll be ' +
                'redirected to a browser window to log in'
            )
            flow = InstalledAppFlow.from_client_secrets_file(credsFile, scopes)
            creds = flow.run_local_server(port=0)
        with open(tokenFile, 'w') as token:
            token.write(creds.to_json())
    return creds
