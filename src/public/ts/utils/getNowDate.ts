export default function getNowDate() {
  // формат - YYYY-MM-DD
  let now = new Date();
  let month = now.getMonth() + 1;
  let day = now.getDate();

  return `${now.getFullYear()}-${month < 10 ? '0' + month : month}-${
    day < 10 ? '0' + day : day
  }`;
}
