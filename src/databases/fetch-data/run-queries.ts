export const fetchWithCondition = (
  collectionName: string,
  whereQuery: { field: string; operator: string; value: any }[],
  joinStatement?: string,
  orderBy?: string,
  order?: 'asc' | 'desc' | '',
  limit?: number,
): Promise<any[]> => {
  console.log(
    'fetchWithCondition',
    collectionName,
    whereQuery,
    joinStatement,
    orderBy,
    order,
    limit,
  );

  return new Promise((resolve, reject) => {
    resolve([]);
  });
};
