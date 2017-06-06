from setuptools import setup
import sys

requirements = ['future>=0.14',
                'dedupe>=1.6',
                'unidecode',
                'psycopg2']

if sys.version < '3':
    requirements += ['backports.csv']

setup(
    name = "rayyan-dedup-training",
    version = '0.0.3',
    description="csvdedupe-based command line tool for deduplicating Rayyan articles",
    author="Hossam Hammady, Forest Gregg, Derek Eder",
    author_email="github@hammady.net",
    url="https://github.com/rayyanqcri/rayyan-dedup-training",
    license="MIT",
    packages=['csvdedupe'],
    entry_points ={
        'console_scripts': [
            'rayyan-dedup-train = csvdedupe.csvdedupe:launch_new_instance'
        ]
    },
    install_requires = requirements
)
