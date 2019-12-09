<template>
    <div>
     <!-- <el-input v-model="orgNames" size="small"   :placeholder="'请选择组织'" :disabled="isSee"  @focus="showDig" >
        &lt;!&ndash;<el-button slot="append" icon="el-icon-search" size="small"  :disabled="isSee" @click="showDig" ></el-button>&ndash;&gt;
      </el-input>-->
      <el-select v-model="orgNames" placeholder="请选择" :disabled="isSee" size="small">
        <el-option
          :label="orgNames"
          :value="orgNames">
        </el-option>
      </el-select>
      <el-dialog
        title="人员组织"
        :visible.sync="dialogVisible"
        width="60%"
        center>
        <div class="tree-list" v-loading="loading">
          <el-tree
            :data="treeList"
            show-checkbox
            node-key="id"
            ref="tree"
            default-expand-all
            :default-expanded-keys="orgIds"
            :default-checked-keys="orgIds"
            highlight-current
            v-bind="$attrs"
            v-on="$listeners"
            :props="defaultProps">
          </el-tree>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="selectOrgHandler">确 定</el-button>
        </span>
      </el-dialog>
    </div>
</template>

<script>
  import request from '@/utils/request'
  import PREFIX from '@/api/serviceDepartment/baseApiUrl'
  import {mapGetters} from 'vuex'
    export default {
        name: "orgTree",
        data() {
            return {
              dialogVisible:false,
              orgNames:'',
              orgIds:'',
              treeList:[],
              loading:false,
              defaultProps: {
                children: 'children',
                label:'label'
              }
            }
        },
        props:{
          isSee:{
            type:[String,Boolean],
            default:true
          }
        },
      watch:{
        $attrs:{
          handler:function (val) {
            this.orgNames=val.value;
          }
        }
      },
      created(){
        this.orgNames=this.$attrs.value;
      },
        methods: {
          showDig(){
            this.dialogVisible = true;
            this._getTreeList()
          },
          _getTreeList(){
            let _this=this;
            this.loading=true;
            request({
              url:`${PREFIX}/roma/getMyOrg`,
              method:'get'
            }).then(res=>{
              _this.treeList=res.data;
              _this.loading=false;
            }).catch(err=>{
              _this.loading=false;
              _this.$message.warning('获取组织树失败！')
            })
          },
          selectOrgHandler () { //组织结构弹框
            let data=this.$refs.tree.getCheckedNodes();
            let userorgNames=data.map(item=>{
              return item.label
            });
            this.orgNames=userorgNames.join();
            this.orgIds=data.map(item=>{
              return item.id
            });
            this.dialogVisible = false
          },
        }
    }
</script>

<style scoped lang="scss">
 /deep/ .el-input.is-disabled .el-input__inner {
    border: 1px solid #DCDFE6 !important;
  }
</style>
