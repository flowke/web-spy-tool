function merge(baseObj, extendObj) {
  for (const key in extendObj) {
    baseObj[key] = extendObj[key];
  }

  return baseObj;
};

exports.merge = merge;