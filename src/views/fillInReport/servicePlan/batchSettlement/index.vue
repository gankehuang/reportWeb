<template>
  <div v-loading.lock="fullscreenLoading">
    <!--顶部操作区-->
    <formTitle title="批次结算计划">
      <div slot="context">
        <page-form
          v-bind="formOptions"
          :model="formData"
          :editable="false"
          ref="PageForm"
        ></page-form>
      </div>
      <div slot="title-suffix">
      </div>
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
        :loading="loading"
        border
        highlight-hover-row
        ref="xTable"
        :height="childTableHeight"
        :data="childTableData">
        <vxe-table-column type="index" width="60" fixed="left" title="序号"></vxe-table-column>
        <vxe-table-column min-width="100" field="fbatchno" fixed="left" title="批次档案">
          <template v-slot="{row}">
            {{row.fbatchno || '-'}}
          </template>
        </vxe-table-column>
        <vxe-table-column min-width="80" field="fsetlleperiodmonth" title="结算月份" align="right">
          <template v-slot="{row}">
            {{row.fsetlleperiodmonth || '-'}}
          </template>
        </vxe-table-column>
        <vxe-table-column min-width="80" field="fseedqty" title="投苗头数" align="right">
          <template v-slot="{row}">
            {{row.fseedqty || '-'}}
          </template>
        </vxe-table-column>
        <vxe-table-column min-width="80" field="fsaleage" title="上市日龄" align="right">
          <template v-slot="{row}">
            {{row.fsaleage || '-'}}
          </template>
        </vxe-table-column>
        <vxe-table-column min-width="80" field="fsaleqty" title="上市头数" align="right">
          <template v-slot="{row}">
            {{row.fsaleqty || '-'}}
          </template>
        </vxe-table-column>
        <vxe-table-column min-width="80" field="fsalerealqty" title="上市正品头数" align="right">
          <template v-slot="{row}">
            {{row.fsalerealqty || '-'}}
          </template>
        </vxe-table-column>
        <vxe-table-column min-width="80" field="fsaleavgweight" title="上市均重（KG）" align="right">
          <template v-slot="{row}">
            {{row.fsaleavgweight || '-'}}
          </template>
        </vxe-table-column>
        <vxe-table-column width="80" field="fsalecostpcs" title="单斤销售成本" align="right">
          <template v-slot="{row}">
            {{row.fsalecostpcs || '-'}}
          </template>
        </vxe-table-column>
        <vxe-table-column min-width="80" field="fstandardcostpcs" title="单斤标准成本" align="right">
          <template v-slot="{row}">
            {{row.fstandardcostpcs || '-'}}
          </template>
        </vxe-table-column>
        <vxe-table-column title="结算指标" align="center">
          <vxe-table-column width="70" field="fsurvivalrate" title="成活率（%）" align="right">
            <template v-slot="{ row }">{{ row.fsurvivalrate ? (row.fsurvivalrate - 0).toFixed(2) : '-' }}</template>
          </vxe-table-column>
          <vxe-table-column width="70" field="frealrate" title="正品率（%）" align="right">
            <template v-slot="{ row }">{{ row.frealrate ? (row.frealrate - 0).toFixed(2) : '-' }}</template>
          </vxe-table-column>
          <vxe-table-column width="70" field="flrb" title="料肉比" align="right">
            <template v-slot="{ row }">{{ row.flrb ? (row.flrb - 0).toFixed(2) : '-' }}</template>
          </vxe-table-column>
          <vxe-table-column width="70" field="fdaydynamiting" title="日增重" align="right">
            <template v-slot="{ row }">{{ row.fdaydynamiting ? (row.fdaydynamiting - 0).toFixed(2) : '-' }}</template>
          </vxe-table-column>
        </vxe-table-column>
        
        <vxe-table-column title="单头成本明细（元/头）" align="center">
          <vxe-table-column width="80" field="fonecost" title="单头成本" align="right">
            <template v-slot="{row}">
              {{row.fonecost || '-'}}
            </template>
          </vxe-table-column>
          <vxe-table-column width="80" field="fseedcost" title="猪苗成本" align="right">
            <template v-slot="{row}">
              {{row.fseedcost || '-'}}
            </template>
          </vxe-table-column>
          <vxe-table-column width="80" field="ffeedcost" title="饲料成本" align="right">
            <template v-slot="{row}">
              {{row.ffeedcost || '-'}}
            </template>
          </vxe-table-column>
          <vxe-table-column width="80" field="fdrugcost" title="兽药成本" align="right">
            <template v-slot="{row}">
              {{row.fdrugcost || '-'}}
            </template>
          </vxe-table-column>
          <vxe-table-column width="80" field="fcustprofit" title="养户毛利" align="right">
            <template v-slot="{row}">
              {{row.fcustprofit || '-'}}
            </template>
          </vxe-table-column>
          <vxe-table-column width="80" field="fheadaredifferent" title="头均异补" align="right">
            <template v-slot="{row}">
              {{row.fheadaredifferent || '-'}}
            </template>
          </vxe-table-column>
          <vxe-table-column width="80" field="fproductcost" title="生产费用" align="right">
            <template v-slot="{row}">
              {{row.fproductcost || '-'}}
            </template>
          </vxe-table-column>
          <vxe-table-column width="80" field="fthreecost" title="三项费用" align="right">
            <template v-slot="{row}">
              {{row.fthreecost || '-'}}
            </template>
          </vxe-table-column>
        </vxe-table-column>
        
        <vxe-table-column title="总成本" align="center">
          <vxe-table-column width="80" field="fseedcostSum" title="猪苗成本" align="right">
            <template v-slot="{ row }">{{ row.fseedcostSum ? parseInt(row.fseedcostSum - 0) : '-' }}</template>
          </vxe-table-column>
          <vxe-table-column width="80" field="ffeedcostSum" title="饲料成本" align="right">
            <template v-slot="{ row }">{{ row.ffeedcostSum ? parseInt(row.ffeedcostSum - 0) : '-' }}</template>
          </vxe-table-column>
          <vxe-table-column width="80" field="fdrugcostSum" title="兽药成本" align="right">
            <template v-slot="{ row }">{{ row.fdrugcostSum ? parseInt(row.fdrugcostSum - 0) : '-' }}</template>
          </vxe-table-column>
          <vxe-table-column width="80" field="fcustprofitSum" title="养户毛利" align="right">
            <template v-slot="{ row }">{{ row.fcustprofitSum ? parseInt(row.fcustprofitSum - 0) : '-' }}</template>
          </vxe-table-column>
          <vxe-table-column width="80" field="fheadaredifferent" title="头均异补" align="right">
            <template v-slot="{ row }">{{ row.fheadaredifferent ? parseInt(row.fheadaredifferent - 0) : '-' }}
            </template>
          </vxe-table-column>
          <vxe-table-column width="80" field="fproductcost" title="生产费用" align="right">
            <template v-slot="{ row }">{{ row.fproductcost ? parseInt(row.fproductcost - 0) : '-' }}</template>
          </vxe-table-column>
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
  import commMixin from '../seedlingPlan/commMixin'
  import {exportReport} from '@/utils/export'
  import {
    getBatchSettlementList,
    getBatchSettlementDetails,
    toExamine,
    backToExamine
  } from '@/api/serviceDepartment/batchSettlement'

  export default {
    name: 'batchSettlement',
    mixins: [commMixin],
    data() {
      return {}
    },
    components: {
      formTitle,
      PageForm
    },
    created() {
      this.initData()
      this.getPageList()
    },
    mounted() {

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

        getBatchSettlementList({
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
              this.isCanUnAudit = this.parentData[0].isCanUnAudit
              let childTableObj = this.parentData[0].pageCostplanningEntry

              this.formData = {
                fcreatetime: this.parentData[0].fcreatetime ? this.formatDate(this.parentData[0].fcreatetime, 'yyyy-MM-dd') : '',
                fcreatorname: this.parentData[0].fcreatorname,
                fbizdate: this.parentData[0].fbizdate ? this.formatDate(this.parentData[0].fbizdate, 'yyyy-MM-dd') : '',
                fauditorname: this.parentData[0].fauditorname,
                faudittime: this.parentData[0].faudittime ? this.formatDate(this.parentData[0].faudittime, 'yyyy-MM-dd') : '',
                status: this.parentData[0].status ? this.parentData[0].status : ''
              }

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
        }, (err) => {
          this.fullscreenLoading = false
        })

      },
      getChildList() {  // 分页切换子表数据
        this.loading = true
        getBatchSettlementDetails({
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
            url: `Costplanning/exportExcel/${this.fparentid}`,
            fileName: '批次结算计划表',
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
