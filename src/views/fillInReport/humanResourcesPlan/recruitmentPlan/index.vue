<template>
  <div>
    <!--顶部操作区-->
      <formTitle title="人员招聘计划及追踪">
        <div slot="context">
          <page-form
            v-bind="formOptions"
            :model="formData"
            :editable="false"
            ref="PageForm"
          ></page-form>
        </div>
        <div slot="title-suffix">
          <!-- <el-button size="small" :disabled="loading" @click="insertEventParent()" type="primary" plain>新增</el-button> -->
          <!--  <el-button size="small" :disabled="loading" @click="delEvent()" class="el-button-delete" v-if="isStatus == 0">删除</el-button>
            <el-button size="small" :disabled="loading" @click="getUpdateEvent()" class="el-button-audit" v-if="isStatus == 0">保存</el-button>
            <el-button size="small" :disabled="loading" @click="submiteEvent()" class="el-button-submit" v-if="isStatus == 0">提交</el-button>
            <el-button size="small" :disabled="loading" @click="auditEvent(1)" class="el-button-audit" v-if="isStatus == 1">审核</el-button>
            <el-button size="small" :disabled="loading" @click="auditEvent(2)" class="el-button-unaudit" v-if="isStatus == 2">反审核</el-button> -->
            <!-- <el-button size="small" :disabled="loading" @click="feedBack" type="primary" plain v-if="isStatus == 2">反馈</el-button> -->

            <template v-if="isStatus<0">
              <el-button size="small" :disabled="loading" @click="getUpdateEvent()" class="el-button-audit" >保存</el-button>
            </template>
            <template v-else-if="isStatus==0">
              <el-button size="small" :disabled="loading" @click="delEvent()" class="el-button-delete">删除</el-button>
              <el-button size="small" :disabled="loading" @click="getUpdateEvent()" class="el-button-audit">保存</el-button>
              <el-button size="small" :disabled="loading" @click="submiteEvent()" class="el-button-submit">提交</el-button>
            </template>
            <template v-else-if="isStatus==1 ">
              <el-button size="small" :disabled="loading" @click="auditEvent(1)" class="el-button-audit">审核</el-button>
            </template>
            <template v-else-if="isStatus==2">
               <el-button size="small" :disabled="loading" @click="auditEvent(2)" class="el-button-unaudit">反审核</el-button>
              <el-button size="small" :disabled="loading" @click="feedBack" class="el-button-audit">反馈</el-button>
            </template>
        </div>
      </formTitle>
    <!--    内容区-->
