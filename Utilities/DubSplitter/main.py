"""
import packages to support run directly
"""
from sympy import false

import dubSplitter.dubSplitter

if __name__ == '__main__':
    dubSplitter.dubSplitter.update_runtime(false)
    dubSplitter.dubSplitter.main()
