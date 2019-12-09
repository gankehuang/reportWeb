<template>
<div v-loading.fullscreen.lock="loading">
  <div class="content-container" ref="pageContent">
    <div class="box">
      <el-row type="flex" align="middle">
        <el-col :span="24" class="content-head-right">
          <el-button style="border:1px solid #1989FA;color:#1989FA;"
                     size="small"
                     icon="el-icon-upload2"
                     @click="exportDataEvent">导出
          </el-button>
          <!-- <el-button size="small"
                     icon="el-icon-rank" @click="handleFullscreen">{{fullScreenText}}
          </el-button> -->
          <el-button size="small" icon="el-icon-rank" @click="handleFullscreen">{{fullscreen?'退出全屏':'全屏'}}
          </el-button>
        </el-col>
      </el-row>
      <vxe-table
        header-align="center"
        ref="xTable"
        resizable
        :data="tableData"
        class="summaryTable"
        highlight-hover-row
        :height="childTableHeight"
        :show-footer="showFooter"
        :footer-method="footerMethod"
        :keyboard-config="{isArrow: true, isDel: true, isTab: true, isEdit: true}"
        border>
        <vxe-table-column v-for="(item,index) in addHead" :key="index" :title="item.title" :field="item.key" width="130" fixed="left"></vxe-table-column>
        <vxe-table-column v-for="(item,index) in dataHead" :key="item.key" :title="item.title" :align="item.align" :field="item.key" :fixed="index == 0?'left':''" :minWidth:="item.minWidth" :width="item.width"  >
          <template v-slot="{ row }" v-if="item.format">
            {{ valueFormat(row,item) }}
          </template>
          <template v-slot="{ row }" v-else-if="item.timeFormat">
            {{ timeFormat(row,item) }}
          </template>
          <template v-slot="{ row }" v-else>
            {{row[item.key]||'-'}}
          </template>
          <vxe-table-column v-for="(i,idx) in item.children" :key="idx" :title="i.title" :align="i.align" :width="i.width" :field="i.key"></vxe-table-column>
        </vxe-table-column>
      </vxe-table>
      <!-- <vxe-pager
        border
        :current-page="tablePage.currentPage"
        :page-size="tablePage.pageSize"
        :total="tablePage.totalResult"
        :layouts="['PrevPage', 'JumpNumber', 'NextPage', 'FullJump', 'Sizes', 'Total']"
        @page-change="handlePageChange">
      </vxe-pager> -->
    </div>
  </div>
</div>
</template>

