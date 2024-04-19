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
import {
  fetchAllData,
  fetchAllCollections,
} from './fetch-data/fetch-collection';
import { fetchUniqueData } from './fetch-data/fetch-unique';
import { fetchCountData } from './fetch-data/fetch-count';
import { fetchRowData } from './fetch-data/fetch-row';
import { fetchNlpQuery } from './fetch-data/nlp-query';
import { fetchWithCondition } from './fetch-data/run-queries';

/**
 * The Document class represents a document within a collection in the database.
 * It provides methods to interact with the data within the document.
 */
export class Document {
  /**
   * The unique identifier of the document.
   */
  id: string;

  /**
   * The data contained within the document.
   */
  data: any;

  /**
   * The name of the collection that the document belongs to.
   */
  collectionName: string;

  /**
   * Creates a new Document instance.
   * @param {string} collectionName - The name of the collection that the document belongs to.
   * @param {string} id - The unique identifier of the document.
   */
  constructor(collectionName: string, id: string) {
    this.collectionName = collectionName;
    this.id = id;
    this.data = {};
  }

  /**
   * Adds data to the document and updates the database.
   * @param {any} data - The data to be added to the document.
   * @returns {Promise} A promise that resolves with the result of the database operation.
   */
  add(data: any) {
    this.data = data;
    return addDataDb(this.collectionName, this.id, data);
  }

  /**
   * Updates the document with the provided data and updates the database.
   * This method supports special operations like array addition, removal, and increment.
   * For these operations, the data should be an object with a '__op' property indicating the operation,
   * and an 'elements' property containing the elements for the operation.
   * @param {any} data - The data to be updated in the document.
   * @returns {Promise} A promise that resolves with the result of the database operation.
   * @throws {Error} If the data for a special operation is not in the correct format.
   */
  async update(data: any) {
    for (const key in data) {
      /**
       * Handles the 'arrayUnion' operation.
       * Adds an element to an array in the document.
       * The data for this operation should be an object with a '__op' property of 'arrayUnion',
       * and an 'elements' property containing the element to be added.
       */
      if (data[key].__op === 'arrayUnion') {
        if (
          !Array.isArray(data[key].elements) ||
          data[key].elements.length !== 1
        ) {
          throw new Error(
            'Only one element can be passed to the arrayUnion function. See the documentation for more details.',
          );
        }
        return await arrayUnionDb(
          this.collectionName,
          this.id,
          key,
          data[key].elements,
        );
      } else if (data[key].__op === 'arrayRemove') {
        /**
         * Handles the 'arrayRemove' operation.
         * Removes an element from an array in the document.
         * The data for this operation should be an object with a '__op' property of 'arrayRemove',
         * and an 'elements' property containing the element to be removed.
         */
        if (
          !Array.isArray(data[key].elements) ||
          data[key].elements.length !== 1
        ) {
          throw new Error(
            'Only one element can be passed to the arrayRemove function. See the documentation for more details.',
          );
        }
        return await arrayRemoveDb(
          this.collectionName,
          this.id,
          key,
          data[key].elements,
        );
      } else if (data[key].__op === 'increment') {
        /**
         * Handles the 'increment' operation.
         * Increments a numeric field in the document.
         * The data for this operation should be an object with a '__op' property of 'increment',
         * and an 'elements' property containing the number to increment by.
         */
        if (typeof data[key].elements !== 'number') {
          throw new Error(
            'Increment value must be a number. You can pass in both Positive and Negative values .You can use the increment() function to increment a field. See the documentation for more details.',
          );
        }
        return await incrementFieldDb(
          this.collectionName,
          this.id,
          key,
          data[key].elements,
        );
      } else {
        /**
         * Handles normal assignment.
         * Assigns the provided value to the specified field in the document.
         */
        // Normal assignment
        this.data[key] = data[key];
      }
    }
    /**
     * Updates the document in the database with the new data.
     */
    return updateDataDb(this.collectionName, this.id, this.data);
  }

  /**
   * Deletes the data from the database.
   * @returns {Promise} A promise that resolves when the data is deleted.
   */
  delete() {
    return deleteDataDb(this.collectionName, this.id);
  }

  /**
   * Fetches the document from the database.
   * @returns {Promise} A promise that resolves with the fetched document.
   */
  get() {
    return fetchRowData(this.collectionName, this.id);
  }
}

/**
 * The Collection class represents a collection within the database.
 * It provides methods to interact with the documents within the collection.
 */