<div class="page-content" ref="pageContent">

  <el-row class="content-head" type="flex" align="middle">
    <el-col :span="12">
      <span class="dot"></span>
      <span class="title" style="font-size: 14px;">子表信息</span>
    </el-col>
    <el-col :span="12" class="content-head-right">
      <vxe-toolbar>
          <template v-slot:buttons>
             <el-button size="small" @click="insertEventParent()" v-if="isStatus<=0" class="el-button-audit">新增行</el-button>
            <!--<el-button size="small" @click="$refs.xTable.removeSelecteds()" v-if="isStatus !=1 || isStatus !=2" class="el-button-unaudit">删除行</el-button> -->
              <el-button size="small" @click="exportDataEvent" icon="el-icon-upload2" class="el-button-audit">导出</el-button>
               <el-upload
               v-if="isStatus<=0"
                style="display:inline-block;margin-left:10px;"
                ref="upload"
                :limit="1"
                :show-file-list="false"
                action="/recruitmentFeedback/excelUpload"
                accept=".xls,.xlsx"
                :http-request="importDataEvent"
                :file-list="fileList">
                <el-button icon="el-icon-download" size="small" class="el-button-submit">导入</el-button>
              </el-upload>
              <!--<el-button size="small" class="el-button-full" icon="el-icon-rank" @click="handleFullscreen">{{fullscreen?'退出全屏':'全屏'}}</el-button>-->
          </template>
      </vxe-toolbar>
    </el-col>
  </el-row>

    <vxe-table
      border
      resizable
      ref="xTable"
      highlight-hover-row
      :data="tableData"
      :edit-rules="validRules"
      :span-method="rowspanMethod"
      :edit-config="{trigger: 'click', mode: 'cell',activeMethod: activeCellMethod}"
      :height="childTableHeight"
      align="center">
      <!-- <vxe-table-column type="checkbox" width="60"></vxe-table-column> -->
      <vxe-table-column field="serialNumber" title="序号" fixed="left" width="40" class-name="project">
      </vxe-table-column>
      <vxe-table-column min-width="120" field="item" title="项目">
        <vxe-table-column min-width="50" field="type" title="项目" class-name="project"></vxe-table-column>
        <vxe-table-column min-width="150" field="projectName" title="人数" class-name="project"></vxe-table-column>
      </vxe-table-column>
      <vxe-table-column min-width="130" field="recruitmentPlan" title="招聘计划">
        <vxe-table-column min-width="60" field="planSubtotal" title="小计">
          <template v-slot="{ row }">{{planSubtotals(row)}}</template>
        </vxe-table-column>
        <vxe-table-column min-width="60" field="planTheFirstWeek" title="1-7日"
                          :edit-render="{name: 'input',attrs: {type: 'number'}}"></vxe-table-column>
        <vxe-table-column min-width="60" field="planTheSecondWeek" title="8-14日"
                          :edit-render="{name: 'input',attrs: {type: 'number'}}"></vxe-table-column>
        <vxe-table-column min-width="60" field="planTheThirdWeek" title="15-21日"
                          :edit-render="{name: 'input',attrs: {type: 'number'}}"></vxe-table-column>
        <vxe-table-column min-width="60" field="planTheFourthWeek" title="22-30日"
                          :edit-render="{name: 'input',attrs: {type: 'number'}}"></vxe-table-column>
      </vxe-table-column>
      <vxe-table-column min-width="70" field="nextMonth" :title="((month + 1) > 12 ? ((month + 1) - 12) : (month + 1))+'月'"
                        :edit-render="{name: 'input',attrs: {type: 'number'}}"></vxe-table-column>
      <vxe-table-column min-width="70" field="nextFebruary" :title="((month + 2) > 12 ? ((month + 2) - 12) : (month + 2))+'月'"
                        :edit-render="{name: 'input',attrs: {type: 'number'}}"></vxe-table-column>
      <vxe-table-column min-width="70" field="perfection" title="实际完成">
        <vxe-table-column min-width="60" field="actualSubtotal" title="小计">
          <template v-slot="{ row }">{{subtotals(row)}}</template>
        </vxe-table-column>
        <vxe-table-column min-width="60" field="actualTheFirstWeek" title="1-7日"
                          :edit-render="{name: 'input',attrs: {type: 'number'}}"></vxe-table-column>
        <vxe-table-column min-width="60" field="actualTheSecondWeek" title="8-14日"
                          :edit-render="{name: 'input',attrs: {type: 'number'}}"></vxe-table-column>
        <vxe-table-column min-width="60" field="actualTheThirdWeek" title="15-21日"
                          :edit-render="{name: 'input',attrs: {type: 'number'}}"></vxe-table-column>
        <vxe-table-column min-width="60" field="actualTheFourthWeek" title="22-30日"
                          :edit-render="{name: 'input',attrs: {type: 'number'}}"></vxe-table-column>
      </vxe-table-column>
    </vxe-table>
    </div>
  </div>
</template>

