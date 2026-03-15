const Layout = () => import("@/layout/index.vue");

export default {
  path: "/",
  name: "Home",
  component: Layout,
  redirect: "/home",
  meta: {
    icon: "ep/home-filled",
    title: "首页",
    rank: 0
  },
  children: [
    {
      path: "/home",
      name: "HomePage",
      component: () => import("@/views/home/index.vue"),
      meta: {
        title: "首页"
      }
    }
  ]
};
