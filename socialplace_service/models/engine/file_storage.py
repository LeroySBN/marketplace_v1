#!/usr/bin/python3
"""
This module defines a class to manage file storage for hbnb clone
"""
import json
import models
from models.user import User

classes = {
            'User': User,
            }


class FileStorage:
    """
    This class manages storage of hbnb models in JSON format
    """
    __file_path = 'file.json'
    __objects = {}

    def all(self, cls=None):
        """
        Returns a dictionary of models currently in storage
        """
        if cls is not None:
            dict = {}
            for key, value in self.__objects.items():
                if cls == value.__class__ or cls == value.__class__.__name__:
                    dict[key] = value
            return dict
        return self.__objects

    def new(self, obj):
        """
        Adds new object to storage dictionary
        """
        # self.all().update({obj.to_dict()['__class__'] + '.' + obj.id: obj})
        self.__objects["{}.{}".format(type(obj).__name__, obj.id)] = obj

    def save(self):
        """
        Saves storage dictionary to file
        """
        with open(FileStorage.__file_path, 'w') as f:
            temp = {}
            temp.update(FileStorage.__objects)
            for key, val in temp.items():
                temp[key] = val.to_dict()
            json.dump(temp, f)

    def reload(self):
        """
        Loads storage dictionary from file
        """
        try:
            temp = {}
            with open(FileStorage.__file_path, 'r') as f:
                temp = json.load(f)
                for key, val in temp.items():
                    self.all()[key] = classes[val['__class__']](**val)
        except FileNotFoundError:
            pass

    def delete(self, obj=None):
        """
        Deletes obj if in __objects
        """
        try:
            del self.__objects["{}.{}".format(type(obj).__name__, obj.id)]
        except (AttributeError, KeyError):
            pass

    def get(self, cls, id):
        """
        Retrieves one object
        """
        if cls not in classes.values():
            return None
        objs = models.storage.all(cls)
        for value in objs.values():
            if value.id == id:
                return value

    def count(self, cls=None):
        """
        Counts the number of objects in storage
        """
        if not cls:
            count = 0
            for clas in classes.values():
                count += len(models.storage.all(clas).values())
        else:
            count = len(models.storage.all(cls).values())
        return count

    def close(self):
        """
        Deserializing the JSON file to objects
        """
        self.reload()
