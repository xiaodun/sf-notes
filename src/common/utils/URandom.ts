export namespace URandom {
  export function getIntegeValue(
    startNumber: number,
    endNumber: number,
    lastValue?: number
  ) {
    // @ts-ignore
    function able() {
      const randomValue =
        Math.floor(Math.random() * (endNumber - startNumber + 1)) + startNumber;
      if (lastValue != undefined) {
        if (randomValue !== lastValue) {
          return randomValue;
        } else {
          return able();
        }
      } else {
        return randomValue;
      }
    }
    return able();
  }
}
