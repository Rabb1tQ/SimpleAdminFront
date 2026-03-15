const Layout = () => import("@/layout/index.vue");

export default [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/login/index.vue"),
    meta: {
      title: "登录",
      showLink: false
    }
  },
  {
    path: "/account-settings",
    name: "AccountSettings",
    component: Layout,
    meta: {
      title: "个人中心",
      showLink: false
    },
    children: [
      {
        path: "",
        name: "AccountSettingsIndex",
        component: () => import("@/views/account-settings/index.vue"),
        meta: {
          title: "个人中心",
          showLink: false
        }
      }
    ]
  },
  // 全屏403（无权访问）页面
  {
    path: "/access-denied",
    name: "AccessDenied",
    component: () => import("@/views/error/403.vue"),
    meta: {
      title: "403",
      showLink: false
    }
  },
  // 全屏500（服务器出错）页面
  {
    path: "/server-error",
    name: "ServerError",
    component: () => import("@/views/error/500.vue"),
    meta: {
      title: "500",
      showLink: false
    }
  },
  {
    path: "/redirect",
    component: Layout,
    meta: {
      title: "加载中...",
      showLink: false
    },
    children: [
      {
        path: "/redirect/:path(.*)",
        name: "Redirect",
        component: () => import("@/layout/redirect.vue")
      }
    ]
  },
  // 动态路由加载前的 catch-all 路由，避免产生 "No match found" 警告
  // 当动态路由加载完成后，会自动导航到正确的页面
  {
    path: "/:pathMatch(.*)*",
    name: "Loading",
    component: () => import("@/views/loading/index.vue"),
    meta: {
      title: "加载中...",
      showLink: false
    }
  }
] satisfies Array<RouteConfigsTable>;
