<template>
  <div class="select-data-container">
    <div class="select-box">
      <el-select
        v-model="labelValue"
        v-bind="$attrs"
        :disabled="disabled"
        :filterable="subType === 'select'"
        :popper-class="subType === 'select'?'':'select-tree'"
        :filter-method="searchAbel ? dataFilter : null"
        v-on="$listeners"
        @change="dataChange"
        clearable
        onmouseover="this.title = this.getElementsByClassName('el-input__inner')[0].value">
        <el-option
          v-for="o in mapSelectOptions"
          :key="o.value"
          :label="o.label"
          :value="o.value"
          :disabled="o.disabled">
          <template v-if="labelFields.length">
            <span v-for="(itm, index) in labelFields" :key="index">
              {{o[itm]}}
            </span>
          </template>
        </el-option>
      </el-select>
      <i class="icon el-icon-search" v-show="searchIconVisible" slot="suffix" @click.stop="alertDialog"></i>
    </div>
    <search-dialog
      v-if="subType === 'select'"
      :visibleValue.sync="dialogShow"
      :props="props"
      :url="url"
      :title="title"
      :options="optionsData"
      :params="params"
      :searchKey="searchKey"
      :labelFields="labelFields"
      v-bind="$attrs"
      v-on="$listeners"
      @dataChange='dialogDataChange'>
    </search-dialog>
    <person-dialog
      v-else
      :visibleValue.sync="dialogShow"
      :props="props"
      :url="url"
      :title="title"
      :options="optionsData"
      :params="params"
      :searchKey="searchKey"
      :labelFields="labelFields"
      v-bind="$attrs"
      v-on="$listeners"
      @dataChange='dialogDataChange'>
    </person-dialog>
  </div>
</template>

<script>
  import {getDict} from "@/api/projectManager/dict";

  export default {
    name: "FromSelectData",
    components: {
      'search-dialog': () => import('../dialog/searchDialog'),
      'person-dialog': () => import('../dialog/personDialog')
    },
    directives: {},
    filters: {},
    mixins: [],
    model: {
      prop: 'value',
      event: 'input'
    },
    props: {
      value: [String,Number,Array],
      filterable: Boolean,
      url: {
        type: String,
        default: ''
      }, // 请求地址
      params: {
        type: Object,
        default: () => ({})
      }, // 请求参数
      options: Array, // 选项
      props: {
        type: Object,
        default: () => ({
          label: 'label',
          value: 'value'
        })
      },
      title: {
        type: String,
        default: '数据选择'
      },
      disabled: Boolean,
      dataField: String, // 返回结果中显示的字段名
      // 弹出选则框类型 select treeSelect
      subType: {
        type: String,
        default: 'select'
      },
      labelText: [String,Number,Array], // 无下拉选项时显示的名称
      // 下拉选项显示字段
      labelFields: {
        type: Array,
        default: () => ([])
      },
      searchAbel: Boolean,  // 开启搜索
      searchKey: { // 查询请求的key
        default: 'nameOrNumber'
      },
      searchIconVisible: { // 显示搜索图标
        type: Boolean,
        default: true
      },
      searchDialogEnable: { // 是否开启显示搜索框
        type: Boolean,
        default: true
      },
      autoFirst: { // 是否自动选择第一个
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        optionsData: this.options || [],
        labelValue: '',
        dialogShow: false,
      }
    },
    computed: {
      mapSelectOptions() {
        const {label, value} = this.props
        const options = this.optionsData.map(item => {
          item.label = item[label]
          item.value = item[value]
          return item
        })
        if (options.findIndex(i => i[this.props.value] === this.value) === -1 && this.labelText) {
          const {label, value} = this.props
          const obj = {
            label: this.labelText,
            value: this.value,
          }
          this.$set(obj,label,this.labelText)
          this.$set(obj,value,this.value)
          options.push(obj)
        }
        return options
      }
    },
    watch: {
      value: {
        handler(val) {
          this.labelValue = val
        },
        immediate: true
      },
      url: {
        handler(val) {
         if (val && this.subType === 'select' && !this.$attrs.cascade) {
           this.getAsyncOptions()
         }
        },
        immediate: true
      },
      params: {
        handler(val,oldVal) {
          if (val !== oldVal && this.subType === 'select') {
            this.getAsyncOptions()
          }
        },
        deep: true
      }
    },
    methods: {
      // 获取选项数据
      getAsyncOptions() {
        getDict(this.url,this.params,this.$attrs.method).then(res => {
          if (res.status === 200) {
            if (res.data && res.data.list && res.data.list instanceof Array) {
              this.optionsData = res.data.list || []
              if (this.autoFirst) { // 自动选择第一个
                this.labelValue = res.data.list[0][this.props.value]
                this.dataChange(res.data.list[0][this.props.value])
                this.$emit('input', this.labelValue)
              }
            }else if (res.data instanceof Array && res.data.length) {
              this.optionsData = res.data || []
              if (this.autoFirst) {
                this.labelValue = res.data[0][this.props.value]
                this.dataChange(res.data[0][this.props.value])
                this.$emit('input', this.labelValue)
              }
            }else { // 防止查询条件更新后查不到数据的情况下 清空下拉列表
              this.optionsData = []
              this.labelValue = ''
            }
            if (this.dataField) {
              this.optionsData = this.optionsData.map(itm => itm[this.dataField])
            }
          }
        })
      },
      // 弹出选择框
      alertDialog() {
        if (!this.searchDialogEnable) return
        if (!this.disabled) {
          this.dialogShow = true
        }
      },
      // dataChange 事件 返回选中的对象
      dataChange(val) {
        const {value} = this.props
        this.$emit('dataChange',this.optionsData.find(i => i[value] === val))
      },
      // change事件
      dialogDataChange(data) {
        const {value} = this.props
        if (this.$attrs.multiple && data instanceof Array && data.length) {
          data.forEach(itm => {
            if (this.optionsData.findIndex(i => i[value] === itm[value] ) === -1) {
              this.optionsData.push(itm)
            }
          })
        }else {
          if (this.optionsData.findIndex(i => i[value] === data[value] ) === -1) {
            this.optionsData.push(data)
          }
        }
      },
      // 搜索数据
      dataFilter(val) {
        this.$set(this.params,this.searchKey,val)
        this.getAsyncOptions()
      }
    }
  }
</script>

<style scoped lang="scss">
  .select-data-container {
    position: relative;
    /deep/ .el-input {
      &:hover {
        cursor: pointer;
      }
      input {
        &:hover {
          cursor: pointer;
        }
      }
    }
    .select-box {
      position: relative;
      .icon {
        cursor: pointer;
        color: #C0C4CC;
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
      }
    }
    /deep/ .el-select {
      width: 100%;
      height: 100%;
      position: relative;
      .el-input__suffix {
        display: none;
        .el-icon-arrow-up{
          display: none;
        }
      }
      &:hover .el-input__suffix{
        display: inline;
        margin-right: 16px;
      }
    }
    /deep/ .is-disabled .el-input__inner{
      color: #4D4D4D;
    }
  }

</style>
<style lang="scss">
  .select-tree {
    display: none;
  }
</style>
