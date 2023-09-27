#!/usr/bin/python3
"""This module defines a base class for all models in our socialplace api"""
from uuid import uuid4
from datetime import datetime
from os import getenv
import models

ftime = '%Y-%m-%dT%H:%M:%S.%f'

Base = object


class BaseModel:
    """A base class for all hbnb models"""

    def __init__(self, *args, **kwargs):
        """Instantiates a new model"""
        self._id = str(uuid4())
        self.dateCreated = self.dateUpdated = datetime.utcnow()
        if kwargs:
            for key, value in kwargs.items():
                if key == "dateCreated" or key == "dateUpdated":
                    value = datetime.strptime(value, ftime)
                if key != "__class__":
                    setattr(self, key, value)

    def __str__(self):
        """Returns a string representation of the instance"""
        return "[{:s}] ({:s}) {}".format(self.__class__.__name__,
                                         self._id,
                                         self.__dict__)

    def save(self):
        """Updates updated_at with current time when instance is changed"""
        self.dateUpdated = datetime.now()
        models.storage.new(self)

    def to_dict(self):
        """Convert instance into dict format"""
        dict = self.__dict__.copy()
        dict["__class__"] = self.__class__.__name__
        dict["dateCreated"] = self.dateCreated.isoformat()
        dict["dateUpdated"] = self.dateUpdated.isoformat()
        if "_sa_instance_state" in dict:
            del dict["_sa_instance_state"]
        return dict

    def delete(self):
        """deletes the current instance from storage"""
        models.storage.delete(self)
