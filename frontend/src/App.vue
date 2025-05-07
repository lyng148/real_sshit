<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import AppLayout from './components/layout/AppLayout.vue'
</script>

<template>
  <AppLayout>
    <router-view />
  </AppLayout>
</template>

<style>
/* Remove all constraints on width */
</style>
