export function createProxy(list) {
  const ret = [];

  // 确保 list 是一个有效的可迭代对象
  if (!Array.isArray(list)) {
    console.error("Proxy list is not an array:", list);
    return ret; // 返回一个空数组
  }

  for (const [prefix, target] of list) {
    const httpsRE = /^https:\/\//;
    const isHttps = httpsRE.test(target);

    ret.push({
      target: target,
      changeOrigin: true,
      ws: true,
      rewrite: path => path.replace(new RegExp(`^${prefix}`), ""),
      ...(isHttps ? { secure: false } : {})
    });
  }

  return ret;
}
