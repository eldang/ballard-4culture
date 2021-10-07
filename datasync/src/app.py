import logging
import os
import time

from src import google


LOGLEVEL = 'DEBUG'
# get these by inspecting the sharing link in Google Drive.  The ID is the
# whole sequence between (e.g.) https://docs.google.com/spreadsheets/d/
# and /edit
FILE_IDS = {
    'spreadsheet': '122PnHx_kzVnvxOaExUeuA0OeZthBYkqqYeRR7e-B7jk'
}



logging.basicConfig(
    format='%(asctime)s %(levelname)s %(name)s: %(message)s',
    datefmt='%Y%m%d %H:%M:%S'
)
logger = logging.getLogger(__name__)



def sync() -> None:
    logger.setLevel(LOGLEVEL)
    logger.info('Starting run')
    tmpDir = 'temp_' + time.strftime('%Y%m%d_%H%M_%S')
    logger.debug('Creating temp directory: ' + tmpDir)
    os.mkdir(tmpDir)
    data = google.readSheet(tmpDir, FILE_IDS['spreadsheet'], LOGLEVEL)
    print(data)
    # os.rmdir(tmpDir)
    logger.info('Run complete')






if __name__ == '__main__':
    sync()
