<template>
  <div v-loading="loading">
      <card title="效率提升指标" showHead>
        <template #head_suffix>
          <el-button size="small" class="el-button-audit" v-show="!disabled && formData && formData.status === 0" @click="saveHandler">保存</el-button>
          <el-button size="small" class="el-button-submit" v-show="!disabled && formData && formData.status === 0" @click="submitHandler">提交</el-button>
          <el-button size="small" class="el-button-audit" v-show="!disabled && formData && formData.status === 1" @click="auditHandler">审核</el-button>
          <el-button size="small" class="el-button-audit" v-show="!disabled && formData && formData.status === 2" @click="unAuditHandler">反审核</el-button>
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
          <el-button size="small" :disabled="loading" @click="exportData"  icon="el-icon-upload2" class="el-button-audit">
            导出
          </el-button>
          <el-button :disabled="loading"
                     v-show="!disabled && formData && formData.status === 0"
                     @click="importData"
                     size="small"
                     icon="el-icon-download"
                     class="el-button-submit">导入</el-button>
          <el-button size="small" icon="el-icon-rank" @click="handleFullscreen">{{fullscreen?'退出全屏':'全屏'}}
          </el-button>
        </template>

        <vxe-table
          ref="xTable"
          resizable
          :edit-config="editConfig"
          :loading="loading"
          :span-method="rowspanMethod"
          :data="tableData"
          :cell-class-name="cellClassName"
          :edit-rules="validRules"
          :mouse-config="{selected: true}"
          :keyboard-config="{isArrow: true, isDel: true, isTab: true, isEdit: true}"
          border
          :height="autoHeight">
          <vxe-table-column title="指标名称" field="kname" width="100">
          </vxe-table-column>
          <vxe-table-column align="right" title="上月目标值" width="80" field="lastMonthGoal">
            <template #header>
              {{ monthText(-1) }}目标值
            </template>
            <template v-slot="{ row }">
              {{ row.lastMonthGoal || '-' }}
            </template>
          </vxe-table-column>
          <vxe-table-column align="right" title="上月实际完成" field="lastMonthActual" width="80">
            <template #header>
              {{ monthText(-1) }}实际完成
            </template>
            <template v-slot="{ row }">
              {{ row.lastMonthActual ? quotaFormat(row.lastMonthActual, row.kname) : '-' }}
            </template>
          </vxe-table-column>
          <vxe-table-column align="right" title="预警值" width="80" field="warning">
            <template v-slot="{ row }">
              <!--{{ row.warning || '-' }}-->
              {{row.warning? percentFormat(row): '-' }}
            </template>
          </vxe-table-column>
          <vxe-table-column title="差距及原因分析" align="right" width="100" field="causeAnalysis" :edit-render="{type: 'default'}">
            <template v-slot:edit="scope">
              <el-input type="text" v-model="scope.row.causeAnalysis" @change="$refs.xTable.updateStatus(scope)"></el-input>
            </template>
            <template v-slot="{ row }">
              {{ row.causeAnalysis || '-' }}
            </template>
          </vxe-table-column>
          <vxe-table-column title="应对策略和措施" align="right" width="100" field="respondMethod" :edit-render="{type: 'default'}">
            <template v-slot:edit="scope">
              <el-input type="text" v-model="scope.row.respondMethod" @change="$refs.xTable.updateStatus(scope)"></el-input>
            </template>
            <template v-slot="{ row }">
              {{ row.respondMethod || '-' }}
            </template>
          </vxe-table-column>
          <vxe-table-column title="本月计划" align="right">
            <template #header>
              {{ monthText(0) }}计划
            </template>
            <vxe-table-column title="本月计划" align="right" width="80" field="analysisMonthPlan">
              <template v-slot="{ row }">
                {{ row.analysisMonthPlan ? quotaFormat(row.analysisMonthPlan, row.kname) : '-' }}
              </template>
            </vxe-table-column>
            <vxe-table-column title="1-7日" align="right" width="80" field="analysisFirstWeek">
              <template v-slot="{ row }">
                {{ row.analysisFirstWeek ? quotaFormat(row.analysisFirstWeek, row.kname) : '-' }}
              </template>
            </vxe-table-column>
            <vxe-table-column title="8-14日" align="right" width="80" field="analysisSecondWeek">
              <template v-slot="{ row }">
                {{ row.analysisSecondWeek ? quotaFormat(row.analysisSecondWeek, row.kname) : '-' }}
              </template>
            </vxe-table-column>
            <vxe-table-column title="15-21日" align="right" width="80" field="analysisThirdWeek">
              <template v-slot="{ row }">
                {{ row.analysisThirdWeek ? quotaFormat(row.analysisThirdWeek, row.kname) : '-' }}
              </template>
            </vxe-table-column>
            <vxe-table-column title="22-30日" align="right" width="80" field="analysisFourthWeek">
              <template v-slot="{ row }">
                {{ row.analysisFourthWeek ? quotaFormat(row.analysisFourthWeek, row.kname) : '-' }}
              </template>
            </vxe-table-column>
          </vxe-table-column>
          <vxe-table-column align="right" field="analysisNextMonthGoal" width="80" title="下月目标">
            <template #header>
              {{ monthText(1) }}目标
            </template>
            <template v-slot="{ row }">
              {{ row.analysisNextMonthGoal ? quotaFormat(row.analysisNextMonthGoal, row.kname) : '-' }}
            </template>
          </vxe-table-column>
          <vxe-table-column align="right" field="analysisNext2MonthGoal" width="80" title="下下月目标">
            <template #header>
              {{ monthText(2) }}目标
            </template>
            <template v-slot="{ row }">
              {{ row.analysisNext2MonthGoal ? quotaFormat(row.analysisNext2MonthGoal, row.kname) : '-' }}
            </template>
          </vxe-table-column>
          <vxe-table-column align="left" field="ownersName" width="90" title="负责人" :edit-render="{name: 'input', props: {placeholder: '请输入值'}}">
            <template v-slot="{ row }">
              {{ row.ownersName || '-' }}
            </template>
          </vxe-table-column>
          <!-- ownersId superiorId -->
          <vxe-table-column align="left" field="superiorName" width="90" title="直接上级" :edit-render="{name: 'input', props: {placeholder: '请输入值'}}">
            <template v-slot="{ row }">
              {{ row.superiorName || '-' }}
            </template>
          </vxe-table-column>
        </vxe-table>
      </card>
    </div>
    <input type="file" id="effFileId" accept=".xlsx" style="display: none;">
  </div>
