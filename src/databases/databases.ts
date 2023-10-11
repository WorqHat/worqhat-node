import {
  createCollectionWithSchema,
  createCollectionWithoutSchema,
} from './collections/create-collection';
import { deleteCollection } from './collections/delete-collection';
import { addDataDb } from './data-mgmt/add-data';
import { deleteDataDb } from './data-mgmt/delete-data';
import { updateDataDb } from './data-mgmt/update-data';
import { arrayUnionDb } from './db-functions/add-array';

export class Document {
  id: string;
  data: any;
  collectionName: string;

  constructor(collectionName: string, id: string) {
    this.collectionName = collectionName;
    this.id = id;
    this.data = {};
  }

  add(data: any) {
    this.data = data;
    return addDataDb(this.collectionName, this.id, data);
  }

  async update(data: any) {
    for (const key in data) {
      if (data[key].__op === 'arrayUnion') {
        // Call the database function for array union operation
        return await arrayUnionDb(
          this.collectionName,
          this.id,
          key,
          data[key].elements,
        );
      } else {
        // Normal assignment
        this.data[key] = data[key];
      }
    }

    return updateDataDb(this.collectionName, this.id, this.data);
  }

  delete() {
    return deleteDataDb(this.collectionName, this.id);
  }
}

export class Collection {
  name: string;
  data: any[];
  documents: { [key: string]: Document };

  constructor(name: string) {
    this.name = name;
    this.data = [];
    this.documents = {};
  }

  create(data?: any, orderByKey?: string) {
    let response = {};

    if (!data || Object.keys(data).length === 0) {
      response = createCollectionWithoutSchema(this.name);
    } else {
      // I want to check the data object to see that the values are among the allowed values
      let allowedValues = [
        'string',
        'number',
        'float',
        'boolean',
        'date',
        'timestamp',
        'json',
        'map',
        'array',
        'geopoint',
        'uuid',
        'ip',
      ];

      Object.entries(data).forEach(([key, value]) => {
        if (!allowedValues.includes(value as string)) {
          throw new Error(
            `The data type ${value} is not allowed as a Collection Schema value`,
          );
        }
      });

      response = createCollectionWithSchema(this.name, data, orderByKey || '');
    }
    return response;
  }

  delete() {
    return deleteCollection(this.name);
  }

  add(data: any) {
    return addDataDb(this.name, '', data);
  }

  doc(docId: string) {
    if (!this.documents[docId]) {
      this.documents[docId] = new Document(this.name, docId);
    }
    return this.documents[docId];
  }
}

export class Database {
  collections: { [key: string]: Collection };

  constructor() {
    this.collections = {};
  }

  collection(name: string) {
    if (!this.collections[name]) {
      this.collections[name] = new Collection(name);
    }
    return this.collections[name];
  }

  arrayUnion(elements: string) {
    return {
      __op: 'arrayUnion',
      elements: elements,
    };
  }
}
