<template>
  <div>
    <keep-alive :include="cachedViews">
      <router-view :key="key" />
    </keep-alive>
  </div>
</template>

<script>
  export default {
    name: 'publicReport',
    computed: {
      cachedViews() {
        return this.$store.state.tagsView.cachedViews
      },
      key() {
        return this.$route.path
      }
    },
    data() {
      return {
      }
    },

  }
</script>

<style lang="scss" scoped>

</style>
