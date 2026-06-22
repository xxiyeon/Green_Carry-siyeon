const MUTATION_METHODS = new Set(["post", "put", "patch", "delete"]);

const isPlainObject = (value) =>
  Object.prototype.toString.call(value) === "[object Object]";

const normalizeValue = (value) => {
  if (value == null) {
    return value;
  }

  if (typeof FormData !== "undefined" && value instanceof FormData) {
    const entries = [];
    value.forEach((entryValue, key) => {
      if (typeof File !== "undefined" && entryValue instanceof File) {
        entries.push([key, `file:${entryValue.name}:${entryValue.size}`]);
      } else {
        entries.push([key, entryValue]);
      }
    });

    return entries.sort(([a], [b]) => a.localeCompare(b));
  }

  if (
    typeof URLSearchParams !== "undefined" &&
    value instanceof URLSearchParams
  ) {
    return value.toString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(normalizeValue);
  }

  if (isPlainObject(value)) {
    return Object.keys(value)
      .sort()
      .reduce((acc, key) => {
        acc[key] = normalizeValue(value[key]);
        return acc;
      }, {});
  }

  return value;
};

const buildMutationKey = (config = {}) => {
  const method = (config.method || "get").toLowerCase();

  if (!MUTATION_METHODS.has(method)) {
    return null;
  }

  return JSON.stringify({
    baseURL: config.baseURL || "",
    url: config.url || "",
    method,
    params: normalizeValue(config.params),
    data: normalizeValue(config.data),
  });
};

export const installMutationGuard = (client) => {
  if (!client || client.__mutationGuardInstalled) {
    return client;
  }

  const inflightMutations = new Map();
  const originalRequest = client.request.bind(client);

  client.request = (configOrUrl, maybeConfig) => {
    const config =
      typeof configOrUrl === "string"
        ? { ...(maybeConfig || {}), url: configOrUrl }
        : { ...(configOrUrl || {}) };

    const key = buildMutationKey(config);

    if (!key) {
      return originalRequest(configOrUrl, maybeConfig);
    }

    const existingPromise = inflightMutations.get(key);
    if (existingPromise) {
      return existingPromise;
    }

    const requestPromise = originalRequest(configOrUrl, maybeConfig).finally(
      () => {
        inflightMutations.delete(key);
      },
    );

    inflightMutations.set(key, requestPromise);
    return requestPromise;
  };

  client.post = (url, data, config) =>
    client.request({ ...(config || {}), method: "post", url, data });
  client.put = (url, data, config) =>
    client.request({ ...(config || {}), method: "put", url, data });
  client.patch = (url, data, config) =>
    client.request({ ...(config || {}), method: "patch", url, data });
  client.delete = (url, config) =>
    client.request({ ...(config || {}), method: "delete", url });

  client.__mutationGuardInstalled = true;
  return client;
};
