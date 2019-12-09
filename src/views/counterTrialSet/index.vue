<template>
  <div class="page-container" v-loading.lock="fullscreenLoading">
    <div class="content-left">
      <div class="left-box">
        <el-tree ref="orgTree"
                 :data="treeData"
                 :props="defaultProps"
                 highlight-current
                 node-key="ORGNAME"
                 default-expand-all
                 @node-click="handleNodeClick">
        </el-tree>
      </div>
    </div>
    
    <div class="content-right" v-loading.lock="loadingRightContent">
      <div class="right-box">
        <el-row type="flex" class="right-head" align="middle">
          <el-col :span="10" class="head-left">
            <span v-if="curSelectNode.type==='parentNode'">
              {{ this.treeData.length ? this.treeData[0].ORGNAME : ''}}
            </span>
            <span v-else>
              {{this.treeData.length ? this.treeData[0].ORGNAME : ''}} > {{this.curSelectNode.ORGNAME}}
            </span>
          </el-col>
          <el-col :span="14" class="head-right" style="text-align:right;">
            <el-date-picker
              size="small"
              v-model="filterTime"
              type="month"
              @change="changeSelectTime"
              value-format="yyyy-MM"
              placeholder="选择期间">
            </el-date-picker>
            <el-button type="primary"
                       v-show="isShowConfirmBtn && curSelectNode.type==='parentNode'"
                       size="small"
                       class="base-btn"
                       @click="handleOperate('confirm')">确认
            </el-button>
            
            <el-button type="danger"
                       v-show="curSelectNode.type==='parentNode' && curLevel == 1 && !isShowConfirmBtn"
                       size="small"
                       class="base-btn"
                       @click="handleOperate('back')">退回
            </el-button>
            
            <el-button type="danger"
                       v-show="curSelectNode.type==='childNode' && isShowBackBtn"
                       size="small"
                       class="base-btn"
                       @click="handleOperate('back')">退回
            </el-button>
          </el-col>
        </el-row>
        
        <div class="right-content">
          <el-collapse v-if="reportList.length" v-model="activeNames" style="padding:0 20px;">
            <el-collapse-item v-for="(item, index) in reportList"
                              :title="item.reportName"
                              :class="!item.data.length ? 'item-no-data' : ''"
                              :name="(index+1).toString()" :key="index">
              <el-table
                :data="item.data"
                border
                size="medium"
                style="width: 100%">
                <el-table-column
                  width="50"
                  label="序号"
                  type="index">
                </el-table-column>
                <el-table-column
                  prop="tbTime"
                  label="填报日期">
                  <template slot-scope="scope">
                    {{ formatDate(scope.row.tbTime, 'yyyy-MM-dd') }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="sumbitPerson"
                  label="提交人">
                </el-table-column>
                <el-table-column
                  prop="sumbitTime"
                  label="提交日期">
                  <template slot-scope="scope">
                    {{ formatDate(scope.row.sumbitTime, 'yyyy-MM-dd') }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="spPerson"
                  label="审批人">
                </el-table-column>
                <el-table-column
                  prop="spTime"
                  label="审批日期">
                  <template slot-scope="scope">
                    {{ formatDate(scope.row.spTime, 'yyyy-MM-dd') }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="status"
                  label="状态">
                </el-table-column>
              </el-table>
            </el-collapse-item>
          </el-collapse>
          
          <div v-else class="no-dataTip">暂无数据</div>
        </div>
      
      </div>
    </div>
  </div>
</template>

<script>
  import moment from 'moment'
  import {mapGetters} from 'vuex'
  import {
    getOrgTree,
    saveOrgSpRecord,
    checkIsShowButton,
    checkIsShowBackButton,
    getReportList
  } from '@/api/counterTrialSet/counterTrialSet'

  export default {
    name: 'counterTrialSet',
    data() {
      return {
        fullscreenLoading: false,
        loadingRightContent: false,
        treeData: [],
        defaultProps: {
          children: 'children',
          label: 'label'
        },
        filterTime: '',
        curSelectNode: {
          type: 'parentNode',
          label: '',
          ORGID: '',
          CNUMBER: '',
          FTYPE: '',
          ORGNAME: '',
          PORGID: '',
          children: []
        },
        isShowConfirmBtn: false,
        isShowBackBtn: false,
        reportList: [],
        activeNames: ['1'],
        curLevel: ''
      }
    },
    created() {
      this.initData()
    },
    mounted() {

    },
    computed: {
      ...mapGetters(['orgInfo'])
    },
    watch: {
      orgInfo(newVal, oldVal) { // 动态监听切换组织
        if (newVal && newVal.id) {
          this.getOrgTree({
            id: newVal.id,
            longNumber: newVal.longNumber,
            name: newVal.name,
            parentId: newVal.parentId,
            type: newVal.type
          });

          this.curLevel = newVal.type

          this.checkIsShowButton()
          this.checkIsShowBackButton()

        } else {
          this.$message.warning('请选择组织!')
        }
      }
    },
    methods: {
      initData() {  // 初始化数据
        this.curLevel = this.orgInfo.type

        this.filterTime = moment(new Date()).add('year', 0).format('YYYY-MM')

        if (this.orgInfo && this.orgInfo.id) { //获取默认orgId
          this.getOrgTree({
            id: this.orgInfo.id,
            longNumber: this.orgInfo.longNumber,
            name: this.orgInfo.name,
            parentId: this.orgInfo.parentId,
            type: this.orgInfo.type
          })
        } else {
          this.$message.warning('请选择组织!')
        }
      },
      getOrgTree(data) {  // 获取树结构
        this.fullscreenLoading = true
        this.treeData = []
        getOrgTree({
          id: data.id,
          longNumber: data.longNumber,
          name: data.name,
          parentId: data.parentId,
          type: data.type
        }).then(res => {
          this.fullscreenLoading = false

          if (res.status === 200) {
            let data = res.data
            let children = []
            this.treeData = [{
              type: 'parentNode',
              label: data.ORGNAME,
              ORGID: data.ORGID,
              ORGNAME: data.ORGNAME,
              PORGID: data.PORGID
            }]

            if (data.children.length) {
              children = data.children.map((item, index) => {
                return {
                  type: 'childNode',
                  label: item.ORGNAME,
                  ORGID: item.ORGID,
                  CNUMBER: item.CNUMBER,
                  FTYPE: item.FTYPE,
                  ORGNAME: item.ORGNAME,
                  PORGID: item.PORGID,
                  children: []
                }
              })

              this.treeData[0].children = children

              this.curSelectNode = children[0]  // 默认选中子节点下第一个
              this.curSelectNode.type = 'childNode'
            } else {
              this.curSelectNode = this.treeData[0]
              this.curSelectNode.type = 'parentNode'
            }

            this.checkIsShowButton()
            this.checkIsShowBackButton()
            this.renderReportList()

            this.$nextTick(() => {
              this.$refs.orgTree.setCurrentKey(this.curSelectNode.ORGNAME)
            })
          }

        }, err => {
          this.fullscreenLoading = false
        })
      },
      handleNodeClick(data) { // 点击当前节点
        this.curSelectNode = data
        this.checkIsShowButton()
        this.checkIsShowBackButton()
        this.renderReportList()
        this.loadingRightContent = true
      },
      renderReportList() {  // 加载报表列表
        getReportList({
          orgId: this.curSelectNode.ORGID,
          dateMonth: this.filterTime
        }).then(res => {
          this.loadingRightContent = false
          this.reportList = []
          if (res.status === 200) {
            this.reportList = res.data
          }
        }).catch(err => {
          this.loadingRightContent = false
        })
      },
      checkIsShowButton() { // 判断父级是否需要显示确认按钮
        if (this.curSelectNode.type === 'parentNode') {
          if (!this.checkSubmit()) {
            return
          }

          checkIsShowButton({
            orgId: this.curSelectNode.ORGID,
            dateMonth: this.filterTime
          }).then(res => {
            if (res.status === 200) {
              this.isShowConfirmBtn = res.data.isShow
            }
          }).catch(err => {

          })
        }
      },
      checkIsShowBackButton() { // 判断子级是否需要显示退回按钮
        if (this.curSelectNode.type === 'childNode') {
          if (!this.checkSubmit()) {
            return
          }

          checkIsShowBackButton({
            orgId: this.curSelectNode.ORGID,
            dateMonth: this.filterTime
          }).then(res => {
            if (res.status === 200) {
              this.isShowBackBtn = res.data.isShow
            }
          }).catch(err => {

          })
        }
      },
      changeSelectTime(val) {  // 监听选择时间
        if (val) {
          this.checkIsShowButton()
          this.checkIsShowBackButton()
          this.renderReportList()
        }
      },
      checkSubmit() {  // 校验提交数据
        if (this.curSelectNode.ORGID === undefined) {
          this.$message({
            message: '组织不能为空',
            type: 'warning'
          })
          return false
        }

        if (this.filterTime === '') {
          this.$message({
            message: '期间不能为空',
            type: 'warning'
          })
          return false
        }

        return true
      },
      formatDate(value, format) {
        if (value && value != 'null' && value != 'undefined') {
          return this.$utils.toDateString(value, format)
        } else {
          return ''
        }
      },
      handleOperate(state) {  // 操作按钮
        if (!this.checkSubmit()) {
          return
        }

        let status = 0
        let tipText = ''

        if (state === 'confirm') {
          status = 2
          tipText = '是否确认'
        } else if (state === 'back') {
          status = 0
          tipText = '是否退回'
        }

        this.$confirm(tipText, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {

          saveOrgSpRecord({
            status,
            orgId: this.curSelectNode.ORGID,
            dateMonth: this.filterTime
          }).then(res => {
            if (res.status === 200) {
              this.getOrgTree({
                id: this.orgInfo.id,
                longNumber: this.orgInfo.longNumber,
                name: this.orgInfo.name,
                parentId: this.orgInfo.parentId,
                type: this.orgInfo.type
              })
              this.$message({
                message: '操作成功',
                type: 'success'
              })
            } else {
              this.$message({
                message: res.message.length ? res.message[0].message : res.message,
                type: 'error'
              })
            }
          }, err => {

          })

        }).catch(() => {

        })
      }
    }
  }
</script>

<style lang="scss" scoped>
  .page-container {
    width: 100%;
    height: calc(100vh - 200px);
    margin: 10px;
    
    .content-left {
      padding: 20px;
      width: 20%;
      height: calc(100vh - 105px);
      background-color: #fff;
      float: left;
      
      .left-box {
        height: 100%;
        border: 1px solid rgba(235, 238, 243, 1);
        overflow-y: auto;
      }
    }
    
    .content-right {
      margin-left: 1%;
      float: left;
      width: 77.5%;
      height: calc(100vh - 105px);
      background-color: #fff;
      padding: 20px;
      
      .right-box {
        border: 1px solid rgba(235, 238, 243, 1);
        
        .right-head {
          padding: 10px;
          background-color: rgba(247, 248, 250, 1);
          
          .base-btn {
            margin-left: 15px;
          }
        }
        
        .right-content {
          height: calc(100vh - 105px - 94px);
          overflow-y: auto;
          
          .item-no-data {
            /deep/ .el-collapse-item__header {
              color: #99a9bf;
            }
          }
          
          
          .no-dataTip {
            text-align: center;
            margin-top: 40px;
          }
        }
      }
    }
    
    /deep/ .el-collapse-item__header {
      font-size: 16px;
    }
    
  }
</style>
