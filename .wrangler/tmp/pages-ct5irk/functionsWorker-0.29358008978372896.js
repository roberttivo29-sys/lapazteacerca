var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// api/login.js
async function onRequestPost(context) {
  const { request, env } = context;
  const corsHeaders3 = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json"
  };
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders3 });
  }
  try {
    const { username, password } = await request.json();
    const validUser = env.ADMIN_USER || "admin";
    const validPass = env.ADMIN_PASS;
    if (!validPass) {
      return new Response(
        JSON.stringify({
          error: true,
          message: "Contrase\xF1a de administrador no configurada. Contacta al desarrollador."
        }),
        { status: 500, headers: corsHeaders3 }
      );
    }
    if (username === validUser && password === validPass) {
      const token = generateSessionToken(username);
      return new Response(
        JSON.stringify({
          success: true,
          token,
          user: username,
          expires: Date.now() + 2 * 60 * 60 * 1e3
          // 2 horas
        }),
        { status: 200, headers: corsHeaders3 }
      );
    } else {
      return new Response(
        JSON.stringify({
          error: true,
          message: "Usuario o contrase\xF1a incorrectos"
        }),
        { status: 401, headers: corsHeaders3 }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: true,
        message: "Error en el servidor: " + error.message
      }),
      { status: 500, headers: corsHeaders3 }
    );
  }
}
__name(onRequestPost, "onRequestPost");
function generateSessionToken(username) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return btoa(`${username}:${timestamp}:${random}`);
}
__name(generateSessionToken, "generateSessionToken");
function validateToken(token) {
  if (!token) return false;
  try {
    const decoded = atob(token);
    const parts = decoded.split(":");
    if (parts.length !== 3) return false;
    const timestamp = parseInt(parts[1]);
    const now = Date.now();
    const twoHours = 2 * 60 * 60 * 1e3;
    return now - timestamp < twoHours;
  } catch {
    return false;
  }
}
__name(validateToken, "validateToken");

