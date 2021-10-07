import logging
import os
import time

from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials


logging.basicConfig(
    format='%(asctime)s %(levelname)s %(name)s: %(message)s',
    datefmt='%Y%m%d %H:%M:%S'
)
logger = logging.getLogger(__name__)



def sync() -> None:
    logger.setLevel('DEBUG')
    logger.info('Starting run')
    tmpDirName = 'temp_' + time.strftime('%Y%m%d_%H%m_%S')
    os.mkdir(tmpDirName)
    scopes = ['https://www.googleapis.com/auth/drive.metadata.readonly']
    creds = googleAuth(scopes)
    os.rmdir(tmpDirName)
    logger.info('Run complete')


# from https://developers.google.com/drive/api/v3/quickstart/python
def googleAuth(scopes: [str]) -> Credentials:
    creds = None
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', scopes)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file('credentials.json', scopes)
            creds = flow.run_local_server(port=0)
        with open('token.json', 'w') as token:
            token.write(creds.to_json())
    return creds



if __name__ == '__main__':
    sync()
