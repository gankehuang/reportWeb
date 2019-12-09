<template>
  <div ref="tableWrapper">
    <vxe-grid
      border
      resize
      stripe
      highlight-hover-row
      highlight-current-row
      ref="vxegrid"
      v-bind="$attrs"
      :height="tableHeight"
      :loading="loading"
      :columns="tableHead"
      :data="tableData">
    </vxe-grid>
  </div>
</template>

<script>
import $ from 'jquery'
import request from '@/utils/request'
export default {
  name: 'deepGridTable',
  props: {
    url: {
      type: String,
    },
    params: {
      type: Object
    },
    dataFormatter: {
      type: Function
    },
    show: {
      type: Boolean
    },
    tableHead: {
      type: Array
    },
    method: {
      type: String,
      default: () => 'get'
    },
    autoHeight: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      tableData: [],
      tableHeight: 500,
      loading: false,
      requestTime: 1000,
      firstLoaded: false
    }
  },
  methods: {
    initData () {
      if (new Date().getTime() - this.requestTime > 800) {
        this.loading = true
        request({
          url: this.url,
          method: this.method,
          params: this.params
        }).then(res => {
          this.loading = false
          if (this.dataFormatter) {
            this.tableData = this.dataFormatter(res.data, {...this.$props, ...this.$attrs})
          } else {
            this.tableData = res.data
          }
        }).catch(error => {
          console.log(error)
          this.loading = false
        })
        this.requestTime = new Date().getTime()
      }
    },
    computedHeight () {
      setTimeout(() => {
        const top = $(this.$refs.vxegrid.$el).offset().top || 0
        const height = document.body.clientHeight - top - 35
        // $(this.$refs.vxegrid.$el).find('.vxe-table--body-wrapper.body--wrapper').height(height + 'px')
        this.tableHeight = height
      },100)
    }
  },
  created() {
  },
  mounted() {
  },
  updated () {
    this.computedHeight()
  },
  watch: {
    params: {
      handler(val) {
        if (!this.firstLoaded && val) {
          this.initData()
          this.firstLoaded = true
        }
      },
      deep: true
    },
    url (val) {
    },
    autoHeight (val) {
      this.computedHeight()
    }
  }
}
</script>

<style scoped>

</style>
