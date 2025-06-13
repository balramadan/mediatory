<!-- components/LoadingVideo.vue -->
<template>
  <div class="flex justify-center items-center p-4">
    <video 
      :width="width"
      :height="height"
      :class="videoClass"
      autoplay 
      loop 
      muted
      playsinline
    >
      <source :src="src">
      <source :src="fallbackSrc" type="video/mp4" v-if="fallbackSrc">
      <div class="loading-fallback">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    </video>
  </div>
</template>

<script lang="ts" setup>
interface Props {
  src: string
  fallbackSrc?: string
  width?: number
  height?: number
  videoClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  width: 64,
  height: 64,
  videoClass: 'object-cover rounded'
})
</script>