<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from "vue";
import axios from "axios";

onMounted(async () => {
  try {
    const response = await axios.get("https://6835cde6cd78db2058c33d5f.mockapi.io/movies");
    console.log("Movie API Response:", response.data);
  } catch (error) {
    console.error("Error", error);
  }
});

const remainingTime = ref("00:00");
const formatTime = (time) => {
  const minutes = Math.floor(time / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(time % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
};

const movieData = ref(null);
const qualities = computed(() => movieData.value?.qualities.map((q) => ({ quality: q.quality.replace("p", ""), url: q.url })) || []);

const selectedQuality = ref("");
const isDropdownOpen = ref(false);
const dropdownRef = ref(null);

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const selectQuality = (quality) => {
  selectedQuality.value = quality;
  isDropdownOpen.value = false;
  changeSourceToQuality(quality);
};

const handleClickOutside = (e) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    isDropdownOpen.value = false;
  }
};

const videoRef = ref(null);
const isPlaying = ref(false);
const currentSource = ref("");

const updateRemaining = () => {
  if (!videoRef.value?.duration) return;
  const rem = videoRef.value.duration - videoRef.value.currentTime;
  remainingTime.value = formatTime(rem);
};

const changeSourceToQuality = (quality) => {
  const match = qualities.value.find((q) => q.quality === quality);
  if (!match || !videoRef.value) return;
  const currentTime = videoRef.value.currentTime || 0;
  currentSource.value = match.url;
  nextTick(() => {
    videoRef.value.currentTime = currentTime;
    if (isPlaying.value) videoRef.value.play();
  });
};

const togglePlay = () => {
  if (!videoRef.value) return;
  if (videoRef.value.paused) {
    videoRef.value.play();
  } else {
    videoRef.value.pause();
  }
};
const skip = (sec) => {
  if (videoRef.value) videoRef.value.currentTime += sec;
};

onMounted(async () => {
  document.addEventListener("click", handleClickOutside);
  const cached = sessionStorage.getItem("movieData");
  if (cached) {
    movieData.value = JSON.parse(cached);
  } else {
    try {
      const res = await axios.get("https://6835cde6cd78db2058c33d5f.mockapi.io/movies");
      movieData.value = res.data[0];
      sessionStorage.setItem("movieData", JSON.stringify(movieData.value));
    } catch (err) {
      console.error("Error fetching movie:", err);
    }
  }
  const defaultQ = movieData.value.qualities[2]?.quality.replace("p", "") || "";
  selectedQuality.value = defaultQ;
  currentSource.value = movieData.value.qualities.find((q) => q.quality === defaultQ + "p")?.url;

  videoRef.value.addEventListener("loadedmetadata", updateRemaining);
  videoRef.value.addEventListener("timeupdate", updateRemaining);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  videoRef.value.removeEventListener("loadedmetadata", updateRemaining);
  videoRef.value.removeEventListener("timeupdate", updateRemaining);
});
</script>

<template>
  <div class="grid grid-cols-12 text-neutral-100 bg-neutral-800 h-screen px-20 pt-10">
    <!-- Name & quality -->
    <div class="col-span-7 flex justify-between items-center">
      <div class="flex items-center gap-2">
        <!-- show quality -->
        <div class="flex flex-col justify-center rounded-lg items-center bg-red-700 p-1 !px-[2px]">
          <div class="w-10 text-sm bg-neutral-100 text-red-700 rounded-[4px] flex items-center justify-center">{{ selectedQuality }}</div>
          <p class="text-neutral-100 text-sm mt-1">WebDL</p>
        </div>
        <!-- name -->
        <div class="flex flex-col">
          <p class="text-2xl font-semibold uppercase">{{ movieData?.title }}</p>
          <p class="text-sm">{{ movieData?.description }}</p>
        </div>
      </div>
      <div class="flex items-center gap-5">
        <!-- Season & Part -->
        <div class="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z" />
          </svg>
            <p>Season 2 Episode 5</p>
        </div>
        <!-- Quality dropdown -->
        <div class="dropdown" ref="dropdownRef">
          <div tabindex="0" role="button" class="bg-neutral-700 flex items-center gap-3 py-2 px-4 rounded-lg" @click="toggleDropdown">
            <div class="flex items-center">
              <p class="me-2">quality</p>
              {{ selectedQuality }}
              <p>p</p>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="size-6 transition-transform duration-300"
              :class="{ 'rotate-180': isDropdownOpen }">
              <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
          <!-- Quality List -->
          <ul tabindex="0" class="dropdown-content menu bg-neutral-700 mt-2 rounded-b-lg z-20 w-52 p-2 shadow-sm" v-show="isDropdownOpen">
            <li v-for="q in qualities" :key="q.quality">
              <a @click="selectQuality(q.quality)">{{ q.quality }} webDL</a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Player -->
    <div class="col-span-7 mt-8 h-[60vh] relative rounded-xl overflow-hidden bg-black">
      <video ref="videoRef" :src="currentSource" class="w-full h-full object-cover" @play="isPlaying = true" @pause="isPlaying = false"></video>
      <div class="absolute bottom-4 right-4 text-sm font-mono text-white bg-black/50 px-2 py-1 rounded">
        {{ remainingTime }}
      </div>
      <!-- کنترل‌ها -->
      <div class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent flex items-center gap-4">
        <!-- Play / Pause -->
        <button @click="togglePlay" class="p-2 bg-neutral-700 rounded-full backdrop-blur">
          <svg v-if="!isPlaying" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
            <path fill-rule="evenodd" d="M18.75 12 5.25 21.213V2.787L18.75 12Z" clip-rule="evenodd" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.25h3v13.5h-3V5.25zm10.5 0h3v13.5h-3V5.25z" />
          </svg>
        </button>
        <!-- Rewind 10s -->
        <button @click="skip(-10)" class="p-2 bg-neutral-700 rounded-full backdrop-blur">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12.75 19.5 4.5 12l8.25-7.5v15zM19.5 19.5 11.25 12l8.25-7.5v15z" />
          </svg>
        </button>
        <!-- Forward 10s -->
        <button @click="skip(10)" class="p-2 bg-neutral-700 rounded-full backdrop-blur">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 4.5 19.5 12l-8.25 7.5V4.5zM4.5 4.5 12.75 12 4.5 19.5V4.5z" />
          </svg>
        </button>
      </div>
    </div>
    <!-- Details -->
    <div class="col-span-7 flex flex-col gap-2 mt-5" dir="ltr">
      <div class="flex items-center justify-between">
        <p>
          <span class="text-lg font-semibold">movie Id:</span> <span>{{ movieData?.movieId }}</span>
        </p>
        <p>
          <span class="text-lg font-semibold">release:</span> <span>{{ movieData?.releaseYear }}</span>
        </p>
        <p>
          <span class="text-lg font-semibold">rating:</span> <span>{{ movieData?.rating }}</span>
        </p>
      </div>
      <p>
        <span class="text-lg font-semibold capitalize">description:</span> <span>{{ movieData?.description }}</span>
      </p>
    </div>
  </div>
</template>

<style>
.transition-transform {
  transition-property: transform;
}
.duration-300 {
  transition-duration: 300ms;
}
.rotate-180 {
  transform: rotate(180deg);
}
</style>
