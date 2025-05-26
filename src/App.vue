<script setup></script>

<template>
  <div class="grid grid-cols-12 relative">
    <div class="col-span-full">
      <router-view></router-view>
    </div>
  </div>
</template>

<style>
@font-face {
  font-family: "IRANSansX";
  src: url("/IRANSansX-Regular.woff") format("woff");
  font-weight: normal;
  font-style: normal;
}
body {
  font-family: "IRANSansX", sans-serif;
}
html.dark {
  color-scheme: dark;
}
</style>
