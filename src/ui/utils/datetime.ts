export function getFormattedDateTime(): string {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // 月份从0开始，所以需要+1
  const day = String(now.getDate()).padStart(2, "0");

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function getCurrentHour(): string {
  const now = new Date();
  return String(now.getHours()).padStart(2, "0");
}

export function getCurrentMinute(): string {
  const now = new Date();
  return String(now.getMinutes()).padStart(2, "0");
}

export function getCurrentSecond(): string {
  const now = new Date();
  return String(now.getSeconds()).padStart(2, "0");
}

export function getDelay(start: string, end: string): number {
  // 将时间字符串转换为分钟数
  function timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  }

  // 计算开始时间和结束时间的分钟数
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);

  // 计算时间差，如果结束时间小于开始时间，表示跨天
  const delay =
    endMinutes >= startMinutes
      ? endMinutes - startMinutes
      : 24 * 60 - startMinutes + endMinutes;

  return delay * 60 * 1000; //毫秒
}
