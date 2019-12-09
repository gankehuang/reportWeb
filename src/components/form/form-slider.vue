<template>
  <el-slider
    :class="getClassName"
    v-bind="$attrs"
    v-on="$listeners"
    @input="limitScope"
    @change="limitScopeChange">
  </el-slider>
</template>

<script>
  export default {
    name: "form-slider",
    components: {},
    directives: {},
    filters: {},
    mixins: [],
    props: {
      status: [Number,String],
      overdueNumber: Number,  // 逾期天数
      // 限制范围
      limits: {
        type: Array,
        default:() => ([]),
        validator: function (value) {
          if (value.length && value[0] > 100) {
            console.error('数据范围的最小值不能大于100')
            return false
          }
          if (value.length === 2) {
            return value[0] < value[1]
          }
          return true
        }
      }
    },
    computed: {
      getClassName() {
        if (this.status == 0) {
          if (this.overdueNumber >= 3 && this.overdueNumber <= 7) {
            return 'is-overdue10' // 蓝色预警
          } else if (this.overdueNumber > 7 && this.overdueNumber <= 10) {
            return 'is-overdue7' // 黄色预警
          } else if (this.overdueNumber > 10) {
            return 'is-overdue3'  // 红色预警
          } else {
            return 'is-regular'
          }
        } else if (this.status == 1) {
          return 'is-regular'
        } else if (this.status == 2) {
          return 'is-outstrip'
        } else {
          return 'is-regular'
        }
      }
    },
    methods: {
      limitScope(val) {
        if (this.limits.length) {
          const min = this.limits[0]
          const max = this.limits[1] || 100
          if (val< min) {
            val = min
          }else if (val > max) {
            val = max
          }
        }
        this.$emit('input',val)
      },
      limitScopeChange(val) {
        if (this.limits.length) {
          const min = this.limits[0]
          const max = this.limits[1] || 100
          if (val< min) {
            val = min
          }else if (val > max) {
            val = max
          }
        }
        this.$emit('input',val)
        this.$emit('change',val)
      }
    }
  }
</script>

<style scoped lang="scss">
  $overdue7: #FFA626;
  $overdue3: #F56767;
  $overdue10: #497FE0;
  $regular: #45B9B0;
  $outstrip: #31C0FF;
  .is-overdue3 {
    /deep/ .el-slider__bar {
      background: $overdue3!important;
    }
    /deep/ .el-slider__button {
      border-color: $overdue3!important;
    }
  }
  .is-overdue7 {
    /deep/ .el-slider__bar {
      background: $overdue7!important;
    }
    /deep/ .el-slider__button {
      border-color: $overdue7!important;
    }
  }
  .is-overdue10 {
    /deep/ .el-slider__bar {
      background: $overdue10!important;
    }
    /deep/ .el-slider__button {
      border-color: $overdue10!important;
    }
  }
  .is-regular {
    /deep/ .el-slider__bar {
      background: $regular!important;
    }
    /deep/ .el-slider__button {
      border-color: $regular!important;
    }
  }
  .is-outstrip {
    /deep/ .el-slider__bar {
      background: $outstrip!important;
    }
    /deep/ .el-slider__button {
      border-color: $outstrip!important;
    }
  }
</style>