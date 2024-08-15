/**
 * 创建代理，用于解析 .env.development 代理配置
 * @param list
 */
export function createProxy(list) {
  const ret = {};
  for (const [prefix, target] of list) {
    ret[prefix] = {
      target: target,
      changeOrigin: true,
      ws: true,
      rewrite: path => path.replace(new RegExp(`^${prefix}`), "")
    };
  }
  return ret;
}
