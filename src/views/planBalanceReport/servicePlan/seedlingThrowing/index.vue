<template>
<div v-loading.fullscreen.lock="loading">
  <div class="head_title">
    <formTitle title="月度投苗计划">
      <div slot="context">
        <page-form
          v-bind="formOptions"
          :model="formData"
          :editable="false"
          ref="PageForm"
        ></page-form>
      </div>
      <div slot="title-suffix">
        <el-button :type="status == 1?'primary':'danger'" plain size="small" v-if="reverseAuditStatus" @click="auditEvent">{{ status == 1?'审核':'反审核' }}</el-button>
        <el-button type="primary" size="small" v-if="isSumit" @click="submit">提交</el-button>
      </div>
    </formTitle>
  </div>
    <div class="box" ref="pageContent">
       <el-row class="but-box" type="flex" align="middle">
        <el-col style="text-align: left">
          <span class="dot"></span>
          <span class="title_name">月度投苗计划汇总</span>
        </el-col>
        <el-col :span="12" style="text-align: right">
          <el-button icon="el-icon-upload2" class="el-button-audit" size="small" @click="exportDataEvent">导出</el-button>
          <el-button
            size="small"
            icon="el-icon-rank"
            @click="handleFullscreen"
          >{{fullscreen?'退出全屏':'全屏'}}</el-button>
        </el-col>
      </el-row>
      <vxe-table
        header-align="center"
        :height="childTableHeight"
        ref="xTable"
        resizable
        :loading="loading"
        :data="tableData"
        class="summaryTable"
        :show-footer="showFooter"
        :footer-method="footerMethod"
        :footer-cell-style="footerCellStyle"
        :footer-cell-class-name="footerCellClass"
        :cell-style="cellStyle"
        @cell-click="cellClick"
        :keyboard-config="{isArrow: true, isDel: true, isTab: true, isEdit: true}"
        border
        >
        <vxe-table-column title="组织"  field="orgName" width="138" ></vxe-table-column>
        <vxe-table-column v-for="(item,index) in dataHead" :key="index" :title="item.title">
          <vxe-table-column v-for="(i,idx) in item.children" :key="idx" align="right"  :title="i.title" min-width="100" :field="i.key" >
            <template v-slot="{ row }">
                {{ rounding(row[i.key]) }}
            </template>
          </vxe-table-column>
        </vxe-table-column>
      </vxe-table>
    </div>
</div>
</template>

