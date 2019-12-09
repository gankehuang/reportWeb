<template>
  <div v-loading.fullscreen.lock="fullLoading">
    <card title="月度经营计划表" showHead>
      <template #head_suffix>
        <el-select size="small" disabled v-model="searchForm.level" placeholder="全部" style="width: 100px">
          <el-option v-for="item in levelList" :label="item.label" :value="item.value"></el-option>
        </el-select>
        &nbsp;
        <el-select size="small" v-model="searchForm.post" placeholder="全部" style="width: 140px">
          <el-option v-for="item in filterPosts" :label="item.label" :value="item.value"></el-option>
        </el-select>
        &nbsp;&nbsp;
        <el-button size="small" v-show="!(disabled || formData.status > 1)" class="el-button-audit" @click="saveHandler">保存</el-button>
<!--        <el-button size="small" class="el-button-delete">提交</el-button>-->
        <el-button size="small" v-show="!(disabled || formData.status !== 0)" @click="auditHandler(1)" class="el-button-submit">提交</el-button>
        <el-button size="small" v-show="!(disabled || formData.status !== 1)" class="el-button-audit" @click="auditHandler(2)">审核</el-button>
        <el-button size="small" v-show="!(disabled || formData.status !== 2)" class="el-button-unaudit" @click="unauditHandler">反审核</el-button>
      </template>
      <page-form
        v-bind="formOptions"
        :model="formData"
        :editable="false"
        ref="PageForm"
      ></page-form>
    </card>
    <div ref="pageContent">
      <card title="子表信息" showHead>
        <template #head_suffix>
          <el-button size="small" :disabled="loading"  @click="exportData"  icon="el-icon-upload2" class="el-button-audit">导出</el-button>
          <el-button size="small" :disabled="loading" v-show="formData.status === 0"  @click="refreshForecast" class="el-button-audit">刷新旬预测数据</el-button>
          <el-button size="small" :disabled="loading" v-show="formData.status === 0"  @click="refreshBusiness" class="el-button-audit">刷新经营业绩</el-button>
          <el-button size="small" icon="el-icon-rank" @click="handleFullscreen">{{fullscreen?'退出全屏':'全屏'}}
          </el-button>
          <!--        <vxe-button @click="insertEvent">新增行</vxe-button>-->
          <!--        <vxe-button @click="$refs.xTable.removeSelecteds()">删除选中</vxe-button>-->
          <!--        <vxe-button @click="$refs.xTable.getTableData()">获取</vxe-button>-->
        </template>
        <vxe-table
          ref="xTable"
          resizable
          highlight-hover-row
          highlight-current-row
          id="bodyTable2"
          :span-method="rowspanMethod"
          :edit-config="editConfig"
          :loading="loading"
          :data="tableData"
          :edit-rules="validRules"
          :mouse-config="{selected: true}"
          :keyboard-config="{isArrow: true, isDel: true, isTab: true, isEdit: true}"
          border
          :height="autoHeight">
          <vxe-table-column class-name="ch-bg-gary" title="项目" align="center" width="40"
                            field="quotaBigType"></vxe-table-column>
          <vxe-table-column class-name="ch-bg-gary" title="项目" align="center" width="40" field="quotaSmallType"></vxe-table-column>
          <vxe-table-column title="指标" :className="kpiClassRender" width="200" field="quotaName">
            <template v-slot="{ row }">
              <el-link type="primary" v-if="deepKpiKeys.includes(row.quotaId) && parseInt(orgInfo.type) <= 4" @click="deepJump(row)">{{ row.quotaName }}
              </el-link>
              <span v-else>{{ row.quotaName || '' }}</span>
            </template>
          </vxe-table-column>
          <vxe-table-column :title="monthText(-1)" align="center">
            <vxe-table-column :title="monthText(-1) + '目标'" className="ch-bg-gary2" align="right" width="80" field="lastTarget">
              <template v-slot="{ row }">
                {{ row.lastTarget || '-' }}
              </template>
            </vxe-table-column>
            <vxe-table-column :title="monthText(-1) + '实际完成'" className="ch-bg-green" align="right" field="lastComplete" width="100">
              <template v-slot="{ row }">
                {{ row.lastComplete ? kpiFormatter(row.lastComplete,row.quotaName) : '-' }}
              </template>
            </vxe-table-column>
            <vxe-table-column title="计划达成率" align="right" width="70" field="completeRates">
              <template v-slot="{ row }">
                {{ row.completeRates ? kpiFormatter(row.completeRates,row.quotaName) : '-' }}
              </template>
            </vxe-table-column>
            <vxe-table-column title="预警值" align="right" width="80" field="warningRates">
              <template v-slot="{row}">
                {{ row.warningRates ? warningFormatter (row) : '-' }}
              </template>
            </vxe-table-column>
          </vxe-table-column>
          <vxe-table-column :title="monthText(0) + '计划'" width="80" align="center">
            <vxe-table-column :title="monthText(0) + '目标'" width="95" align="right" field="target">
              <template v-slot="{ row }">
                {{ row.target ? kpiFormatter(row.target,row.quotaName) : '-' }}
              </template>
            </vxe-table-column>
            <vxe-table-column title="1-7日"  align="right" width="70" field="firstWeekTarget">
              <template v-slot="{ row }">
                {{ row.firstWeekTarget ? kpiFormatter(row.firstWeekTarget,row.quotaName) : '-' }}
              </template>
            </vxe-table-column>
            <vxe-table-column title="8-14日" align="right" width="80" field="secondWeekTarget">
              <template v-slot="{ row }">
                {{ row.secondWeekTarget ? kpiFormatter(row.secondWeekTarget,row.quotaName) : '-' }}
              </template>
            </vxe-table-column>
            <vxe-table-column title="15-21日" align="right" width="85" field="thirdWeekTarget">
              <template v-slot="{ row }">
                {{ row.thirdWeekTarget ? kpiFormatter(row.thirdWeekTarget,row.quotaName) : '-' }}
              </template>
            </vxe-table-column>
            <vxe-table-column title="22-30日" align="right" width="85" field="fourthWeekTarget">
              <template v-slot="{ row }">
                {{ row.fourthWeekTarget ? kpiFormatter(row.fourthWeekTarget,row.quotaName) : '-' }}
              </template>
            </vxe-table-column>
          </vxe-table-column>
          <vxe-table-column align="right" field="nextMonthTarget" width="90" :title="monthText(1) + '目标'">
            <template v-slot="{ row }">
              {{ row.nextMonthTarget ? kpiFormatter(row.nextMonthTarget,row.quotaName) : '-' }}
            </template>
          </vxe-table-column>
          <vxe-table-column align="right" field="nextTwoMonthTarget" width="95" :title="monthText(2) + '目标'">
            <template v-slot="{ row }">
