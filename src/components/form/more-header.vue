<template>
  <div class="more-header">
    <el-table-column
      :label="item.label"
      :prop="item.prop"
      :width="item.width"
      v-for="(item, index) in header"
      :key="index"
      align="center"
    >
      <more-header :header="item.children"></more-header>
    </el-table-column>
  </div>
</template>

<script>
export default {
  name: "more-header",
  props: {
    header: {
      type: Array
    }
  },
  data() {
    return {};
  }
};
</script>

<style lang="scss" scoped>
</style>