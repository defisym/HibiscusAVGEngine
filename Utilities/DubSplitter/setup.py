from setuptools import find_packages
from setuptools import setup

VERSION = '0.1.2'

with open('ReadMe.md') as f:
    LONG_DESCRIPTION = f.read()

setup(
    name='DubSplitter',
    version=VERSION,
    author='defisym',
    author_email='defisym@outlook.com',
    url='https://github.com/defisym/HibiscusAVGEngine/tree/main/Utilities/DubSplitter',
    description='an easy tool to split dubs based on given silence',
    long_description=LONG_DESCRIPTION,
    long_description_content_type='text/markdown',
    keywords='DubSplitter dub splitter Hibiscus AVG Galgame VisualNovel VN',
    license='MIT',
    packages=find_packages(),
    include_package_data=True,
    zip_safe=False,
    install_requires=[
        'sympy',
        'pydub',
        'openai-whisper',
    ],
    entry_points={
        'console_scripts': [
            'DubSplitter = dubSplitter.dubSplitter:main'
        ]
    },
    classifiers=[
        "Development Status :: 4 - Beta",
        "Environment :: Console",
        "Environment :: GPU :: NVIDIA CUDA :: 11.7",
        "License :: OSI Approved :: MIT License",
        "Natural Language :: English",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3.10",
    ]
)
