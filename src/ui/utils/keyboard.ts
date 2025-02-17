function isCharacterKey(key?: string) {
  if (key === null || key === undefined || key.length != 1) {
    return false;
  }
  const match = key.match(/[a-z]/i);
  console.log(match);
  if (match) {
    return true;
  }
  return false;
}

const functionalKeys = ["Control", "Meta", "Alt", "Shift"];

function isFunctionKey(key?: string) {
  if (!key) {
    return false;
  }
  if (key in functionalKeys) {
    return true;
  }
  return false;
}

function isFunctionKeyDuplicated(keys?: string[]) {
  console.log(keys);
  if (!keys) {
    return false;
  }
  const keysCopy = Array.from(keys);
  //非功能键后置, 所以b-a
  keysCopy.sort(
    (a, b) => functionalKeys.indexOf(b) - functionalKeys.indexOf(a)
  );
  console.log(keysCopy);
  let count = 1;
  for (let i = 1; i < keysCopy.length; i++) {
    if (keysCopy[i] == keysCopy[i - 1]) {
      count++;
    } else {
      count = 1;
    }
    if (count >= 2) {
      return true;
    }
  }
  return false;
}

export { isCharacterKey, isFunctionKey, isFunctionKeyDuplicated };
