<template>
<div v-loading.fullscreen.lock="loading">
  <div class="head_title">
    <formTitle title="月度引种计划">
      <div slot="context">
        <page-form
          v-bind="formOptions"
          :model="formData"
          :editable="false"
          ref="PageForm"
        ></page-form>
      </div>
      <div slot="title-suffix" v-if="isShowButton">
        <el-button :type="status == 1?'primary':'danger'" plain size="small" v-if="reverseAuditStatus" @click="auditEvent">{{ status == 1?'审核':'反审核' }}</el-button>
        <el-button type="primary" size="small" v-if="isSumit" @click="submit(1)">提交</el-button>
      </div>
    </formTitle>
  </div>
    <div class="box" ref="pageContent">
      <el-row class="but-box" type="flex" align="middle">
        <el-col style="text-align: left">
          <span class="dot"></span>
          <span class="title_name">月度引种计划汇总</span>
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
        :loading="loading"
        :data="tableData"
        class="summaryTable"
        highlight-hover-row
        resizable
        :show-footer="showFooter"
        :footer-method="footerMethod"
        :cell-style="cellStyle"
        :footer-cell-style="footerCellStyle"
        :footer-cell-class-name="footerCellClass"
        @cell-click="cellClick"
        :keyboard-config="{isArrow: true, isDel: true, isTab: true, isEdit: true}"
        border>
        <vxe-table-column title="组织" field="orgName" width="120"></vxe-table-column>
        <vxe-table-column v-for="(item,index) in dataHead" :key="index" :title="item.title" >
          <vxe-table-column v-for="(i,idx) in item.children" :key="idx" :title="i.title"  min-width="100" :field="i.key" align="right">
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
import { getForNew, add, getTree, checkReportIsSp, unAudit} from '@/api/introduction/index'
import $ from 'jquery'
import { exportMethods } from '@/utils/export'
export default {
    name: 'introduction',
    components: { formTitle, PageForm },
    created(){
      if (this.$route.query.orgId) {
        this.type = this.$route.query.type
        this.orgId = this.$route.query.orgId
        this.period = this.$route.query.yearMonth
        this.search()
      }else if (this.$store.getters.orgInfo) {
        this.orgLongNum = this.$store.getters.orgInfo.longNumber
        this.type = parseInt(this.$store.getters.orgInfo.type)
        this.orgId = this.$store.getters.orgInfo.id
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
    mounted(){
      const that = this
      $('.box').delegate('.checkDetails', 'click', function() {
        if (that.orgId && that.period) {
          that.$router.push({ path: '/pagePenetrationOne', query: {orgId: that.orgId,yearMonth:that.period,type: that.type, pagehead:"introduction"}});
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
    data(){
        return {
          isShowButton:true,
          fullscreen: "",
          childTableHeight:300,
          status: null,
          loading: false,
          orgId: '',
          parentOrgId: '',
          showFooter: false,
          orgName: '',
          type: null,
          isSumit: false,
          reverseAuditStatus: false,
          orgLongNum: '',
          period: '',
          formOptions: {
            labelWidth: "130px",
            options: [
              {
                label: "提交人",
                prop: "submitorName",
                span: 4.8
              },
              {
                label: "提交日期",
                prop: "submitDate",
                span: 4.8,
                dateFormat: true
              },
              {
                label: "审批人",
                prop: "approverName",
                span: 4.8
              },
              {
                label: "审批日期",
                prop: "approveDate",
                span: 4.8,
                dateFormat: true
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
              title: '合计',
              children: [
                {
                  title: '小计',
                  key: 'total',
                },
                {
                  title: '1-7日',
                  key: 'firstWeek',
                },
                {
                  title: '8-14日',
                  key: 'secondWeek',
                },
                {
                  title: '15-21日',
                  key: 'thirdWeek',
                },
                {
                  title: '22-30日',
                  key: 'fourthWeek',
                }
              ]
            },
            {
              title: '其中：外引',
              children: [
                {
                  title: '小计',
                  key: 'wyTotal'
                },
                {
                  title: '1-7日',
                  key: 'wyFirstWeek',
                },
                {
                  title: '8-14日',
                  key: 'wySecondWeek',
                },
                {
                  title: '15-21日',
                  key: 'wyThirdWeek',
                },
                {
                  title: '22-30日',
                  key: 'wyFourthWeek',
                }
              ]
            },
            {
              title: '其中：内引',
              children: [
                {
                  title: '小计',
                  key: 'nyTotal'
                },
                {
                  title: '1-7日',
                  key: 'nyFirstWeek',
                },
                {
                  title: '8-14日',
                  key: 'nySecondWeek',
                },
                {
                  title: '15-21日',
                  key: 'nyThirdWeek',
                },
                {
                  title: '22-30日',
                  key: 'nyFourthWeek',
                }
              ]
            },
            {
              title: '其中：自留',
              children: [
                {
                  title: '小计',
                  key: 'zlTotal'
                },
                {
                  title: '1-7日',
                  key: 'zlFirstWeek',
                },
                {
                  title: '8-14日',
                  key: 'zlSecondWeek',
                },
                {
                  title: '15-21日',
                  key: 'zlThirdWeek',
                },
                {
                  title: '22-30日',
                  key: 'zlFourthWeek',
                }
              ]
            },
            {
              title: '其中：提级',
              children: [
                {
                  title: '小计',
                  key: 'tjTotal'
                },
                {
                  title: '1-7日',
                  key: 'tjFirstWeek',
                },
                {
                  title: '8-14日',
                  key: 'tjSecondWeek',
                },
                {
                  title: '15-21日',
                  key: 'tjThirdWeek',
                },
                {
                  title: '22-30日',
                  key: 'tjFourthWeek',
                }
              ]
            }
          ],
          props: {
            label: 'name',
            value: 'longNumber'
          },
          tableData: [],
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
      search(){
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
          period: this.period,
          orgId: this.orgId,
          type: this.type
        }
        this.searchData(params)
      },
      searchData(params){
        getForNew(params).then(res =>{
          console.log("data:"+JSON.stringify(res))
          if (res.status == 200) {
            this.isShowButton = res.data.isShowButton
            if (!res.data.parent && res.data.child && res.data.child.length > 0) {
              let obj = {
                orgName: this.orgName,
                orgLongNumber: this.orgLongNum,
                period: this.period,
                submitorName: this.$store.getters.name,
                submitor: this.$store.getters.userId,
                createTime: new Date().getTime(),
                submitDate: new Date().getTime()
              }
              this.formData = obj
              this.isSumit = true
              this.reverseAuditStatus = false
            }else if (res.data.parent){
              this.formData = res.data.parent
              if ([1,2].includes(res.data.parent.status)){
                this.status = res.data.parent.status
                this.reverseAuditStatus = true
                this.isSumit = false
                if (this.status == 2) {
                  this.checkReport(res.data.parent)
                }
              } else{
                this.reverseAuditStatus = false
                this.isSumit = false
              }
            } else {
              this.reverseAuditStatus = false
              this.formData = {}
            }
            if (res.data.child && res.data.child.length > 0) {
              this.tableData = res.data.child
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
      submit(state){
        this.$confirm('是否保存?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.submitData(state)
        })
      },
      submitData(state){
        let obj = this.formData
        obj.orgId = this.orgId
        obj.parentOrgId = this.parentOrgId
        obj.status = state
        obj.exoticPlanTotalEntryList = null
        obj.exoticPlanTotalEntryList = this.tableData
        this.loading = true
        add(obj).then(res =>{
          if (res.status == 200) {
            this.formData = res.data.parent
            this.tableData = res.data.child
            if ([1,2].includes(res.data.parent.status)){
              this.status = res.data.parent.status
              this.reverseAuditStatus = true
              this.isSumit = false
              if (this.status == 2) {
                this.checkReport(res.data.parent)
              }
            } else {
              this.reverseAuditStatus = false
              this.isSumit = false
            }
            let tips = state==2?'审批成功！':'提交成功！'
            this.loading = false
            this.$message({
              message: tips,
              type: "success"
            });
          }
        }).catch(err =>{
          this.$message({
            message: "提交失败！",
            type: "error"
          });
          this.loading = false
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
          if (!row.type) {
            if(parseInt(this.type) == 1){
              this.$router.push({ path: '/planBalanceReport/pigPlan/introduction'+(parseInt(this.type)+2), query: {orgId: row.orgId,yearMonth:this.period,type: parseInt(this.type)+2}});
            }else{
              this.$router.push({ path: '/planBalanceReport/pigPlan/introduction'+(parseInt(this.type)+1), query: {orgId: row.orgId,yearMonth:this.period,type: parseInt(this.type)+1}});
            }
          }else{
            this.$router.push({ path: '/pigFarmPlan/introductionPlanDetails', query: {orgId: row.orgId,yearMonth:this.period}});
          }
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
      // 反审核  审核
      auditEvent(){
        let tips = this.status==1?'审核':'反审核'
        this.$confirm(tips, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          if (this.status == 1) {
            this.submitData(2)
          } else if(this.status == 2){
            let params = {
              id: this.formData.id
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
        }).catch(err =>{
          this.reverseAuditStatus = false
        })
      },
      // 导出数据
      exportDataEvent(){
        let params = {
          orgId :this.orgId,
          period : this.period ,
          type : this.type
        }
        let myObj = {
          method: 'get',
          url:'exoticPlanTotal/exportExoticPlanTotalInfo',
          fileName: '月度引种计划汇总表',
          params: params
        }
        exportMethods(myObj)
        // if (this.tableData.length > 0) {
        //   this.$refs.xTable.exportData({
        //     filename: '月度引种计划汇总', // 导出文件名称
        //     type: 'csv', // 导出文件格式
        //     original: false, // 导出表头是否为字段名
        //     isHeader: true, // 是否导出表头
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
