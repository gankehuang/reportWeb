<template>
  <el-dialog :close-on-click-modal="false" :before-close="handleClose" class="org-wrap" width="700px" title="选择组织" :visible.sync="visible" append-to-body v-loading="loading">
    <el-input v-model="keyword" placeholder="请输入关键字" suffix-icon="el-icon-search" size="small"></el-input>
    <div class="tree-wrap">
      <my-tree ref="tree" :treeData="orgData" :props="{label: 'name', children: 'children'}" @node-click="nodeClickHandler"></my-tree>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button size="small" type="primary" @click="confirm">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  import myTree from './myTree'
  import request from '@/utils/request'
  import { mapGetters } from 'vuex'
  import { debounce2 as debounce } from '@/utils'
  export default {
    name: 'orgDialog',
    components: {
      myTree
    },
    data() {
      return {
        visible: false,
        loading: false,
        orgData: [],
        selectObj: null,
        keyword: '',
        clickTime: 0
      }
    },
    methods: {
      show () {
        this.visible = true
      },
      queryData () {
        this.loading = true
        request({
          url: '/BUSINESSREPORT/roma/getMyOrg',
        }).then(res => {
          this.loading = false
          if (res.status === 200) {
            this.orgData = res.data
          }
        }).catch(error => {
          this.loading = false
        })
      },
      nodeClickHandler (data) {
        this.selectObj = data
        if (new Date().getTime() - this.clickTime < 500 && new Date().getTime() - this.clickTime > 100) {
          this.confirm()
        } else {
          this.clickTime = new Date().getTime()
        }
      },
      confirm () {
        if (!this.selectObj) {
          this.$message.warning('请选择一项!')
          return
        }
        this.setSession(this.selectObj).then(res => {
          this.$store.commit('SET_ORG_INFO', this.selectObj)
          this.visible = false
        }).catch(error => {
        })
      },
      setSession (orgInfo) {
        delete orgInfo.children
        return request({
          url: '/BUSINESSREPORT/common/chooseOrg',
          method: 'post',
          params: orgInfo
        })
      },
      handleClose(done) {
        // if (!this.orgInfo || !this.orgInfo.id) { // TODO
        //   this.$message.warning('必须选择组织,才可以继续!')
        //   return
        // }
        done()
      },
      fd: debounce(({ vm, val }) => {
        vm.$refs.tree.filter(val)
      },500)
    },
    watch: {
      visible (val) {
        if (val&& this.orgData.length === 0) {
          this.queryData()
        }
      },
      keyword (val) {
        this.fd({vm: this, val})
      }
    },
    mounted() {
    },
    computed: {
      ...mapGetters(['orgInfo'])
    }
  }
</script>

<style scoped lang="scss">
.org_wrap {
  /deep/ .el-tree-node__content{
    height: auto;
  }
}

/deep/ .el-dialog__body {
  padding: 20px;
}
.tree-wrap{
  height: 350px;
  margin-top: 10px;
  overflow-y: auto;
}
</style>
