import { createRouter, createWebHistory } from "vue-router";
import MainHomePage from "../components/HomePage/MainHomePage.vue";
// import TaskModule from "../components/Modules/TaskModule.vue";

const routes = [
  { path: "/", component: MainHomePage, name: "home" },
  // { path: "/task-module", component: TaskModule, name: "task-module" },  
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;