#!/usr/bin/python3
""" This module instantiates an object of class FileStorage """
from os import getenv
from dotenv import load_dotenv
from models.engine.mongo_storage import MongoStorage
from models.engine.redis_storage import RedisClient
# from models.engine.file_storage import FileStorage

load_dotenv()

REDIS_HOST = getenv('REDIS_HOST', 'localhost')
REDIS_PORT = getenv('REDIS_PORT', 6379)
REDIS_PASSWORD = getenv('REDIS_PASSWORD', None)
REDIS_DB = getenv('REDIS_DB', 0)

mongo_storage = MongoStorage()
redis_storage = RedisClient(REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_DB)
# file_storage = FileStorage()
