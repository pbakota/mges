
import os

__all__ = ['readHiscore', 'writeHiscore']

HISCORE_PATH=f"{os.getenv('HOME')}/rabbit-unleashed-hiscore.txt"

def readHiscore() -> int:
    try:
        with open(HISCORE_PATH, 'r') as f:
            line = f.readline()
            return int(line)
    except OSError|ValueError:
        return -1

def writeHiscore(hiscore:int):
    try:
        with open(HISCORE_PATH, 'w') as f:
            f.write(str(hiscore))
    except:
        pass
