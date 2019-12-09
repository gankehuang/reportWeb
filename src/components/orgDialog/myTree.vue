<template>
  <div>
    <el-tree
      :data="treeData"
      :filter-node-method="filterNode"
      :render-content="renderMethod"
      ref="tree"
      v-bind="$attrs"
      v-on="$listeners"
      @node-click="nodeClickHandler">
    </el-tree>
  </div>
</template>

<script>
export default {
    props: {
        treeData: {
            type: Array,
            default: () => [],
        }
    },
    data () {
      return {
        currentId: ''
      }
    },
    methods: {
      renderMethod (h, {node, data, store}) {
            return (<div class={{rowWrap: true, active: this.currentId === data.id}}>
                {   node.isLeaf ?
                        <img class="tree-icon folder" src={require("@/assets/libFolder.png")} />:
                        // <img class="tree-icon" src={require("@/assets/libFile.png")} />:
                        node.expanded?
                            <img class="tree-icon folder" src={require("@/assets/libFolder.png")} />:
                            <img class="tree-icon folder" src={require("@/assets/libFolder.png")} />
                }
                <span class="tree-item">{data[this.$attrs.props.label]}</span>
            </div>);
        },
      nodeClickHandler (data, node, instance) {
        this.currentId = data.id
        this.$emit('node-click',{data, node, instance})
      },
      filterNode (value, data) {
        if (!value) return true;
        return data.name.indexOf(value) !== -1;
      },
      filter(val) {
        this.$refs.tree.filter(val);
      }
    },
    mounted () {

    }
}
</script>

<style lang="scss" scope>
  /deep/ .el-tree-node__content{
    height: auto;
  }
  .tree-icon {
      color: #FFCC34;
      font-size: 20px;
      padding-right: 4px;
      width: 20px;
      &.folder{
        width: 25px;
      }
  }
  .tree-item{
      color:#323445;
      margin-left: 3px;
  }
  .rowWrap {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    height: 26px;
    /*width: 100%;*/
    padding-right: 12px;
    padding-left: 8px;
    transition: background .2s ease-in;
    &.active{
      background-color: #89c3eb;
    }
  }
</style>
