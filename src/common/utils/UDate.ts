import moment from 'moment';

export namespace UDate {
  export const ymd = 'YYYY-MM-DD';
  export const hms = 'hh:mm:ss';
  export const ymdhms = ymd + ' ' + hms;
  export function fomat(timestamp: number, pattern: string) {
    if (timestamp == undefined) {
      return '';
    }
    return moment(timestamp).format(pattern);
  }
}
export default UDate;
