<template>
  <div>
    <!--顶部操作区-->
      <formTitle title="人事管理反馈">
        <div slot="context">
          <page-form
            v-bind="formOptions"
            :model="formData"
            :editable="false"
            ref="PageForm"
          ></page-form>
        </div>
        <div slot="title-suffix">
          <!-- <el-button size="small" :disabled="loading" @click="insertEventParent()" plain>新增</el-button> -->
            <el-button size="small" :disabled="loading" @click="delEvent()" type="danger" plain v-if="isStatus === 0">删除</el-button>
            <el-button size="small" :disabled="loading" @click="getUpdateEvent()" type="primary" plain v-if="isShowSave&&isStatus !=1 && isStatus !=2">保存</el-button>
            <el-button size="small" :disabled="loading" @click="submiteEvent()" type="primary" v-if="isStatus === 0">提交</el-button>
            <el-button size="small" :disabled="loading" @click="auditEvent(1)" type="primary" plain v-if="isStatus == 1">审核</el-button>
            <el-button size="small" :disabled="loading" @click="auditEvent(2)" type="danger" plain v-if="isStatus == 2">反审核</el-button>
            <!-- <el-button size="small" :disabled="loading" @click="feedBack" type="primary" plain v-if="isStatus == 2">反馈</el-button> -->
        </div>
      </formTitle>
    <div class="page-content" ref="pageContent">
      <el-row class="content-head" type="flex" align="middle">
        <el-col :span="12">
          <span class="dot" ></span>
          <span class="title" style="font-size: 14px;">子表信息</span>
        </el-col>
        <el-col :span="12" class="content-head-right">
          <vxe-toolbar>
            <template v-slot:buttons>
              <el-button size="small" @click="insertEvent()" v-if="isStatus !=1 && isStatus !=2" type="primary" plain>新增行</el-button>
              <el-button size="small" @click="$refs.xTable.removeSelecteds()" v-if="isStatus !=1 && isStatus !=2" type="danger" plain>删除行</el-button>
              <el-button size="small" @click="exportDataEvent" icon="el-icon-upload2" type="primary" plain>导出</el-button>
              <el-upload
                v-if="isStatus !=1 && isStatus !=2"
                style="display:inline-block;margin-left:10px;"
                ref="upload"
                :limit="1"
                :show-file-list="false"
                action="/projectFundingFeedback/excelUpload"
                accept=".xls,.xlsx"
                :http-request="importDataEvent"
                :file-list="fileList">
                <el-button icon="el-icon-download" size="small" class="el-button-submit" >导入</el-button>
              </el-upload>
              <!--<el-button size="small" icon="el-icon-rank" @click="handleFullscreen">{{fullscreen?'退出全屏':'全屏'}}</el-button>-->
               <!--<vxe-button  @click="importDataEvent" type="primary"  icon="el-icon-download" class="import-btn">导入数据</vxe-button>-->
            </template>
          </vxe-toolbar>
        </el-col>
      </el-row>

    <vxe-table
      ref="xTable"
      resizable
      :edit-config="{trigger: 'click', mode: 'row',activeMethod: activeCellMethod}"
      :loading="loading"
      :span-method="rowspanMethod"
      :edit-rules="validRules"
      :data="tableData"
      :cell-class-name="cellClassName"
      :height="childTableHeight"
      border
      align="center">
      <vxe-table-column type="checkbox" width="60" fixed="left"></vxe-table-column>
      <vxe-table-column title="周数" field="whichWeek" width="120" :edit-render="{name: 'default'}" fixed="left">

        <template v-slot:edit="scope">
          <el-select v-model="scope.row.whichWeek" @change="$refs.xTable.updateStatus(scope)">
            <el-option v-for="item in whichWeeks" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </template>
        <template v-slot="{ row }">{{ getSelectWeek(row.whichWeek) }}</template>
      </vxe-table-column><vxe-table-column title="总人数">
        <vxe-table-column title="小计" width="80" field="subtotal">
            <template v-slot="{ row }">{{subtotals(row)}}</template>
        </vxe-table-column>
        <vxe-table-column title="繁殖线" width="80" field="reproduction"
                          :edit-render="{name: 'input',attrs: {type: 'number'}}"></vxe-table-column>
        <vxe-table-column title="育肥线" width="80" field="fattening"
                          :edit-render="{name: 'input',attrs: {type: 'number'}}"></vxe-table-column>
        <vxe-table-column title="片区本部" width="80" field="districtHeadquarters"
                          :edit-render="{name: 'input',attrs: {type: 'number'}}"></vxe-table-column>
        <vxe-table-column title="事业部本部" width="80" field="businessUnit"
                          :edit-render="{name: 'input',attrs: {type: 'number'}}"></vxe-table-column>
      </vxe-table-column>
      <vxe-table-column title="管理指标">
        <vxe-table-column title="全员满编率" width="80" field="fullStaffingRate">
          <template v-slot="{ row }">{{fullStaffingRate(row)}}</template>
        </vxe-table-column>
        <vxe-table-column title="全员定编人数" width="80" field="fullStaff"
                          :edit-render="{name: 'input',attrs: {type: 'number'}}"></vxe-table-column>
        <vxe-table-column title="全员现编人数" width="80" field="allEdited"
                          :edit-render="{name: 'input',attrs: {type: 'number'}}"></vxe-table-column>
        <vxe-table-column title="干部满编率" width="80" field="compilationRate">
          <template v-slot="{ row }">{{compilatRate(row)}}</template>
        </vxe-table-column>
        <vxe-table-column title="干部定编(场长/主任级以上)" width="80" field="cadre"
                          :edit-render="{name: 'input',attrs: {type: 'number'}}"></vxe-table-column>
        <vxe-table-column title="干部现编(场长/主任级以上)" width="80" field="compiled"
                          :edit-render="{name: 'input',attrs: {type: 'number'}}"></vxe-table-column>
        <vxe-table-column title="人员主动离职率" width="80" field="turnoverRate">
          <template v-slot="{ row }">{{turnoverRate(row)}}</template>
        </vxe-table-column>
        <vxe-table-column title="主动离职人数" width="80" field="activeSeparation"
                          :edit-render="{name: 'input',attrs: {type: 'number'}}"></vxe-table-column>
        <vxe-table-column title="团队平均年龄" width="80" field="averageAge"
                          :edit-render="{name: 'input',attrs: {type: 'number'}}"></vxe-table-column>
        <vxe-table-column title="大学生占比" width="80" field="collegeStudents">
          <template v-slot="{ row }">{{collegeStudents(row)}}</template>
        </vxe-table-column>
        <vxe-table-column title="大学生人数" width="80" field="universityStudents"
                          :edit-render="{name: 'input',attrs: {type: 'number'}}"></vxe-table-column>
      </vxe-table-column>
      <vxe-table-column title="社会招聘">
        <vxe-table-column title="社会招聘人数" width="80" field="socialRecruitment">
          <template v-slot="{ row }">{{socialRecruitment(row)}}</template>
        </vxe-table-column>
        <vxe-table-column title="关键岗位到岗人数" width="80" field="keyPosition">
          <template v-slot="{ row }">{{keyPosition(row)}}</template>
        </vxe-table-column>
        <vxe-table-column title="其中：副总裁级" width="80" field="vicePresident"
                          :edit-render="{name: 'input',attrs: {type: 'number'}}"></vxe-table-column>
        <vxe-table-column title="其中：事业部总监级" width="80" field="businessDirector"
                          :edit-render="{name: 'input',attrs: {type: 'number'}}"></vxe-table-column>
        <vxe-table-column title="其中：事业部经理级" width="80" field="businessManager"
                          :edit-render="{name: 'input',attrs: {type: 'number'}}"></vxe-table-column>
        <vxe-table-column title="其中：片区总经理级" width="80" field="areaManager"
                          :edit-render="{name: 'input',attrs: {type: 'number'}}"></vxe-table-column>
        <vxe-table-column title="其中：片区总监级" width="80" field="areaDirector"
                          :edit-render="{name: 'input',attrs: {type: 'number'}}"></vxe-table-column>
        <vxe-table-column title="其中：分公司经理级" width="80" field="branchManager"
                          :edit-render="{name: 'input',attrs: {type: 'number'}}"></vxe-table-column>
        <vxe-table-column title="其中：场长级" width="80" field="factoryManager"
                          :edit-render="{name: 'input',attrs: {type: 'number'}}"></vxe-table-column>
        <vxe-table-column title="其中：服务部主任级" width="80" field="serviceDirector"
                          :edit-render="{name: 'input',attrs: {type: 'number'}}"></vxe-table-column>
        <vxe-table-column title="其中：生产主管" width="80" field="productionManager"
                          :edit-render="{name: 'input',attrs: {type: 'number'}}"></vxe-table-column>
        <vxe-table-column title="其中：管理员" width="80" field="administrator"
                          :edit-render="{name: 'input',attrs: {type: 'number'}}"></vxe-table-column>
        <vxe-table-column title="2-5年大学生到岗人数" width="80" field="experiencedStudent"
                          :edit-render="{name: 'input',attrs: {type: 'number'}}"></vxe-table-column>
      </vxe-table-column>
      <vxe-table-column title="大学生招聘">
        <vxe-table-column title="大学生到岗人数" width="80" field="collegeStudentsNumber"
                          :edit-render="{name: 'input',attrs: {type: 'number'}}"></vxe-table-column>
        <vxe-table-column title="三方协议签约人数" width="80" field="tripartiteAgreement"
                          :edit-render="{name: 'input',attrs: {type: 'number'}}"></vxe-table-column>
        <vxe-table-column title="校代表人数" width="80" field="schoolRepresentative"
                          :edit-render="{name: 'input',attrs: {type: 'number'}}"></vxe-table-column>
      </vxe-table-column>
    </vxe-table>
    </div>
  </div>
