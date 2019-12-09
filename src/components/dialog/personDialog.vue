<template>
  <div>
    <el-dialog :width="changeRem(width)" :title="title" :visible.sync="visible" append-to-body>
      <el-input
        :validate-event="false"
        placeholder="请输入关键字"
        v-model="keyword" @keyup.enter.native="search">
        <i slot="suffix" class="el-input__icon el-icon-search cursor" @click="search"></i>
      </el-input>
     <div class="option-box org-box">
         <div class="tree-left">
           <el-scrollbar>
           <el-tree
             ref="elTree"
             :data="treeData"
             :props="props"
             :check-strictly="checkStrictly"
             :node-key="props.value"
             show-checkbox
             highlight-current
             :filter-node-method="filterNodeMethod || filterNode"
             @check="dataCheck"
             v-bind="$attrs"
             v-on="$listeners">
           </el-tree>
           </el-scrollbar>
         </div>
        <div class="midden-icon">
          <div class="icon">
            <i class="el-icon-arrow-right"></i>
          </div>
        </div>
        <div class="checked-right">
          <el-tag
            v-for="(item,index) in getCheckedNodes"
            :key="index"
            size="small"
            closable
            @close="rmCheckedNode(index)">
            {{item}}
          </el-tag>
       </div>
     </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="visible = false" size="small">取 消</el-button>
        <el-button type="primary" size="small" @click="confirm" :disabled="!checkedNodes.length">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'

export default {
  name: 'personDialog',
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
    title: {
      default: '选择人员'
    },
    props: {
      type: Object,
      default: () => ({
        label: 'label',
        value: 'value',
        children: 'children'
      })
    },
    checkStrictly: {
      type: Boolean,
      default: true
    },
    filterNodeMethod: {
      type: Function,
      default: null
    },
    multiple: Boolean, // 是否多选
    labelFields: Array // 下拉选项显示字段
  },
  data() {
    return {
      keyword: '',
      visible: true,
      checkedNodes: [],
      treeData: []
    }
  },
  computed: {
    getCheckedNodes() {
      return this.checkedNodes.map(i => i[this.props.label])
    }
  },
  created() {
    if (this.url) {
      request({
        url: this.url,
        method: this.$attrs.method ||'get',
      }).then(res => {
        this.treeData = res.data.list || res.data || []
      })
    }
  },
  methods: {
    search () {
      this.$refs.elTree.filter(this.keyword);
    },
    confirm() {
      let value = ''
      if (this.multiple) {
        value = this.checkedNodes.map(i => i[this.props.value])
        this.$emit('dataChange',this.checkedNodes)
      } else {
        value = this.checkedNodes.map(i => i[this.props.value])[0]
        this.$emit('dataChange',this.checkedNodes[0])
      }
      this.$emit('change',value)
      this.$emit('input',value)
      this.visible = false
    },
    dataCheck(data,{checkedNodes}) {
      if (this.multiple) {
        this.checkedNodes = checkedNodes
      }else {
        this.checkedNodes = []
        this.checkedNodes.push(data)
        this.$refs.elTree.setCheckedNodes(this.checkedNodes)
      }
    },
    filterNode(value, data) {
      if (!value) return true;
      return data[this.props.label].includes(value);
    },
    rmCheckedNode(index) {
      this.checkedNodes.splice(index,1)
      this.$refs.elTree.setCheckedNodes(this.checkedNodes)
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
    }
  }
}
</script>

<style scoped lang="scss">
  .drawing-list-wrap{
    padding: 0px;
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
  }
  /deep/ .el-dialog__body {
    padding-top: 20px;
    padding-bottom: 0;
  }
  /deep/.el-scrollbar__wrap{
    overflow-x: hidden;
  }
  /deep/ .el-icon-circle-check {
    display: none;
  }
  .org-box {
    margin-top: 20px;
    display: flex;
    justify-content: space-between;
    .tree-left {
      flex: 3;
      border-radius: 3px;
      border: solid 1px #EBEEF3;
      height: 322px;
    }
    /deep/ .el-tree {
      height: 320px;
    }
    .midden-icon {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 80px;
      .icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #EDF0F5;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #B6BCC9;
      }
    }
    .checked-right {
      flex: 1;
      min-width: 200px;
      padding: 10px;
      border-radius: 3px;
      border: solid 1px #EBEEF3;
      height: 322px;
      .el-tag {
        margin: 5px;
      }
    }
  }
  /deep/ .el-tree-node__content {
    height: 30px;
    line-height: 30px;
  }
  /deep/ .el-tree-node__expand-icon {
    font-size: 18px;
  }
.cursor{
  cursor: pointer;
}
</style>