</template>

<script>
  import axios from 'axios'
  import DataTable from '@/components/DataTable'
  import moment from 'moment'
  import PageForm from "@/components/form/Form";
  import request from '@/utils/request'
  import { status2Str } from '@/utils'
  import { mapGetters } from 'vuex'
  import card from '@/components/card'
  import formOption from './formOption'
  import { changeTwoDecimal2 } from '@/utils' // 四舍五入
  import { exportReport } from '@/utils/export'
  export default {
    name: 'efficImproAnalysisIndex',
    mixins: [formOption],
    components: {
      DataTable,
      PageForm,
      card
    },
    filters: {
      dateFormat (data) {
        if (data) {
          return moment(parseInt(data)).format('YYYY-MM-DD')
        }
      }
    },
    data() {
      return {
        loading: false,
        searchForm: {},
        formData: {},
        page: {
          total: 0,
          pageSize: 20
        },
        disabled: false,
        listData: [],
        tableData: [],
        validRules: { // 校验规则
          causeAnalysis: [
            { required: true, message: '差距及原因分析必须填写' }
          ],
          respondMethod: [
            { required: true, message: '应对策略和措施必须填写' }
          ],
          ownersName: [
            { required: true, message: '负责人必须填写' }
          ],
          superiorName: [
            { required: true, message: '直接上级必须填写' }
          ]
        }
      }
    },
    methods: {
      init () {
        if (this.orgInfo) {
          request({
            url: `/BUSINESSREPORT/orgSpRecord/checkReportIsSave`,
            params: {
              orgId: this.orgInfo.id,
              dateMonth: this.planYearMonth
            }
          }).then(res => {
            if (res.data === '成功') {
            } else {
              this.disabled = true
            }
          })
        }
      },
      importData () {
        if (!this.formData.id) {
          this.$message.warning('请先保存!')
          return
        }

        const dom = document.getElementById('effFileId')
        dom.click()
        const listener = (e) => {
          const file = e.target.files[0]
          const data = new FormData()
          data.append('file', file)
          return request({
            url: `/BUSINESSREPORT/kpiAnalysisEntry/importExcelByList/${this.formData.id}`,
            method: 'post',
            data
          }).then(res => {
            dom.value = ''
            this.tableData = res.data
            console.log(res)
          }).catch(error => {
            dom.value = ''
          })
          dom.removeEventListener('change', listener)
        }
        dom.addEventListener('change',listener)
      },
      exportData () {
        const fileName = `效率提升指标${this.planYearMonth}`
        // if (this.formData.id) {
        //   exportMethod ({
        //     url: 'kpiAnalysisEntry/exportExcel',
        //     method: 'get',
        //     params: this.formData.id,
        //     fileName: fileName
        //   })
        // }
        const entryData = this.$refs.xTable.getTableData().fullData
        const formData = {
          ...this.formData,
          kpiAnalysisEntry: entryData
        }
        exportReport({
          url: 'kpiAnalysisEntry/exportExcelByList',
          fileName: fileName,
          method: 'post',
          data: formData
        })
      },
      percentFormat(row){
        let rate = row.warning;
        if (rate) {
          if (row.kname.indexOf('占比') >= 0 || row.kname.indexOf('率') >= 0) { // 百分比
            rate = changeTwoDecimal2(row.warning * 100) + '%'
          }
          let prefix = ''
          if (row.warningTitle && row.warningType) {
            prefix = `${row.warningTitle} ${row.warningType} ${row.warning}`
          }
          return prefix + rate
        }
      },
      quotaFormat(val, name) {
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
      getAutoHeightEl () {
        return this.$refs.xTable.$el
      },
      monthText (offset = 0) {
        return moment(this.planYearMonth, 'YYYY-MM').add(offset, 'months').format('YYYY年MM月')
      },
      queryData () {
        this.loading = true
        request({
          url: '/BUSINESSREPORT/kpiAnalysis/find',
          params: {
            period: this.planYearMonth,
            orgId: this.orgInfo.id
          }
        }).then(res => {
          this.loading = false
          const data = res.data
          if (!data) {
            this.tableData =  []
            this.addNewBody()
          } else {
            this.formData = res.data
            this.initSubData(data)
          }
        }).catch(() => {
          this.loading = false
        })
      },
      addNewBody () {
        const obj =  {
          orgName: this.orgInfo.name,
          orgId: this.orgInfo.id,
          orgLongNum: this.orgInfo.longNumber,
          status: 0,
          createTime: new Date().getTime(),
          period: this.planYearMonth
        }
        this.formData = obj
        // 获取模板
        this.resetTemplate()
      },
      submitHandler () {
        const entryData = this.$refs.xTable.getTableData().fullData
        this.vaildForm().then(() => {
          const formData = {
            ...this.formData,
            kpiAnalysisEntry: entryData
          }
          formData.status = 1
          let url = '/BUSINESSREPORT/kpiAnalysis/insertOrUpdate'

          this.$confirm('提交后无法修改，是否继续?', '提示', {
            type: 'warning'
          }).then(() => {
            request({
              url: url,
              method: 'post',
              data: formData
            }).then(res => {
              if (res.status === 200) {
                this.$XModal.message({ message: '提交成功!', status: 'success' })
              }
              // 刷新数据
              this.queryData()
            }).catch(error => {
              console.log(error)
            })
          })

        })
      },
      resetTemplate () {
        request({
          url: '/BUSINESSREPORT/kpiAnalysis/find',
          params: {
            orgId: this.orgInfo.id,
            period: this.planYearMonth
          }
        }).then(res => {
          this.tableData = res.data
        })
      },
      dataTablePageChange (val) {
        this.page.pageNum = val
        this.queryData()
      },
      vaildForm() {
        return new Promise((resolve, reject) => {
          const fullData = this.formData
          const entryData = this.$refs.xTable.getTableData().fullData
          if (!fullData || fullData.length === 0) {
            this.$XModal.message({ message: '请填写必要信息!', status: 'warning' })
            reject()
          }
          if (!entryData || entryData.length === 0) {
            this.$XModal.message({ message: '请填写必要信息!', status: 'warning' })
            reject()
          }
          this.$refs.xTable.fullValidate((valid, errMap) => {
            if (!valid) {
              let msgList = []
              Object.values(errMap).forEach(errList => {
                errList.forEach(params => {
                  let { rowIndex, column, rules } = params
                  rules.forEach(rule => {
                    msgList.push(`第 ${rowIndex + 1} 行 ${column.title} 校验错误：${rule.message}`)
                  })
                })
              })
              this.$XModal.message({
                status: 'error',
                message: () => {
                  return [
                    <div class="red" style="max-height: 400px;overflow: auto;">
                    {
                      msgList.map(msg => <div>{ msg }</div>)
                    }
                    </div>
                  ]
                }
              })
              reject()
            } else {
              resolve()
            }
          })
        })
      },
      initSubData(data) {
        this.tableData = data.kpiAnalysisEntry
      },
      auditHandler () {
        const entryData = this.$refs.xTable.getTableData().fullData
        this.vaildForm().then(() => {
          const formData = {
            ...this.formData,
            kpiAnalysisEntry: entryData
          }
          formData.status = 2
          this.$confirm('是否确认审核?', '提示', {
            type: 'warning'
          }).then(() => {
            request({
              url: '/BUSINESSREPORT/kpiAnalysis/approve',
              method: 'post',
              data: formData
            }).then(res => {
              if (res.status === 200) {
                this.$message.success('审核成功')
              } else {
                this.$message.success('审核失败')
              }
              this.queryData()
            }).catch(error => {
              // 刷新数据
              this.queryData()
              console.log(error)
            })
          })
        })
      },
      unAuditHandler () {
        // 判断能否反审核
        this.loading = true
        request({
          url: `/BUSINESSREPORT/orgSpRecord/checkReportIsSp`,
          params: {
            orgId: this.orgInfo.id,
            dateMonth: this.planYearMonth
          }
        }).then(res => {
          this.loading = false
          if (res.data === '成功') {
            this.doUnAudit()
          } else {
            this.$XModal.message({ message: '反审核失败!', status: 'error' })
          }
        })
      },
      doUnAudit () {
        const entryData = this.$refs.xTable.getTableData().fullData
        this.vaildForm().then(() => {
          const formData = {
            ...this.formData,
            kpiAnalysisEntry: entryData
          }
          formData.status = 0
          this.$confirm('是否确认反审核?', '提示', {
            type: 'warning'
          }).then(() => {
            request({
              url: '/BUSINESSREPORT/kpiAnalysis/approve',
              method: 'post',
              data: formData
            }).then(res => {
              if (res.status === 200) {
                this.$XModal.message({ message: '反审核成功!', status: 'success' })
              } else {
                this.$XModal.message({ message: '反审核失败!', status: 'error' })
              }
              this.queryData()
            }).catch(error => {
              // 刷新数据
              this.queryData()
              console.log(error)
            })
          })
        })
      },
      insertEvent() {
        const record = {}
        this.$refs.xTable.insert(record)
          .then(({ row }) => this.$refs.xTable.setActiveCell(row, 'type'))
      },
      rowspanMethod({ row, $rowIndex, column, columnIndex, data }) {
        const fields = ['projectType', 'project']
        const cellValue = row[column.property]
        if (cellValue && fields.includes(column.property)) {
          const prevRow = data[$rowIndex - 1]
          let nextRow = data[$rowIndex + 1]
          if (prevRow && prevRow[column.property] === cellValue) {
            return { rowspan: 0, colspan: 1 }
          } else {
            let countRowspan = 1
            while (nextRow && nextRow[column.property] === cellValue) {
              nextRow = data[++countRowspan + $rowIndex]
            }
            if (countRowspan > 1) {
              return { rowspan: countRowspan, colspan: 1 }
            }
          }
        }
      },
      cellClassName ({ row, rowIndex, column, columnIndex }) {
        if (['kname', 'lastMonthGoal'].includes(column.property)){
          return 'ch-bg-gray'
        }
        if (['lastMonthActual'].includes(column.property)) {
          return 'ch-bg-green2'
        }

        if (column.property === 'warning') {
          if (row.colorMark == 0) {
            return 'col-red'
          } else if (row.colorMark == 1) {
            return 'col-yellow'
          }
        }
      },
      saveHandler () {
        const entryData = this.$refs.xTable.getTableData().fullData
        const formData = {
          ...this.formData,
          kpiAnalysisEntry: entryData
        }
        let url = '/BUSINESSREPORT/kpiAnalysis/insertOrUpdate'
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
    },
    watch : {
      orgInfo: {
        handler (val) {
          if (val) {
            this.queryData()
            this.tableData = []
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
      editConfig () {
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
      ...mapGetters(['token', 'orgInfo', 'planYearMonth'])
    }
  }

</script>

<style lang="scss" scoped>
  /deep/ .ch-bg-gray {
    background-color: #F4F4FA;
  }
  /deep/ .ch-bg-green2 {
    background-color: #F0F9F5;
   }

  /deep/ .col-red {
    background-color: #FFD7D7;
    color: #666666;
  }
  /deep/ .col-yellow {
    background-color: #FFFAAF;
    color: #666666;
  }

  @media screen and (max-width: 1281px) {
    /deep/ .page-form-item {
      font-size: 13px;
    }
  }

</style>