</template>

<script>
  import {
    getPersonneList,
    updatePersonneList,
    deletePersonneList,
    auditPersonneList,
    unAuditPersonneList,
    personalImportReport,
    feedbackPersonneList
  } from '@/api/businessUnitApi/personManagement'
  import formTitle from '@/components/formTitle/formTitle'
  import PageForm from '@/components/form/Form'
  import floatObj from '@/utils/math'
  import {exportReport} from '@/utils/export'
  import moment from 'moment'
  import { mapGetters } from 'vuex'
  export default {
    name: 'PersonnelManagement',
    components: {
        formTitle,
        PageForm
    },
    data() {
      return {
        childTableHeight: 300,
        searchForm: {
          orgId: '',
          organization: '',
          period: new Date().getTime()
        },
        isStatus: '',
        parentData: [],
        orgLongNum: '',
        form: {
          orgId: '',
          period: ''
        },
        fileList: [],
        treeData: [],
        tableData: [],//显示的子表数据
        chrenList: [],//获取的子表数据
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
        props: {
          label: 'name',
          value: 'longNumber'
        },
        formData: {
        },
        delectIds:[],
        formOptions: {
          labelWidth: '150px',
          options: [
            /* {
              label: '填报日期',
              prop: 'creatorTime',
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
        whichWeeks: [
          {
            label: '第一周',
            value: '1'
          },
          {
            label: '第二周',
            value: '2'
          },
          {
            label: '第三周',
            value: '3'
          },
          {
            label: '第四周',
            value: '4'
          }
        ],
        orgList: [
          {
            label: 'xxx公司',
            value: '0'
          },
          {
            label: 'xxx片区',
            value: '1'
          },
          {
            label: 'xxx猪场',
            value: '2'
          }
        ],
        orgName: '',
        tablePage: {
          currentPage: 1,
          pageSize: 10,
          totalResult: 0
        },
        loading: false,
        ifAedit:0,
        rowIndex: 0,
        validRules: {
          whichWeek: [
            { required: true, message: '周数必须填写' }
          ],
          reproduction: [
            { required: true, message: '繁殖线必须填写' },
            { pattern: /^[1-9]([0-9])*$/, message: '不能含有小数' }
          ],
          fattening: [
            { required: true, message: '育肥线必须填写' },
            { pattern: /^[1-9]([0-9])*$/, message: '不能含有小数' }
          ],
          districtHeadquarters: [
            { required: true, message: '片区本部必须填写' },
            { pattern: /^[1-9]([0-9])*$/, message: '不能含有小数' }
          ],
          businessUnit: [
            { required: true, message: '事业部本部必须填写' },
            { pattern: /^[1-9]([0-9])*$/, message: '不能含有小数' }
          ],
          fullStaff: [
            { required: true, message: '全员定编人数必须填写' },
            { pattern: /^[1-9]([0-9])*$/, message: '不能含有小数' }
          ],
          allEdited: [
            { required: true, message: '全员现编人数必须填写' },
            { pattern: /^[1-9]([0-9])*$/, message: '不能含有小数' }
          ],
          cadre: [
            { required: true, message: '干部定编必须填写' },
            { pattern: /^[1-9]([0-9])*$/, message: '不能含有小数' }
          ],
          compiled: [
            { required: true, message: '干部现编必须填写' },
            { pattern: /^[1-9]([0-9])*$/, message: '不能含有小数' }
          ],
          activeSeparation: [
            { required: true, message: '主动离职人数必须填写' },
            { pattern: /^[1-9]([0-9])*$/, message: '不能含有小数' }
          ],
          averageAge: [
            { required: true, message: '团队平均年龄必须填写' },
            { pattern: /^[1-9]([0-9])*$/, message: '不能含有小数' }
          ],
          universityStudents: [
            { required: true, message: '大学生人数必须填写' },
            { pattern: /^[1-9]([0-9])*$/, message: '不能含有小数' }
          ],
          vicePresident: [
            { required: true, message: '副总裁级必须填写' },
            { pattern: /^[1-9]([0-9])*$/, message: '不能含有小数' }
          ],
          businessDirector: [
            { required: true, message: '事业部总监级必须填写' },
            { pattern: /^[1-9]([0-9])*$/, message: '不能含有小数' }
          ],
          businessManager: [
            { required: true, message: '事业部经理级必须填写' },
            { pattern: /^[1-9]([0-9])*$/, message: '不能含有小数' }
          ],
          areaManager: [
            { required: true, message: '片区总经理级必须填写' },
            { pattern: /^[1-9]([0-9])*$/, message: '不能含有小数' }
          ],
          areaDirector: [
            { required: true, message: '片区总监级必须填写' },
            { pattern: /^[1-9]([0-9])*$/, message: '不能含有小数' }
          ],
          branchManager: [
            { required: true, message: '分公司经理级必须填写' },
            { pattern: /^[1-9]([0-9])*$/, message: '不能含有小数' }
          ],
          factoryManager: [
            { required: true, message: '场长级必须填写' },
            { pattern: /^[1-9]([0-9])*$/, message: '不能含有小数' }
          ],
          serviceDirector: [
            { required: true, message: '服务部主任级必须填写' },
            { pattern: /^[1-9]([0-9])*$/, message: '不能含有小数' }
          ],
          productionManager: [
            { required: true, message: '生产主管必须填写' },
            { pattern: /^[1-9]([0-9])*$/, message: '不能含有小数' }
          ],
          administrator: [
            { required: true, message: '管理员必须填写' },
            { pattern: /^[1-9]([0-9])*$/, message: '不能含有小数' }
          ],
          experiencedStudent: [
            { required: true, message: '2-5年大学生到岗人数必须填写' },
            { pattern: /^[1-9]([0-9])*$/, message: '不能含有小数' }
          ],
          collegeStudentsNumber: [
            { required: true, message: '大学生到岗人数必须填写' },
            { pattern: /^[1-9]([0-9])*$/, message: '不能含有小数' }
          ],
          tripartiteAgreement: [
            { required: true, message: '三方协议签约人数必须填写' },
            { pattern: /^[1-9]([0-9])*$/, message: '不能含有小数' }
          ],
          schoolRepresentative: [
            { required: true, message: '校代表人数必须填写' },
            { pattern: /^[1-9]([0-9])*$/, message: '不能含有小数' }
          ],
        },
        fullscreen:'',
        isSave: false,//是否保存
        isShowSave:false //是否显示保存按钮
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
      this.initData()
      this.getList()
    },
    methods: {
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
        this.tableData.forEach((item, index) => {
          if (item.id) {
            this.delectIds.push(item.id);
          }
        });
        personalImportReport(formData).then(res => {
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
      cellClassName ({ row, rowIndex, column, columnIndex }) {
        if(['subtotal'].includes(column.property)){
          return 'col-grey'
        }
      },
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
        //提交和反审核之后不能修改
        if (this.isStatus == 1 || this.isStatus == 2) {
          return false
        } else {
          return true
        }
      },
      initData() {  // 初始化数据
      this.form.period = this.planYearMonth;
        if (this.orgInfo && this.orgInfo.id) { //获取默认orgId
          this.form.orgId = this.orgInfo.id
          this.searchForm.organization = this.orgInfo.name
        } else {
          this.$message.warning('请选择组织!')
        }
        // console.log(this.form.orgId,222)
      },
      // 获取数据
      getList() {
        if(!this.searchForm.organization) {
          this.$message.warning('请选择组织!')
          return false
        }
        this.form.orgId = this.orgInfo.id;
        getPersonneList(this.form)
          .then(res => {
            if (res.status === 200) {
              this.isShowSave=true
              if (res.data.length > 0) {
                 this.tableData = res.data[0].entrys;
                 this.formData = res.data[0].lord
                 this.isStatus = res.data[0].lord.status;
                 this.ifAedit = res.data[0].ifAedit;
                 console.log(this.formData)
              }else {
                this.isStatus = '';
                this.tableData = [];
                this.formData = new Object()
              }

            }
          })
          .catch(() => {

          })

      },
      //查询
      searchEvent() {
        if(!this.searchForm.organization) {
          console.log(this.searchForm.organization)
          this.$message.warning('请选择组织!')
          return false
        }
        this.form.period = moment(parseInt(new Date(this.searchForm.period).getTime())).format('YYYY-MM')
        console.log(this.form.period)
        this.tableData = []
        this.parentData = []
        this.getList()
      },
      formatDate(value, format) {
        return this.$utils.toDateString(value, format)
      },
      getSelectWeek(val) {
        if (val == 1) return '第一周'
        if (val == 2) return '第二周'
        if (val == 3) return '第三周'
        if (val == 4) return '第四周'
      },
      getSelectLabel(value, list, valueProp = 'value', labelField = 'label') {
        let item = this.$utils.find(list, item => item[valueProp] === value)
        return item ? item[labelField] : null
      },
        //反馈
    feedBack() {
      let updateRecords = this.$refs.xTable.getUpdateRecords()//子表修改
      this.formData.status = this.isStatus;
      let data = {
        entrys:updateRecords,
        lord:this.formData
      }
      feedbackPersonneList(data).then(res=> {
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
          let data = {
            lord: this.formData //insertchirld[0]
          }
          auditPersonneList(data).then(res => {
            if (res.status === 200) {
              this.$message.success('审核成功！')
              this.isStatus = 2
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
          console.log(this.ifAedit)
          if(this.ifAedit) {
            this.$XModal.message({ status: 'error', message: '该记录不可反审核' })
            return false;
          }
          unAuditPersonneList(data).then(res => {
            if (res.status === 200) {
              this.$message.success('反审核成功！')
              this.isStatus = 0
            }

          })

        }
      },
      //保存
      getUpdateEvent() {

        let insertRecords = this.$refs.xTable.getInsertRecords()//子表新增
        let removeRecords = this.$refs.xTable.getRemoveRecords()//子表删除
        let updateRecords = this.$refs.xTable.getUpdateRecords()//子表修改
        let chirdRecord = insertRecords.concat(updateRecords)
        let parenInset//新增要提交的主表数据
        let chirdnUpdate//修改要提交的子表数据对象
        let removeId = removeRecords.map(item => {
          return item.id
        })
        this.dataSubile(chirdRecord);
        this.formData.orgName =  this.searchForm.organization
        this.formData.orgId =  this.orgInfo.id
        this.formData.status = 0
        this.formData.period = this.planYearMonth;
       if (this.isStatus !== 0 && chirdRecord.length <1&&this.tableData.length<1) {
          this.$XModal.message({ status: 'error', message: '请添加子表数据' })
          return false;
        }
     /*   if(this.isStatus === 0 &&insertRecords.length==0){
          if (this.isStatus === 0 && updateRecords.length < 1) {
            this.$XModal.message({ status: 'error', message: '无法保存，没有修改子表或子表无数据' })
            return false;
          }
        }*/

        let data = [{
          delectIds: this.delectIds,
          entrys: this.tableData.concat(insertRecords),
          lord: this.formData //insertchirld[0]
        }]
        this.$refs.xTable.validate(valid => {
          if (!valid) {
            this.$XModal.message({ status: 'error', message: '校验不通过！' })
          }else {
            updatePersonneList(data).then(res => {
              this.isSave = true
              this.$message.success('保存成功！')
              this.isStatus = 0
            })
          }
        })
      },
      getPeriod(val) {
        if (val.length > 8) {
          return moment(parseInt(val)).format('YYYY-MM-DD')
        } else {
          return val
        }
      },
      //提交
      submiteEvent() {
        let insertRecords = this.$refs.xTable.getInsertRecords()//子表新增
        let removeRecords = this.$refs.xTable.getRemoveRecords()//子表删除
        let updateRecords = this.$refs.xTable.getUpdateRecords()//子表修改
        let chirdRecord = insertRecords.concat(updateRecords)
        let removeId = removeRecords.map(item => {
          return item.id
        })
        this.formData.status = 1
        this.formData.submiter = this.$store.getters.userId
        this.formData.submiterName = this.$store.getters.name
        this.formData.submitDate = moment(parseInt(new Date().getTime())).format('YYYY-MM-DD')
        this.dataSubile(chirdRecord);
        let data = [{
          delectIds: removeId,
          entrys: chirdRecord,
          lord: this.formData //insertchirld[0]
        }]
        this.$refs.xTable.validate(valid => {
          if (!valid) {
            this.$XModal.message({ status: 'error', message: '校验不通过！' })
          }else {
            updatePersonneList(data).then(res => {
              this.isSave = true
              this.$message.success('提交成功！')
              this.isStatus = 1
            })
          }
        })

      },
      insertEvent(row) {
        // if(!this.formData) {
        //   this.$XModal.message({ status: 'error', message: '请先选择主表' })
        //   return false
        // }

        let record = {
          status: 1
        };
      this.$refs.xTable.insertAt(record).then(({row})=> this.$refs.xTable.setActiveCell(row, 'whichWeek'))

     /*   let record = {}
        this.$refs.xTable.insertAt(record, row)
          .then(({
                   row
                 }) => this.getInsertEvent())*/

      },
      dataSubile(valList) {
        for(let i = 0;i<valList.length; i++) {
          const rep = Number(valList[i].reproduction),
            fattening = Number(valList[i].fattening),
            distr = Number(valList[i].districtHeadquarters),
            business = Number(valList[i].businessUnit),
            fullStaff = Number(valList[i].fullStaff),
            compiled = Number(valList[i].compiled),
            cadre = Number(valList[i].cadre),
            active = Number(valList[i].activeSeparation),
            universityStudents = Number(valList[i].universityStudents),
            vicePresident = Number(valList[i].vicePresident),
            businessDirector = Number(valList[i].businessDirector),
            businessManager = Number(valList[i].businessManager),
            areaManager = Number(valList[i].areaManager),
            areaDirector = Number(valList[i].areaDirector),
            branchManager = Number(valList[i].branchManager),
            factoryManager = Number(valList[i].factoryManager),
            serviceDirector = Number(valList[i].serviceDirector)
          let z_total = rep + fattening + distr + business;
          let fullSsunNum = (compiled / fullStaff) * 100
          let compilationRate = (compiled / cadre) * 100
          let turnoverRate = (active / z_total) * 100
          let universNum = (universityStudents / z_total) * 100
          let keyPosition = vicePresident + businessDirector + businessManager + areaManager + areaDirector + branchManager + factoryManager + serviceDirector
          valList[i].subtotal = z_total; //小计
          valList[i].fullStaffingRate = fullSsunNum.toFixed(0)  //全员满编率
          valList[i].compilationRate = compilationRate.toFixed(0) //干部满编率
          valList[i].turnoverRate = turnoverRate.toFixed(0) //人员主动离职率
          valList[i].collegeStudents = universNum.toFixed(0) //大学生占比
          valList[i].keyPosition = keyPosition //关键岗位到岗人数
        }
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
      } else {
        this.$message.warning("该组织该月已有数据，不能新增！");
      }
      },
      //删除主表数据
      delEvent() {
        let deleteId = [this.formData.id];
        deletePersonneList(deleteId).then(res => {
          if (res.status === 200) {
            this.formData = {};
            this.parentData = []
            this.tableData = []
          }
        })

      },
      getSelectLabel(value, list, valueProp = 'value', labelField = 'label') {
        let item = this.$utils.find(list, item => item[valueProp] === value)
        return item ? item[labelField] : null
      },
      exportDataEvent () {
        // this.$refs.xTable.openExport()

        let insertRecords = this.$refs.xTable.getInsertRecords()//子表新增
        let commitData = {
          url:'personneManagement\/downloadExcel',
          method:'post',
          fileName:'人事管理反馈',
          data:{
           delectIds: this.entryIds,
           lord: this.formData,
           entrys: this.tableData.concat(insertRecords)
         }
        };
        exportReport(commitData)
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
      // subtotals (row) {
      //   return this.$utils.toNumber(row.reproduction) + this.$utils.toNumber(row.fattening) + this.$utils.toNumber(row.districtHeadquarters) + this.$utils.toNumber(row.businessUnit)
      // },

    },
    watch: {
      orgInfo(newVal, oldVal) { // 动态监听切换组织
        this.form.orgId = newVal.id
        this.searchForm.organization = newVal.name
        this.getList()
      },
      planYearMonth(newVal, oldVal) {  // 动态监听计划期间
        this.form.period = newVal
        this.getList()
      }
    },
    computed: {
      ...mapGetters(['orgInfo', 'planYearMonth','token']),
      //小计
      subtotals() {
        return function(row, index) {
          let rep = Number(row.reproduction),
            fattening = Number(row.fattening),
            distr = Number(row.districtHeadquarters),
            business = Number(row.businessUnit)
          let sunNum = rep + fattening + distr + business
          return sunNum
        }
      },
      //干部满编率
      compilatRate() {
        return function(row) {
          let compiled = Number(row.compiled),
            cadre = Number(row.cadre)
          let sunNum = (compiled / cadre) * 100
          return (compiled && cadre) ? sunNum.toFixed(0) + '%' : 0
        }
      },
      //全员满编率
      fullStaffingRate() {
        return function(row) {
          let allEdited = Number(row.allEdited),
            fullStaff = Number(row.fullStaff)
          let sunNum = (allEdited / fullStaff) * 100
          return (fullStaff) ? sunNum.toFixed(0) + '%' : '-'
        }
      },
      //人员主动离职率
      turnoverRate() {
        return function(row) {
          let active = Number(row.activeSeparation),
            subtotal = Number(row.subtotal)
          const rep = Number(row.reproduction),
            fattening = Number(row.fattening),
            distr = Number(row.districtHeadquarters),
            business = Number(row.businessUnit)
          let z_total = rep + fattening + distr + business
          let sunNum = (active / z_total) * 100
          return active ? sunNum.toFixed(0) + '%' : 0
        }
      },
      //大学生占比
      collegeStudents() {
        return function(row) {
          let active = Number(row.universityStudents),
            subtotal = row.subtotal
          const rep = Number(row.reproduction),
            fattening = Number(row.fattening),
            distr = Number(row.districtHeadquarters),
            business = Number(row.businessUnit)
          let z_total = rep + fattening + distr + business
          let sunNum = (active / z_total) * 100
          return active ? sunNum.toFixed(0) + '%' : 0
        }
      },
      //社会招聘人数
      socialRecruitment() {
        return function(row) {
          let vicePresident = Number(row.vicePresident),
            businessDirector = Number(row.businessDirector),
            businessManager = Number(row.businessManager),
            areaManager = Number(row.areaManager),
            areaDirector = Number(row.areaDirector),
            branchManager = Number(row.branchManager),
            factoryManager = Number(row.factoryManager),
            serviceDirector = Number(row.serviceDirector),
            experiencedStudent = Number(row.experiencedStudent);
          let sunNum =vicePresident + businessDirector + businessManager + areaManager + areaDirector + branchManager + factoryManager + serviceDirector + experiencedStudent
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

          let sunNum = vicePresident + businessDirector + businessManager + areaManager + areaDirector + branchManager + factoryManager + serviceDirector
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
  /deep/ .col-grey {
    background-color: #F5FAFC;
    color: #333333;
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
    padding: 8px;
    border-radius: 5px;
    background-color: #fff;

    .content-head {
      padding: 5px 0 10px 0;

      .title {
        font-weight: bold;
        color: #333333;
      }

      .content-head-right {
        text-align: right;
      }
    }
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
