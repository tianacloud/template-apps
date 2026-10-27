const registry = new Map();

export function register(name, handler) {
  registry.set(name, handler);
}

export function has(name) {
  return registry.has(name);
}

export async function run(name, dataset = {}, event = null, el = null) {
  const handler = registry.get(name);
  if (!handler) {
    console.warn('[actions] 未注册：', name);
    return null;
  }
  return handler(dataset, event, el);
}
