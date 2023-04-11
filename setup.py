from setuptools import setup, find_packages

with open("requirements.txt") as f:
	install_requires = f.read().strip().split("\n")

# get version from __version__ variable in sahayog_report/__init__.py
from sahayog_report import __version__ as version

setup(
	name="sahayog_report",
	version=version,
	description="Collect daily Reports of branches ",
	author="Talib Sheikh",
	author_email="talib.s@sahayogmultistate.com",
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires
)
