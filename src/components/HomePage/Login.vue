<script setup>
import { ref } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

const email = ref("");
const password = ref("");
const showPassword = ref(false);
const router = useRouter();

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const handleLogin = async () => {
  try {
    const res = await axios.post("https://6835cde6cd78db2058c33d5f.mockapi.io/login", { username: email.value, password: password.value });
    localStorage.setItem("token", res.data.token);
    router.replace({ name: "home" });
  } catch (err) {
    console.error(err);
    alert("Login failed.");
  }
};

axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;

</script>

<template>
  <div class="min-h-screen bg-black flex flex-col justify-center items-center p-4">
    <div class="w-full max-w-md bg-white rounded-lg shadow-md p-8">
      <h2 class="text-3xl font-bold text-center text-black mb-8">Login</h2>
      <form @submit.prevent="handleLogin">
        <div class="mb-6">
          <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            id="email"
            v-model="email"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-500"
            placeholder="you@example.com"
            required />
        </div>
        <div class="mb-8">
          <label for="password" class="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <div class="relative">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="password"
              class="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-500"
              placeholder="••••••••"
              required />
            <button
              type="button"
              @click="togglePasswordVisibility"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-600 hover:text-gray-800 focus:outline-none"
              aria-label="Toggle password visibility">
              <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            </button>
          </div>
        </div>
        <button
          type="submit"
          class="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-opacity-50 transition duration-150 ease-in-out">
          Login
        </button>
      </form>
    </div>
    <p class="mt-8 text-center text-sm text-gray-400">
      Don't have an account?
      <a href="#" class="font-medium text-gray-300 hover:text-white">Sign up</a>
    </p>
  </div>
</template>

<style scoped>
</style>
