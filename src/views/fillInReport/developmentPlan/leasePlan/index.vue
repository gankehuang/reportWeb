
<template>
  <div>
    <!--顶部操作区-->
      <formTitle title="代建及租赁栏舍计划及追踪">
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
            <el-button size="small" :disabled="loading" @click="getUpdateEvent()" class="el-button-audit" v-if="isStatus==0">保存</el-button>
            <el-button size="small" :disabled="loading" @click="submiteEvent()" class="el-button-submit" v-if="isStatus == 0">提交</el-button>
            <el-button size="small" :disabled="loading" @click="auditEvent(1)" class="el-button-audit" v-if="isStatus == 1">审核</el-button>
            <el-button size="small" :disabled="loading" @click="auditEvent(2)" class="el-button-unaudit" v-if="isStatus == 2">反审核</el-button>
            <el-button size="small" :disabled="loading" @click="feedBack" type="primary" plain v-if="isStatus == 2">反馈</el-button> -->

            <template v-if="isStatus<0">
              <el-button size="small" :disabled="loading" @click="getUpdateEvent()" class="el-button-audit">保存</el-button>
            </template>
            <template v-else-if="isStatus==0">
              <el-button size="small" :disabled="loading" @click="delEvent()" class="el-button-delete" >删除</el-button>
              <el-button size="small" :disabled="loading" @click="getUpdateEvent()" class="el-button-audit" >保存</el-button>
              <el-button size="small" :disabled="loading" @click="submiteEvent()" class="el-button-submit" >提交</el-button>
            </template>
            <template v-else-if="isStatus==1 ">
              <el-button size="small" :disabled="loading" @click="auditEvent(1)" class="el-button-audit" >审核</el-button>
            </template>
            <template v-else-if="isStatus==2">
               <el-button size="small" :disabled="loading" @click="auditEvent(2)" class="el-button-unaudit" >反审核</el-button>
               <el-button size="small" :disabled="loading" @click="feedBack" type="primary" plain>反馈</el-button>
            </template>
        </div>
      </formTitle>
    <div class="page-content" ref="pageContent">
      <el-row class="content-head" type="flex" align="middle">
        <el-col :span="12">
          <span class="dot" ></span>
          <span class="title">子表信息</span>
        </el-col>
        <el-col :span="12" class="content-head-right">
          <vxe-toolbar>
          <template v-slot:buttons>
              <el-button size="small" @click="insertEvent()" v-if="isStatus<=0" class="el-button-audit">新增行</el-button>
              <el-button size="small" @click="$refs.xTable.removeSelecteds()" v-if="isStatus<=0" class="el-button-unaudit">行删除</el-button>
              <el-button size="small" @click="exportDataEvent" icon="el-icon-upload2" class="el-button-audit">导出</el-button>

             <el-upload
              v-if="isStatus<=0"
               style="display:inline-block;margin-left:10px;"
               ref="upload"
               :limit="1"
               :show-file-list="false"
               action="/leaseHouseFeedback/excelUpload"
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
      ref="xTable"
      resizable
      :edit-config="{trigger: 'click', mode: 'cell',activeMethod: activeCellMethod}"
      :loading="loading"
      :span-method="rowspanMethod"
      :data="tableData"
      show-footer
      :footer-method="footerMethod"
      :edit-rules="validRules"
      :height="childTableHeight"
      border
      align="center">
      <vxe-table-column type="checkbox" width="60" fixed="left"></vxe-table-column>
      <vxe-table-column title="猪场名称" min-width="130" field="pigfarmName" fixed="left" :edit-render="{name: 'input'}"></vxe-table-column>
      <vxe-table-column title="猪场类型" field="pigfarmType" min-width="100" :edit-render="{name: 'default'}">
        <template v-slot:edit="scope">
          <el-select v-model="scope.row.pigfarmType" @change="$refs.xTable.updateStatus(scope)">
            <el-option v-for="item in typeList" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </template>
        <template v-slot="{ row }">{{ getSelectWeek(row.pigfarmType) }}</template>
        <!-- <template v-slot="{ row }">{{ getSelectType(row.pigfarmType) }}</template> -->
      </vxe-table-column>
      <vxe-table-column title="计划数据">
        <vxe-table-column title="母猪规模（头）" width="90" field="planSowQuantity" :edit-render="{name: 'input',attrs: {type: 'number'}}"></vxe-table-column>
        <vxe-table-column title="肥猪规模（头）" width="90" field="planFatpigQuantity" :edit-render="{name: 'input',attrs: {type: 'number'}}"></vxe-table-column>
        <vxe-table-column title="租赁价格(元/头年)" width="90" field="planLeaseMoney" :edit-render="{name: 'input',attrs: {type: 'number'}}"></vxe-table-column>
        <vxe-table-column title="计划签约日期" width="160" field="planSigningDate" :edit-render="{type: 'default'}">
          <template v-slot:edit="{ row }">
              <el-date-picker
                  v-model="row.planSigningDate"
                  type="date"
                  format="yyyy-MM-dd"
                  value-format="timestamp"
                  style="width: 100%;"
              ></el-date-picker>
          </template>
          <template v-slot="{ row }">{{formatDate(row.planSigningDate,'yyyy-MM-dd')}}</template>
        </vxe-table-column>
        <vxe-table-column title="责任人" width="90" field="planPrincipalId" :edit-render="{name: 'input'}"></vxe-table-column>
      </vxe-table-column>
      <vxe-table-column title="实际数据">
        <vxe-table-column title="租赁年限（年）" width="100" field="leaseYears" :edit-render="{name: 'input',attrs: {type: 'number'}}"></vxe-table-column>
        <vxe-table-column title="租赁价格(元/头年)" width="100" field="leasePrice" :edit-render="{name: 'input',attrs: {type: 'number'}}"></vxe-table-column>
        <vxe-table-column title="年租金(万元)" width="100" field="annualRent" :edit-render="{name: 'input',attrs: {type: 'number'}}"></vxe-table-column>
        <vxe-table-column title="支付方式" width="90" field="paymentMethod" :edit-render="{name: 'input'}"></vxe-table-column>
        <vxe-table-column title="合同签约日期" width="160" field="contractSigningDate" :edit-render="{type: 'default'}">
          <template v-slot:edit="{ row }">
              <el-date-picker
                  v-model="row.contractSigningDate"
                  type="date"
                  format="yyyy-MM-dd"
                  value-format="timestamp"
                  style="width: 100%;"
              ></el-date-picker>
          </template>
          <template v-slot="{ row }">{{formatDate(row.contractSigningDate,'yyyy-MM-dd')}}</template>
        </vxe-table-column>
        <vxe-table-column title="合同约定交付日期" width="160" field="contractualDeliveryDate" :edit-render="{type: 'default'}">
          <template v-slot:edit="{ row }">
              <el-date-picker
                  v-model="row.contractualDeliveryDate"
                  type="date"
                  format="yyyy-MM-dd"
                  value-format="timestamp"
                  style="width: 100%;"
              ></el-date-picker>
          </template>
          <template v-slot="{ row }">{{formatDate(row.contractualDeliveryDate,'yyyy-MM-dd')}}</template>
        </vxe-table-column>
        <vxe-table-column title="交付时需支付租金(万元)" width="120" field="neetPayRent" :edit-render="{name: 'input',attrs: {type: 'number'}}"></vxe-table-column>
        <vxe-table-column title="已付款合计(万元)" width="120" field="totalPayment" :edit-render="{name: 'input',attrs: {type: 'number'}}"></vxe-table-column>
        <vxe-table-column title="其中：支付定/押金(万元)" width="120" field="depositPaid" :edit-render="{name: 'input',attrs: {type: 'number'}}"></vxe-table-column>
        <vxe-table-column title="其中：支付租金(万元)" width="120" field="payPrice" :edit-render="{name: 'input',attrs: {type: 'number'}}"></vxe-table-column>
        <vxe-table-column title="尚需支付款项差额(万元)" width="120" field="paymentDifference" :edit-render="{name: 'input',attrs: {type: 'number'}}"></vxe-table-column>
      </vxe-table-column>
      <vxe-table-column title="备注" min-width="100" field="remarks" :edit-render="{name: 'input'}"></vxe-table-column>
    </vxe-table>
    </div>
  </div>
