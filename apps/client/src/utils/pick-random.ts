/** 从非空元组中随机取一个元素 */
export const pickRandom = <T>(list: readonly [T, ...T[]]): T =>
  list[Math.floor(Math.random() * list.length)] ?? list[0];
