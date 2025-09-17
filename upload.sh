rm -r jupyter_openwebui/labextension/
python -m build
twine upload -u __token__ -p ${PYPI_TOKEN} dist/*