</template>

<script>
import {importLeasePlanReport,
  getLeaseList,
  updateLeaseList,
  deleteLeaseList,
  auditLeaseList,
  unAuditLeaseList,
  feedbackLeaseList
} from '@/api/businessUnitApi/personManagement'
import { mapGetters } from 'vuex'

import axios from 'axios'
import { getToken } from '@/utils/auth'

import formTitle from '@/components/formTitle/formTitle'
import PageForm from '@/components/form/Form'
import moment from 'moment'
import floatObj from '@/utils/math'
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
        orgName: '',
        period: new Date().getTime()
      },
      isStatus:'',
      parentData: [],
      typeList: [  //父表状态
        { label: '代建', value: 0 },
        { label: '租赁', value: 1 },
      ],
      orgLongNum: "",
      treeData: [],
      tableData: [],//显示的子表数据
      isCanUnAudit: '',
      chrenList:[],//获取的子表数据
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
      validRules: {
          pigfarmName: [
            { required: true, message: '猪场名称' }
          ],
          pigfarmType: [
            { required: true, message: '猪场类型' }
          ],
          planSowQuantity: [
            { required: true, message: '母猪规模' },
            { pattern: /^(\d+)*$/, message: '必须是正整数' }
          ],
          planFatpigQuantity: [
            { required: true, message: '肥猪规模' },
            { pattern: /^(\d+)*$/, message: '必须是正整数' },
          ],
          planLeaseMoney: [
            { required: true, message: '租赁价格' }
          ],
          planSigningDate: [
            { required: true, message: '计划签约日期' }
          ],
          planPrincipalId: [
            { required: true, message: '责任人' }
          ],
        },
      props: {
        label: "name",
        value: "longNumber"
      },
      orgList: [
        {
          label: "xxx公司",
          value: "0"
        },
        {
          label: "xxx片区",
          value: "1"
        },
        {
          label: "xxx猪场",
          value: "2"
        }
      ],
      ifAedit:0,
      orgName:'',
      loading: false,
      rowIndex:0,
      isSave:false,//是否保存
      isFeedBack:0,//模拟是否反馈，用来判断反馈按钮 0,未反馈，1已反馈
      fullscreen: ''
    }
  },
  watch: {
    orgInfo(newVal, oldVal) { // 动态监听切换组织
      this.searchForm.orgId = newVal.id
      this.searchForm.orgName = newVal.name
      this.searchForm.period = this.planYearMonth
      this.formData.orgId = newVal.id
      this.formData.orgName = newVal.name
      this.formData.period = this.planYearMonth
      this.getList()
    },
    planYearMonth(newVal, oldVal) {  // 动态监听计划期间
      this.searchForm.period = newVal
      this.formData.period = newVal
      this.getList()
    },
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
      activeCellMethod ({ column, columnIndex }) {

       if (this.isStatus == 1) {
         return false
       }else if(this.isStatus == 2){
         if (columnIndex === 1 || columnIndex === 2 ||columnIndex === 3 || columnIndex === 4 ||columnIndex === 5 || columnIndex === 6 ||columnIndex === 7) {
            return false
          }else {
            return true
          }
       }else {
         return true
       }
      console.log(column, columnIndex)

      },

      countAllAmount (data) {
        let count = 0
        data.forEach(row => {
          count += this.countAmount(row)
        })
        return count
      },
      footerMethod ({ columns, data }) {
        return [

          columns.map((column, columnIndex) => {
            if (columnIndex === 0) {
              return '合计'
            }
            if (['planSowQuantity', 'planFatpigQuantity','leaseYears','annualRent','totalPayment','depositPaid','payPrice','paymentDifference'].includes(column.property)) {
              return this.$utils.sum(data, column.property)
            }
            return null
          })
        ]
      },
      getSelectWeek(val) {
        if (val == 0) return '代建'
        if (val == 1) return '租赁'
      },
    initData() {  // 初始化数据
      if (this.orgInfo && this.orgInfo.id) { //获取默认orgId
        this.searchForm.orgId = this.orgInfo.id
        this.searchForm.period = this.planYearMonth
        this.searchForm.orgName = this.orgInfo.name
      } else {
        this.$message.warning('请选择组织!')
      }
    },
    getPeriod(val) {
      if (val.length > 8 ) {
        return moment(parseInt(val)).format('YYYY-MM')
      }else {
        return val
      }
    },
    // 获取数据
    getList() {
      if(!this.searchForm.orgName) {
        this.$message.warning('请选择组织!')
        return false
      }
      // this.form.orgId = this.orgInfo.id;
      getLeaseList(this.searchForm)
        .then(res => {
          if (res.status === 200) {
              if (res.data.length > 0) {
                 this.tableData = res.data[0].entrys;
                //  this.parentData.push(res.data[0].lord);
                 this.formData = res.data[0].lord
                 this.isStatus = res.data[0].lord.status;
                 this.ifAedit = res.data[0].ifAedit;
                //  this.formData = {
                //     creatorTime: this.formData.creatorTime,
                //     submiterName: this.formData.submiterName,
                //     submitDate: this.formData.submitDate,
                //     appover: this.formData.appover,
                //     appoverDate: this.formData.appoverDate,
                //     status: this.formData.status ? this.enumStatus(this.formData.status) : '',
                //     id:this.formData.id
                //  }
              }else {
                this.tableData = [];
                this.formData = new Object()
                this.isStatus = '-1'
              }
              this.formData.orgId = this.searchForm.orgId
              this.formData.orgName = this.searchForm.orgName
              this.formData.period = this.searchForm.period

          }
        })
        .catch(() => {
        });

    },
    //反馈
    feedBack() {
      let updateRecords = this.$refs.xTable.getUpdateRecords()//子表修改
      this.formData.status = this.isStatus;
      let data = {
        entrys:updateRecords,
        lord:this.formData
      }
      feedbackLeaseList(data).then(res=> {
        this.$message.success("反馈成功！");
        this.isFeedBack = 1;
      })

    },
    //时间格式化方法
    formatDate(value, format) {
        return this.$utils.toDateString(value, format);
    },
    //审核及反审核
    auditEvent(ele) {
      //审批
      debugger
      if (ele == 1) {
        // this.formData.status = 2;
        this.formData.appoverId = this.$store.getters.userId;
        this.formData.appover = this.$store.getters.name;
        let data = {
          lord:this.formData //insertchirld[0]
        }
        auditLeaseList(data).then(res=>{
        debugger
          if(res.status === 200) {
               this.formData.status = 2;
            this.$message.success("审核成功！");
            this.isStatus = 2;
            this.formData.appoverDate = moment(parseInt(new Date().getTime())).format('YYYY-MM-DD')
          }
        })
      }
      //反审批
      if (ele == 2) {
        // this.formData.status = 9;
        let data = {
          lord:this.formData //insertchirld[0]
        }
        if(this.ifAedit) {
            this.$XModal.message({ status: 'error', message: '该记录不可反审核' })
            return false;
          }
        unAuditLeaseList(data).then(res=>{
          if(res.status === 200) {
            this.$message.success("反审核成功！");
             this.formData.status = 0;
            this.isStatus = 0;
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
	  this.formData.status = 1;      this.formData.submiter = this.$store.getters.userId;
      this.formData.submiterName = this.$store.getters.name;
      this.formData.submitDate = moment(parseInt(new Date().getTime())).format('YYYY-MM-DD')
      // debugger
      let data = [{
        delectIds:removeId,
        entrys:chirdRecord,
        lord:this.formData
      }]

      this.$refs.xTable.validate(valid => {
        if (!valid) {
          this.$XModal.message({ status: 'error', message: '校验不通过！' })
        }else {
          updateLeaseList(data).then(res=> {
            this.isSave = true;
            this.$message.success("操作成功！");
            this.formData.status = 1;
            this.isStatus = 1;
          })
        }
      })

    },
    //查询
    // searchEvent() {
    //   if(!this.searchForm.orgName) {
    //       console.log(this.searchForm.orgName)
    //       this.$message.warning('请选择组织!')
    //       return false
    //     }
    //   this.form.period = moment(parseInt(new Date(this.searchForm.period).getTime())).format('YYYY-MM')
    //   console.log(this.form.period)
    //   this.tableData = []
    //   this.parentData = [];
    //   this.getList();
    // },
    formatStatus(val) {
      if (val == 0) return '未审批';
      if (val == 1) return '已审批';
    },
    getSelectType(value) {
      if(value == 1) {
        return '租赁'
      }else {
        return '代建'
      }
    },
    exportDataEvent () {
      // debugger
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
        url: `${process.env.BASE_API}/BUSINESSREPORT/leaseHouseFeedback/downloadExcel`,
        responseType: 'blob',
        timeout: 1000 * 30,
        data: commitData,
        headers: {
          Authentication: `${getToken()}`,
          filename: 'utf-8'
        }
      }).then(response => {
          debugger
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', '代建和租赁栏舍计划及追踪' + '.xlsx');
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
      // 导入报表
      const _file = params.file;

      if (!this._checkImportReport(_file)) {
        return;
      }

      let _self = this;

      let formData = new FormData();
      formData.append("file", _file);
      importLeasePlanReport(formData).then(res => {
        debugger
        this.$refs.upload.clearFiles();
        if (res.status === 200) {
          // this.tableData = res.data;
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
    },
    uploadSuccess(response, file){
      debugger
    },
    //保存
    getUpdateEvent () {
debugger
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
      // this.formData.submiter = this.$store.getters.userId;
      // this.formData.submiterName = this.$store.getters.name;
      this.formData.orgName =  this.searchForm.orgName
      this.formData.orgId =  this.orgInfo.id
      this.formData.period = this.planYearMonth;
      // this.formData.submitDate = moment(parseInt(new Date().getTime())).format('YYYY-MM-DD')
      this.formData.status = 0;
      let data = [{
        delectIds:removeId,
        entrys:chirdRecord,
        lord:this.formData
      }]
      if (chirdRecord.length <1) {
        this.$XModal.message({ status: 'error', message: '请添加子表数据' })
        return false;
      }
      updateLeaseList(data).then(res=> {
        this.isSave = true;
        this.$message.success("保存成功！");
        this.isStatus = 0;
        this.formData.status = 0;
      })

    },
    insertEvent() {
      // const dataList = Object.keys(this.formData);
      /* if (dataList.length === 0) {
        this.$XModal.message({ status: 'error', message: '请先选择主表' })
        return false
      } */
        let record = {}
        this.$refs.xTable.insertAt(record)
          .then(({
            row
          }) => this.$refs.xTable.setActiveCell(row, 'pigfarmName'))

      },
     // [废弃]新增主表
    insertEventParent() {
      const dataList = Object.keys(this.formData);
      if (dataList.length === 0) {
        this.$set(this.formData,'creatorTime',moment(parseInt(new Date().getTime())).format('YYYY-MM-DD'))
        this.formData.orgName =  this.searchForm.orgName
        this.formData.orgId =  this.orgInfo.id
        this.formData.status = 0
        this.formData.period = this.planYearMonth;
        console.log(this.formData)
        // this.parentData.splice(0, 0, {
        //   creatorTime:moment(parseInt(new Date().getTime())).format('YYYY-MM-DD'),
        //   // submiterName: this.$store.getters.name,
        //   // submiter: this.$store.getters.userId,
        //   submitDate: '',
        //   orgName: this.searchForm.orgName,
        //   orgId: this.form.orgId,
        //   period: this.form.period,
        //   status:0
        // });
      } else {
        this.$message.warning("该组织该月已有数据，不能新增！");
      }
    },
    //删除主表数据
    delEvent() {

      let deleteId = [this.formData.id];
      if(this.isStatus == 2) {
        this.$XModal.message({ status: 'error', message: '审核后不能删除' })
        return false
      }
      deleteLeaseList(deleteId).then(res=> {
        if(res.status === 200) {
            this.isStatus=-1
            // this.$refs.PTable.removeSelecteds()
            this.formData = {};
            this.parentData = []
            this.tableData = []
        }
      })

    },
    getSelectLabel(value, list, valueProp = "value", labelField = "label") {
      let item = this.$utils.find(list, item => item[valueProp] === value);
      return item ? item[labelField] : null;
    },
    rowspanMethod({ row, $rowIndex, column, columnIndex, data }) {
      const fields = ['projectType', 'project']
      const cellValue = row[column.property]
      if (cellValue && fields.includes(column.property)) {
        const prevRow = data[$rowIndex - 1]
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
    handleChangeEvent(val, data) {
      if(data) {
        this.orgId = data.id;
        this.orgName = data.name;
      } else {
        this.orgId = "";
        this.orgName = "";
      }
    },

  },
  computed: {
    ...mapGetters(['orgInfo', 'planYearMonth']),
    token(){
      let test = getToken()
      debugger
      return test;
    },
    //小计
    subtotals() {
     return function(row,index) {
        let rep = Number(row.reproduction),
            fattening = Number(row.fattening),
            distr = Number(row.districtHeadquarters),
            business = Number(row.businessUnit)
        let sunNum = rep + fattening + distr + business;
        return sunNum
      }
    },
    //全员满编率
    fullStaffingRate() {
     return function(row) {
        let compiled = Number(row.compiled),
            fullStaff = Number(row.fullStaff)
        let sunNum = (compiled / fullStaff) * 100;
        return (compiled && fullStaff) ? sunNum.toFixed(0) +'%' : 0
      }
    },
    //人员主动离职率
    turnoverRate() {
     return function(row) {
        let active = Number(row.activeSeparation),
            subtotal = Number(row.subtotal);
        const rep = Number(row.reproduction),
          fattening = Number(row.fattening),
          distr = Number(row.districtHeadquarters),
          business = Number(row.businessUnit)
        let z_total = rep + fattening + distr + business;
        let sunNum = (active / z_total) * 100;
        // return (active && subtotal) ? sunNum.toFixed(0) +'%' : 0
        return sunNum.toFixed(0) +'%'
      }
    },
    //大学生占比
    collegeStudents() {
     return function(row) {
        let active = Number(row.universityStudents),
            subtotal = row.subtotal;
        const rep = Number(row.reproduction),
          fattening = Number(row.fattening),
          distr = Number(row.districtHeadquarters),
          business = Number(row.businessUnit)
        let z_total = rep + fattening + distr + business;
        let sunNum = (active / z_total) * 100;
        return sunNum.toFixed(0) +'%'
      }
    },
    //社会招聘人数
    socialRecruitment() {
     return function(row) {
        let keyPosition = Number(row.keyPosition),
            experiencedStudent = Number(row.experiencedStudent)
        let sunNum = keyPosition + experiencedStudent;
        return sunNum
      }
    },
    //关键岗位到岗人数
    keyPosition() {
     return function(row) {
        let vicePresident = Number(row.vicePresident),
            businessDirector = Number(row.businessDirector),
            businessManager = Number(row.businessManager),
            areaManager = Number(row.areaManager),
            areaDirector = Number(row.areaDirector),
            branchManager = Number(row.branchManager),
            factoryManager = Number(row.factoryManager),
            serviceDirector = Number(row.serviceDirector)

        let sunNum = vicePresident+businessDirector+businessManager+areaManager+areaDirector+branchManager+factoryManager+serviceDirector;
        return sunNum
      }
    },
  },


}
</script>

<style scoped lang="scss">
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
