#!/usr/bin/python3
""" This module instantiates an object of class FileStorage or MongoStorage """
from os import getenv
from dotenv import load_dotenv

load_dotenv()


if getenv('SOCIALPLACE_TYPE_STORAGE') == 'db':
    from models.engine.mongo_storage import MongoStorage
    storage = MongoStorage()
# else:
#     from models.engine.file_storage import FileStorage
#     storage = FileStorage()