export interface NActivity {
  name: string;
  weight?: number;
  isClose?: boolean;
  tips?: string;
  children?: NActivity[];
}
export namespace NActivity {
  export interface ISelectCell {
    selectValue: string;
    children: NActivity[];
  }
}
export default NActivity;
