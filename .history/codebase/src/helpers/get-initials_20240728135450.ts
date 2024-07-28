export const getInitialsFromName = (name: string | null | undefined) => {
  const arr = (name ?? '').trim().split(' ');
  let fistSymbol = '';
  let secondSymbol = '';
  if (arr.length >= 2) {
    fistSymbol = arr[0][0];
    const lastWord = arr.pop();
    secondSymbol = lastWord ? lastWord[0] : '';
  } else if (arr.length == 1) {
    fistSymbol = arr[0][0] ?? '';
    secondSymbol = arr[0][1] ?? '';
  }
  return `${fistSymbol}${secondSymbol}`.toUpperCase();
};
