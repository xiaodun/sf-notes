export interface IResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
export class PageList<T> {
  public dataSource: T[] = [];
  public current: number = 0;
  public pageSize: number = 0;
  public total: number = 0;
}
