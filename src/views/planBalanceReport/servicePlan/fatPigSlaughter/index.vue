<template>
<div v-loading.fullscreen.lock="loading">
  <div class="head_title">
    <formTitle title="月度肥猪出栏计划">
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
          <span class="title_name">度肥猪出栏计划汇总</span>
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
        highlight-hover-row
        :show-footer="showFooter"
        :footer-method="footerMethod"
        :footer-cell-class-name="footerCellClass"
        :cell-style="cellStyle"
        :footer-cell-style="footerCellStyle"
        @cell-click="cellClick"
        :keyboard-config="{isArrow: true, isDel: true, isTab: true, isEdit: true}"
        border>
        <vxe-table-column title="组织"  field="orgName" width="100" ></vxe-table-column>
        <vxe-table-column v-for="(item,index) in dataHead" :key="index" :title="item.title" >
          <vxe-table-column v-for="(i,idx) in item.children" :key="idx" :title="i.title" min-width="100" :field="i.key" align="right">
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
import { getForNew, add, getTree, unAudit, checkReportIsSp, audit,getSubOrg} from '@/api/fatPigSlaughter/index'
import { parseTime } from '@/utils/index'
import { exportMethod } from '@/utils/export'
import $ from 'jquery'
export default {
    name: 'fatPigSlaughter',
    components: { formTitle, PageForm },
    created(){
      if (this.$route.query.orgId) {
        this.orgLongNum = this.$route.query.orgLongNum
        this.orgId = this.$route.query.orgId
        this.period = this.$route.query.yearMonth
        this.orgIdthree = this.$route.query.orgId
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
    mounted(){
      const that = this
      $('.box').delegate('.checkDetails', 'click', function() {
        if (that.orgId && that.period) {
          that.$router.push({ path: '/pagePenetrationFive', query: {orgId: that.orgId,yearMonth:that.period,type: that.type, pagehead:"promotionPig"}});
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
          orgId2:"",
          fullscreen:"",
          childTableHeight:300,
          status: null,
          loading: false,
          orgId: '',
          parentOrgId: '',
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
              title: '出栏小计',
              children: [
                {
                  title: '小计',
                  key: 'totalQuantity'
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
              title: '其中：正品外销',
              children: [
                {
                  title: '小计',
                  key: 'normalSalesSubtotal'
                },
                {
                  title: '1-7日',
                  key: 'firstWeekNsSt',
                },
                {
                  title: '8-14日',
                  key: 'secondWeekNsSt',
                },
                {
                  title: '15-21日',
                  key: 'thirdWeekNsSt',
                },
                {
                  title: '22-30日',
                  key: 'fourthWeekNsSt',
                }
              ]
            },
            {
              title: '其中：内调(提级)',
              children: [
                {
                  title: '小计',
                  key: 'gradeSalesSubtotal'
                },
                {
                  title: '1-7日',
                  key: 'firstWeekGsSt',
                },
                {
                  title: '8-14日',
                  key: 'secondWeekGsSt',
                },
                {
                  title: '15-21日',
                  key: 'thirdWeekGsSt',
                },
                {
                  title: '22-30日',
                  key: 'fourthWeekGsSt',
                }
              ]
            },
            {
              title: '其中：提前上市',
              children: [
                {
                  title: '小计',
                  key: 'advanceSalesSubtotal'
                },
                {
                  title: '1-7日',
                  key: 'firstWeekAsSt',
                },
                {
                  title: '8-14日',
                  key: 'secondWeekAsSt',
                },
                {
                  title: '15-21日',
                  key: 'thirdWeekAsSt',
                },
                {
                  title: '22-30日',
                  key: 'fourthWeekAsSt',
                }
              ]
            }
          ],
          props: {
            label: 'name',
            value: 'longNumber'
          },
          tableData: [],
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
            if (!res.data.plaMonoutplanSumInfo && res.data.entryInfoList && res.data.entryInfoList.length > 0) {
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
            }else if (res.data.plaMonoutplanSumInfo){
              this.formData = res.data.plaMonoutplanSumInfo
              if ([1,2].includes(res.data.plaMonoutplanSumInfo.status)){
                this.status = res.data.plaMonoutplanSumInfo.status
                this.reverseAuditStatus = true
                this.isSumit = false
                if (this.status == 2) {
                  this.checkReport(res.data.plaMonoutplanSumInfo)
                }
              } else{
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
            plaMonoutplanSumInfo: obj
          }
          this.loading = true
          add(params).then(res =>{
            if (res.status == 200) {
              this.formData = res.data.plaMonoutplanSumInfo
              this.tableData = res.data.entryInfoList
              if ([1,2].includes(res.data.plaMonoutplanSumInfo.status)){
                this.status = res.data.plaMonoutplanSumInfo.status
                this.reverseAuditStatus = true
                this.isSumit = false
                if (this.status == 2) {
                  this.checkReport(res.data.plaMonoutplanSumInfo)
                }
              } else{
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
              type: "error"
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
      /**
       * 给表尾合计单元格添加class
       */
      footerCellClass({ row, rowIndex, column, columnIndex }){
        if (columnIndex == 0) {
          return 'checkDetails'
        }
      },
      cellClick({row, rowIndex, column, columnIndex},event){
        if (columnIndex == 0) {
          if (row.orgLongNumber) {
            if(parseInt(this.type) == 1){
               this.$router.push({ path: '/planBalanceReport/servicePlan/fatPigSlaughter'+(parseInt(this.type)+2), query: {orgId: row.orgId,orgId2:this.orgId2,orgIdthree:this.orgIdthree,yearMonth:this.period,orgLongNum: row.orgLongNumber,type:parseInt(this.type)+2}});
            }else{
              this.$router.push({ path: '/planBalanceReport/servicePlan/fatPigSlaughter'+(parseInt(this.type)+1), query: {orgId: row.orgId,orgId2:this.orgId2,orgIdthree:this.orgIdthree,yearMonth:this.period,orgLongNum: row.orgLongNumber,type:parseInt(this.type)+1}});
            }
           
          }else{
            this.$router.push({ path: '/servicePlan/promotionPig', query: {orgId: row.orgId,yearMonth:this.period}});
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
              plaMonoutplanSumInfo: this.formData
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
              plaMonoutplanSumInfo: this.formData
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
              url:'plamonoutplansum/exportExcel',
              fileName: '月度肥猪出栏计划汇总表',
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
        //     filename: '月度肥猪出栏计划汇总',
        //     type: 'csv',
        //     original: false,
        //     isHeader: true,
        //   })
        // }
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
        }
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
     // text-align: right;
    }
    .summaryTable{
      margin-top: 10px;
    }
}
</style>