<script>
  import {
    importReport,
    updateFeedbackList,
    getFeedbackList,
    deletebackListList,
    auditbackListList,
    unAuditbackListList,
    feedbackRecruitmentList
  } from '@/api/businessUnitApi/personManagement'
  import formTitle from '@/components/formTitle/formTitle'
  import PageForm from '@/components/form/Form'
  import moment from 'moment'
  import { mapGetters } from 'vuex'

  import axios from 'axios'
  import { getToken } from '@/utils/auth'

  export default {
    name: 'PersonnelManagement',
    components: {
        formTitle,
        PageForm
    },
    data() {
      return {
        fileList: [],
        childTableHeight: 300,
        searchForm: {
          orgId: '',
          organization: '',
          period: new Date().getTime()
        },
        isStatus: '-1',
        parentData: [],
        tableDataLocal: [
          {
            type: '社会招聘',
            projectName: '社会招聘人数',
            serialNumber: 1,
            planSubtotal: '',
            planTheFirstWeek: '',
            planTheSecondWeek: '',
            planTheThirdWeek: '',
            planTheFourthWeek: '',
            nextMonth: '',
            nextFebruary: '',
            actualSubtotal: '',
            actualTheFirstWeek: '',
            actualTheSecondWeek: '',
            actualTheThirdWeek: '',
            actualTheFourthWeek: ''
          },
          {
            type: '社会招聘',
            projectName: '关键岗位到岗人数',
            serialNumber: 2,
            planSubtotal: '',
            planTheFirstWeek: '',
            planTheSecondWeek: '',
            planTheThirdWeek: '',
            planTheFourthWeek: '',
            nextMonth: '',
            nextFebruary: '',
            actualSubtotal: '',
            actualTheFirstWeek: '',
            actualTheSecondWeek: '',
            actualTheThirdWeek: '',
            actualTheFourthWeek: ''
          },
          {
            type: '社会招聘',
            projectName: '其中：副总裁级',
            serialNumber: 3,
            planSubtotal: '',
            planTheFirstWeek: '',
            planTheSecondWeek: '',
            planTheThirdWeek: '',
            planTheFourthWeek: '',
            nextMonth: '',
            nextFebruary: '',
            actualSubtotal: '',
            actualTheFirstWeek: '',
            actualTheSecondWeek: '',
            actualTheThirdWeek: '',
            actualTheFourthWeek: ''
          },
          {
            type: '社会招聘',
            projectName: '事业部总监级',
            serialNumber: 4,
            planSubtotal: '',
            planTheFirstWeek: '',
            planTheSecondWeek: '',
            planTheThirdWeek: '',
            planTheFourthWeek: '',
            nextMonth: '',
            nextFebruary: '',
            actualSubtotal: '',
            actualTheFirstWeek: '',
            actualTheSecondWeek: '',
            actualTheThirdWeek: '',
            actualTheFourthWeek: ''
          },
          {
            type: '社会招聘',
            projectName: '事业部经理级',
            serialNumber: 5,
            planSubtotal: '',
            planTheFirstWeek: '',
            planTheSecondWeek: '',
            planTheThirdWeek: '',
            planTheFourthWeek: '',
            nextMonth: '',
            nextFebruary: '',
            actualSubtotal: '',
            actualTheFirstWeek: '',
            actualTheSecondWeek: '',
            actualTheThirdWeek: '',
            actualTheFourthWeek: ''
          },
          {
            type: '社会招聘',
            projectName: '片区总经理/副总级',
            serialNumber: 6,
            planSubtotal: '',
            planTheFirstWeek: '',
            planTheSecondWeek: '',
            planTheThirdWeek: '',
            planTheFourthWeek: '',
            nextMonth: '',
            nextFebruary: '',
            actualSubtotal: '',
            actualTheFirstWeek: '',
            actualTheSecondWeek: '',
            actualTheThirdWeek: '',
            actualTheFourthWeek: ''
          },
          {
            type: '社会招聘',
            projectName: '片区总监级',
            serialNumber: 7,
            planSubtotal: '',
            planTheFirstWeek: '',
            planTheSecondWeek: '',
            planTheThirdWeek: '',
            planTheFourthWeek: '',
            nextMonth: '',
            nextFebruary: '',
            actualSubtotal: '',
            actualTheFirstWeek: '',
            actualTheSecondWeek: '',
            actualTheThirdWeek: '',
            actualTheFourthWeek: ''
          },
          {
            type: '社会招聘',
            projectName: '分公司经理/副经理级',
            serialNumber: 8,
            planSubtotal: '',
            planTheFirstWeek: '',
            planTheSecondWeek: '',
            planTheThirdWeek: '',
            planTheFourthWeek: '',
            nextMonth: '',
            nextFebruary: '',
            actualSubtotal: '',
            actualTheFirstWeek: '',
            actualTheSecondWeek: '',
            actualTheThirdWeek: '',
            actualTheFourthWeek: ''
          },
          {
            type: '社会招聘',
            projectName: '场长级',
            serialNumber: 9,
            planSubtotal: '',
            planTheFirstWeek: '',
            planTheSecondWeek: '',
            planTheThirdWeek: '',
            planTheFourthWeek: '',
            nextMonth: '',
            nextFebruary: '',
            actualSubtotal: '',
            actualTheFirstWeek: '',
            actualTheSecondWeek: '',
            actualTheThirdWeek: '',
            actualTheFourthWeek: ''
          },
          {
            type: '社会招聘',
            projectName: '分场长级',
            serialNumber: 10,
            planSubtotal: '',
            planTheFirstWeek: '',
            planTheSecondWeek: '',
            planTheThirdWeek: '',
            planTheFourthWeek: '',
            nextMonth: '',
            nextFebruary: '',
            actualSubtotal: '',
            actualTheFirstWeek: '',
            actualTheSecondWeek: '',
            actualTheThirdWeek: '',
            actualTheFourthWeek: ''
          },
          {
            type: '社会招聘',
            projectName: '服务部主任级',
            serialNumber: 11,
            planSubtotal: '',
            planTheFirstWeek: '',
            planTheSecondWeek: '',
            planTheThirdWeek: '',
            planTheFourthWeek: '',
            nextMonth: '',
            nextFebruary: '',
            actualSubtotal: '',
            actualTheFirstWeek: '',
            actualTheSecondWeek: '',
            actualTheThirdWeek: '',
            actualTheFourthWeek: ''
          },
          {
            type: '社会招聘',
            projectName: '生产主管',
            serialNumber: 12,
            planSubtotal: '',
            planTheFirstWeek: '',
            planTheSecondWeek: '',
            planTheThirdWeek: '',
            planTheFourthWeek: '',
            nextMonth: '',
            nextFebruary: '',
            actualSubtotal: '',
            actualTheFirstWeek: '',
            actualTheSecondWeek: '',
            actualTheThirdWeek: '',
            actualTheFourthWeek: ''
          },
          {
            type: '社会招聘',
            projectName: '管理员',
            serialNumber: 13,
            planSubtotal: '',
            planTheFirstWeek: '',
            planTheSecondWeek: '',
            planTheThirdWeek: '',
            planTheFourthWeek: '',
            nextMonth: '',
            nextFebruary: '',
            actualSubtotal: '',
            actualTheFirstWeek: '',
            actualTheSecondWeek: '',
            actualTheThirdWeek: '',
            actualTheFourthWeek: ''
          },
          {
            type: '社会招聘',
            projectName: '“1+2”岗位到岗人数',
            serialNumber: 14,
            planSubtotal: '',
            planTheFirstWeek: '',
            planTheSecondWeek: '',
            planTheThirdWeek: '',
            planTheFourthWeek: '',
            nextMonth: '',
            nextFebruary: '',
            actualSubtotal: '',
            actualTheFirstWeek: '',
            actualTheSecondWeek: '',
            actualTheThirdWeek: '',
            actualTheFourthWeek: ''
          },
          {
            type: '大学生招聘',
            projectName: '大学生在岗人数',
            serialNumber: 15,
            planSubtotal: '',
            planTheFirstWeek: '',
            planTheSecondWeek: '',
            planTheThirdWeek: '',
            planTheFourthWeek: '',
            nextMonth: '',
            nextFebruary: '',
            actualSubtotal: '',
            actualTheFirstWeek: '',
            actualTheSecondWeek: '',
            actualTheThirdWeek: '',
            actualTheFourthWeek: ''
          },
          {
            type: '大学生招聘',
            projectName: '大学生到岗人数',
            serialNumber: 16,
            planSubtotal: '',
            planTheFirstWeek: '',
            planTheSecondWeek: '',
            planTheThirdWeek: '',
            planTheFourthWeek: '',
            nextMonth: '',
            nextFebruary: '',
            actualSubtotal: '',
            actualTheFirstWeek: '',
            actualTheSecondWeek: '',
            actualTheThirdWeek: '',
            actualTheFourthWeek: ''
          },
          {
            type: '大学生招聘',
            projectName: '三方协议签约人数',
            serialNumber: 17,
            planSubtotal: '',
            planTheFirstWeek: '',
            planTheSecondWeek: '',
            planTheThirdWeek: '',
            planTheFourthWeek: '',
            nextMonth: '',
            nextFebruary: '',
            actualSubtotal: '',
            actualTheFirstWeek: '',
            actualTheSecondWeek: '',
            actualTheThirdWeek: '',
            actualTheFourthWeek: ''
          }
        ],
        tableData: [],
        statusList: [  //父表状态
         {
              label: "已保存",
              value: 0
          },
          {
              label: "已提交",
              value: 1
          },
          {
              label: "已审核",
              value: 2
          }
        ],
        formData: {
        },
        formOptions: {
          labelWidth: '150px',
          options: [
            /* {
              label: '填报日期',
              prop: 'createrTime',
              span: 4
            }, */
            {
              label: '提交人',
              prop: 'submiterName',
              span: 4.8
            },
            {
              label: '提交日期',
              prop: 'submitDate',
              span: 4.8
            },
            {
              label: '审批人',
              prop: 'appover',
              span: 4.8
            },
            {
              label: '审批日期',
              prop: 'appoverDate',
              span: 4.8
            },
            {
              label: '状态',
              prop: 'status',
              span: 4.8,
              fontStyle: { color: '#2BB687' },
              valueFormat: true
            }
          ]
        },
        orgLongNum: '',
        form: {
          orgId: '',
          period: ''
        },
        fullscreen:'',
        treeData: [],
        customColumns: [
          {
            field: 'orgId',
            visible: false
          }
        ],
        tablePage: {
          currentPage: 1,
          pageSize: 10,
          totalResult: 0
        },
        orgName: '',
        ifAedit:0,
        loading: false,
        rowIndex: 0,
        isSave: false,//是否保存
        validRules: {
          planTheFirstWeek: [
            { required: true, message: '1-7日计划必须填写' },
            { pattern: /^[1-9]([0-9])*$/, message: '不能含有小数' }
          ],
          planTheSecondWeek: [
            { required: true, message: '8-14日计划必须填写' },
            { pattern: /^[1-9]([0-9])*$/, message: '不能含有小数' }
          ],
          planTheThirdWeek: [
            { required: true, message: '15-21日计划必须填写' },
            { pattern: /^[1-9]([0-9])*$/, message: '不能含有小数' }
          ],
          planTheFourthWeek: [
            { required: true, message: '22-30日计划必须填写' },
            { pattern: /^[1-9]([0-9])*$/, message: '不能含有小数' }
          ],
          nextMonth: [
            { required: true, message: '下一月必须填写' },
            { pattern: /^[1-9]([0-9])*$/, message: '不能含有小数' }
          ],
          nextFebruary: [
            { required: true, message: '下二月必须填写' },
            { pattern: /^[1-9]([0-9])*$/, message: '不能含有小数' }
          ],

        },
        month: 0,
        nowMonth:'',//当前月份
        nextMonths:'',//下一月
        months:['一','二','三','四','五','六','七','八','九','十','十一','十二'],
        props: {
          label: 'name',
          value: 'longNumber'
        }
      }
    },
    watch: {
      orgInfo(newVal, oldVal) { // 动态监听切换组织
        this.form.orgId = newVal.id
        this.searchForm.organization = newVal.name
        this.getList()
      },
      planYearMonth(newVal, oldVal) {  // 动态监听计划期间
        this.form.period = newVal
        let month1 = Number(newVal.split('-')[1])
        this.month = month1
        this.getList()
      }
    },
    mounted() {
      window.onresize = () => {  // 动态监听窗口大小
      // this.fullscreen = document.fullscreen
        return (() => {
          this.computedDOMHeight()
        })()
      }
      this.$nextTick(() => {  // 根据当前屏幕高度计算子表内容区高度
        this.computedDOMHeight()
        this._onFullscreenchange() // 监听全屏
      })
      let m = this.planYearMonth.substring(5);
      // this.nowMonth = this.months[Number(m)]
      this.nextMonths = this.months[Number(m)]
      console.log(this.nextMonths)
      this.initData()
      this.getList()
    },
    methods: {
      handleFullscreen() {
        let fullarea = this.$refs.pageContent

        if (this.fullscreen) {       // 退出全屏

          if (document.exitFullscreen) {

            document.exitFullscreen()

          } else if (document.webkitCancelFullScreen) {

            document.webkitCancelFullScreen()

          } else if (document.mozCancelFullScreen) {

            document.mozCancelFullScreen()

          } else if (document.msExitFullscreen) {

            document.msExitFullscreen()

          }

        } else {        // 进入全屏

          if (fullarea.requestFullscreen) {

            fullarea.requestFullscreen()

          } else if (fullarea.webkitRequestFullScreen) {

            fullarea.webkitRequestFullScreen()

          } else if (fullarea.mozRequestFullScreen) {

            fullarea.mozRequestFullScreen()

          } else if (fullarea.msRequestFullscreen) {

            // IE11

            fullarea.msRequestFullscreen()

          }

        }

        this.fullscreen = !this.fullscreen

      },
      _onFullscreenchange () { // 监听全屏事件
      document.addEventListener("fullscreenchange", () => {
        this.fullscreen = this._isFullscreenEnable()
      }, false)


      document.addEventListener("mozfullscreenchange", () => {
        this.fullscreen = this._isFullscreenEnable()
      }, false)


      document.addEventListener("webkitfullscreenchange", () => {
        this.fullscreen = this._isFullscreenEnable()
      }, false)


      document.addEventListener("msfullscreenchange", () => {
        this.fullscreen = this._isFullscreenEnable()
      }, false)
    },
    _isFullscreenEnable() { // 判断当前是否在全屏状态
      return document.fullscreenElement ||
        document.msFullscreenElement ||
        document.mozFullScreenElement ||
        document.webkitFullscreenElement ||
        document.fullscreen ||  false;
    },
      computedDOMHeight() {
        let curClientHeight = document.body.clientHeight  // 当前屏幕高度
        let pageContentHeight = curClientHeight - this.$refs.pageContent.getBoundingClientRect().top
        this.$refs.pageContent.style.height = (pageContentHeight - 10) + 'px'

        let contentHeadHeight = document.querySelectorAll('.content-head')[0].offsetHeight
        //let pagerHeight = document.querySelectorAll('.vxe-pager')[0].offsetHeight

        this.childTableHeight = pageContentHeight - contentHeadHeight - 30
      },
      activeCellMethod({ column, columnIndex }) {
        debugger
        if (this.isStatus == 1 ) {
          return false
        }
        if(this.isStatus == 2){
          if(column.property=='actualTheFirstWeek' || column.property=='actualTheSecondWeek'
            || column.property=='actualTheThirdWeek' || column.property=='actualTheFourthWeek'){
              return true
          }else{
              return false
          }
        }
        return true
      },
      initData() {  // 初始化数据
        let month1 = Number(this.planYearMonth.split('-')[1])
        this.month = month1
        this.form.orgId = this.searchForm.orgId;
        this.form.period = this.planYearMonth;
        if (this.orgInfo && this.orgInfo.id) { //获取默认orgId
          this.form.orgId = this.orgInfo.id
          this.searchForm.organization = this.orgInfo.name
        } else {
          this.$message.warning('请选择组织!')
        }
      },
      // 获取数据
      getList() {
         if(!this.searchForm.organization) {
          this.$message.warning('请选择组织!')
          return false
        }
          getFeedbackList(this.form)
          .then(res => {
            if (res.status === 200) {
              debugger
              if (res.data.length > 0) {
                 this.tableData = res.data[0].entrys;
                //  this.parentData.push(res.data[0].lord);
                 this.formData = res.data[0].lord
                 this.isStatus = res.data[0].lord.status;
                 this.ifAedit = res.data[0].ifAedit;
                 console.log(this.formData)
              }else {
                this.isStatus = '-1';
                this.tableData = [];
                this.formData = new Object()
              }

            }
          })
          .catch(() => {
          })

      },
      // //查询
      // searchEvent() {
      //   if(!this.searchForm.organization) {
      //     console.log(this.searchForm.organization)
      //     this.$message.warning('请选择组织!')
      //     return false
      //   }
      //   this.form.period = moment(parseInt(new Date(this.searchForm.period).getTime())).format('YYYY-MM')
      //   console.log(this.form.period)
      //   this.tableData = []
      //   this.parentData = []
      //   this.getList()
      // },
      getPeriod(val) {
        if (val.length > 8) {
          return moment(parseInt(val)).format('YYYY-MM-DD')
        } else {
          return val
        }
      },
      //反馈
    feedBack() {
      let updateRecords = this.$refs.xTable.getUpdateRecords()//子表修改
      this.formData.status = this.isStatus;
      let data = {
        entrys:updateRecords,
        lord:this.formData
      }
      feedbackRecruitmentList(data).then(res=> {
        this.isSave = true;
        this.$message.success("反馈成功！");
        this.isFeedBack = 1;
      })

    },
      //审核及反审核
      auditEvent(ele) {

        //审批
        if (ele == 1) {
          // this.formData.status = 2
          this.formData.appoverId = this.$store.getters.userId
          this.formData.appover = this.$store.getters.name
          // this.formData.appoverDate = moment(parseInt(new Date().getTime())).format('YYYY-MM-DD');
          let data = {
            lord: this.formData //insertchirld[0]
          }
          auditbackListList(data).then(res => {
            if (res.status === 200) {
              this.$message.success('审核成功！')
              this.isStatus = 2
              this.formData.status = 2;
              this.formData.appoverDate = moment(parseInt(new Date().getTime())).format('YYYY-MM-DD')
            }
          })
        }
        //反审批
        if (ele == 2) {
          // this.formData.status = 9
          let data = {
            lord: this.formData //insertchirld[0]
          }
          if(this.ifAedit) {
            this.$XModal.message({ status: 'error', message: '该记录不可反审核' })
            return false;
          }
          unAuditbackListList(data).then(res => {
            if (res.status === 200) {
              this.$message.success('反审核成功！')
              this.isStatus = 0
              this.formData.status = 0
            }
          })
        }

      },
      //提交
      submiteEvent() {
       let insertRecords = this.$refs.xTable.getInsertRecords()//子表新增
      let removeRecords = this.$refs.xTable.getRemoveRecords()//子表删除
      let updateRecords = this.$refs.xTable.getUpdateRecords()//子表修改
      // console.log(insertchirld)
      let subRemove;//有id的删除数组
      let chirdRecord = insertRecords.concat(updateRecords)
      let removeId = removeRecords.map(item=> {
        return item.id
      })
      this.formData.status = 1;
      this.formData.submiter = this.$store.getters.userId;
      this.formData.submiterName = this.$store.getters.name;
      this.formData.submitDate = moment(parseInt(new Date().getTime())).format('YYYY-MM-DD')
      let data = [{
        delectIds:removeId,
        entrys:chirdRecord,
        lord:this.formData
      }]
        this.$refs.xTable.validate(valid => {
          if (!valid) {
            this.$XModal.message({ status: 'error', message: '校验不通过！' })
          }else {
            updateFeedbackList(data).then(res => {
              this.isSave = true
              this.$message.success('提交成功！')
              this.isStatus = 1
            })
          }
        })

      },
      //保存
      getUpdateEvent() {
        let insertRecords = this.$refs.xTable.getInsertRecords()//子表新增
        let removeRecords = this.$refs.xTable.getRemoveRecords()//子表删除
        let updateRecords = this.$refs.xTable.getUpdateRecords()//子表修改
        // console.log(insertchirld)
        let subRemove;//有id的删除数组
        // let parentCheck = this.$refs.PTable.getSelectRecords();//选中的父表
        let chirdRecord = insertRecords.concat(updateRecords)
        let removeId = removeRecords.map(item=> {
          return item.id
        })
        this.formData.status = 0;
        let data = [{
          delectIds:removeId,
          entrys:chirdRecord,
          lord:this.formData
        }]
        debugger
        if (chirdRecord.length <1) {
          this.$XModal.message({ status: 'error', message: '请添加子表数据' })
          return false;
        }

        updateFeedbackList(data).then(res => {
          this.isSave = true
          this.$message.success('保存成功！')
          this.isStatus = 0;
        })
      },
      insertEvent(row) {
        let record = {}
        this.$refs.xTable.insertAt(record, row)
          .then(({
            row
          }) => this.getInsertEvent())

      },
      getInsertEvent() {
        let insertRecords = this.$refs.xTable.getInsertRecords()
        insertRecords[0].status = 1
        this.tableData.unshift(insertRecords[0])
        // this.tempTableData.unshift(insertRecords[0]);
      },
      // 新增主表
      insertEventParent() {
        const dataList = Object.keys(this.formData);
        if (dataList.length === 0) {
           this.$set(this.formData,'creatorTime',moment(parseInt(new Date().getTime())).format('YYYY-MM-DD'))
          this.formData.orgName =  this.searchForm.organization
          this.formData.orgId =  this.orgInfo.id
          this.formData.status = 0
          this.formData.period = this.planYearMonth;
        console.log(this.formData)
          this.tableData = this.tableDataLocal
        } else {
          this.$message.warning('该组织该月已有数据，不能新增！')
        }

      },
      //删除主表数据
      delEvent() {
        let deleteId = [this.formData.id];
        deletebackListList(deleteId).then(res => {
          if (res.status === 200) {
            this.isStatus=-1
            this.formData = {};
            this.parentData = []
            this.tableData = []
          }
          // this.tableData = []
        })

      },
      getSelectLabel(value, list, valueProp = 'value', labelField = 'label') {
        let item = this.$utils.find(list, item => item[valueProp] === value)
        return item ? item[labelField] : null
      },
      dataSubile(valList) {
        for(let i = 0;i<valList.length; i++) {
          const rep = Number(valList[i].planTheFirstWeek),
            fattening = Number(valList[i].planTheSecondWeek),
            distr = Number(valList[i].planTheThirdWeek),
            business = Number(valList[i].planTheFourthWeek),
            reps = Number(valList[i].actualTheFirstWeek),
            fattenings = Number(valList[i].actualTheSecondWeek),
            distrs = Number(valList[i].actualTheThirdWeek),
            businessS = Number(valList[i].actualTheFourthWeek)
          let z_total = rep + fattening + distr + business;
          let s_total = reps + fattenings + distrs + businessS;
          valList[i].planSubtotal = z_total; //计划小计
          valList[i].actualSubtotal = s_total; //实际小计
        }
      },
      // 通用行合并函数（将相同多列数据合并为一行）
      rowspanMethod({ row, $rowIndex, column, data }) {
        let fields = ['type']
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
            if (countRowspan > 1) {
              return { rowspan: countRowspan, colspan: 1 }
            }
          }
        }
      },
      formatDate(value) {
        let date = new Date(date)
        let year = date.getFullYear()
        let month = date.getMonth() + 1
        console.log(year + '-' + month)
        return year + '-' + month
      },
      handleChangeEvent(val, data) {
        if (data) {
          this.orgId = data.id
          this.orgName = data.name
        } else {
          this.orgId = ''
          this.orgName = ''
        }
      },
      exportDataEvent () {
        // this.$refs.xTable.openExport()

          let data = this.$refs.xTable.getTableData().fullData;
          let commitData = {
              // delectIds: this.entryIds,
              // lord: this.mainTableData,
              entrys: data
          };
          this.exportMethod(commitData);
      },
      exportMethod(commitData){
        axios({
          method: 'post',
          url: `${process.env.BASE_API}/BUSINESSREPORT/recruitmentFeedback/downloadExcel`,
          responseType: 'blob',
          timeout: 1000 * 30,
          data: commitData,
          headers: {
            Authentication: `${getToken()}`,
            filename: 'utf-8'
          }
        }).then(response => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', '人员招聘计划及追踪' + '.xlsx');
            document.body.appendChild(link);
            link.click();
          }).catch(function (reason) {
            console.log('catch:', reason);
          });
      },
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
        let _self = this;
        let formData = new FormData();
        formData.append("file", _file);
        importReport(formData).then(res => {
          debugger
          this.$refs.upload.clearFiles();
          if (res.status === 200) {
            _self.$refs.xTable.remove()
            _self.$refs.xTable.insertAt(res.data)
            this.$message.success('导入成功');
          } else {
            this.$message.error('导入失败');
          }
        }).catch(err => {
          this.$refs.upload.clearFiles();
          this.$message.error(`${err}`);
        });
      }
    },
    computed: {
      ...mapGetters(['orgInfo', 'planYearMonth']),
      //计划小计
      planSubtotals() {
        return function(row, index) {
          let rep = Number(row.planTheFirstWeek),
            fattening = Number(row.planTheSecondWeek),
            distr = Number(row.planTheThirdWeek),
            business = Number(row.planTheFourthWeek)
          let sunNum = rep + fattening + distr + business
          return sunNum
        }
      },
      //实际小计
      subtotals() {
        return function(row, index) {
          let rep = Number(row.actualTheFirstWeek),
            fattening = Number(row.actualTheSecondWeek),
            distr = Number(row.actualTheThirdWeek),
            business = Number(row.actualTheFourthWeek)
          let sunNum = rep + fattening + distr + business
          return sunNum
        }
      }
    }
  }
</script>

<style scoped lang="scss">
  .page-form-container {
    margin: 0 !important;
  }

  .dot {
    margin-right: 10px;
  }

  .search-container /deep/ .el-input.is-disabled .el-input__inner {
    border: 1px solid #E4E7ED !important;
  }

  .el-button--primary.is-plain {
      color: #1989FA;
      background: #ffffff;
      border-color: #1989FA;
  }
  .el-button--danger.is-plain {
      color: #F56C6C;
      background: #ffffff;
      border-color: #F56C6C;
  }
  .page-content {
    box-sizing: border-box;
    margin: 10px 10px;
    padding: 1px 20px;
    border-radius: 5px;
    background-color: #fff;

    .content-head {
      padding: 5px 0 10px 0;

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

</style>
