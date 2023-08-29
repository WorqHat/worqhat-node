export class APISuccess {
  readonly status: number | undefined;
  readonly message: string | undefined;
  readonly data: Object | undefined;

  constructor(status: number | undefined, data: Object | undefined) {
    this.status = status;
    this.data = data;
  }
  static generate(status: number | undefined, data: Object | undefined) {
    return new APISuccess(status, data);
  }
}
