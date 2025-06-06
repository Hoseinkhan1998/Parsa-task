import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import router from "./router/index"
import axios from 'axios';

const vuetify = createVuetify({
  components,
  directives,
})


const app = createApp(App);
app.use(router);
app.use(vuetify) 
app.mount("#app");