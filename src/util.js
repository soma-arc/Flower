// https://qiita.com/coa00/items/679b0b5c7c468698d53f
export function Randomstr(length) {
  var s = "";
  length = length || 32;
  for (let i = 0; i < length; i++) {
      let random = Math.random() * 16 | 0;
      s += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
  }

  return s;
}
