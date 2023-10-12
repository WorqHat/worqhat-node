import { getUniqueQuery } from '../types';
import {
  createCollectionWithSchema,
  createCollectionWithoutSchema,
} from './collections/create-collection';
import { deleteCollection } from './collections/delete-collection';
import { addDataDb } from './data-mgmt/add-data';
import { deleteDataDb } from './data-mgmt/delete-data';
import { updateDataDb } from './data-mgmt/update-data';
import { arrayUnionDb } from './db-functions/add-array';
import { arrayRemoveDb } from './db-functions/remove-array';
import { incrementFieldDb } from './db-functions/increment-data';
import { fetchAllData } from './fetch-data/fetch-collection';
import { fetchUniqueData } from './fetch-data/fetch-unique';
import { fetchCountData } from './fetch-data/fetch-count';
import { fetchRowData } from './fetch-data/fetch-row';
import { fetchNlpQuery } from './fetch-data/nlp-query';
import { fetchWithCondition } from './fetch-data/run-queries';

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
      if (data[key].__op === 'arrayAdd') {
        // Call the database function for array union operation
        return await arrayUnionDb(
          this.collectionName,
          this.id,
          key,
          data[key].elements,
        );
      } else if (data[key].__op === 'arrayRemove') {
        // Call the database function for array union operation
        return await arrayRemoveDb(
          this.collectionName,
          this.id,
          key,
          data[key].elements,
        );
      } else if (data[key].__op === 'increment') {
        // Call the database function for array union operation
        return await incrementFieldDb(
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

  get() {
    return fetchRowData(this.collectionName, this.id);
  }
}

export class Collection {
  name: string;
  data: any[];
  documents: { [key: string]: Document };
  private languageQuery: string;
  private whereQuery: { field: string; operator: string; value: any }[] = [];
  private joinOperator: string;

  constructor(name: string) {
    this.name = name;
    this.data = [];
    this.documents = {};
    this.languageQuery = '';
    this.whereQuery = [];
    this.joinOperator = 'AND';
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

  getAll() {
    return fetchAllData(this.name);
  }

  getCount(column: string) {
    return fetchCountData(this.name, column);
  }

  language(query: string) {
    this.languageQuery = query;
    return this; // return the instance of the class to allow method chaining
  }

  where(field: string, operator: string, value: any) {
    this.whereQuery.push({ field, operator, value });
    return this; // return the instance of the class to allow method chaining
  }

  join(operator: string) {
    this.joinOperator = operator.toUpperCase();
    return this; // return the instance of the class to allow method chaining
  }

  async get() {
    if (this.languageQuery) {
      return fetchNlpQuery(this.name, this.languageQuery);
    } else if (this.whereQuery.length > 0) {
      return fetchWithCondition(this.name, this.whereQuery, this.joinOperator);
    } else {
      return fetchAllData(this.name);
    }
  }

  private getUniqueQuery: getUniqueQuery = {
    uniqueColumn: '',
    orderByColumn: '',
    orderDirection: 'asc',
  };

  getUnique(uniqueColumn: string) {
    this.getUniqueQuery.uniqueColumn = uniqueColumn;
    return this;
  }

  orderBy(orderByColumn: string, orderDirection: 'asc' | 'desc' = 'asc') {
    this.getUniqueQuery.orderByColumn = orderByColumn;
    this.getUniqueQuery.orderDirection = orderDirection;
    return this;
  }

  async execute() {
    const { uniqueColumn, orderByColumn, orderDirection } = this.getUniqueQuery;

    if (!uniqueColumn) {
      return { error: 'Please specify a unique column.' };
    }

    let fetchData = {};

    if (orderByColumn) {
      fetchData = fetchUniqueData(
        this.name,
        uniqueColumn,
        orderByColumn,
        orderDirection,
      );
    } else {
      fetchData = fetchUniqueData(this.name, uniqueColumn);
    }

    return fetchData;
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

  arrayAdd(elements: string) {
    return {
      __op: 'arrayAdd',
      elements: elements,
    };
  }

  arrayRemove(elements: string) {
    return {
      __op: 'arrayRemove',
      elements: elements,
    };
  }
  increment(elements: number) {
    return {
      __op: 'increment',
      elements: elements,
    };
  }
}
