<template>
  <div>
    <decoration :src="proudImage" right="-75px" bottom="0" width="400px" max-width="75vw" />
    <decoration :src="tomatoJamImage" top="120px" right="0" width="100px" max-width="25vw" mirror />
    <decoration :src="tomatoJamImage" top="250px" left="0" width="150px" max-width="37.5vw" />
  </div>
</template>

<script setup lang="ts">
import proudImage from "@/assets/images/proud.png";
import tomatoJamImage from "@/assets/images/tomato-jam.png";
import Decoration from "@/components/decoration/index.vue";
</script>