<script>
import request from '@/utils/request'
import  conserveLoansMixins from './conserveLoansMixins'
import  promotionPigMixins from './promotionpigMixins'
import  seedingPlanMixins from './seedingPlanMixins'
import { exportMethods } from '@/utils/export'
const PATH = "/BUSINESSREPORT"
import moment from 'moment'
export default {
    name: 'pagePenetration',
    mixins:[conserveLoansMixins,promotionPigMixins,seedingPlanMixins],
    created(){
      this.tableHandle(this.$route.query)
    },
     mounted(){
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
          fullscreen:"",
          loading: false,
          showFooter: false,
          orgId: '',
          yearMonth: '',
          type: '',
          pagehead:"",
          url: '',
          childTableHeight: 300,
          formData: {},
          addHead: [],
          dataHead: [],
          tableData: [],
          tablePage: {
            currentPage: 1,
            pageSize: 5000,
            totalResult: 0
          },
          introduction: [
            {
              title: '猪场名称(代养场)',
              key: 'pigName',
              align:"center",
              width: 150
            },
            {
              title: '母猪规模',
              key: 'loadScale',
              width: 80,
              align:"right",
            },
            {
              title: '经产母猪存栏',
              key: 'breedingStock',
              width: 110,
              align:"right",
            },
            {
              title: '后备母猪存栏',
              key: 'reserveStock',
              width: 110,
              align:"right",
            },
            {
              title: '引种月份',
              key: 'importedMonth',
              width: 100,
              align:"center",
            },
            {
              title: '引种日期',
              key: 'importedDate',
              width: 100,
              align:"center",
              format: [
                { label: '1-7日', value: 1 },
                { label: '8-14日', value: 2 },
                { label: '15-21日', value: 3 },
                { label: '22-月底', value: 4 }
              ],
            },
            {
              title: '引种数量',
              key: 'importedNum',
              width: 80,
              align:"right",
            },
            {
              title: '引种日龄',
              key: 'importedDayAge',
              width: 80,
              align:"right",
            },
            {
              title: '引种类型',
              key: 'importedTypeText',
              width: 100,
              align:"center",
              // format: [  //引种类型
              //   { label: '外引', value: 0 },
              //   { label: '提级', value: 1 },
              //   { label: '自留', value: 2 },
              //   { label: '内调', value: 3 }
              // ],
            },
            {
              title: '性别',
              key: 'sexText',
              width: 60,
              align:"center",
              // format: [  //性别
              //   { label: '公', value: 0 },
              //   { label: '母', value: 1 }
              // ],
            },
            {
              title: '品种',
              key: 'species',
              width: 70,
              align:"center",
            },
            {
              title: '供应商',
              key: 'supplier',
              width: 140,
              align:"center",
            },
            {
              title: '责任人（具体经办人）',
              key: 'responsibler',
              width: 120,
              align:"center",
            },
            {
              title: '分管领导（经办人上级）',
              key: 'leadershiper',
              width: 120,
              align:"center",
            },
            {
              title: '进展情况',
              key: 'progressText',
              width: 120,
              align:"center",
              // format: [  //进展情况
              //   { label: '合同未签订', value: 0 },
              //   { label: '合同已签订', value: 1 },
              //   { label: '未确定种源', value: 2 }
              // ],
            },
            {
              title: '应对措施',
              key: 'measures',
              width: 140,
              align:"center",
            }
          ],
          seedlingEmergence: [
            {
              title: '猪场',
              key: 'pigName',
              width: 120,
              align:"center",
            },
            {
              title: '分场',
              key: 'parvialFieldName',
              width: 120,
              align:"center",
            },
            {
              title: '出苗小计',
              children: [
                {
                  title: '小计',
                  key: 'cmTotal',
                  width: 60,
                  align:"right",
                },{
                  title: '1-7日出栏数',
                  key: 'cmFirstWeek',
                  width: 100,
                  align:"right",
                },{
                  title: '8-14日出栏数',
                  key: 'cmSecondWeek',
                  width: 120,
                  align:"right",
                },{
                  title: '15-21日出栏数',
                  key: 'cmThirdWeek',
                  width: 120,
                  align:"right",
                },{
                  title: '22-月底出栏数',
                  key: 'cmFourthWeek',
                  width: 120,
                  align:"right",
                }
              ]
            },
            {
              title: '其中：自留保育/育肥',
              children: [
                {
                  title: '小计',
                  key: 'zlTotal',
                  width: 60,
                  align:"right",
                },{
                  title: '1-7日出栏数',
                  key: 'zlFirstWeek',
                  width: 100,
                  align:"right",
                },{
                  title: '8-14日出栏数',
                  key: 'zlSecondWeek',
                  width: 120,
                  align:"right",
                },{
                  title: '15-21日出栏数',
                  key: 'zlThirdWeek',
                  width: 120,
                  align:"right",
                },{
                  title: '22-月底出栏数',
                  key: 'zlFourthWeek',
                  width: 120,
                  align:"right",
                }
              ]
            },
            {
              title: '其中：外销猪苗',
              children: [
                {
                  title: '小计',
                  key: 'wxTotal',
                  width: 60,
                  align:"right",
                },{
                  title: '1-7日出栏数',
                  key: 'wxFirstWeek',
                  width: 100,
                  align:"right",
                },{
                  title: '8-14日出栏数',
                  key: 'wxSecondWeek',
                  width: 120,
                  align:"right",
                },{
                  title: '15-21日出栏数',
                  key: 'wxThirdWeek',
                  width: 120,
                  align:"right",
                },{
                  title: '22-月底出栏数',
                  key: 'wxFourthWeek',
                  width: 120,
                  align:"right",
                }
              ]
            },
            {
              title: '其中：7kg小种猪',
              children: [
                {
                  title: '小计',
                  key: 'xzzTotal',
                  width: 60,
                  align:"right",
                },{
                  title: '1-7日出栏数',
                  key: 'xzzFirstWeek',
                  width: 100,
                  align:"right",
                },{
                  title: '8-14日出栏数',
                  key: 'xzzSecondWeek',
                  width: 120,
                  align:"right",
                },{
                  title: '15-21日出栏数',
                  key: 'xzzThirdWeek',
                  width: 120,
                  align:"right",
                },{
                  title: '22-月底出栏数',
                  key: 'xzzFourthWeek',
                  width: 120,
                  align:"right",
                }
              ]
            },
            {
              title: '其中：调服务部',
              children: [
                {
                  title: '小计',
                  key: 'fwbTotal',
                  width: 60,
                  align:"right",
                },{
                  title: '1-7日出栏数',
                  key: 'fwbFirstWeek',
                  width: 100,
                  align:"right",
                },{
                  title: '8-14日出栏数',
                  key: 'fwbSecondWeek',
                  width: 120,
                  align:"right",
                },{
                  title: '15-21日出栏数',
                  key: 'fwbThirdWeek',
                  width: 120,
                  align:"right",
                },{
                  title: '22-月底出栏数',
                  key: 'fwbFourthWeek',
                  width: 120,
                  align:"right",
                }
              ]
            },
            {
              title: '下一月出苗计划',
              children: [
                {
                  title: '出苗小计',
                  key: 'cmNextTwoMonth',
                  width: 120,
                  align:"right",
                },{
                  title: '其中：自留保育/育肥',
                  key: 'zlNextTwoMonth',
                  width: 160,
                  align:"right",
                },{
                  title: '其中：外销猪苗',
                  key: 'wxNextTwoMonth',
                  width: 120,
                  align:"right",
                },{
                  title: '其中：7kg小种猪',
                  key: 'xzzNextTwoMonth',
                  width: 130,
                  align:"right",
                },{
                  title: '其中：调服务部',
                  key: 'fwbNextTwoMonth',
                  width: 120,
                  align:"right",
                }
              ]
            },
            {
              title: '下二月出苗计划',
              children: [
                {
                  title: '出苗小计',
                  key: 'cmNextThreeMonth',
                  width: 120,
                  align:"right",
                },{
                  title: '其中：自留保育/育肥',
                  key: 'zlNextThreeMonth',
                  width: 160,
                  align:"right",
                },{
                  title: '其中：外销猪苗',
                  key: 'wxNextThreeMonth',
                  width: 120,
                  align:"right",
                },{
                  title: '其中：7kg小种猪',
                  key: 'xzzNextThreeMonth',
                  width: 130,
                  align:"right",
                },{
                  title: '其中：调服务部',
                  key: 'fwbNextThreeMonth',
                  width: 120,
                  align:"right",
                }
              ]
            },
          ],
          mating:[
            {
              title: '猪场',
              key: 'pigName',
              width: 120,
              align:"center",
            },
            {
              title: '分场',
              key: 'parvialFieldName',
              width: 120,
              align:"center",

            },
            {
              title: '分场规模',
              key: 'fieldScale',
              width: 80,
              align:"right",
            },
            {
              title: '配种类型',
              key: 'breedTypeText',
              width: 120,
              align:"center",
              // format: [  //配种类型下拉
              //   { label: '请选择', value: null },
              //   { label: '一元（GP）', value: 0 },
              //   { label: '一元（GGP）', value: 1 },
              //   { label: '二元(正常)', value: 2 },
              //   { label: '二元(回交)', value: 3 },
              //   { label: '三元', value: 4 },
              //   { label: 'PIC', value: 5 }
              // ],
            },
            {
              title: '当前经产存栏',
              children: [
                {
                  title: '小计',
                  key: 'jcclTotal',
                  width: 60,
                  align:"right",
                },{
                  title: '妊娠',
                  key: 'cmFirstWeek',
                  width: 60,
                  align:"right",
                },{
                  title: '哺乳',
                  key: 'lactation',
                  width: 60,
                  align:"right",
                },{
                  title: '其中：25日前可断奶哺乳母猪头数',
                  key: 'ablactation',
                  width: 120,
                  align:"right",
                },{
                  title: '其中：经产待淘',
                  key: 'jcdt',
                  width: 120,
                  align:"right",
                }
              ]
            },
            {
              title: '本月配经产计划',
              key: 'novPjcPlan',
              width: 120,
              align:"right",
            },
            {
              title: '后备存栏及结构明细',
              children: [
                {
                  title: '小计',
                  key: 'hbclTotal',
                  width: 60,
                  align:"right",
                },{
                  title: '日龄≤100天',
                  key: 'firstTimeQuantum',
                  width: 80,
                  align:"right",
                },{
                  title: '100天＜日龄≤160天',
                  key: 'secondTimeQuantum',
                  width: 120,
                  align:"right",
                },{
                  title: '160天＜日龄≤190天',
                  key: 'thirdTimeQuantum',
                  width: 120,
                  align:"right",
                },{
                  title: '190天＜日龄≤220天',
                  key: 'fourthTimeQuantum',
                  width: 120,
                  align:"right",
                },{
                  title: '220天＜日龄≤240天',
                  key: 'fifthTimeQuantum',
                  width: 120,
                  align:"right",
                },{
                  title: '240天＜日龄≤280天',
                  key: 'sixthTimeQuantum',
                  width: 120,
                  align:"right",
                },{
                  title: '日龄＞280天',
                  key: 'seventhTimeQuantum',
                  width: 120,
                  align:"right",
                }
              ]
            },
            {
              title: '本月配后备计划',
              key: 'novPhbPlan',
              width: 120,
              align:"right",
            },
            {
              title: '本月配种计划',
              key: 'novPzPlan',
              width: 110,
              align:"right",
            },
            {
              title: '本月配种计划分解',
              children: [
                {
                  title: '1-7日',
                  key: 'novFirstWeek',
                  width: 60,
                  align:"right"
                },{
                  title: '8-14日',
                  key: 'novSecondWeek',
                  width: 80,
                  align:"right"
                },{
                  title: '15-21日',
                  key: 'novThirdWeek',
                  width: 80,
                  align:"right"
                },{
                  title: '22-月底',
                  key: 'novFourthWeek',
                  width: 80,
                  align:"right"
                }
              ]
            },
            {
              title: '分场长',
              key: 'partFarmer',
              width: 100,
              align:"center"
            },
            {
              title: '场长',
              key: 'farmer',
              width: 100,
              align:"center"
            },
            {
              title: '异常情况备注（定额偏差超±10%）',
              key: 'exeptionRemark',
              width: 140,
              align:"center"
            },
            {
              title: '下一月配种计划',
              children: [
                {
                  title: '配种小计',
                  key: 'nextMonthPzTotal',
                  width: 80,
                  align:"right"
                },{
                  title: '其中：配后备',
                  key: 'nextMonthPhb',
                  width: 80,
                  align:"right"
                }
              ]
            },
            {
              title: '下二月配种计划',
              children: [
                {
                  title: '配种小计',
                  key: 'nextTwoMonthPzTotal',
                  width: 80,
                  align:"right"
                },{
                  title: '其中：配后备',
                  key: 'nextTwoMonthPhb',
                  width: 100,
                  align:"right"
                }
              ]
            },
          ],
        }
    },

    methods:{
      tableHandle(data){
        this.orgId = data.orgId
        this.yearMonth = data.yearMonth
        this.type = data.type
        this.pagehead = data.pagehead
        switch (data.pagehead) {
          case "introduction":
            this.dataHead = this.introduction
            this.url = PATH + '/exoticPlanTotal/getExoticPlanDetail'
            break;
          case "seedlingEmergence":
            this.dataHead = this.seedlingEmergence
            this.url = PATH + '/sproutPlanTotal/getSproutPlanDetail'
            break;
          case "mating":
            this.dataHead = this.mating
            this.url = PATH + '/breedPlanTotal/getBreedPlanDetail'
            break;
          case "conserveLoans":
            this.dataHead = this.conserveLoans
            this.url = PATH + '/custLoanPlan/getCustLoanPlanDetail'
            break;
          case "promotionPig":
            this.dataHead = this.promotionPig;
            this.url = PATH + '/monoutplan/getMonoutPlanDetail';
            break;
          case "seedingPlan":
            this.dataHead = this.seedingPlan;
            this.url = PATH + '/CtPlaYzRhSeedpl/getCtPlaYzRhSeedplDetail';
            break;
          default:
            break;
        }
        this.getData()
      },
      getData(){
        let params = {
          orgId: this.orgId,
          period: this.yearMonth,
          type: this.type,
          pageNum: this.tablePage.currentPage,
          pageSize: this.tablePage.pageSize
        }
        this.loading = true
        request({
          url: this.url,
          method: 'get',
          params: params
        }).then(res => {
          this.loading = false
          if (res.status === 200) {
           this.addHead = res.data.head;
           this.addHead.forEach((item,index)=>{ //去除大区显示
             if(item.key=='lineName'){
               this.addHead.splice(1,index)
             }
           })
            this.tableData = res.data.entry
            this.tablePage.totalResult = res.data.total
          }
        }).catch(error => {
          this.loading = false
        })
      },
      handlePageChange ({ currentPage, pageSize }) {
        this.tablePage.currentPage = currentPage
        this.tablePage.pageSize = pageSize
        this.getData()
      },
      // 表格样式更改
      cellStyle({ row, rowIndex, column, columnIndex }){
        if (columnIndex == 0) {
          return {
            color: '#1989fa',
            cursor: 'pointer'
          }
        }
      },
      footerMethod({ columns, data }){
        return[
          columns.map((column, columnIndex) => {
            if (columnIndex === 0) {
              return '合计'
            }else{
              return this.sum(data,column.property)
            }
            return null
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
      // 导出数据
      exportDataEvent(){
         let params = {
          orgId :this.orgId,
          period : this.yearMonth ,
          type : this.type
        }
        if(this.pagehead === 'introduction'){
          let myObj = {
            method: 'get',
            url:'exoticPlanTotal/exportExoticPlanDetail',
            fileName: '月度引种计划汇总表明细',
            params: params
          }
          exportMethods(myObj)
        }else if(this.pagehead === 'mating'){
          let myObj = {
            method: 'get',
            url:'breedPlanTotal/exportBreedPlanDetail',
            fileName: '月度配种计划汇总表明细',
            params: params
          }
          exportMethods(myObj)
        }else if(this.pagehead === 'seedlingEmergence'){
          let myObj = {
            method: 'get',
            url:'sproutPlanTotal/exportExcel',
            fileName: '月度出苗计划汇总表明细',
            params: params
          }
          exportMethods(myObj)
        }else if(this.pagehead === 'conserveLoans'){
          let myObj = {
            method: 'get',
            url:'custLoanPlan/getCustLoanPlanDetailForexcel',
            fileName: '月度养户贷计划汇总表明细',
            params: params
          }
          exportMethods(myObj)
        }else if(this.pagehead === 'promotionPig'){
          let myObj = {
            method: 'get',
            url:'monoutplan/getMonoutPlanDetailForexcel',
            fileName: '月度肥猪出栏计划汇总表明细',
            params: params
          }
          exportMethods(myObj)
        }else if(this.pagehead === 'seedingPlan'){
          let myObj = {
            method: 'get',
            url:'CtPlaYzRhSeedpl/getYzRhSeedplDetailForexcel',
            fileName: '月度投苗计划汇总表明细',
            params: params
          }
          exportMethods(myObj)
        }else{
          //其他总计导出自己做好判断
          if (this.tableData.length > 0) {
          this.$refs.xTable.exportData({
            filename: '月度计划汇总明细', // 导出文件名称
            type: 'xml', // 导出文件格式
            original: false, // 导出表头是否为字段名
            isHeader: true, // 是否导出表头
          })
        }
        }
      },
      valueFormat(row,data){
        if (row) {
          let value = row[data.key]
          if (value) {
            return data.format.find(i => i.value  == value).label
          }
        }
      },
      timeFormat (row,data) {
        if (row) {
          let value = row[data.key]
          if (value) {
            return moment(parseInt(value)).format('YYYY-MM-DD')
          }
        }
      },
      computedDOMHeight() {
        let curClientHeight = document.body.clientHeight  // 当前屏幕高度
        let pageContentHeight = curClientHeight - this.$refs.pageContent.getBoundingClientRect().top
        this.$refs.pageContent.style.height = (pageContentHeight - 10) + 'px'
        //let pagerHeight = document.querySelectorAll('.vxe-pager')[0].offsetHeight

        this.childTableHeight = pageContentHeight   - 100
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
    },
}
</script>

<style lang="scss" scoped>
/deep/ .el-input{
  width: auto;
}
/deep/ .el-input.is-disabled .el-input__inner{
  border: 1px solid #E4E7ED;
}
.content-container{
  .box{
    padding: 0px 10px 10px 10px;
    .summaryTable{
      margin-top: 10px;
    }
  }
}
.content-head-right {
  text-align: right;
}
</style>
