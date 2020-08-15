export namespace TRes {
  export interface Item<T> {
    success: boolean;
    message: string;
    data: T;
  }
  export class List<T> {
    public dataSource: T[] = [];
    public current: number = 0;
    public pageSize: number = 0;
    public total: number = 0;
    public loaded: boolean = false;
  }
}
export default TRes;
