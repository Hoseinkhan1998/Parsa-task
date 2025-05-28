<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from "vue";
import axios from "axios";

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
const videoContainerRef = ref(null);

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const selectQuality = (quality) => {
  selectedQuality.value = quality;
  sessionStorage.setItem("selectedQuality", quality);
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

const progress = ref(0);
const seek = (e) => {
  if (!videoRef.value) return;
  videoRef.value.currentTime = (e.target.value / 100) * videoRef.value.duration;
};
const updateProgress = () => {
  if (!videoRef.value?.duration) return;
  progress.value = (videoRef.value.currentTime / videoRef.value.duration) * 100;
};

const volume = ref(1);
const playbackRate = ref(1);

watch(volume, (v) => {
  if (videoRef.value) videoRef.value.volume = v;
});
watch(playbackRate, (r) => {
  if (videoRef.value) videoRef.value.playbackRate = r;
});

const toggleFullScreen = () => {
  const el = videoContainerRef.value;
  if (!el) return;
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    el.requestFullscreen();
  }
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

  const savedQuality = sessionStorage.getItem("selectedQuality");
  const defaultQ = savedQuality || movieData.value.qualities[2]?.quality.replace("p", "") || "";
  selectedQuality.value = defaultQ;
  currentSource.value = movieData.value.qualities.find((q) => q.quality === defaultQ + "p")?.url;
  if (videoRef.value) {
    videoRef.value.addEventListener("loadedmetadata", updateRemaining);
    videoRef.value.addEventListener("timeupdate", () => {
      updateRemaining();
      updateProgress();
    });
  }
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  videoRef.value.removeEventListener("loadedmetadata", updateRemaining);
  videoRef.value.removeEventListener("timeupdate", updateRemaining);
});

const otherMovies = ref([
  { title: "EL CAMINO", season: 1, part: 1, image: "/images/elcamino.png" },
  { title: "BREAKING BAD", season: 2, part: 3, image: "/images/breakingbad.png" },
  { title: "BETTER CALL SAUL", season: 1, part: 2, image: "/images/bettercallsaul.png" },
]);
</script>

