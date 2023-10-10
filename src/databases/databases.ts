import {
  createCollectionWithSchema,
  createCollectionWithoutSchema,
} from './collections/create-collection';
import { deleteCollection } from './collections/delete-collection';

export class Collection {
  name: string;
  data: any[];

  constructor(name: string) {
    this.name = name;
    this.data = [];
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
    // Delete the collection
    return deleteCollection(this.name);
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
}
