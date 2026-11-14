import { onRequestPost as __api_login_js_onRequestPost } from "C:\\Users\\Robert_Tivo\\Desktop\\verfica la paz final\\functions\\api\\login.js"
import { onRequestPost as __api_upload_js_onRequestPost } from "C:\\Users\\Robert_Tivo\\Desktop\\verfica la paz final\\functions\\api\\upload.js"
import { onRequest as __api_proveedores_js_onRequest } from "C:\\Users\\Robert_Tivo\\Desktop\\verfica la paz final\\functions\\api\\proveedores.js"

export const routes = [
    {
      routePath: "/api/login",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_login_js_onRequestPost],
    },
  {
      routePath: "/api/upload",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_upload_js_onRequestPost],
    },
  {
      routePath: "/api/proveedores",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_proveedores_js_onRequest],
    },
  ]