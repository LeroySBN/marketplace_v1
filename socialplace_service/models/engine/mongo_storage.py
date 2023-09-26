#!/usr/bin/python3
"""
mysql_storage module
"""
from os import getenv
import models
from models.base_model import Base
from models.user import User
from models.community import Community
from models.post import Post
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

SOCIALPLACE_MONGO_HOST = getenv('SOCIALPLACE_MONGO_HOST')
SOCIALPLACE_MONGO_DB = getenv('SOCIALPLACE_MONGO_DB')
SOCIALPLACE_ENV = getenv('SOCIALPLACE_ENV')


class MongoStorage:
    """
    This class manages storage of socialplace models in a database
    """
    __client = None
    __db = None

    def __init__(self):
        """
        Instantiates DBStorage
        """
        self.__client = MongoClient('mongodb://{}:27017/'.format(SOCIALPLACE_MONGO_HOST))
        self.__db = self.__client[SOCIALPLACE_MONGO_DB]

    def status(self):
        """
        Returns the status of the database
        """
        client = self.__client
        try:
            client.admin.command('ping')
            print('You successfully connected to MongoDB!')
            return True
        except Exception:
            print('MongoDB Connection Error!')
            return False

    def all(self, cls=None):
        """
        Querys the MongoDB for documents of the specified class
        """
        if cls is None:
            cls = Base
        collection_name = cls.__name__
        documents = self.__db[collection_name].find()
        return {"{}.{}".format(collection_name, doc['_id']): doc for doc in documents}

    def new(self, obj):
        """
        Inserts a new document into the MongoDB
        """
        collection_name = obj.__class__.__name__
        serialized_obj = obj.to_dict()
        self.__db[collection_name].insert_one(serialized_obj)

    def save(self):
        """
        This method does nothing in MongoDB since documents are saved automatically
        """
        pass

    def delete(self, obj=None):
        """
        Deletes a document from the MongoDB
        """
        if obj is not None:
            collection_name = obj.__class__.__name__
            self.__db[collection_name].delete_one({'_id': obj._id})

    def reload(self):
        """
        Reloads data from the MongoDB (no-op for MongoDB)
        """
        pass

    def get(self, cls, id):
        """
        Retrieves a document by its ID from the MongoDB
        """
        collection_name = cls.__name__
        document = self.__db[collection_name].find_one({'_id': id})
        if document:
            return cls(**document)
        else:
            return None

    def count(self, cls=None):
        """
        Counts the number of documents in the MongoDB for the specified class
        """
        if cls is None:
            cls = Base
        collection_name = cls.__name__
        count = self.__db[collection_name].count_documents({})
        return count if count > 0 else 0
