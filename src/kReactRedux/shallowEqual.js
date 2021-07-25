function is(x, y) {
  if (x === y) {
    // 处理  +0 === -0 // true 的情况
    // 当是 +0 与 -0 时,要返回 false
    return x !== 0 || y !== 0 || 1 / x === 1 / y;
  } else {
    // 处理 NaN !== NaN // true 的情况
    // 当 x 与 y 是 NaN 时,要返回 true
    return x !== x && y !== y;
  }
}

export default function shallowEqual(objA, objB) {
  // 首先对基本数据类型的比较
  // !! 若是同引用便会返回 true
  if (is(objA, objB)) return true;
  // 由于 is() 已经对基本数据类型做一个精确的比较，所以如果不等
  // 那就是object,所以在判断两个数据有一个不是 object 或者 null 之后，就可以返回false了
  if (
    typeof objA !== "object" ||
    objA === null ||
    typeof objB !== "object" ||
    objB === null
  ) {
    return false;
  }

  // 过滤掉基本数据类型之后，就是对对象的比较了
  // 首先拿出 key 值，对 key 的长度进行对比
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  // 长度不等直接返回false
  if (keysA.length !== keysB.length) return false;
  // 长度相等的情况下，进行循环比较
  for (let i = 0; i < keysA.length; i++) {
    // 调用 Object.prototype.hasOwnProperty 方法，判断 objB 里是否有 objA 中所有的 key
    // 如果有那就判断两个 key 值所对应的 value 是否相等(采用 is 函数)
    if (
      !Object.prototype.hasOwnProperty.call(objB, keysA[i]) ||
      !is(objA[keysA[i]], objB[keysA[i]])
    ) {
      return false;
    }
  }

  return true;
}
