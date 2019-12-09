<template>
  <div>
    <el-dialog :width="changeRem(width)" :title="title" :visible.sync="visible" append-to-body>
      <el-input
        :validate-event="false"
        placeholder="请输入关键字"
        v-model="keyword" @keyup.enter.native="search">
        <i slot="suffix" class="el-input__icon el-icon-search cursor" @click="search"></i>
      </el-input>
     <div class="option-box">
       <el-scrollbar>
         <ul class="drawing-list-wrap" v-if="!multiple">
           <li class="list-item" :class="setClass(item)" v-for="(item, index) in dataList" @click="picker(item)" :key="index">
             <slot v-bind:row="item">
               <template>
                 {{ getName(item) }}
               </template>
             </slot>
           </li>
         </ul>
        <div class="drawing-list-wrap"  v-else>
          <el-checkbox-group v-model="checkedValues">
            <el-checkbox v-for="(item, index) in dataList" :label="item" :key="index">
              {{ getName(item) }}
            </el-checkbox>
          </el-checkbox-group>
        </div>
       </el-scrollbar>
     </div>
      <div slot="footer" class="dialog-footer clearfix">
         <span class="page-box" v-if="total">
           <el-pagination
             :current-page.sync="currentPage"
             :page-size="20"
             layout="prev, pager, next, jumper"
             :total="total">
            </el-pagination>
         </span>
        <span class="btn-box">
          <el-button @click="visible = false" size="small">取 消</el-button>
          <el-button type="primary" size="small" @click="confirm">确 定</el-button>
        </span>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'
export default {
  name: 'searchBox',
  props: {
    visibleValue: {
      required: true,
      type: Boolean
    },
    width: {
      default: '750px'
    },
    url: {
      required: true,
      type: String
    },
    params: Object, // 请求参数
    title: {
      default: '搜索'
    },
    searchKey: { // 查询请求的key
      default: 'nameOrNumber'
    },
    props: {
      type: Object,
      default: () => ({
        label: 'label',
        value: 'value'
      })
    },
    multiple: Boolean, // 是否多选
    pathPage: Boolean, // 分页参数是否在url上 格式：url/pageSize/page,
    labelFields: Array // 下拉选项显示字段
  },
  data() {
    return {
      keyword: '',
      visible: false,
      dataList: [],
      activeItem: {},
      checkedValues: [],
      currentPage: 1,
      total: 0
    }
  },
  created() {
    if (this.url) {
      this.search()
    }
  },
  methods: {
    search (url = this.url) {
      const param = this.params || {}
      param[this.searchKey] = this.keyword
      request({
        url: url,
        method: this.$attrs.method || 'get',
        params: param,
        data: param
      }).then(res => {
        if (res.data && res.data.list && res.data.list instanceof Array) {
          this.dataList = res.data.list || []
          this.total = res.data.total || 0
        } else if (res.data instanceof Array && res.data.length) {
          this.dataList = res.data || []
        }
      })
    },
    picker (item) {
      this.activeItem = item
      this.confirm()
    },
    confirm() {
      if (!this.multiple) {
        this.$emit('change',this.activeItem[this.props.value])
        this.$emit('input',this.activeItem[this.props.value])
        this.$emit('dataChange',this.activeItem)
      } else {
        const values = this.checkedValues.map(i => i[this.props.value])
        this.$emit('change',values)
        this.$emit('input',values)
        this.$emit('dataChange',this.checkedValues)
      }
      this.visible = false
    },
    // 显示的内容
    getName (item) {
      if (this.labelFields.length) {
        return this.labelFields.map(i => item[i]).join(" ")
      } else {
        return item[this.props.label]
      }
    },
    setClass(item) {
      if (this.activeItem[this.props.value] === item[this.props.value]) {
        return 'active-item'
      }
      return ''
    },
    changeRem(number) {
      return (parseFloat(number) * Math.min(this.$scale, 1)) + 'px'
    }
  },
  watch: {
    visibleValue: {
      handler (val) {
        if (val !== this.visible) this.visible = val
      },
      immediate: true
    },
    visible (val) {
      if (this.visibleValue !== val) this.$emit('update:visibleValue', val)
    },
    keyword() {
      this.search()
    },
    currentPage(val) {
      this.params.page = val
      this.params.pageNum = val
      if (this.pathPage) {
        const url = this.url.substring(0,this.url.lastIndexOf('/')+1) + val
        this.search(url)
      } else {
        this.search()
      }
    }
  }
}
</script>

<style scoped lang="scss">
  .option-box {
    height: 300px;
  }
  .drawing-list-wrap{
    padding: 0px;
    height: 300px;
    .list-item{
      list-style: none;
      margin: 0;
      cursor: pointer;
      padding: 12px 0 12px 5px;
      transition: all .3s ease-in;
      &:hover{
        background-color: #F5F7FA;
      }
      &:active {
        background-color: #409EFF;
      }
      border-bottom: 1px solid #f4f5f6;
    }
    .active-item {
      color: #409EFF;
    }
    /deep/ .el-checkbox {
      display: inherit;
      margin: 0;
      padding: 12px 0 12px 5px;
      transition: all .3s ease-in;
    }
  }
  /deep/.el-scrollbar__wrap{
    overflow-x: hidden;
  }
  /deep/ .el-icon-circle-check {
    display: none;
  }
.cursor{
  cursor: pointer;
}
  .dialog-footer {
    width: 100%;
    .page-box {
      float: left;
    }
    .btn-box {
      float: right;
    }
  }
</style>
