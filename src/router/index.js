import { createRouter, createWebHistory } from "vue-router";
// import MainHomePage from "../components/HomePage/MainHomePage.vue";
import Login from "../components/HomePage/Login.vue";
import VideoPlayer from "../components/HomePage/VideoPlayer.vue";
import axios from 'axios';

const routes = [
  { path: "/", component: VideoPlayer, name: "home" },
  { path: "/login-panel", component: Login, name: "login-panel" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  if (to.name !== "login-panel" && !token) {
    return next({ name: "login-panel" });
  }
  if (to.name === "login-panel" && token) {
    return next({ name: "home" });
  }
  next();
});

const token = localStorage.getItem("token");
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}


export default router;
