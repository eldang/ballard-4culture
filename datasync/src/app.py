import logging
import os
import time

from src import google


LOGLEVEL = 'DEBUG'



logging.basicConfig(
    format='%(asctime)s %(levelname)s %(name)s: %(message)s',
    datefmt='%Y%m%d %H:%M:%S'
)
logger = logging.getLogger(__name__)



def sync() -> None:
    logger.setLevel(LOGLEVEL)
    logger.info('Starting run')
    tmpDirName = 'temp_' + time.strftime('%Y%m%d_%H%m_%S')
    logger.debug('Creating temp directory: ' + tmpDirName)
    os.mkdir(tmpDirName)
    scopes = ['https://www.googleapis.com/auth/drive.metadata.readonly']
    creds = google.auth(scopes, LOGLEVEL)
    os.rmdir(tmpDirName)
    logger.info('Run complete')






if __name__ == '__main__':
    sync()
