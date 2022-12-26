import moment from 'moment';

/**
 * Convert ISO_8601 format to string
 * @param dateString ISO_8601 format
 * @returns string
 */
function convertDateToString(dateString: string): string {
  const dateTime = moment(dateString, moment.ISO_8601).millisecond(0);
  const now = moment();

  const diff = now.diff(dateTime);
  const calDuration = moment.duration(diff);
  const year = calDuration.years();
  const months = calDuration.months();
  const day = calDuration.days();
  const hour = calDuration.hours();
  const minute = calDuration.minutes();
  const second = calDuration.seconds();

  if (year === 0 && day === 0 && hour === 0 && minute === 0 && second !== undefined && (second === 0 || second < 1)) {
    return '0초 전';
  }

  if (year === 0 && months === 0 && day === 0 && hour === 0 && minute === 0 && second) {
    return `${Math.floor(second)}초 전`;
  }
  if (year === 0 && months === 0 && day === 0 && hour === 0) {
    return `${minute}분 전`;
  }

  if (year === 0 && months === 0 && day === 0) {
    return `${hour}시간 전`;
  }

  if (year === 0 && months === 0) {
    return `${day}일 전`;
  }

  if (year === 0) {
    return `${months}달 전`;
  }

  return `${year}년 전`;
}

export default convertDateToString;