<script>
import formTitle from "@/components/formTitle/formTitle";
import PageForm from "@/components/form/Form";
import { getForNew, add, getTree, unAudit, checkReportIsSp, audit,exportExcel,getSubOrg} from '@/api/seedlingThrowing/index'
import { parseTime } from '@/utils/index'
import { exportMethod } from '@/utils/export'
import $ from 'jquery'
export default {
    name: 'seedlingThrowing',
    components: { formTitle, PageForm },
    created(){
      if (this.$route.query.orgId) {
        this.orgLongNum = this.$route.query.orgLongNum
        this.orgId = this.$route.query.orgId
        this.orgIdthree = this.$route.query.orgId
        this.period = this.$route.query.yearMonth
        this.orgIdthree2 = this.$route.query.orgIdthree
        this.type = this.$route.query.type
        this.orgId2 = this.$route.query.orgId2
        if(this.orgIdthree2){
          let params = {
            orgId : this.orgIdthree2,
            type : parseInt(this.type),
          }
            getSubOrg(params).then(res =>{
              if (res.status == 200) {
                console.log(res);
                for (const item of res.data) {
                console.log(item.id);
                if(item.id === this.orgId){
                  this.orgId3 = item.id
                  this.parentOrgId3 = item.parentId
                  this.orgName3 = item.name
                  this.longNumber3 = item.longNumber
                  console.log(item);
                  return
                }
              }
            }
          })
        }else{
          let params = {
            orgId : this.orgId2,
            type : parseInt(this.type),
          }
            getSubOrg(params).then(res =>{
              if (res.status == 200) {
                console.log(res);
                for (const item of res.data) {
                console.log(item.id);
                if(item.id === this.orgId){
                  this.orgId3 = item.id
                  this.parentOrgId3 = item.parentId
                  this.orgName3 = item.name
                  this.longNumber3 = item.longNumber
                  console.log(item);
                  return
                }
              }
            }
          })
        }
        this.search()
      }else if (this.$store.getters.orgInfo) {
        this.orgLongNum = this.$store.getters.orgInfo.longNumber
        this.type = parseInt(this.$store.getters.orgInfo.type)
        this.orgId = this.$store.getters.orgInfo.id
        this.orgId2 = this.$store.getters.orgInfo.id
        this.parentOrgId = this.$store.getters.orgInfo.parentId
        this.orgName = this.$store.getters.orgInfo.name
        if (this.$store.getters.planYearMonth) {
          this.period = this.$store.getters.planYearMonth
          this.search()
        }
      }
    },
    computed:{
      longNumber(){
        return this.$store.getters.orgInfo
      },
      yearMonth(){
        return this.$store.getters.planYearMonth
      }
    },
    mounted() {
      const that = this
      $('.box').delegate('.checkDetails', 'click', function() {
        if (that.orgId && that.period) {
          that.$router.push({ path: '/pagePenetrationFour', query: {orgId: that.orgId,yearMonth:that.period,type: that.type, pagehead:"seedingPlan"}});
        }else{
          that.$message({
            message: '请先选择组织与计划期间',
            type: "warning"
          });
        }
      });
      window.onresize = () => {  // 动态监听窗口大小
      this.fullscreen = this._isFullscreenEnable()
        return (() => {
          this.computedDOMHeight()
        })()
      }
      this.$nextTick(() => {  // 根据当前屏幕高度计算子表内容区高度
        this.computedDOMHeight()
      })
    },
    watch:{
      longNumber(val){
        this.orgLongNum = val.longNumber
        this.type = parseInt(val.type)
        this.orgId = val.id
        this.parentOrgId = val.parentId
        this.orgName = val.name
        if (this.period) {
          this.search()
        }
      },
      yearMonth(val){
        this.period = val
        if (this.orgId) {
          this.search()
        }
      }
    },
    data(){
        return {
          orgIdthree:"",
          orgIdthree2:"",
          longNumber3:"",
          orgName3:"",
          orgId3:"",
          parentOrgId3:"",
          fullscreen:"",
          childTableHeight:300,
          status: null,
          loading: false,
          orgId: '',
          parentOrgId: '',
          orgId2:"",
          showFooter: false,
          orgName: '',
          type: null,
          detailsType: null,
          isSumit: false,
          reverseAuditStatus: false,
          orgLongNum: '',
          period: '',
          formOptions: {
            labelWidth: "150px",
            options: [
              {
                label: "提交人",
                prop: "submitor",
                span: 4.8,
              },
              {
                label: "提交日期",
                prop: "submitDate",
                span: 4.8,
              },
              {
                label: "审批人",
                prop: "approver",
                span: 4.8,
              },
              {
                label: "审批日期",
                prop: "approveDate",
                span: 4.8,
              },
              {
                label: "状态",
                prop: "status",
                span: 4.8,
                fontStyle: {color: '#2BB687'},
                valueFormat: true
              }
            ]
          },
          formData: {},
          dataHead:[
            {
              title: '投苗小计',
              children: [
                {
                  title: '小计',
                  key: 'totalQuantity',
                },
                {
                  title: '1-7日',
                  key: 'firstWeekTq',
                },
                {
                  title: '8-14日',
                  key: 'secondWeekTq',
                },
                {
                  title: '15-21日',
                  key: 'thirdWeekTq',
                },
                {
                  title: '22-30日',
                  key: 'fourthWeekTq',
                }
              ]
            },
            {
              title: '其中：投内调苗',
              children: [
                {
                  title: '小计',
                  key: 'inPurchaseSubtotal'
                },
                {
                  title: '1-7日',
                  key: 'firstWeekIpSt',
                },
                {
                  title: '8-14日',
                  key: 'secondWeekIpSt',
                },
                {
                  title: '15-21日',
                  key: 'thirdWeekIpSt',
                },
                {
                  title: '22-30日',
                  key: 'fourthWeekIpSt',
                }
              ]
            },
            {
              title: '其中：投外购苗',
              children: [
                {
                  title: '小计',
                  key: 'outPurchaseSubtotal'
                },
                {
                  title: '1-7日',
                  key: 'firstWeekOpSt',
                },
                {
                  title: '8-14日',
                  key: 'secondWeekOpSt',
                },
                {
                  title: '15-21日',
                  key: 'thirdWeekOpSt',
                },
                {
                  title: '22-30日',
                  key: 'fourthWeekOpSt',
                }
              ]
            },
          ],
          props: {
            label: 'name',
            value: 'longNumber'
          },
          tableData: [],
          mainTableData:[],
          treeData:[]
        }
    },
    methods:{
      // 数值取整
      rounding(data){
        if (data && data !='' && data != 0) {
          return Math.round(data)
        } else {
          return '-'
        }
      },
      /**
       * 给表尾合计单元格添加class
       */
      footerCellClass({ row, rowIndex, column, columnIndex }){
        if (columnIndex == 0) {
          return 'checkDetails'
        }
      },
      handleFullscreen() {
        let fullarea = this.$refs.pageContent;
        if (this.fullscreen) {
          // 退出全屏
          if (document.exitFullscreen) {
            document.exitFullscreen();
          } else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
          } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
          } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
          }
        } else {
          // 进入全屏
          if (fullarea.requestFullscreen) {
            fullarea.requestFullscreen();
          } else if (fullarea.webkitRequestFullScreen) {
            fullarea.webkitRequestFullScreen();
          } else if (fullarea.mozRequestFullScreen) {
            fullarea.mozRequestFullScreen();
          } else if (fullarea.msRequestFullscreen) {
            // IE11
            fullarea.msRequestFullscreen();
          }
        }
        // this.fullscreen = !this.fullscreen;
      },
      _isFullscreenEnable() {
        return document.fullscreen || document.isFullScreen || document.mozIsFullScreen || document.webkitIsFullScreen
      },
      computedDOMHeight() {
        let curClientHeight = document.body.clientHeight  // 当前屏幕高度
        let pageContentHeight = curClientHeight - this.$refs.pageContent.getBoundingClientRect().top
        this.$refs.pageContent.style.height = (pageContentHeight - 10) + 'px'
        let contentHeadHeight = document.querySelectorAll('.but-box')[0].offsetHeight
        this.childTableHeight = pageContentHeight - contentHeadHeight - 40
      },
      // 表格样式更改
      cellStyle({ row, rowIndex, column, columnIndex }){
        if (columnIndex == 0) {
          return {
            color: '#1989fa',
            cursor: 'pointer'
          }
        } else if(column.title === '小计'){
          return {
            background: 'rgba(245,250,252,1)'
          }
        }
      },
      // 表格合计行样式更改
      footerCellStyle({ row, rowIndex, column, columnIndex }){
        if (columnIndex == 0) {
          return {
            color: '#1989fa',
            cursor: 'pointer',
            background: 'rgba(255,253,243,1)'
          }
        } else {
          return {
            background: 'rgba(255,253,243,1)'
          }
        }
      },
      stateFormat(state) {
        state = parseInt(state);
        let res = "";
        switch (state) {
          case 0:
            res = "保存";
            break;
          case 1:
            res = "提交";
            break;
          case 2:
            res = "审核通过";
            break;
          case 3:
            res = "退回";
            break;
          case 4:
            res = "驳回";
            break;
          default:
            res = "保存";
            break;
        }
        return res;
      },
      // 时间区间选择事件
      search(state){
        if (!this.orgId) {
          this.$message({
            message: "请选择组织！",
            type: "warning"
          });
          return false
        }
        if (!this.period) {
          this.$message({
            message: "请选择业务期间！",
            type: "warning"
          });
          return false
        }
        let params = {
          orgLongNum: this.orgLongNum,
          period: this.period,
          orgId: this.orgId,
          type: this.type
        }
        this.searchData(params)
      },
      searchData(params){
        getForNew(params).then(res =>{
          if (res.status == 200) {
            if (!res.data.rhSeedplSumInfo && res.data.entryInfoList && res.data.entryInfoList.length > 0) {
              let obj = {
                orgName: this.orgName,
                orgLongNumber: this.orgLongNum,
                period: this.period,
                submitor: this.$store.getters.name,
                submitorId: this.$store.getters.userId,
                createTime: parseTime(new Date(),'{y}-{m}-{d}'),
                submitDate: parseTime(new Date(),'{y}-{m}-{d}')
              }
              this.formData = obj
              this.isSumit = true
              this.reverseAuditStatus = false
            }else if (res.data.rhSeedplSumInfo){
              this.formData = res.data.rhSeedplSumInfo
              if ([1,2].includes(res.data.rhSeedplSumInfo.status)){
                this.status = res.data.rhSeedplSumInfo.status
                this.reverseAuditStatus = true
                this.isSumit = false
                if (this.status == 2) {
                  this.checkReport(res.data.rhSeedplSumInfo)
                }
              } else {
                this.reverseAuditStatus = false
                this.isSumit = false
              }
            }else{
              this.reverseAuditStatus = false
              this.formData = {}
            }
            if (res.data.entryInfoList && res.data.entryInfoList.length > 0) {
              this.tableData = res.data.entryInfoList
              this.showFooter = true
              this.$refs.xTable.refreshData()
            }else{
              this.showFooter = false
              this.tableData = []
            }
          }
        }).catch(err =>{
          this.formData = {}
          this.tableData = []
        })
      },
      submit(){
        this.$confirm('是否提交?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let obj = this.formData
          if(this.orgId3 && this.longNumber3){
            obj.orgId = this.orgId3
            obj.longNumber = this.longNumber3
            obj.orgName = this.orgName3
            obj.parentOrgId = this.parentOrgId3
          }else{
            obj.orgId = this.orgId
            obj.longNumber = this.longNumber
            obj.orgName = this.orgName
            obj.parentOrgId = this.parentOrgId
          }
          obj.status = 1
          let params = {
            entryInfoList: this.tableData,
            rhSeedplSumInfo: obj
          }
          this.loading = true
          add(params).then(res =>{
            if (res.status == 200) {
              this.formData = res.data.rhSeedplSumInfo
              this.tableData = res.data.entryInfoList
              if ([1,2].includes(res.data.rhSeedplSumInfo.status)){
                this.status = res.data.rhSeedplSumInfo.status
                this.reverseAuditStatus = true
                this.isSumit = false
                if (this.status == 2) {
                  this.checkReport(res.data.rhSeedplSumInfo)
                }
              } else {
                this.reverseAuditStatus = false
                this.isSumit = false
              }
              this.$message({
                message: "提交成功！",
                type: "success"
              });
              this.loading = false
            }
          }).catch(err =>{
            this.$message({
              message: "提交失败！",
              type: "warning"
            });
            this.loading = false
          })
        })
      },
      footerMethod({ columns, data }){
        return[
          columns.map((column, columnIndex) => {
            if (columnIndex === 0) {
              return '合计'
            }else{
              if (this.sum(data,column.property) && this.sum(data,column.property) !='' && this.sum(data,column.property) != 0) {
                return Math.round(this.sum(data,column.property))
              }else {
                return '-'
              }
            }
          })
        ]
      },
      sum(list, key){
        let sum = 0
        list.forEach(element => {
          sum += parseFloat(element[key] || 0);
        });
        return sum
      },
      cellClick({row, rowIndex, column, columnIndex},event){
        if (columnIndex == 0) {
          if (row.orgLongNumber) {
            if(parseInt(this.type) == 1){
              this.$router.push({ path: '/planBalanceReport/servicePlan/seedlingThrowing'+(parseInt(this.type)+2), query: {orgId: row.orgId,orgId2:this.orgId2,orgIdthree:this.orgIdthree,yearMonth:this.period,orgLongNum: row.orgLongNumber,type:parseInt(this.type)+2}});
            }else{
              this.$router.push({ path: '/planBalanceReport/servicePlan/seedlingThrowing'+(parseInt(this.type)+1), query: {orgId: row.orgId,orgId2:this.orgId2,orgIdthree:this.orgIdthree,yearMonth:this.period,orgLongNum: row.orgLongNumber,type:parseInt(this.type)+1}});
            }
          }else{
            this.$router.push({ path: '/servicePlan/seedlingPlan', query: {orgId: row.orgId,yearMonth:this.period}});
          }
        }
      },
      // 反审核 审核
      auditEvent(){
        let tips = this.status==1?'审核':'反审核'
        this.$confirm(tips, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          if (this.status == 1) {
            let params = {
              entryInfoList: this.tableData,
              rhSeedplSumInfo: this.formData
            }
            this.loading = true
            audit(params).then(res => {
              if (res.status == 200) {
                this.$message({
                  message: "审批成功！",
                  type: "success"
                });
                this.loading = false
                this.search(true)
              }
            }).catch(err =>{
            this.loading = false
          })
          }else if (this.status == 2) {
            let params = {
              rhSeedplSumInfo: this.formData
            }
            this.loading = true
            unAudit(params).then(res => {
              if (res.status == 200) {
                this.$message({
                  message: "操作成功！",
                  type: "success"
                });
                this.loading = false
                this.search(true)
              }
            }).catch(err =>{
            this.loading = false
          })
          }
        })
      },
      checkReport(data){
        let params = {
          orgId: data.orgId,
          dateMonth: data.period
        }
        checkReportIsSp(params).then(res => {
          if (res.status != 200) {
            this.reverseAuditStatus = false
          }
        })
      },
      // 导出数据
      exportDataEvent(){
        if(this.formData.id){
          let myObj = {
            method: 'get',
            url:'rhseedplsum/exportExcel',
            fileName: '月度投苗计划汇总表',
            params: this.formData.id
          }
         exportMethod(myObj)
        }else{
          this.$message({
          message: "未提交,暂时不能导出！",
          type: "warning"
          });
        }
        // if (this.tableData.length > 0) {
        //   this.$refs.xTable.exportData({
        //     filename: '月度投苗计划汇总',
        //     type: 'csv',
        //     original: false,
        //     isHeader: true,
        //   })
        // }
      },
    }
}
</script>

<style lang="scss" scoped>
/deep/ .el-input{
  width: auto;
}
/deep/ .el-input.is-disabled .el-input__inner{
  border: 1px solid #E4E7ED;
}
  .head_title{
    padding: 0px 0px 10px 0px;
  }
  .title_name{
    color: #4d4d4d;
    font-size: 14px;
    font-family: PingFangSC;
    font-weight: bold;
  }
  .box{
    margin: 0px 10px 0px 10px;
    padding: 10px 20px 10px 20px;
    background-color: #fff;
    .but-box{
      //text-align: right;
    }
    .summaryTable{
      margin-top: 10px;
    }
}
</style>
