<template>
  <div v-loading.fullscreen.lock="loading">
    <formTitle title="关键业绩指标达成分析">
      <div slot="context">
        <page-form
          v-bind="formOptions"
          :model="formData"
          :editable="false"
          ref="PageForm"
        ></page-form>
      </div>
      <div slot="title-suffix">
        <el-button
          v-if="projectId&&status==0"
          size="small"
          class="el-button-audit"
          @click="audit(1)">提交
        </el-button>
        <el-button
          v-if="projectId&&status==1"
          size="small"
          class="el-button-audit"
          @click="audit(2)">审核
        </el-button>
        <el-button
          v-if="projectId&&status==2"
          size="small"
          class="el-button-unaudit"
          @click="audit(0)">反审核
        </el-button>
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
          <el-upload
            style="display:inline-block;margin-left:10px;"
            ref="upload"
            :limit="1"
            v-if="status==0"
            :show-file-list="false"
            action="/projectFundingFeedback/excelUpload"
            accept=".xls,.xlsx"
            :http-request="importDataEvent"
            :file-list="fileList">
            <el-button icon="el-icon-download" size="small" class="el-button-submit">导入</el-button>
          </el-upload>
          <el-button size="small"
                     icon="el-icon-rank" @click="handleFullscreen">{{fullscreen?'退出全屏':'全屏'}}
          </el-button>
        </el-col>
      </el-row>
        <vxe-table
          ref="xTable"
          resizable
          class="mytable-style"
          highlight-hover-row
          :span-method="rowspanMethod"
          :data="tableData"
          :edit-rules="validRules"
          :mouse-config="{selected: true}"
          :edit-config="isEdit"
          :cell-class-name="cellClassName"
          :height="childTableHeight"
          :keyboard-config="{isArrow: true, isDel: true, isTab: true, isEdit: true}"
          border>
          <vxe-table-column title="项目" minWidth="100"  align="left" field="projectName">
            <template v-slot="{ row }">
              {{ row.projectName || '-' }}
            </template>
          </vxe-table-column>
          <vxe-table-column title="指标名称"  align="left" minWidth="100" field="kpiName">
            <template v-slot="{ row }">
              {{ row.kpiName || '-' }}
            </template>
          </vxe-table-column>
          <vxe-table-column :title="formatMonth(-1)+'月目标值'" align="right" minWidth="80"  field="lastMonthGoal">
            <template v-slot="{ row }">
              {{ row.lastMonthGoal || '-' }}
            </template>
          </vxe-table-column>
          <vxe-table-column :title="formatMonth(-1)+'月实际达成'"  align="right" minWidth="80" field="lastMonthActual"></vxe-table-column>
          <vxe-table-column title="预警值" field="warning"  align="right" minWidth="70">
            <template v-slot="{ row }">
              {{row.warning? percentFormat(row): '-' }}
              <!--{{ row.warning || '-' }}-->
            </template>
          </vxe-table-column>
          <vxe-table-column title="差距及原因分析" minWidth="100"  align="left"  field="causeAnalysis" :edit-render="{name: 'input'}" >
            <template v-slot:edit="{ row }">
              <el-input v-model="row.causeAnalysis" ></el-input>
            </template>
            <template v-slot="{ row }">
              {{ row.causeAnalysis || '-' }}
            </template>
          </vxe-table-column>
          <vxe-table-column title="应对策略和措施" minWidth="100"  align="left"  field="respondMethod" :edit-render="{name: 'input'}">
            <template v-slot:edit="{ row }">
              <el-input v-model="row.respondMethod" ></el-input>
            </template>
            <template v-slot="{ row }">
              {{row.respondMethod  || '-'}}
            </template>
          </vxe-table-column>
          <vxe-table-column  align="center" :title="formatMonth(0)+'月计划'">
            <vxe-table-column  align="right" field="paMonthPlan"  minWidth="80" :title="formatMonth(0)+'月计划'">
              <template v-slot="{ row }">
                {{ row.paMonthPlan || '-' }}
              </template>
            </vxe-table-column>
            <vxe-table-column  align="right" field="paFirstWeek"  minWidth="80"  title="1-7日">
              <template v-slot="{ row }">
                {{ row.paFirstWeek || '-' }}
              </template>
            </vxe-table-column>
            <vxe-table-column  align="right" field="paSecondWeek" minWidth="80"  title="8-14日">
              <template v-slot="{ row }">
                {{ row.paSecondWeek || '-' }}
              </template>
            </vxe-table-column>
            <vxe-table-column  align="right" field="paThirdWeek" minWidth="80"  title="15-21日">
              <template v-slot="{ row }">
                {{ row.paThirdWeek || '-' }}
              </template>
            </vxe-table-column>
            <vxe-table-column  align="right" field="paFourthWeek"  minWidth="80"  title="22-30日">
              <template v-slot="{ row }">
                {{ row.paFourthWeek || '-' }}
              </template>
            </vxe-table-column>
          </vxe-table-column>
          <vxe-table-column :title="formatMonth(1)+'月目标'"  align="right"  minWidth="80"  field="paNextMonthGoal">
            <template v-slot="{ row }">
              {{ row.paNextMonthGoal || '-' }}
            </template>
          </vxe-table-column>
          <vxe-table-column :title="formatMonth(2)+'月目标'"  align="right"  minWidth="80" field="paNext2MonthGoal">
            <template v-slot="{ row }">
              {{ row.paNext2MonthGoal || '-' }}
            </template>
          </vxe-table-column>
          <vxe-table-column title="责任人"  align="left"  minWidth="70"  field="ownersName" :edit-render="{name: 'input'}" >
            <template v-slot:edit="{ row }">
              <el-input v-model="row.ownersName" ></el-input>
            </template>
            <template v-slot="{ row }">
              {{ row.ownersName || '-' }}
            </template>

          </vxe-table-column>
          <vxe-table-column title="直接上级"  align="left" minWidth="90" field="superiorName" :edit-render="{name: 'input'}" >
            <template v-slot:edit="{ row }">
              <el-input v-model="row.superiorName" ></el-input>
            </template>
            <template v-slot="{ row }">
              {{ row.superiorName || '-' }}
            </template>
          </vxe-table-column>
        </vxe-table>
      </div>
  </div>