<template>
  <div class="h-screen bg-neutral-800">
    <div class="grid grid-cols-12 gap-5 text-neutral-100 bg-neutral-800 lg:px-14 sm:px-5 overflow-y-auto py-10">
      <div class="lg:col-span-7 col-span-full flex flex-col">
        <!-- Name & quality -->
        <div ref="videoContainerRef" class="flex lg:flex-row justify-between lg:items-center flex-col items-start">
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
          <div class="flex items-center justify-between lg:mt-0 sm:mt-5 gap-5">
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
        <div ref="videoContainerRef" class="mt-8 relative rounded-lg overflow-hidden bg-black aspect-video">
          <video ref="videoRef" :src="currentSource" class="w-full h-full object-contain" @play="isPlaying = true" @pause="isPlaying = false"></video>
          <div class="absolute bottom-4 right-4 text-sm font-mono text-white bg-black/50 px-2 py-1 rounded">
            {{ remainingTime }}
          </div>          
          <div class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent flex items-center gap-3">
            <!-- Play / Pause -->
            <button @click="togglePlay" class="p-2 bg-neutral-700 rounded-full backdrop-blur">
              <svg v-if="!isPlaying" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="lg:size-6 size-4">
                <path fill-rule="evenodd" d="M18.75 12 5.25 21.213V2.787L18.75 12Z" clip-rule="evenodd" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="lg:size-6 size-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.25h3v13.5h-3V5.25zm10.5 0h3v13.5h-3V5.25z" />
              </svg>
            </button>
            <!-- Rewind 10s -->
            <button @click="skip(-10)" class="p-2 bg-neutral-700 rounded-full backdrop-blur">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="lg:size-6 size-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12.75 19.5 4.5 12l8.25-7.5v15zM19.5 19.5 11.25 12l8.25-7.5v15z" />
              </svg>
            </button>
            <!-- Forward 10s -->
            <button @click="skip(10)" class="p-2 bg-neutral-700 rounded-full backdrop-blur">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="lg:size-6 size-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 4.5 19.5 12l-8.25 7.5V4.5zM4.5 4.5 12.75 12 4.5 19.5V4.5z" />
              </svg>
            </button>
            <!-- Volume -->
            <input type="range" min="0" max="1" step="0.01" v-model="volume" class="w-16" />

            <!-- Speed -->
            <select v-model="playbackRate" class="bg-neutral-700 p-1 lg:text-sm text-xs rounded">
              <option value="0.5">0.5×</option>
              <option value="1">1×</option>
              <option value="1.5">1.5×</option>
              <option value="2">2×</option>
            </select>

            <!-- Fullscreen -->
            <button @click="toggleFullScreen" class="p-2 bg-neutral-700 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" class=" size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M8.25 3H5.25A2.25 2.25 0 003 5.25v3M15.75 3h3A2.25 2.25 0 0121 5.25v3M8.25 21H5.25A2.25 2.25 0 013 18.75v-3M15.75 21h3A2.25 2.25 0 0021 18.75v-3" />
              </svg>
            </button>
          </div>
          <!-- Progress Bar -->
          <input type="range" min="0" max="100" step="0.1" :value="progress" @input="seek" class="w-full mt-2 absolute bottom-0" />
        </div>
        <!-- Details -->
        <div class="flex flex-col gap-2 mt-5">
          <div class="flex items-center justify-between">
            <p>
              <span class="lg:text-lg lg:font-semibold">movie Id:</span> <span class="sm:text-sm">{{ movieData?.movieId }}</span>
            </p>
            <p>
              <span class="lg:text-lg lg:font-semibold">release:</span> <span class="sm:text-sm">{{ movieData?.releaseYear }}</span>
            </p>
            <p>
              <span class="lg:text-lg lg:font-semibold">rating:</span> <span class="sm:text-sm">{{ movieData?.rating }}</span>
            </p>
          </div>
          <p>
            <span class="lg:text-lg lg:font-semibold capitalize">description:</span> <span class="sm:text-sm"> {{ movieData?.description }}</span>
          </p>
        </div>
      </div>
      <!-- other movies -->
      <div class="lg:col-span-5 col-span-full flex flex-col lg:mt-[85px] sm:mt-10 gap-3">
        <div v-for="movie in otherMovies" :key="movie.title" class="flex items-center gap-2">
          <div class="relative rounded-lg overflow-hidden bg-black h-36 w-28">
            <img :src="movie.image" class="w-full h-full object-cover mx-auto" :alt="movie.title" />
          </div>
          <div class="flex flex-col gap-3">
            <p>{{ movie.title }}</p>
            <div class="flex items-center gap-10">
              <p>season {{ movie.season }}</p>
              <p>part {{ movie.part }}</p>
            </div>
            <div class="flex items-center gap-1">
              <div class="bg-[#FB7800] flex items-center justify-center h-7 w-7 rounded-lg">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clip-path="url(#clip0_8937_3306)">
                    <path
                      d="M12.3944 6.07272C12.3512 6.01866 12.2989 6.02928 12.2715 6.04031C12.2485 6.04963 12.1959 6.07938 12.2032 6.15394C12.2119 6.24347 12.2168 6.33475 12.2178 6.42528C12.2217 6.80084 12.071 7.16878 11.8044 7.43475C11.5396 7.699 11.1912 7.84138 10.8203 7.83725C10.3136 7.83078 9.89332 7.5665 9.60492 7.07297C9.36645 6.66488 9.47126 6.13853 9.58223 5.58125C9.64717 5.25506 9.71432 4.91775 9.71432 4.59672C9.71432 2.09706 8.03388 0.654938 7.0322 0.0177813C7.01148 0.004625 6.99176 0 6.97429 0C6.94588 0 6.92338 0.01225 6.91229 0.01975C6.89079 0.0343125 6.85638 0.0675 6.86745 0.12625C7.25032 2.15944 6.10832 3.38228 4.89926 4.67691C3.65301 6.01138 2.24048 7.52391 2.24048 10.2518C2.24048 13.4214 4.81913 16.0001 7.98876 16.0001C10.5985 16.0001 12.8995 14.1806 13.5842 11.5754C14.0512 9.79903 13.5619 7.53628 12.3944 6.07272ZM8.13217 14.7731C7.33848 14.8093 6.58367 14.5246 6.00713 13.9734C5.43679 13.428 5.10967 12.6669 5.10967 11.8852C5.10967 10.4183 5.67054 9.34144 7.1791 7.91181C7.20379 7.88841 7.22907 7.881 7.2511 7.881C7.27107 7.881 7.28838 7.88709 7.30029 7.89281C7.32538 7.90491 7.36663 7.93484 7.36107 7.99959C7.30713 8.62725 7.30807 9.14822 7.36382 9.54809C7.50632 10.5695 8.25404 11.2558 9.22451 11.2558C9.70032 11.2558 10.1535 11.0767 10.5007 10.7516C10.5141 10.7387 10.5304 10.7293 10.5483 10.7242C10.5662 10.7191 10.585 10.7184 10.6032 10.7223C10.6261 10.7272 10.6567 10.7412 10.6727 10.7799C10.8166 11.1274 10.8902 11.4963 10.8913 11.8763C10.8959 13.4052 9.65817 14.7047 8.13217 14.7731Z"
                      fill="white" />
                  </g>
                  <defs>
                    <clipPath id="clip0_8937_3306">
                      <rect width="20" height="20" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </div>
              <div class="bg-[#245DEF] flex items-center justify-center h-7 w-20 gap-1 rounded-lg">
                <svg class="size-6" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12.5024 14.6502H3.49753C3.11733 14.6948 2.73208 14.6518 2.37062 14.5244C2.00915 14.397 1.68081 14.1884 1.41017 13.9143C1.13953 13.6402 0.933588 13.3077 0.807751 12.9417C0.681915 12.5756 0.639441 12.1854 0.683508 11.8004V4.2009C0.639441 3.81586 0.681915 3.42572 0.807751 3.05965C0.933588 2.69358 1.13953 2.36107 1.41017 2.08699C1.68081 1.8129 2.00915 1.60434 2.37062 1.4769C2.73208 1.34947 3.11733 1.30645 3.49753 1.35108H12.5024C12.8826 1.30645 13.2678 1.34947 13.6293 1.4769C13.9908 1.60434 14.3191 1.8129 14.5897 2.08699C14.8604 2.36107 15.0663 2.69358 15.1922 3.05965C15.318 3.42572 15.3605 3.81586 15.3164 4.2009V11.8004C15.3605 12.1854 15.318 12.5756 15.1922 12.9417C15.0663 13.3077 14.8604 13.6402 14.5897 13.9143C14.3191 14.1884 13.9908 14.397 13.6293 14.5244C13.2678 14.6518 12.8826 14.6948 12.5024 14.6502ZM3.49753 2.49101C2.31414 2.49101 1.80912 3.00245 1.80912 4.2009V11.8004C1.80912 12.9988 2.31414 13.5103 3.49753 13.5103H12.5024C13.6858 13.5103 14.1908 12.9988 14.1908 11.8004V4.2009C14.1908 3.00245 13.6858 2.49101 12.5024 2.49101H3.49753ZM12.3148 8.57061H11.1892C11.1892 8.77217 11.1101 8.96546 10.9694 9.10798C10.8287 9.2505 10.6378 9.33057 10.4388 9.33057C10.2398 9.33057 10.0489 9.2505 9.90816 9.10798C9.76743 8.96546 9.68837 8.77217 9.68837 8.57061V7.43069C9.68837 7.22914 9.76743 7.03584 9.90816 6.89332C10.0489 6.7508 10.2398 6.67074 10.4388 6.67074C10.6378 6.67074 10.8287 6.7508 10.9694 6.89332C11.1101 7.03584 11.1892 7.22914 11.1892 7.43069H12.3148C12.3148 6.92681 12.1171 6.44357 11.7653 6.08727C11.4135 5.73098 10.9363 5.53081 10.4388 5.53081C9.94123 5.53081 9.46406 5.73098 9.11224 6.08727C8.76041 6.44357 8.56276 6.92681 8.56276 7.43069V8.57061C8.56276 9.07449 8.76041 9.55773 9.11224 9.91403C9.46406 10.2703 9.94123 10.4705 10.4388 10.4705C10.9363 10.4705 11.4135 10.2703 11.7653 9.91403C12.1171 9.55773 12.3148 9.07449 12.3148 8.57061ZM7.43716 8.57061H6.31155C6.31155 8.77217 6.23249 8.96546 6.09176 9.10798C5.95103 9.2505 5.76016 9.33057 5.56114 9.33057C5.36212 9.33057 5.17125 9.2505 5.03053 9.10798C4.8898 8.96546 4.81074 8.77217 4.81074 8.57061V7.43069C4.81074 7.22914 4.8898 7.03584 5.03053 6.89332C5.17125 6.7508 5.36212 6.67074 5.56114 6.67074C5.76016 6.67074 5.95103 6.7508 6.09176 6.89332C6.23249 7.03584 6.31155 7.22914 6.31155 7.43069H7.43716C7.43716 6.92681 7.2395 6.44357 6.88768 6.08727C6.53586 5.73098 6.05869 5.53081 5.56114 5.53081C5.06359 5.53081 4.58642 5.73098 4.2346 6.08727C3.88278 6.44357 3.68513 6.92681 3.68513 7.43069V8.57061C3.68513 9.07449 3.88278 9.55773 4.2346 9.91403C4.58642 10.2703 5.06359 10.4705 5.56114 10.4705C6.05869 10.4705 6.53586 10.2703 6.88768 9.91403C7.2395 9.55773 7.43716 9.07449 7.43716 8.57061Z"
                    fill="white" />
                </svg>
                <p class="text-sm mt-1">subtitle</p>
              </div>
              <div class="bg-[#43B100] flex items-center justify-center h-7 w-20 gap-1 rounded-lg">
                <svg class="size-6" viewBox="0 0 12 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M2.83337 3.99967C2.83337 2.2502 4.25056 0.833008 6.00004 0.833008C7.74952 0.833008 9.16671 2.2502 9.16671 3.99967V7.66634C9.16671 9.41582 7.74952 10.833 6.00004 10.833C4.25056 10.833 2.83337 9.41582 2.83337 7.66634V3.99967ZM6.00004 1.83301C4.80285 1.83301 3.83337 2.80248 3.83337 3.99967V7.66634C3.83337 8.86353 4.80285 9.83301 6.00004 9.83301C7.19723 9.83301 8.16671 8.86353 8.16671 7.66634V3.99967C8.16671 2.80248 7.19723 1.83301 6.00004 1.83301Z"
                    fill="white" />
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M0.89978 5.93262C1.17592 5.93262 1.39978 6.15647 1.39978 6.43262V7.56595C1.39978 10.1031 3.46259 12.166 5.99978 12.166C8.53697 12.166 10.5998 10.1031 10.5998 7.56595V6.43262C10.5998 6.15647 10.8236 5.93262 11.0998 5.93262C11.3759 5.93262 11.5998 6.15647 11.5998 6.43262V7.56595C11.5998 10.6554 9.08926 13.166 5.99978 13.166C2.9103 13.166 0.39978 10.6554 0.39978 7.56595V6.43262C0.39978 6.15647 0.623638 5.93262 0.89978 5.93262Z"
                    fill="white" />
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M6.75434 4.75553C6.26547 4.57628 5.73413 4.57628 5.24526 4.75553C4.986 4.8506 4.69876 4.71748 4.6037 4.45822C4.50863 4.19896 4.64174 3.91172 4.90101 3.81666C5.61214 3.55591 6.38746 3.55591 7.0986 3.81666C7.35786 3.91172 7.49097 4.19896 7.39591 4.45822C7.30084 4.71748 7.0136 4.8506 6.75434 4.75553Z"
                    fill="white" />
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M6.41207 6.1833C6.14243 6.11208 5.86377 6.11208 5.59413 6.1833C5.32714 6.25383 5.05354 6.09456 4.98301 5.82758C4.91249 5.56059 5.07175 5.28699 5.33874 5.21646C5.77576 5.10102 6.23043 5.10102 6.66746 5.21646C6.93445 5.28699 7.09371 5.56059 7.02319 5.82758C6.95266 6.09456 6.67906 6.25383 6.41207 6.1833Z"
                    fill="white" />
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M6 12.166C6.27614 12.166 6.5 12.3899 6.5 12.666V14.666C6.5 14.9422 6.27614 15.166 6 15.166C5.72386 15.166 5.5 14.9422 5.5 14.666V12.666C5.5 12.3899 5.72386 12.166 6 12.166Z"
                    fill="white" />
                </svg>
                <p class="text-sm mt-1">dubed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
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