// api/upload.js
var corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization",
  "Content-Type": "application/json"
};
var MAX_FILE_SIZE = 5 * 1024 * 1024;
var ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
async function onRequestPost2(context) {
  const { request, env } = context;
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ error: true, message: "Token requerido" }),
      { status: 401, headers: corsHeaders }
    );
  }
  const token = authHeader.substring(7);
  if (!validateToken(token)) {
    return new Response(
      JSON.stringify({ error: true, message: "Token inv\xE1lido o expirado" }),
      { status: 401, headers: corsHeaders }
    );
  }
  const imgbbApiKey = env.IMGBB_API_KEY;
  if (!imgbbApiKey) {
    return new Response(
      JSON.stringify({ error: true, message: "API key de ImgBB no configurada" }),
      { status: 500, headers: corsHeaders }
    );
  }
  try {
    const formData = await request.formData();
    const file = formData.get("image");
    const numero = formData.get("numero") || "1";
    if (!file) {
      return new Response(
        JSON.stringify({ error: true, message: "No se proporcion\xF3 imagen" }),
        { status: 400, headers: corsHeaders }
      );
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return new Response(
        JSON.stringify({ error: true, message: "Tipo de imagen no permitido. Use JPG, PNG o WebP" }),
        { status: 400, headers: corsHeaders }
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ error: true, message: "La imagen no puede superar los 5MB" }),
        { status: 400, headers: corsHeaders }
      );
    }
    const imgbbFormData = new FormData();
    imgbbFormData.append("image", file);
    imgbbFormData.append("key", imgbbApiKey);
    const imgbbResponse = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: imgbbFormData
    });
    if (!imgbbResponse.ok) {
      const error = await imgbbResponse.json();
      throw new Error(error.error?.message || "Error al subir a ImgBB");
    }
    const imgbbData = await imgbbResponse.json();
    if (!imgbbData.success) {
      throw new Error(imgbbData.error?.message || "Error en ImgBB");
    }
    return new Response(
      JSON.stringify({
        success: true,
        url: imgbbData.data.url,
        display_url: imgbbData.data.display_url,
        size: imgbbData.data.size,
        numero
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: true, message: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
}
__name(onRequestPost2, "onRequestPost");

// api/proveedores.js
var REPO = "roberttivo29-sys/verifica-la-paz";
var BRANCH = "main";
var FILE_PATH = "data/proveedores.json";
var corsHeaders2 = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json"
};
async function onRequest(context) {
  const { request, env } = context;
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders2 });
  }
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ error: true, message: "Token de autenticaci\xF3n requerido" }),
      { status: 401, headers: corsHeaders2 }
    );
  }
  const token = authHeader.substring(7);
  if (!validateToken(token)) {
    return new Response(
      JSON.stringify({ error: true, message: "Token inv\xE1lido o expirado" }),
      { status: 401, headers: corsHeaders2 }
    );
  }
  const githubToken = env.GITHUB_TOKEN;
  if (!githubToken) {
    return new Response(
      JSON.stringify({ error: true, message: "Token de GitHub no configurado" }),
      { status: 500, headers: corsHeaders2 }
    );
  }
  const url = new URL(request.url);
  const pathParts = url.pathname.split("/");
  const providerId = pathParts[pathParts.length - 1];
  try {
    switch (request.method) {
      case "GET":
        return await handleGet(githubToken);
      case "POST":
        return await handlePost(request, githubToken);
      case "PUT":
        return await handlePut(request, githubToken, providerId);
      case "DELETE":
        return await handleDelete(githubToken, providerId);
      default:
        return new Response(
          JSON.stringify({ error: true, message: "M\xE9todo no permitido" }),
          { status: 405, headers: corsHeaders2 }
        );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: true, message: error.message }),
      { status: 500, headers: corsHeaders2 }
    );
  }
}
__name(onRequest, "onRequest");
async function handleGet(githubToken) {
  const response = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`,
    {
      headers: {
        "Authorization": `token ${githubToken}`,
        "Accept": "application/vnd.github.v3+json"
      }
    }
  );
  if (!response.ok) {
    throw new Error("No se pudo cargar el archivo de proveedores");
  }
  const data = await response.json();
  const content = atob(data.content);
  const providers = JSON.parse(content);
  return new Response(
    JSON.stringify({ proveedores: providers }),
    { status: 200, headers: corsHeaders2 }
  );
}
__name(handleGet, "handleGet");
async function handlePost(request, githubToken) {
  const newProvider = await request.json();
  const currentFile = await getGitHubFile(githubToken);
  const providers = JSON.parse(atob(currentFile.content));
  if (providers.find((p) => p.id === newProvider.id)) {
    throw new Error(`El ID ${newProvider.id} ya existe`);
  }
  providers.push(newProvider);
  await saveToGitHub(githubToken, providers, currentFile.sha, "Agregar proveedor");
  return new Response(
    JSON.stringify({ success: true, message: "Proveedor agregado" }),
    { status: 201, headers: corsHeaders2 }
  );
}
__name(handlePost, "handlePost");
async function handlePut(request, githubToken, providerId) {
  const updatedProvider = await request.json();
  const currentFile = await getGitHubFile(githubToken);
  const providers = JSON.parse(atob(currentFile.content));
  const index = providers.findIndex((p) => p.id === parseInt(providerId));
  if (index === -1) {
    throw new Error(`Proveedor con ID ${providerId} no encontrado`);
  }
  providers[index] = updatedProvider;
  await saveToGitHub(githubToken, providers, currentFile.sha, "Actualizar proveedor");
  return new Response(
    JSON.stringify({ success: true, message: "Proveedor actualizado" }),
    { status: 200, headers: corsHeaders2 }
  );
}
__name(handlePut, "handlePut");
async function handleDelete(githubToken, providerId) {
  const currentFile = await getGitHubFile(githubToken);
  const providers = JSON.parse(atob(currentFile.content));
  const filtered = providers.filter((p) => p.id !== parseInt(providerId));
  if (filtered.length === providers.length) {
    throw new Error(`Proveedor con ID ${providerId} no encontrado`);
  }
  await saveToGitHub(githubToken, filtered, currentFile.sha, "Eliminar proveedor");
  return new Response(
    JSON.stringify({ success: true, message: "Proveedor eliminado" }),
    { status: 200, headers: corsHeaders2 }
  );
}
__name(handleDelete, "handleDelete");
async function getGitHubFile(githubToken) {
  const response = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`,
    {
      headers: {
        "Authorization": `token ${githubToken}`,
        "Accept": "application/vnd.github.v3+json"
      }
    }
  );
  if (!response.ok) {
    throw new Error("No se pudo cargar el archivo");
  }
  return response.json();
}
__name(getGitHubFile, "getGitHubFile");
async function saveToGitHub(githubToken, providers, sha, message) {
  const content = btoa(JSON.stringify(providers, null, 2));
  const response = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`,
    {
      method: "PUT",
      headers: {
        "Authorization": `token ${githubToken}`,
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message,
        content,
        sha,
        branch: BRANCH
      })
    }
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error al guardar en GitHub");
  }
  return response.json();
}
__name(saveToGitHub, "saveToGitHub");

// ../.wrangler/tmp/pages-ct5irk/functionsRoutes-0.887805477505859.mjs
var routes = [
  {
    routePath: "/api/login",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/api/upload",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost2]
  },
  {
    routePath: "/api/proveedores",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest]
  }
];

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../../../AppData/Roaming/npm/node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function getOriginalPathPrefix(requestPath, normalizedPrefix) {
  let end = 0;
  for (let index = 0; index < normalizedPrefix.length; index++) {
    end++;
    if (normalizedPrefix[index] === "/") {
      while (requestPath[end] === "/") {
        end++;
      }
    }
  }
  return requestPath.slice(0, end);
}
__name(getOriginalPathPrefix, "getOriginalPathPrefix");
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  const normalizedRequestPath = requestPath.replace(/\/+/g, "/");
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath) || routeMatcher(normalizedRequestPath);
    const originalMountMatch = mountMatcher(requestPath);
    const mountMatchResult = originalMountMatch || mountMatcher(normalizedRequestPath);
    if (matchResult && mountMatchResult) {
      const path = originalMountMatch ? originalMountMatch.path : getOriginalPathPrefix(requestPath, mountMatchResult.path);
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
export {
  pages_template_worker_default as default
};