</template>

<script>
  import {queryList,submitData,exportData,auditData,importReport} from "@/api/serviceDepartment/importantKpi";
  import  orgTree from "../../../fillInReport/servicePlan/conserveLoans/orgTree"
  import {mapGetters} from  'vuex'
  import formTitle from "@/components/formTitle/formTitle";
  import PageForm from "@/components/form/Form";
  import common from  './common'
  import axios from 'axios'
  import { changeTwoDecimal2 } from '@/utils' // 四舍五入
  export default {
    name: 'maintenanceLoan',
    components: {orgTree,formTitle,PageForm},
    mixins:[common],
    data(){
      return {
        validRules: { // 校验规则
          causeAnalysis: [{
            required: true,
            message: '差距及原因分析必须填写'
          }],
          respondMethod: [{
            required: true,
            message: '应对策略和措施必须填写'
          }],
          ownersName: [{
            required: true,
            message: '责任人必须填写'
          }],
          superiorName: [{
            required: true,
            message: '直接上级必须填写'
          }]
        },
        fullScreenText:'全屏',
        isColor:'',
        fileList:[]
      }
    },

    computed:{
      ...mapGetters(['orgInfo','token','planYearMonth']),
      isEdit () {
        if (this.status==1) {
          return {}
        } else {
          return {
            trigger: 'click',
            mode: 'row',
            showStatus: true
          }
        }
      },
    },
    methods:{
      _checkImportReport(_file) {  // 校验导入文件
        let fileExtension = _file.name.substring(_file.name.lastIndexOf('.') + 1);
        if (fileExtension !== 'xls' && fileExtension !== 'xlsx') {
          this.$refs.upload.clearFiles();
          this.$message.warning('文件格式不正确，请重新上传！');
          return false;
        }
        let isLt20M = _file.size / 1024 / 1024 < 20;

        if (!isLt20M) {
          this.$refs.upload.clearFiles();
          this.$message.error("请上传20M以下的文件");
          return false;
        }
        return true
      },
      importDataEvent (params) {
        // this.$refs.xTable.openImport()
        const _file = params.file;
        if (!this._checkImportReport(_file)) {
          return;
        }

        let formData = new FormData();
        formData.append("file", _file);
        importReport(this.projectId,formData).then(res => {
          this.$refs.upload.clearFiles();
          if (res.status === 200) {
            this.tableData = res.data;
            this.$message.success('导入成功');
          } else {
            this.$message.error('导入失败');
          }
        }).catch(err => {
          this.$refs.upload.clearFiles();
          this.$message.error(`${err}`);
        });
      },
      percentFormat(row){
        let rate = row.warning
        if (rate) {
          if (row.kpiName.indexOf('占比') >= 0 || row.kpiName.indexOf('率') >= 0) { // 百分比
            rate = changeTwoDecimal2(row.warning * 100) + '%'
          }
          let prefix = ''
          if (row.warningTitle && row.warningType) {
            prefix = `${row.warningTitle} ${row.warning}`
          }
          return prefix + rate
        }
      },
      cellClassName ({ row, rowIndex, column, columnIndex }) {
        if (column.property === 'warning') {
          if (row.colorMark == 0) {
            return 'col-red'
          } else if (row.colorMark == 1) {
            return 'col-yellow'
          }
        }
        if(['projectName','kpiName'].includes(column.property)){
          return 'col-grey'
        }
        if(['lastMonthGoal'].includes(column.property)){
          return 'col-act'
        }
        if(['lastMonthActual'].includes(column.property)){
          return 'col-finish'
        }
      },
      exportChildData(){
        /*this.$refs.xTable.exportData({ type: 'csv',
          filename:'关键业绩指标达成分析',
            original: false, // 导出表头是否为字段名
            isHeader: true, // 是否导出表头
             })*/
        if(this.projectId){
          axios({
            method: 'get',
            url: `${process.env.BASE_API}/BUSINESSREPORT/performanceAnalysisEntry/exportExcel/${this.projectId}`,
            responseType: 'blob', // important
            timeout: 1000 * 30,
            headers: {
              Authentication: this.token,
              filename:'utf-8'
            }
          }).then(response => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', '关键业绩指标达成分析.xls');
            document.body.appendChild(link);
            link.click();
          }).catch(error => {
            this.loading = false
            console.log(error)
          })
        }else {
          this.$message.warning('暂无数据')
        }

      },
      audit(status){
        if(status!=2){
          this.$refs.xTable.validate(valid => {
            if (!valid) {
              this.$XModal.message({ status: 'error', message: '校验不通过！' })
            }else {
              this.auditData(status)
            }
          })
        }else{
          this.auditData(status);
        }
      },
      auditData(status){
        let data =this.mainTableData;
        data[0].status=status;
        this.loading=true;
        const formData = {
          ...data[0],
          performanceAnalysisEntry: this.tableData
        }
        let tipsText=['反审核','提交','审核'];
        auditData(formData).then(res=>{
          this.loading=false;
          if(res.status==200){
            this.$message.success(`${tipsText[status]}成功`);
            this.getProjectList(this.searchForm);
          }
        }).catch(err=>{
          this.loading=false;
          this.$message.error(`${tipsText[status]}失败`);
        })
      },
      submit(){
        let data =this.mainTableData;
        data[0].status=2;
        this.loading=true;
        submitData(data[0]).then(res=>{
          this.loading=false;
          if(res.status==200){
            this.$message.success('提交成功');
            this.getProjectList(this.searchForm);
          }
        }).catch(err=>{
          this.loading=false;
          this.$message.error('提交失败');
        })
      },
      rowspanMethod({ row, $rowIndex, column, columnIndex, data }) {
        const fields = ['projectName']
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
      month() {
        let m = this.planYearMonth;
        console.log(m.slice(-1,2))
      },
      activeCellMethod ({ column, columnIndex }) {
        if (columnIndex === 5) {
          return false
        }
        return false
      },
      getProjectList(query){
        this.loading=true;
        queryList(query).then(res=>{
          this.loading=false;
          if(res.data&&res.data.performanceAnalysisEntry){
            this.mainTableData=[res.data];
            this.formData=res.data;
            this.projectId=res.data.id;
            this.tableData=res.data.performanceAnalysisEntry;
            this.status=res.data.status;
          }else{
            this.tableData=[];
            this.formData={};
            this.mainTableData=[]
          }
        }).catch(error=>{
          this.loading=false;
        })
      }
    }

  }
</script>

<style lang="scss" scoped>
  /deep/ .page-form-container{
    margin:0 !important;
  }
  /deep/ .col-red {
    background-color: #FFD7D7;
    color: #666666;
  }
  /deep/ .col-yellow {
    background-color: #FFFAAF;
    color: #666666;
  }
  /deep/ .col-grey {
    background-color: #F8F8F9;
    color: #333333;
  }
  /deep/ .col-act {
    background-color:#F4F4FA;
    color: #333333;
  }
  /deep/ .col-finish {
    background-color:#F0F9F5;
    color: #333333;
  }
  .page-content {
    box-sizing: border-box;
    margin: 10px 10px;
    padding: 16px 20px;
    border-radius: 5px;
    background-color: #fff;

    .content-head {
      padding: 0 0 16px 0;
      .dot{
        margin-right: 10px;
      }
      .title {
        font-weight: bold;
        font-size: 14px;
        color: #333333;
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