<!--              {{ row.nextTwoMonthTarget ? simpleFormatter(row.nextTwoMonthTarget) : '-' }}-->
              {{ row.nextTwoMonthTarget ? kpiFormatter(row.nextTwoMonthTarget,row.quotaName) : '-' }}
            </template>
          </vxe-table-column>
        </vxe-table>
      </card>
    </div>
  </div>
</template>

<script>
  import DataTable from '@/components/DataTable'
  import moment from 'moment'
  import request from '@/utils/request'
  import { mapGetters } from 'vuex'
  import PageForm from "@/components/form/Form";
  import { floatFixed } from '@/utils'
  import card from '@/components/card'
  import formOptionMixins from './formOptionMixins'
  import { changeTwoDecimal2 } from '@/utils' // 四舍五入
  import { exportReport } from '@/utils/export'

  export default {
    name: 'WarningConfig',
    mixins: [formOptionMixins],
    components: {
      DataTable,
      card,
      PageForm
    },
    filters: {
      dateFormat(data) {
        if (data) {
          return moment(parseInt(data)).format('YYYY-MM-DD')
        }
      }
    },
    data() {
      return {
        searchForm: {},
        tableData: [],
        level: 1,
        tableHeight: '500px',
        loading: false,
        disabled: false,
        fullLoading: false,
        entryLoading: false,
        deepKpiKeys: [ // 可以钻取的指标
          '50', // 配种分娩率
          '75' // 月度死亡率
        ],
        deepKpiRouterMap: {
          '50': '/monthReport/monthOpration/matingDeepDetail',
          '75': '/monthReport/monthOpration/mortalityDeepDetail'
        },
        validRules: { // 校验规则
        }
      }
    },
    methods: {
      getFullScreenEl () {
        return this.$refs.pageContent.$el
      },
      getAutoHeightEl () {
        return this.$refs.xTable.$el
      },
      init () {
        this.$nextTick(() => {
          let spanTag = document.getElementById('bodyTable2').getElementsByTagName('tr')[0].getElementsByTagName('th')[0] //设置第一行第一个单元格，占2行2列
          spanTag.colSpan = '2'
          spanTag.colSpan = '2'
          let removeTag = document.getElementById('bodyTable2').getElementsByTagName('tr')[0].getElementsByTagName('th')[1]
          document.getElementById('bodyTable2').getElementsByTagName('tr')[0].removeChild(removeTag)
        })
      },
      kpiClassRender ({seq, row, rowIndex, $rowIndex, column, columnIndex, $columnIndex}) {
        if (row.quotaName && row.quotaName.indexOf('其中') >= 0) {
          return 'ch-textIndent ch-bg-gary'
        } else {
          return 'ch-bg-gary '
        }
      },
      monthText (offset = 0) {
        return moment(this.planYearMonth, 'YYYY-MM').add(offset, 'months').format('YYYY年MM月')
      },
      exportData() {
        const entryData = this.$refs.xTable.getTableData().fullData
        const obj = this.formData
        obj.post = this.searchForm.post
        const formData = {
          summary: obj,
          list: entryData
        }
        const fileName = `月度经营计划${this.planYearMonth}`
        exportReport({
          url: 'summary/exportExcel',
          method: 'post',
          data: formData,
          fileName: fileName
        })
      },
      refreshForecast() { // 获取旬预测
        const params = {
          orgId: this.orgInfo.id,
          period: this.planYearMonth
        }
        this.loading = true
        request({
          url: '/BUSINESSREPORT/roma/getPrediction',
          params: params
        }).then(res => {
          if (res.status === 200 && res.data) {
            this.reloadTableData(res.data)
          }
          this.loading =false
        }).catch(error => {
          console.log(error)
          this.loading = false
        })
      },
      refreshBusiness() { // 刷新经营业绩
        const params = {
          orgId: this.orgInfo.id,
          period: this.planYearMonth
        }
        this.loading = true
        request({
          url: '/BUSINESSREPORT/roma/getFactProfit',
          params: params
        }).then(res => {
          if (res.status === 200 && res.data) {
            this.reloadTableData(res.data)
          }
          this.loading = false
        }).catch(error => {
          console.log(error)
          this.loading = false
        })
      },
      reloadTableData(data) {
        const { fullData } = this.$refs.xTable.getTableData()
        this.tableData = fullData.map(item => {
          if (item.quotaCode) {
            if (data[item.quotaCode] !== undefined) {
              item.lastComplete = data[item.quotaCode]
            }
          }
          return item
        })
      },
      deepJump({ quotaId }) {
        if (this.deepKpiRouterMap [quotaId]) {
          this.$router.push(this.deepKpiRouterMap[quotaId])
        }
      },
      addNewBody() {
        const obj = {
          orgName: this.orgInfo.name,
          orgId: this.orgInfo.id,
          orgLongNumber: this.orgInfo.longNumber,
          status: -1,
          createTime: new Date().getTime(),
          period: this.planYearMonth,
          post: this.searchForm.post
        }
        // 获取模板
        this.formData = obj
        this.resetTemplate()
      },
      simpleFormatter (val) {
        let temp = ''
        if (isNaN(val)) {
          return val
        } else if ((val <= 1 && val > 0) || (val >= -1 && val < 0)) { // 百分比
          temp = changeTwoDecimal2(val * 100) + '%'
        } else if (val) {
          temp = changeTwoDecimal2(val)
        }
        return temp
      },
      kpiFormatter (val, name) {
        let temp = ''
        if (isNaN(val)) {
          return val
        } else if (name.indexOf('占比') >= 0 || name.indexOf('率') >= 0) { // 百分比
          temp = changeTwoDecimal2(val * 100) + '%'
        } else if (val) {
          temp = changeTwoDecimal2(val)
        }
        return temp
      },
      warningFormatter (row) {
        let rate = row.warningRates
        if (rate) {
          if ((rate <= 1 && rate > 0) || (rate >= -1 && rate < 0)) { // 百分比
            rate = changeTwoDecimal2(row.warningRates * 100) + '%'
          }
          let prefix = ''
          if (row.warningTitle && row.warningType) {
            prefix = `${row.warningTitle} ${row.warningType}`
          }
          return prefix + rate
        }
      },
      resetTemplate() { // 获取填报模板
        this.loading = true
        request({
          url: '/BUSINESSREPORT/summary/getTemplete',
          params: {
            post: this.searchForm.post,
            period: this.planYearMonth
          }
        }).then(res => {
          this.tableData = res.data.map(item => {

            return item
          })
          this.loading = false
        }).catch(error => {
          this.loading = false
        })
      },
      queryData () {
        if (!this.orgInfo) {
          this.$message.warning('请选择组织')
          return
        }
        const query = {
          ...this.searchForm,
          orgId: this.orgInfo.id,
          orgNumber: this.orgInfo.longNumber,
          orgType: this.orgInfo.type,
          period: this.planYearMonth
        }
        request({
          url: `/BUSINESSREPORT/summary/listMy`,
          params: query
        }).then(res => {
          if (res.data && res.data.length > 0) {
            if (res.data instanceof Array) {
              this.formData = res.data[0]
            } else {
              this.formData = res.data
            }
            this.initSubData(this.formData)
          } else {
            this.addNewBody()
          }
        })
      },
      initSubData(data) {
        const id = data.id
        this.loading = true
        request({
          url: `/BUSINESSREPORT/summary/listEntry/${id}`
        }).then(res => {
          if (res && res.data) {
            const fixedColumn = ['lastTarget', 'lastComplete', 'completeRates', 'warning', 'target']
            this.tableData = res.data.map(item => {
              fixedColumn.forEach(ii => {
                // item[ii] = floatFixed(item[ii],2)
              })
              return item
            })
          }
          this.loading = false
        }).catch(error => {
          this.loading = false
        })
      },
      unauditHandler () {
        this.fullLoading = true
        request({
          url: `/BUSINESSREPORT/orgSpRecord/checkReportIsSp`,
          params: {
            orgId: this.orgInfo.id,
            dateMonth: this.planYearMonth
          }
        }).then(res => {
          this.fullLoading = false
          if (res.data === '成功') {
            this.auditHandler(0)
          } else {

          }
        }).catch(error => {
          console.log(error)
          this.fullLoading = false
        })
      },
      auditHandler(status) {
        const id = this.formData.id
        const msgMap = {
          0: '反审核',
          1: '提交',
          2: '审核'
        }
        const msg = msgMap[status]
        this.$confirm(`是否确认${msg}?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          request({
            url: '/BUSINESSREPORT/summary/updateStatus',
            method: 'post',
            params: {
              id: id,
              status: status
            }
          }).then(res => {
            if (res.status === 200) {
              this.$message.success(`${msg}成功`)
            } else {
              this.$message.success(`${msg}失败`)
            }
            this.queryData()
          }).catch(error => {
            // 刷新数据
            this.queryData()
            console.log(error)
          })
        })
      },
      insertEvent() {
        const record = {}
        this.$refs.xTable.insert(record)
          .then(({ row }) => this.$refs.xTable.setActiveCell(row, 'type'))
      },
      // 通用行合并函数（将相同多列数据合并为一行）
      rowspanMethod({ row, $rowIndex, column, columnIndex, data }) {
        let fields = ['quotaBigType', 'quotaSmallType']
        let cellValue = row[column.property]
        if (cellValue && fields.includes(column.property)) {
          let prevRow = data[$rowIndex - 1]
          let nextRow = data[$rowIndex + 1]
          if (prevRow && prevRow[column.property] === cellValue) {
            return { rowspan: 0, colspan: 0 }
          } else {
            let countRowspan = 1
            while (nextRow && nextRow[column.property] === cellValue) {
              nextRow = data[++countRowspan + $rowIndex]
            }
            let colspan = 1
            if (columnIndex == 0 && row.quotaSmallType == row.quotaBigType) {
              colspan = 2
            } else if (columnIndex == 1 && row.quotaSmallType == row.quotaBigType) {
              colspan = 0
            }
            if (countRowspan > 1) {
              return { rowspan: countRowspan, colspan: colspan }
            }
          }
        }
      },
      saveHandler() { // 保存、审核传递post
        const entryData = this.$refs.xTable.getTableData().fullData
        if (!this.formData) {
          this.$XModal.message({ message: '请填写必要信息!', status: 'warning' })
          return
        }
        if (!entryData || entryData.length === 0) {
          this.$XModal.message({ message: '请填写必要信息!', status: 'warning' })
          return
        }
        const obj = this.formData
        obj.post = this.searchForm.post
        obj.status = 0
        const formData = {
          summary: obj,
          list: entryData
        }
        let url = '/BUSINESSREPORT/summary/save'
        request({
          url: url,
          method: 'post',
          data: formData
        }).then(res => {
          if (res.status === 200) {
            this.$XModal.message({ message: '保存成功!', status: 'success' })
          }
          // 刷新数据
          this.queryData()
        }).catch(error => {
          console.log(error)
        })
      },
      vaildForm() {
        return Promise((resolve, reject) => {
          this.this.$refs.xTable.fullValidate((valid, errMap) => {
            if (!valid) {
              reject('请输入必填字段')
            } else {
              resolve()
            }
          })
        })
      },
    },
    watch: {
      orgInfo: {
        handler (val) {
          if (val) {
            if (this.postMap[val.type]) {
              this.disabled = false
              // 岗位
              let post = this.postMap[val.type] ? this.postMap[val.type][0].value : ''
              this.searchForm.level = parseInt(val.type)
              this.level = parseInt(val.type)
              this.$set(this, 'level', parseInt(val.type))
              this.searchForm.orgId = val.id
              if (val.name.indexOf('服务部') > 0) {
                post = 'FWB'
              }
              this.$set(this.searchForm, 'post', post)
              if (!this.firstLoaded) {
                this.firstLoaded = true
                this.$set(this.searchForm, 'period', moment().format('YYYY-MM'))
              }
              this.queryData()
            } else {
              this.$message.warning(`当前组织层级:${this.levelMap[val.type]}。请选择事业部、片区、分公司、猪场、服务部层级组织进行操作`)
              this.disabled = true
            }

          }
        },
        immediate: true,
        deep: true
      },
      searchForm: {
        handler (val) {
          console.log('searchForm')
          this.queryData()
        },
        deep: true
      },
      planYearMonth (val, oldVal) {
        if(val !== oldVal) {
          this.queryData()
        }
      }
    },
    computed: {
      filterPosts () {
        if (!this.level) {
          return []
        } else {
          return this.postMap[this.level]
        }
      },
      editConfig() {
        if (this.disabled) {
          return {}
        } else {
          return {
            trigger: 'click',
            mode: 'row',
            showStatus: true
          }
        }
      },
      ...mapGetters(['orgInfo', 'userId', 'name', 'planYearMonth'])
    }
  }
</script>

<style scoped lang="scss">
  .content-container {
    margin: 20px 16px;
    padding: 8px;
    background-color: #fff;
    height: calc(100vh - 90px);
  }

  /deep/ .ch-textIndent{
    text-indent: 25px;
  }
  /deep/ .ch-bg-gary{
    background-color: #F8F8F9;
  }
  /deep/ .ch-bg-gary2{
    background-color: #F4F4FA;
  }
  /deep/ .ch-bg-green{
    background-color: #F0F9F5;
  }

  @media screen and (max-width: 1281px) {
    /deep/ .page-form-item {
      font-size: 13px;
    }
  }

</style>
