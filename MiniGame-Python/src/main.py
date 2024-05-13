#!/usr/bin/env python3

import sys
from game import RabbitGame


def main():
    g = RabbitGame()
    g.run()

    return 0


if __name__ == "__main__":
    sys.exit(main())