export class Collection {
  name: string;
  outputType: string;
  data: any[];
  documents: { [key: string]: Document };
  private languageQuery: string;
  private whereQuery: { field: string; operator: string; value: any }[] = [];
  private joinOperator: string;
  private limitCount: number | null;
  private startAtCount: number | null;

  /**
   * Creates a new Collection instance.
   * @param {string} name - The name of the collection.
   */
  constructor(name: string, outputType: string) {
    this.name = name;
    this.outputType = outputType || 'json';
    this.data = [];
    this.documents = {};
    this.languageQuery = '';
    this.whereQuery = [];
    this.joinOperator = 'AND';
    this.limitCount = null;
    this.startAtCount = null;
  }

  /**
   * Creates a new collection in the database with or without a schema.
   * @param {any} data - The schema for the collection. If not provided, a collection without a schema is created.
   * @param {string} [orderByKey] - The key to order the documents in the collection by.
   * @returns {Promise} A promise that resolves with the result of the database operation.
   * @throws {Error} If a data type in the schema is not allowed.
   */
  create(data: any, orderByKey?: string) {
    let response = {};

    if (!data || Object.keys(data).length === 0) {
      response = createCollectionWithoutSchema(this.name);
    } else {
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

  /**
   * Deletes the current collection from the database.
   * @returns {Promise} A promise that resolves when the collection is deleted.
   */
  delete() {
    return deleteCollection(this.name);
  }

  /**
   * Adds data to the current collection in the database.
   * @param {any} data - The data to be added to the collection.
   * @returns {Promise} A promise that resolves with the result of the database operation.
   */
  add(data: any) {
    return addDataDb(this.name, '', data);
  }

  /**
   * Fetches all data from the current collection in the database.
   * @returns {Promise} A promise that resolves with the fetched data.
   */
  getAll() {
    return fetchAllData(this.name, this.outputType);
  }

  /**
   * Fetches the count of a specific column from the current collection in the database.
   * @param {string} column - The column for which the count is to be fetched.
   * @returns {Promise} A promise that resolves with the count of the specified column.
   */
  getCount(column: string) {
    return fetchCountData(this.name, column);
  }

  /**
   * Sets the language query for the current collection.
   * @param {string} query - The language query to be set.
   * @returns {Collection} The current Collection instance.
   */
  language(query: string) {
    this.languageQuery = query;
    return this;
  }

  /**
   * Sets the response type for current request.
   * @param {string} outputType - The response type to be set.
   * @returns {Collection} The current Collection instance.
   */
  response(outputType: string) {
    this.outputType = outputType;
    return this;
  }

  private getUniqueQuery: getUniqueQuery = {
    uniqueColumn: '',
    orderByColumn: '',
    orderDirection: null as 'asc' | 'desc' | null,
  };

  /**
   * The `orderBy` function sets the column and direction for ordering the query results.
   * @param {string} orderByColumn - The orderByColumn parameter is a string that represents the column
   * by which the data should be ordered.
   * @param {'asc' | 'desc' | null} orderDirection - The `orderDirection` parameter is used to specify
   * the order in which the results should be sorted. It can have three possible values:
   * @returns The current instance of the object.
   */
  orderBy(orderByColumn: string, orderDirection: 'asc' | 'desc' | null) {
    this.getUniqueQuery.orderByColumn = orderByColumn;
    this.getUniqueQuery.orderDirection = orderDirection;
    return this;
  }

  /**
   * The `where` function adds a condition to a query based on a field, operator, and value.
   * @param {string} field - The "field" parameter represents the field or property on which you want to
   * apply the condition. It could be a string representing the name of the field or property in your
   * data.
   * @param {string} operator - The `operator` parameter in the `where` method is used to specify the
   * comparison operator to be used in the query. It determines how the `value` parameter will be
   * compared to the field value.
   * @param {any} value - The `value` parameter in the `where` method is used to specify the value that
   * you want to compare against in the query. It can be of any type, depending on the field you are
   * querying against. For example, if you are querying against a field of type string, the value can
   * @returns The `where` method returns the current instance of the object it is called on (`this`).
   */
  where(field: string, operator: string, value: any) {
    const validOperators = [
      '==',
      '!=',
      '>',
      '>=',
      '<',
      '<=',
      'less than',
      'less than or equal to',
      'equal to',
      'greater than',
      'greater than or equal to',
      'not equal to',
    ];
    if (!validOperators.includes(operator.toLowerCase())) {
      throw new Error(
        'Invalid operator. Valid operators are "==" (or "equal to"), "!=" (or "not equal to"), ">" (or "greater than"), ">=" (or "greater than or equal to"), "<" (or "less than"), "<=" (or "less than or equal to")',
      );
    }
    this.whereQuery.push({ field, operator, value });
    return this;
  }

  /**
   * The join function sets the join operator for a query and throws an error if the operator is invalid.
   * @param {string} operator - The `operator` parameter is a string that represents the join operator to
   * be used.
   * @returns The method is returning the current instance of the object.
   */
  join(operator: string) {
    const validOperators = ['and', 'or'];
    if (!validOperators.includes(operator.toLowerCase())) {
      throw new Error('Invalid operator. Valid operators are "and" and "or"');
    }
    this.joinOperator = operator.toUpperCase();
    return this;
  }

  /**
   * The `limit` function sets a limit count and throws an error if the count is not an integer greater
   * than 0.
   * @param {number} limitCount - The `limitCount` parameter is a number that represents the maximum
   * number of items to be returned or processed.
   * @returns The "this" keyword is being returned.
   */
  limit(limitCount: number) {
    if (!Number.isInteger(limitCount)) {
      throw new Error('Limit count must be an integer greater than 0.');
    }
    this.limitCount = limitCount;
    return this;
  }

  startAt(startAt: number) {
    if (!Number.isInteger(startAt)) {
      throw new Error('StartAt count must be an integer greater than 0.');
    }
    this.startAtCount = startAt;
    return this;
  }

  /**
   * The function retrieves data based on different conditions such as language query, where query, and
   * order by column.
   * @returns The `get()` function returns a promise that resolves to the result of one of the following
   * functions:
   */
  async get() {
    if (this.languageQuery) {
      return fetchNlpQuery(this.name, this.languageQuery, this.outputType);
    } else if (this.whereQuery.length > 0) {
      return fetchWithCondition(
        this.name,
        this.whereQuery,
        this.joinOperator,
        this.getUniqueQuery.orderByColumn,
        this.getUniqueQuery.orderDirection,
        this.limitCount,
        this.startAtCount,
        this.outputType,
      );
    } else {
      return fetchAllData(this.name, this.outputType);
    }
  }

  /**
   * The function sets the unique column for a query and returns the object itself.
   * @param {string} uniqueColumn - A string representing the name of the column in a database table that
   * contains unique values.
   * @returns The `this` object is being returned.
   */
  getUnique(uniqueColumn: string) {
    this.getUniqueQuery.uniqueColumn = uniqueColumn;
    return this;
  }

  /**
   * The function executes a query to fetch unique data based on a specified column, with optional
   * sorting parameters.
   * @returns The code is returning the result of the `fetchData` variable.
   */
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

/**
 * The Database class represents a database with collections.
 * It provides methods to interact with collections and perform operations like array addition, removal, and increment.
 */
export class Database {
  /**
   * An object where keys are collection names and values are Collection instances.
   */
  collections: { [key: string]: Collection };

  /**
   * Creates a new Database instance.
   */
  constructor() {
    this.collections = {};
  }

  /**
   * Returns a Collection instance associated with the given name.
   * If the collection does not exist, it creates a new one.
   * @param {string} name - The name of the collection.
   * @param {string} outputType - output type of the response
   * @returns {Collection} The Collection instance.
   */
  collection(name: string, outputType: string) {
    if (!this.collections[name]) {
      this.collections[name] = new Collection(name, outputType);
    }
    return this.collections[name];
  }

  /**
   * Returns an object to be used for adding an array in a document.
   * @param {string} elements - The elements to be added.
   * @returns {Object} The operation object.
   */
  arrayUnion(elements: string) {
    return {
      __op: 'arrayUnion',
      elements: elements,
    };
  }

  /**
   * Returns an object to be used for removing an array from a document.
   * @param {string} elements - The elements to be removed.
   * @returns {Object} The operation object.
   */
  arrayRemove(elements: string) {
    return {
      __op: 'arrayRemove',
      elements: elements,
    };
  }

  /**
   * Returns an object to be used for incrementing a value in a document.
   * @param {number} elements - The value to be incremented.
   * @returns {Object} The operation object.
   */
  increment(elements: number) {
    return {
      __op: 'increment',
      elements: elements,
    };
  }

  getAllCollections() {
    return fetchAllCollections();
  }
}
