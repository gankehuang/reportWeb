<template>
  <div v-loading.lock="fullscreenLoading">
    <!--顶部操作区-->
    <formTitle title="养户投苗计划">
      <div slot="context">
        <page-form
          v-bind="formOptions"
          :model="formData"
          :editable="false"
          ref="PageForm"
        ></page-form>
      </div>
      <!--      <div slot="title-suffix"></div>-->
    </formTitle>
    
    <!--内容区-->
    <div class="page-content" ref="pageContent">
      <el-row class="content-head" type="flex" align="middle">
        <el-col :span="12">
          <span class="dot"></span>
          <span class="title">子表信息</span>
        </el-col>
        <el-col :span="12" class="content-head-right">
          <el-button style="border:1px solid #1989FA;color:#1989FA;"
                     size="small"
                     icon="el-icon-upload2"
                     @click="exportChildData">导出
          </el-button>
          <el-button size="small"
                     icon="el-icon-rank" @click="handleFullscreen">{{fullscreen?'退出全屏':'全屏'}}
          </el-button>
        </el-col>
      </el-row>
      
      <vxe-table
        :height="childTableHeight"
        :loading="loading"
        border
        type='modal'
        highlight-hover-row
        ref="xTable"
        :data="childTableData">
        <vxe-table-column type="index" width="60" fixed="left" title="序号"></vxe-table-column>
        <vxe-table-column min-width="100" fixed="left" field="cfmaintenname" title="养户姓名">
          <template v-slot="{row}">
            {{row.cfmaintenname || '-'}}
          </template>
        </vxe-table-column>
        <vxe-table-column min-width="80" field="fcusttype" title="养户类型">
          <template v-slot="{row}">
            {{row.fcusttype || '-'}}
          </template>
        </vxe-table-column>
        <vxe-table-column min-width="120" field="cfseedDate" title="计划投苗日期">
          <template v-slot="{ row }">{{ row.cfseedDate ? formatDate(row.cfseedDate, 'yyyy-MM-dd') : '-' }}</template>
        </vxe-table-column>
        <vxe-table-column min-width="60" field="cfplanseedday" title="计划投苗日龄" align="right">
          <template v-slot="{row}">
            {{row.cfplanseedday || '-'}}
          </template>
        </vxe-table-column>
        <vxe-table-column min-width="80" field="cfseedcnt" title="投苗头数" align="right">
          <template v-slot="{row}">
            {{row.cfseedcnt || '-'}}
          </template>
        </vxe-table-column>
        <vxe-table-column min-width="100" field="fbreedtypename" title="投苗品种">
          <template v-slot="{row}">
            {{row.fbreedtypename || '-'}}
          </template>
        </vxe-table-column>
        <vxe-table-column min-width="80" field="fmanagername" title="管理员">
          <template v-slot="{row}">
            {{row.fmanagername || '-'}}
          </template>
        </vxe-table-column>
        <vxe-table-column min-width="80" field="fseedtype" title="投苗类型">
          <template v-slot="{row}">
            {{row.fseedtype || '-'}}
          </template>
        </vxe-table-column>
        <vxe-table-column min-width="130" field="fpigfarmname" title="来源猪场">
          <template v-slot="{row}">
            {{row.fpigfarmname || '-'}}
          </template>
        </vxe-table-column>
        <vxe-table-column min-width="130" field="ffieldname" title="来源分场">
          <template v-slot="{row}">
            {{row.ffieldname || '-'}}
          </template>
        </vxe-table-column>
        <vxe-table-column min-width="100" field="fsuppliername" title="来源供应商">
          <template v-slot="{row}">
            {{row.fsuppliername || '-'}}
          </template>
        </vxe-table-column>
        <vxe-table-column min-width="80" field="cfnote" title="备注">
          <template v-slot="{row}">
            {{row.cfnote || '-'}}
          </template>
        </vxe-table-column>
      </vxe-table>
      
      <vxe-pager
        border
        :loading="loading"
        :current-page="childTablePage.currentPage"
        :page-size="childTablePage.pageSize"
        :total="childTablePage.totalResult"
        :layouts="['PrevPage', 'JumpNumber', 'NextPage', 'FullJump', 'Sizes', 'Total']"
        @page-change="handlePageChange">
      </vxe-pager>
    </div>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'
  import formTitle from '@/components/formTitle/formTitle'
  import PageForm from '@/components/form/Form'
  import commMixin from './commMixin'
  import {exportReport} from '@/utils/export'
  import {
    getSeedlingPlanParentList,
    getSeedlingPlanParentDetails,
    toExamine,
    backToExamine
  } from '@/api/serviceDepartment/seedlingPlan'

  export default {
    name: 'seedlingPlan',
    mixins: [commMixin],
    data() {
      return {}
    },
    created() {
      if (this.$route.query.orgId && this.$route.query.yearMonth) {  // 从汇总页跳转到当前页
        this.searchForm.orgId = this.$route.query.orgId
        this.searchForm.businessMonth = this.$route.query.yearMonth

        this.getPageList()

      } else {
        this.initData()
        this.getPageList()
      }
    },
    mounted() {

    },
    components: {
      formTitle,
      PageForm
    },
    computed: {
      ...mapGetters(['orgInfo', 'planYearMonth'])
    },
    watch: {},
    methods: {
      getPageList() { // 获取主表和初始化子表
        if (!this.searchForm.orgId || !this.searchForm.businessMonth) {
          return
        }
        this.fullscreenLoading = true
        let cfyear = ''
        let cfmonth = ''
        if (this.searchForm.businessMonth) {
          cfyear = this.searchForm.businessMonth.split('-')[0]
          cfmonth = this.searchForm.businessMonth.split('-')[1]
        }
        getSeedlingPlanParentList({
          pageNum: this.childTablePage.currentPage,
          pageSize: this.childTablePage.pageSize,
          orgid: this.searchForm.orgId,
          cfyear: cfyear,
          cfmonth: cfmonth
        }).then((res) => {
          this.fullscreenLoading = false
          if (res.status === 200) {
            if (res.data.length) {
              this.parentData = res.data

              this.fparentid = this.parentData[0].id
              this.curStatus = this.parentData[0].status
              if (this.$route.query.orgId) {
                this.searchForm.organization = this.parentData[0].orgname
              }

              this.formData = {
                fcreatetime: this.parentData[0].fcreatetime ? this.formatDate(this.parentData[0].fcreatetime, 'yyyy-MM-dd') : '',
                fcreatorname: this.parentData[0].fcreatorname,
                fbizdate: this.parentData[0].fbizdate ? this.formatDate(this.parentData[0].fbizdate, 'yyyy-MM-dd') : '',
                fauditorname: this.parentData[0].fauditorname,
                faudittime: this.parentData[0].faudittime ? this.formatDate(this.parentData[0].faudittime, 'yyyy-MM-dd') : '',
                status: this.parentData[0].status ? this.parentData[0].status : ''
              }

              this.isCanUnAudit = this.parentData[0].isCanUnAudit
              let childTableObj = this.parentData[0].pageCtPlaYzRhSeedplentry

              if (childTableObj.list && childTableObj.list.length) {
                this.childTableData = childTableObj.list
                this.childTablePage.totalResult = childTableObj.total
              }

            } else {
              this.formData = {}
              this.parentData = []
              this.childTableData = []
              this.childTablePage = {
                currentPage: 1,
                pageSize: 10,
                totalResult: 0
              }
            }
          }
        }, (err => {
          this.fullscreenLoading = false
        }))

      },
      getChildList() { // 分页切换子表数据
        this.loading = true
        getSeedlingPlanParentDetails({
          pageNum: this.childTablePage.currentPage,
          pageSize: this.childTablePage.pageSize,
          fparentid: this.fparentid
        }).then((res) => {
          this.loading = false
          if (res.status === 200) {
            this.childTableData = res.data.list
          }
        }, (err) => {
          this.loading = false
        })
      },
      examinePageData() { // 审核数据
        this.$confirm('是否提交审核?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          toExamine({
            id: this.fparentid
          }).then(res => {
            if (res.status === 200) {
              this.getPageList()
              this.$message({
                type: 'success',
                message: '审核成功!'
              })
            }

          }).catch(err => {

          })

        }).catch(() => {

        })
      },
      backExaminePageData() { // 反审核
        this.$confirm('是否提交反审核?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          backToExamine({
            id: this.fparentid
          }).then(res => {
            if (res.status === 200) {
              this.getPageList()
              this.$message({
                type: 'success',
                message: '反审核成功!'
              })
            }

          }).catch(err => {

          })

        }).catch(() => {

        })
      },
      exportChildData() {  // 导入数据
        if (this.fparentid) {
          let data = {
            method: 'get',
            url: `CtPlaYzRhSeedpl/exportExcel/${this.fparentid}`,
            fileName: '养户投苗计划表',
          };

          exportReport(data)
        } else {
          this.$message({
            message: "未提交,暂时不能导出！",
            type: "warning"
          });
        }
      }
    }
  }
</script>

<style scoped lang="scss">
  .page-content {
    box-sizing: border-box;
    margin: 10px 10px;
    padding: 16px 20px;
    background-color: #fff;
    
    .content-head {
      margin-bottom: 16px;
      
      .title {
        font-weight: bold;
        color: #333333;
        font-size: 14px;
      }
      
      .content-head-right {
        text-align: right;
      }
    }
  }
  
  .el-date-editor.el-input, .el-date-editor.el-input__inner {
    width: 180px;
  }
  
  /deep/ .el-input.is-disabled .el-input__inner {
    border: 1px solid #E4E7ED !important;
  }
</style>
