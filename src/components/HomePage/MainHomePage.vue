<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import VideoPlayer from "./VideoPlayer.vue"

</script>

<template>
  <div class="grid grid-cols-12 text-neutral-100 bg-neutral-800 h-screen">
    <div class="col-span-full lg:block hidden" id="contact">
      <VideoPlayer @handleDisplay="handleDisplay" />
    </div>
  </div>
</template>

<style></style>
