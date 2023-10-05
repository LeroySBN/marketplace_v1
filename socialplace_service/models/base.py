#!/usr/bin/env python3
""" Base module
"""
from datetime import datetime
from typing import TypeVar, List, Iterable
from os import path
import json
import uuid


TIMESTAMP_FORMAT = "%Y-%m-%dT%H:%M:%S"
DATA = {}


class BaseModel():
    """ Base class
    """

    def __init__(self, *args: list, **kwargs: dict):
        """ Initialize a Base instance
        """
        s_class = str(self.__class__.__name__)
        if DATA.get(s_class) is None:
            DATA[s_class] = {}

        self.id = kwargs.get('id', str(uuid.uuid4()))
        if kwargs.get('created_at') is not None:
            self.created_at = datetime.strptime(kwargs.get('created_at'),
                                                TIMESTAMP_FORMAT)
        else:
            self.created_at = datetime.utcnow()
        if kwargs.get('updated_at') is not None:
            self.updated_at = datetime.strptime(kwargs.get('updated_at'),
                                                TIMESTAMP_FORMAT)
        else:
            self.updated_at = datetime.utcnow()

    def __eq__(self, other: TypeVar('Base')) -> bool:
        """ Equality
        """
        if type(self) != type(other):
            return False
        if not isinstance(self, Base):
            return False
        return (self.id == other.id)

    def to_json(self, for_serialization: bool = False) -> dict:
        """ Convert the object a JSON dictionary
        """
        result = {}
        for key, value in self.__dict__.items():
            if not for_serialization and key[0] == '_':
                continue
            if type(value) is datetime:
                result[key] = value.strftime(TIMESTAMP_FORMAT)
            else:
                result[key] = value
        return result

    def to_dict(self):
        """
        Convert the User object to a dictionary
        """
        user_dict = {
            'created_at': self.created_at.strftime(TIMESTAMP_FORMAT),
            'updated_at': self.updated_at.strftime(TIMESTAMP_FORMAT),
            'email': self.email,
            'password': self._password,  # Ensure it's included if needed
            'first_name': self.first_name,
            'last_name': self.last_name
        }
        return user_dict

    @classmethod
    def load_from_file(cls):
        """ Load all objects from file
        """
        s_class = cls.__name__
        file_path = ".db_{}.json".format(s_class)
        DATA[s_class] = {}
        if not path.exists(file_path):
            return

        with open(file_path, 'r') as f:
            objs_json = json.load(f)
            for obj_id, obj_json in objs_json.items():
                DATA[s_class][obj_id] = cls(**obj_json)

    @classmethod
    def save_to_file(cls):
        """ Save all objects to file
        """
        s_class = cls.__name__
        file_path = ".db_{}.json".format(s_class)
        objs_json = {}
        for obj_id, obj in DATA[s_class].items():
            objs_json[obj_id] = obj.to_json(True)

        with open(file_path, 'w') as f:
            json.dump(objs_json, f)
    
    @classmethod
    def save_to_mongo(cls, obj):
        from models import mongo_storage
        s_class = cls.__name__
        if hasattr(mongo_storage, 'db'):
            collection = mongo_storage.db[s_class]
            obj_dict = obj.to_dict()
            obj_dict['_id'] = obj.id  # Add the ID to the document
            collection.replace_one({'_id': obj.id}, obj_dict, upsert=True)

    def save(self):
        """ Save current object
        """
        s_class = self.__class__.__name__
        self.updated_at = datetime.utcnow()
        DATA[s_class][self.id] = self
        # self.__class__.save_to_file()
        self.__class__.save_to_mongo(self)

    def remove(self):
        """ Remove object
        """
        s_class = self.__class__.__name__
        if DATA[s_class].get(self.id) is not None:
            del DATA[s_class][self.id]
            self.__class__.save_to_file()

    @classmethod
    def count(cls) -> int:
        """ Count all objects
        """
        s_class = cls.__name__
        return len(DATA[s_class].keys())

    @classmethod
    def all(cls) -> Iterable[TypeVar('Base')]:
        """ Return all objects
        """
        return cls.search()

    @classmethod
    def get(cls, id: str) -> TypeVar('Base'):
        """ Return one object by ID
        """
        s_class = cls.__name__
        return DATA[s_class].get(id)

    @classmethod
    def search(cls, attributes: dict = {}) -> List[TypeVar('Base')]:
        """ Search all objects with matching attributes
        """
        s_class = cls.__name__
        def _search(obj):
            if len(attributes) == 0:
                return True
            for k, v in attributes.items():
                if (getattr(obj, k) != v):
                    return False
            return True
        
        return list(filter(_search, DATA[s_class].values()))

    @classmethod
    def search_mongo(cls, attributes: dict = {}):
        from models import mongo_storage
        s_class = cls.__name__
        result = mongo_storage.get(s_class, **attributes)
        return result
