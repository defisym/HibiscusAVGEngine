import os.path
import shutil
import subprocess

from dubSplitter.functions.path import script_path

# requires
# pip install wheel
# pip install twine

# to not input account & password everytime, create file .pypirc at %USERPROFILE%
# with following content:
# [pypi]
# username=your_username
# password=your_password

# then run this file


dist = script_path(__file__) + '\\dist'

print('dist path {}'.format(dist))

print('remove old...')
if os.path.exists(dist):
    shutil.rmtree(dist)

print('build new...')
status = subprocess.call('python setup.py sdist')
if status != 0:
    print('build failed')
    exit(1)

status = subprocess.call('python setup.py bdist_wheel')
if status != 0:
    print('build wheel failed')
    exit(1)

print('uploading...')
status = subprocess.call('twine upload dist/*')

if status != 0:
    print('upload failed')
    exit(1)
else:
    print('upload complete')
    exit(0)
