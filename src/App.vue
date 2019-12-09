<template>
  <div id="app">
    <router-view/>
    <orgDialog ref="orgDialog"></orgDialog>
  </div>
</template>

<script>
  import orgDialog from '@/components/orgDialog'
  import Vue from 'vue'

  export default {
    name: 'App',
    components: {
      orgDialog
    },
    mounted() {
      Vue.prototype.$orgDialog = this.$refs.orgDialog
    }
  }
</script>

<style lang="scss">
  .vxe-table .vxe-body--column:not(.col--ellipsis),
  .vxe-table .vxe-footer--column:not(.col--ellipsis),
  .vxe-table .vxe-header--column:not(.col--ellipsis) {
    padding: 6px 0 !important;
  }

  .vxe-table .vxe-body--column,
  .vxe-table .vxe-footer--column,
  .vxe-table .vxe-header--column {
    line-height: normal;
  }

  .vxe-table--header-wrapper {
    background-color: rgba(248, 248, 249, 1) !important;
  }

  .vxe-table .vxe-body--column.col--ellipsis,
  .vxe-table.vxe-editable .vxe-body--column,
  .vxe-table .vxe-footer--column.col--ellipsis,
  .vxe-table .vxe-header--column.col--ellipsis {
    height: 35px !important;
  }

  body {
    overflow-y: hidden;
  }

  .vxe-header--row th{
    text-align: center !important;
  }


  /*合计添加底色*/ 
  .vxe-table--footer-wrapper{
      background-color: rgba(255,253,243,1) !important;
  }
</style>
