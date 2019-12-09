<template>
  <div class="search_wrap">
    <el-select
      style="width:100%;"
      v-model="select"
      filterable
      reserve-keyword
      placeholder="请输入关键词"
      v-bind="$attrs"
      :remote-method="queryMethod"
      :disabled="disabled"
      @change="change"
      :loading="loading">
      <el-option
        v-for="item in options"
        :key="getKey(item)"
        :label="getLabel(item)"
        :value="getKey(item)">
      </el-option>
    </el-select>
<!--    <i class="icon el-icon-search" @click.stop="alertDialog"></i>-->
  </div>
</template>

<script>
import request from '@/utils/request'
export default {
  name: 'searchSelector',
  props: {
    value: {
      required: true
    },
    url: {
      required: true
    },
    params: {
      type: Object, // 搜索时的额外参数
      default: () => {}
    },
    searchName: {
      default: 'name',
      type: String
    },
    valueKey: { // valuekey
      default: 'id'
    },
    labelKey: { // labelkey
      default: 'name'
    },
    formatter: {
      type: Function
    },
    defaultLabel: {
      type: String
    },
    disabled: {
      type: Boolean,
      default: false
    },
    defaultValue: {
      type: [String, Number]
    },
    syncLabelName: { // 双向绑定下拉name
      type: String
    }
  },
  data() {
    return {
      select: '',
      options: [],
      loading: false
    }
  },
  methods: {
    queryMethod (query, type = 'init') {
      this.loading = true
      let params = {}
      if (this.params) {
        params = {
          ...this.params // 额外参数
        }
      }
      params[this.searchName] = query // 查询参数
      request({
        url: this.url,
        params: params
      }).then((res) => {
        console.log(`${type} end`)
        if (this.formatter) {
          this.options = this.formatter(res.data)
        } else {
          this.options = res.data
        }
        this.loading = false
      }).catch(error => {
        this.loading = false
      })
    },
    change (val) {
      const obj = this.options.find(item => item[this.valueKey] === val)
      this.$emit('change', obj)
      this.$emit('update:syncLabelName', obj[this.labelKey])
    },
    getKey (item) {
      return item[this.valueKey]
    },
    getLabel (item){
      return item[this.labelKey]
    },
    alertDialog () {
      // this.$emit('alertDilog')
    },
    initDefault () {
      this.$nextTick(() => {
        if (this.defaultLabel && this.defaultValue) {
          this.loading = true
          let params = {}
          if (this.params) {
            params = {
              ...this.params // 额外参数
            }
          }
          request({
            url: this.url,
            params: params
          }).then((res) => {
            if (this.formatter) {
              this.options = this.formatter(res.data)
            } else {
              this.options = res.data
            }
            this.select = this.defaultValue
            this.loading = false
          }).catch(error => {
            this.loading = false
          })
        }
      })
    }
  },
  mounted() {
    this.initDefault()
    this.queryMethod()
  },
  watch: {
    value: {
      handler (val) {
        if(val !== this.select) this.select = val
      },
      // immediate: true
    },
    select (val) {
      if(val !== this.value) this.$emit('input', val)
    },
    params (val) {
      this.queryMethod()
    },
    data: {
      handler (val) {
        if (val){
          setTimeout(() => { // 解决change比init初始化慢的问题
            this.queryMethod('', 'changed')
          },500)
        }
      },
      immediate: true,
      deep: true
    },
    defaultLabel (val) {
      this.initDefault()
    },
    defaultValue (val) {
      this.initDefault()
    }
  }
}
</script>

<style scoped lang="scss">
.search_wrap {
  position: relative;
  font-size: 10px;
  width: auto;
  .icon {
    color: #C0C4CC;
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
  }
}
</style>
