import io
import logging
import os

from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials


SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly', 'https://www.googleapis.com/auth/drive.readonly', 'https://www.googleapis.com/auth/spreadsheets.readonly']


logger = logging.getLogger(__name__)




# from https://developers.google.com/drive/api/v3/quickstart/python
def _auth():
    creds = None
    credsFile = 'tokens/credentials.json'
    tokenFile = 'tokens/token.json'
    if os.path.exists(tokenFile):
        creds = Credentials.from_authorized_user_file(tokenFile, SCOPES)
    if creds and creds.valid:
        logger.debug('Using existing Google login session')
    else:
        if creds and creds.expired and creds.refresh_token:
            logger.debug('Refreshing existing Google login')
            creds.refresh(Request())
        else:
            logger.info(
                'No existing Google login session found, so you\'ll be ' +
                'redirected to a browser window to log in.  ' +
                'Or go to the URL below if it doesn\'t happen automatically.'
            )
            flow = InstalledAppFlow.from_client_secrets_file(credsFile, SCOPES)
            creds = flow.run_local_server(port=0)
        with open(tokenFile, 'w') as token:
            token.write(creds.to_json())
    service = build('drive', 'v3', credentials=creds)
    return service



def _saveSheet(tmpDir: str, id: str) -> str:
    tmpFile = os.path.join(tmpDir, 'spreadsheet.xlsx')
    gDrive = _auth()
    request = gDrive.files().export_media(
        fileId=id,
        mimeType='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    with io.FileIO(tmpFile, 'wb') as outFile:
        downloader = MediaIoBaseDownload(outFile, request)
        done = False
        while done is False:
            status, done = downloader.next_chunk()
            logger.debug("Download %d%%." % int(status.progress() * 100))
    return tmpFile




def readSheet(tmpDir: str, id: str, log: str) -> {}:
    logger.setLevel(log)
    tmpFile = _saveSheet(tmpDir, id)
    return {}
