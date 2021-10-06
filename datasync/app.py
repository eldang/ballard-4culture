import logging
import os
import time

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
    os.rmdir(tmpDirName)
    logger.info('Run complete')



if __name__ == '__main__':
    sync()
