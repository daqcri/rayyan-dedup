from setuptools import setup
import sys

requirements = ['future>=0.14',
                'dedupe>=1.6',
                'unidecode',
                'psycopg2']

if sys.version < '3':
    requirements += ['backports.csv']

setup(
    name = "rayyan-dedup",
    version = '0.0.1',
    description="csvdedupe-based command line tool for deduplicating Rayyan articles",
    author="Hossam Hammady, Forest Gregg, Derek Eder",
    license="MIT",
    packages=['csvdedupe'],
    entry_points ={
        'console_scripts': [
            'rayyan-dedup = csvdedupe.csvdedupe:launch_new_instance'
        ]
    },
    install_requires = requirements
)
