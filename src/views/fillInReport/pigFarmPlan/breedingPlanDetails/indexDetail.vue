<template>
  <div v-loading.lock="fullscreenLoading">

    <formTitle title="配种计划">
      <div slot="context">
        <page-form  style="margin: 0"
          v-bind="formOptions"
          :model="formData"
          :editable="false"
          ref="PageForm"
        ></page-form>
      </div>
      <div slot="title-suffix">
        <div v-if="isSave == 1">
          <el-button @click="saveEvent(0, false)" class="save-btn" size="small" v-if="statusText == 4 || statusText == 0">保存</el-button> 
          <el-button @click="saveEvent(1, false)" class="import-btn" size="small" v-if="statusText == 0">提交</el-button>
        </div>
        <el-button @click="saveEvent(2, false)" class="add-btn" size="small" v-if="statusText == 1">审核</el-button>
        <el-button @click="saveEvent(0, true)" class="del-btn" size="small" v-if="statusText == 2">反审核</el-button>
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
            <el-button @click="insertEvent" :disabled="brnStatus" v-if="statusText != 1 && statusText != 2" size="small" class="add-btn">行新增</el-button>
            <el-button @click="getSelectionEvent" v-if="statusText != 1 && statusText != 2" size="small" class="del-btn">行删除</el-button>
            <el-upload  v-if="statusText != 1 && statusText != 2"
              style="display:inline-block;margin-left:10px; margin-right: 10px"
              ref="upload"
              :limit="1"
              :show-file-list="false"
              action="leaseFarmFeedback/excelUpload"
              accept=".xls,.xlsx"
              :http-request="importDataEvent"
              :file-list="fileList">
              <el-button icon="el-icon-download" size="small" class="import-btn">导入</el-button>
            </el-upload>
            <el-button @click="exportData" size="small" class="export-btn" icon="el-icon-upload2">导出</el-button>
            <!-- <el-button @click="handleFullscreen" size="small" icon="el-icon-rank">{{fullscreen?'退出全屏':'全屏'}}</el-button> -->
        </el-col>
      </el-row>

      <vxe-table
        :height="childTableHeight"
        class="mytable-style"
        :cell-class-name="cellClassName"
        ref="xTable"
        resizable
        show-footer
        :footer-method="footerMethod"
        :edit-config="{trigger: 'click', mode: 'row',activeMethod: activeCellMethod}"
        :loading="loading"
        :span-method="rowspanMethod"
        :data="tableData"
        :edit-rules="validRules"
        :mouse-config="{selected: true}"
        highlight-current-row
        :keyboard-config="{isArrow: true, isDel: true, isTab: true, isEdit: true}"
        border
        >
        <vxe-table-column type="checkbox" width="40" fixed="left"></vxe-table-column>
        <!-- <vxe-table-column title="片区" width="200" field="pq"></vxe-table-column> -->
        <!-- <vxe-table-column title="分公司" width="200" field="fgs"></vxe-table-column> -->
        <!-- <vxe-table-column title="猪场" width="200" field="zc"></vxe-table-column> -->
        <!-- <vxe-table-column title="分场" width="200" field="fc"></vxe-table-column> -->

        <vxe-table-column title="分场" width="110" align="left" field="parvialFieldName" fixed="left"></vxe-table-column>
        <vxe-table-column title="分场规模" width="70" align="left" field="fieldScale"></vxe-table-column>
        <vxe-table-column field="breedType" title="配种类型" align="left" width="120" :edit-render="{type: 'default'}">
          <template v-slot:edit="scope">
            <el-select v-model="scope.row.breedType" @change="$refs.xTable.updateStatus(scope)">
              <el-option v-for="item in optionList" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </template>
          <template v-slot="{ row }">{{ getSelectLabel(row.breedType, optionList) }}</template>
        </vxe-table-column>

        <vxe-table-column title="当前经产存栏">
          <vxe-table-column title="小计" width="70" align="right" field="jcclTotal">
            <template v-slot="{ row }">
              <span>{{ countAmountCM(row, 1) }}</span>
            </template>
          </vxe-table-column>

          <vxe-table-column title="妊娠" width="70" align="right" field="gravidity"></vxe-table-column>
          <vxe-table-column title="哺乳" width="70" align="right" field="lactation"></vxe-table-column>
          <vxe-table-column title="其中：25日前可断奶哺乳母猪头数" align="right" width="80" field="ablactation"></vxe-table-column>
          <vxe-table-column title="空怀" width="70" align="right" field="barren"></vxe-table-column>
          <vxe-table-column field="jcdt" title="其中：经产待淘" align="right" width="80" :edit-render="{name: 'input'}">
            <template v-slot:edit="{ row }">
              <el-input
                type="number"
                v-model="row.jcdt"
                @wheel.native.prevent="stopScrollFun($event)"
                @input="inputEvent('jcdt',row)"
              ></el-input>
            </template>
          </vxe-table-column>
        </vxe-table-column>
        <vxe-table-column field="novPjcPlan" :title="month + '月配经产计划'" align="right" width="80" :edit-render="{name: 'input'}">
          <template v-slot:edit="{ row }">
            <el-input
              type="number"
              v-model="row.novPjcPlan"
              @wheel.native.prevent="stopScrollFun($event)"
              @input="inputEvent('novPjcPlan',row)"
            ></el-input>
          </template>
        </vxe-table-column>

        <vxe-table-column title="后备存栏及结构明细">
          <vxe-table-column title="小计" width="70" align="right" field="hbclTotal">
            <template v-slot="{ row }">
              <span>{{ countAmountCM(row, 2) }}</span>
            </template>
          </vxe-table-column>
          <vxe-table-column title="日龄≤100天" width="70" align="right" field="firstTimeQuantum"></vxe-table-column>
          <vxe-table-column title="100天＜日龄≤160天" width="70" align="right" field="secondTimeQuantum"></vxe-table-column>
          <vxe-table-column title="160天＜日龄≤190天" width="70" align="right" field="thirdTimeQuantum"></vxe-table-column>
          <vxe-table-column title="190天＜日龄≤220天" width="70" align="right" field="fourthTimeQuantum"></vxe-table-column>
          <vxe-table-column title="220天＜日龄≤240天" width="70" align="right" field="fifthTimeQuantum"></vxe-table-column>
          <vxe-table-column title="240天＜日龄≤280天" width="70" align="right" field="sixthTimeQuantum"></vxe-table-column>
          <vxe-table-column title="日龄＞280天" width="70" align="right" field="seventhTimeQuantum"></vxe-table-column>
        </vxe-table-column>
        <vxe-table-column field="novPhbPlan" align="right" :title="month + '月配后备计划'" width="80" :edit-render="{name: 'input'}">
          <template v-slot:edit="{ row }">
            <el-input
              type="number"
              v-model="row.novPhbPlan"
              @wheel.native.prevent="stopScrollFun($event)"
              @input="inputEvent('novPhbPlan',row)"
            ></el-input>
          </template>
        </vxe-table-column>
        
        <vxe-table-column :title="month + '月配种计划'" align="right" width="70" field="novPzPlan">
            <template v-slot="{ row }">
              <span>{{ countAmountCM(row, 3) }}</span>
            </template>
        </vxe-table-column>
        <vxe-table-column :title="month + '月配种计划分解'">
          <!-- <vxe-table-column title="1-7日" width="80" field="novFirstWeek" :edit-render="{name: 'input', props: {placeholder: '请输入值'}}"></vxe-table-column> -->
          <vxe-table-column field="novFirstWeek" align="right" title="1-7日" width="80" :edit-render="{name: 'input'}">
            <template v-slot:edit="{ row }">
              <el-input
                type="number"
                v-model="row.novFirstWeek"
                @wheel.native.prevent="stopScrollFun($event)"
                @input="inputEvent('novFirstWeek',row)"
              ></el-input>
            </template>
          </vxe-table-column>
          <!-- <vxe-table-column title="8-14日" width="80" field="novSecondWeek" :edit-render="{name: 'input', props: {placeholder: '请输入值'}}"></vxe-table-column> -->
          <vxe-table-column field="novSecondWeek" align="right" title="8-14日" width="80" :edit-render="{name: 'input'}">
            <template v-slot:edit="{ row }">
              <el-input
                type="number"
                v-model="row.novSecondWeek"
                @wheel.native.prevent="stopScrollFun($event)"
                @input="inputEvent('novSecondWeek',row)"
              ></el-input>
            </template>
          </vxe-table-column>
          <!-- <vxe-table-column title="15-21日" width="80" field="novThirdWeek" :edit-render="{name: 'input', props: {placeholder: '请输入值'}}"></vxe-table-column> -->
          <vxe-table-column field="novThirdWeek" align="right" title="15-21日" width="80" :edit-render="{name: 'input'}">
            <template v-slot:edit="{ row }">
              <el-input
                type="number"
                v-model="row.novThirdWeek"
                @wheel.native.prevent="stopScrollFun($event)"
                @input="inputEvent('novThirdWeek',row)"
              ></el-input>
            </template>
          </vxe-table-column>
          <!-- <vxe-table-column title="22-月底" width="80" field="novFourthWeek" :edit-render="{name: 'input', props: {placeholder: '请输入值'}}"></vxe-table-column> -->
          <vxe-table-column field="novFourthWeek" align="right" title="22-月底" width="80" :edit-render="{name: 'input'}">
            <template v-slot:edit="{ row }">
              <el-input
                type="number"
                v-model="row.novFourthWeek"
                @wheel.native.prevent="stopScrollFun($event)"
                @input="inputEvent('novFourthWeek',row)"
              ></el-input>
            </template>
          </vxe-table-column>
        </vxe-table-column>

        <vxe-table-column title="分场长" width="70" align="left" field="partFarmer" :edit-render="{name: 'input', props: {placeholder: '请输入值'}}"></vxe-table-column>
        
        <vxe-table-column title="场长" width="70" align="left" field="farmer" :edit-render="{name: 'input', props: {placeholder: '请输入值'}}"></vxe-table-column>
        <vxe-table-column title="异常情况备注（定额偏差超±10%）" align="left" width="80" field="exeptionRemark" :edit-render="{name: 'input', props: {placeholder: '请输入值'}}"></vxe-table-column>
        <vxe-table-column :title="((month + 1) > 12 ? ((month + 1) - 12) : (month + 1)) +'月配种计划'">
          <!-- <vxe-table-column title="配种小计" width="80" field="nextMonthPzTotal" :edit-render="{name: 'input', props: {placeholder: '请输入值'}}"></vxe-table-column> -->
          <vxe-table-column field="nextMonthPzTotal" title="配种小计" align="right" width="80" :edit-render="{name: 'input'}">
            <template v-slot:edit="{ row }">
              <el-input
                type="number"
                v-model="row.nextMonthPzTotal"
                @wheel.native.prevent="stopScrollFun($event)"
                @input="inputEvent('nextMonthPzTotal',row)"
              ></el-input>
            </template>
          </vxe-table-column>
          <!-- <vxe-table-column title="其中：配后备" width="80" field="nextMonthPhb" :edit-render="{name: 'input', props: {placeholder: '请输入值'}}"></vxe-table-column> -->
          <vxe-table-column field="nextMonthPhb" title="其中：配后备" align="right" width="80" :edit-render="{name: 'input'}">
            <template v-slot:edit="{ row }">
              <el-input
                type="number"
                v-model="row.nextMonthPhb"
                @wheel.native.prevent="stopScrollFun($event)"
                @input="inputEvent('nextMonthPhb',row)"
              ></el-input>
            </template>
          </vxe-table-column>
        </vxe-table-column>
        <vxe-table-column :title="((month + 2) > 12 ? ((month + 2) - 12) : (month + 2)) +'月配种计划'">
          <vxe-table-column field="nextTwoMonthPzTotal" title="配种小计" align="right" width="80" :edit-render="{name: 'input'}">
            <template v-slot:edit="{ row }">
              <el-input
                type="number"
                v-model="row.nextTwoMonthPzTotal"
                @wheel.native.prevent="stopScrollFun($event)"
                @input="inputEvent('nextTwoMonthPzTotal',row)"
              ></el-input>
            </template>
          </vxe-table-column>
          <vxe-table-column field="nextTwoMonthPhb" title="其中：配后备" align="right" width="80" :edit-render="{name: 'input'}">
            <template v-slot:edit="{ row }">
              <el-input
                type="number"
                v-model="row.nextTwoMonthPhb"
                @wheel.native.prevent="stopScrollFun($event)"
                @input="inputEvent('nextTwoMonthPhb',row)"
              ></el-input>
            </template>
          </vxe-table-column>
        </vxe-table-column>
      </vxe-table>

    </div>
  </div>
</template>

<script>
  import formTitle from "@/components/formTitle/formTitle";  //主表组件
  import PageForm from "@/components/form/Form";
  import { mapGetters } from 'vuex'
  import request from '@/utils/request'
  import { exportReport } from '@/utils/export'  //引入导出方法
  export default {
    name: 'breedingPlanDetailsDetails',
    components: { formTitle, PageForm},
    data() {
      return {
        month: 0,

        fullscreen: false,    //全屏状态
        childTableHeight: 300,  //子表高度
        //主表组件数据
        formOptions: {
          labelWidth: "150px",
          options: [
            {
              label: "填报日期",
              prop: "createTime",
              span: 4.8
            },
            {
              label: "提交人",
              prop: "submiterName",
              span: 4.8
            },
            {
              label: "提交日期",
              prop: "submitDate",  
              span: 4.8
            },
            {
              label: "审批人",
              prop: "approverName",
              span: 4.8
            },
            {
              label: "状态",
              prop: "statusText",
              span: 4.8,
              fontStyle: {color: '#2BB687'},
              //valueFormat: true
            }
          ]
        },
        //主表的数据
        formData: {},

        brnStatus: true,   //新增按钮
        //搜索
        search: {
          orgId: '123',   //组织
          orgName: '',
          orgLongNum: '',
          period: 1574318252000  //业务期间
        },
        //填报日期毫秒数
        createTime: '',
        //提交日期毫秒书
        submitDate: '',


        //业务期间下拉数据
        options: [
          { value: '0', label: '组织'},
          { value: '1', label: '分公司'},
          { value: '2', label: '片区'}
        ],

        tableData: [],
        optionList5: [  //父标状态
          { label: '请选择', value: null },
          { label: '保存', value: '0' },
          { label: '更新', value: '1' },
          { label: '删除', value: '2' }
        ],
        
        parentTableData: [],
        optionList: [  //配种类型下拉
          { label: '请选择', value: null },
          { label: '一元(GP)', value: 0 },
          { label: '一元(GGP)', value: 1 },
          { label: '二元(正常)', value: 2 },
          { label: '二元(回交)', value: 3 },
          { label: '三元', value: 4 },
          { label: 'PIC', value: 5 }
        ],
        page4: {   //分页
          currentPage: 1,
          pageSize: 10,
          totalResult: 300
        },
        loading: false,
        validRules: { // 校验规则
          breedType: [
            { required: true, message: '必须填写' }
          ],
          jcdt: [
            { required: true, message: '必须填写' },
            { pattern: /^[+]{0,1}(\d+)$/, message: '必须为正整数' }
          ],
          novPjcPlan: [
            { required: true, message: '必须填写' },
            { pattern: /^[+]{0,1}(\d+)$/, message: '必须为正整数' }
          ],
          novPhbPlan: [
            { required: true, message: '必须填写' },
            { pattern: /^[+]{0,1}(\d+)$/, message: '必须为正整数' }
          ],
          novFirstWeek: [
            { required: true, message: '必须填写' },
            { pattern: /^[+]{0,1}(\d+)$/, message: '必须为正整数' }
          ],
          novSecondWeek: [
            { required: true, message: '必须填写' },
            { pattern: /^[+]{0,1}(\d+)$/, message: '必须为正整数' }
          ],
          novThirdWeek: [
            { required: true, message: '必须填写' },
            { pattern: /^[+]{0,1}(\d+)$/, message: '必须为正整数' }
          ],
          novFourthWeek: [
            { required: true, message: '必须填写' },
            { pattern: /^[+]{0,1}(\d+)$/, message: '必须为正整数' }
          ],
          partFarmer: [
            { required: true, message: '必须填写' }
          ],
          farmer: [
            { required: true, message: '必须填写' }
          ],
          // exeptionRemark: [
          //   { required: true, message: '必须填写' }
          // ],
          nextMonthPzTotal: [
            { required: true, message: '必须填写' },
            { pattern: /^[+]{0,1}(\d+)$/, message: '必须为正整数' }
          ],
          nextMonthPhb: [
            { required: true, message: '必须填写' },
            { pattern: /^[+]{0,1}(\d+)$/, message: '必须为正整数' }
          ],
          nextTwoMonthPzTotal: [
            { required: true, message: '必须填写' },
            { pattern: /^[+]{0,1}(\d+)$/, message: '必须为正整数' }
          ],
          nextTwoMonthPhb: [
            { required: true, message: '必须填写' },
            { pattern: /^[+]{0,1}(\d+)$/, message: '必须为正整数' }
          ],
        },

        parentId: '',     //主标传过来的id
        delPBTable: 0,   //删除主表的数据标识
        delZBRable: [],  //删除子表数据
        insertZB: [{}],  //子表插入数据

        PBinsert: {},
        statusText: 4,  //按钮状态
        novPzPlanStatus: '',   //11月配种计划校验状态

        isSave: 1,    //获取罗马是否可保存状态

        //导入相关
        fullscreenLoading: false,  //导入加载中状态
        fileList: [],  //导入文件
        isImport: false,  //是否导入状态
        recordData: []  //记录导入之前的数据
      }
    },
    watch: {
      orgInfo(newVal, oldVal) { // 动态监听切换组织
        this.search.orgId = newVal.id
        this.search.orgName = newVal.name
        this.search.orgLongNum = newVal.longNumber
        this.formData = { orgId: this.search.orgId, orgName: this.search.orgName, orgLongNumber: this.search.orgLongNum, period: this.formatDate1(this.search.period) }
        
        this.brnStatus = true
        this.tableData = []

        this.findZBList()
        //this.parentTableData = []  //切换组织主表数据清空
        this.statusText = 4   //按钮状态置回

        this.brnStatus = true
        this.getLM()
      },
      planYearMonth(newVal, oldVal){
        const _this = this
        //console.log(newVal)
        //console.log(this.formatDate(newVal))
        this.search.period = (new Date(newVal)).getTime()
        this.findZBList()
        this.getLM()
        this.formatDate.createTime = newVal
        let month1 = Number(newVal.split('-')[1])
        this.month = month1
      }
    },
    created(){
        const _this = this
        let nowData = Date.now()
        this.search.period = nowData
        this.initData()  //初始化数据

        this.formData = { orgId: this.search.orgId, orgName: this.search.orgName, orgLongNumber: this.search.orgLongNum, period: this.formatDate1(this.search.period) }
        this.getLM()
        //setTimeout(function(){
          _this.findZBList()
        //}, 200)
    },
    mounted() {
      window.onresize = () => {  // 动态监听窗口大小
        return (() => {
          this.computedDOMHeight()
        })()
      },
      this.$nextTick(() => {  // 根据当前屏幕高度计算子表内容区高度
        this.computedDOMHeight()
        this._onFullscreenchange()
      })
    },
    destroyed() {
        window.onresize = null
    },
    computed: { 
      ...mapGetters(['orgInfo', 'planYearMonth']), 
    },
   
    methods: {
      //修改小计底色
      cellClassName ({ row, rowIndex, column, columnIndex }) {
        if(['jcclTotal', 'hbclTotal', 'nextMonthPzTotal', 'nextTwoMonthPzTotal'].includes(column.property)){
          return 'col-grey'
        }
      },
      //全屏
      handleFullscreen() {
        this._toggleFullscreen(this.fullscreen, this.$refs.pageContent)
      },
      _onFullscreenchange () {
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

      _isFullscreenEnable() {
        return document.fullscreen || document.isFullScreen || document.mozIsFullScreen || document.webkitIsFullScreen
      },
      _toggleFullscreen(isFullscreen, fullarea) {
        if (isFullscreen) { // 退出全屏
          if (document.exitFullscreen) {
            document.exitFullscreen()
          } else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen()
          } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen()
          } else if (document.msExitFullscreen) {
            document.msExitFullscreen()
          }
        } else {  // 进入全屏
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
      },

      //自适应页面高度
      computedDOMHeight() {
          let curClientHeight = document.body.clientHeight  // 当前屏幕高度
          let pageContentHeight = curClientHeight - this.$refs.pageContent.getBoundingClientRect().top
          this.$refs.pageContent.style.height = (pageContentHeight - 10) + 'px'

          let contentHeadHeight = document.querySelectorAll('.content-head')[0].offsetHeight

          this.childTableHeight = pageContentHeight - contentHeadHeight - 50
      },

      //整整数校验
      stopScrollFun(evt) {
        evt = evt || window.event;
        if(evt.preventDefault) {
          // Firefox
          evt.preventDefault();
          evt.stopPropagation();
        } else {
          // IE
          evt.cancelBubble=true;
          evt.returnValue = false;
        }
        return false;
      },
      inputEvent(key, row) {
        let reg = /^[0-9]*$/;
        if (!reg.test(row[key])) {
          // this.$message.warning("请输入正确的数！");
          row[key] = "";
          return;
        }
        if (row.fourStructure) {
          row.balance =
            parseInt(row.fourStructure) -
            parseInt(row.planRemain ? row.planRemain : 0) -
            this.introduction;
        }
      },

      //数据导出
      exportData() {  // 导出
        let data = this.$refs.xTable.getTableData()
        let tableData = this.exportCount(data.tableData)
        console.log(tableData)
        if(tableData.length == 0){
            this.$message.warning('无导出数据!')
            return
        }
        exportReport({
          url: 'breedPlanEntry/exportBreedPlanEntryPageInfo',
          method: 'post',
          data: tableData,
          fileName: '配种计划填报表'
        });
      },
      //导出计算小计
      exportCount(data){
          let dataNew = data
          for(let i=0; i<dataNew.length; i++){  
              //当前经产存栏合计
              dataNew[i].jcclTotal = Number(dataNew[i].gravidity) + Number(dataNew[i].lactation) + Number(dataNew[i].barren)
              dataNew[i].hbclTotal = Number(dataNew[i].firstTimeQuantum) + Number(dataNew[i].secondTimeQuantum) + Number(dataNew[i].thirdTimeQuantum) + Number(dataNew[i].fourthTimeQuantum) 
              + Number(dataNew[i].fifthTimeQuantum) + Number(dataNew[i].sixthTimeQuantum) + Number(dataNew[i].seventhTimeQuantum)
              dataNew[i].novPzPlan = Number(dataNew[i].novFirstWeek) + Number(dataNew[i].novSecondWeek) + Number(dataNew[i].novThirdWeek) + Number(dataNew[i].novFourthWeek)
          }
          return dataNew
      },

      //导入方法
      importDataEvent(params) {  
        let data = this.$refs.xTable.getTableData().tableData
        this.recordData = [...data, ...this.recordData]  //记录导入之前的数据

        this.fullscreenLoading = true   //加载层的状态
        const _file = params.file;
        const isLt20M = _file.size / 1024 / 1024 < 20;
        let formData = new FormData();
        formData.append("file", _file);
        formData.append('period', this.formatDate1(this.search.period))
        if (!isLt20M) {
          this.$refs.upload.clearFiles();
          this.$message.error("请上传20M以下的文件");
          return false;
        }
        request({
          url: `/BUSINESSREPORT/breedPlanEntry/importBreedPlanEntry`,
          method: 'post',
          data: formData,
        }).then(res => {
          this.$refs.upload.clearFiles();
          this.fullscreenLoading = false
          if (res.status === 200) {
              if(res.data.code == 0){
                  this.tableData = res.data.data;
                  this.isImport = true
                  this.$message.success('导入成功');
              }else {
                  let msg = '';
                  for(let i=0; i<res.data.message.length; i++){
                      msg += `${i+1}、${res.data.message[i]};`
                  }
                  //导入错误信息提示
                  this.$alert(msg, {
                    confirmButtonText: '确定'
                  });
              }
          } else {
            this.$message.error('导入失败');
          }
        }).catch(err => {
          this.$refs.upload.clearFiles();
          this.$message.error(`${error}`);
        });
      },

      //禁用行
      activeCellMethod ({ column, columnIndex }) {
        if (this.statusText == 1 || this.statusText == 2) {
          return false
        }else {
          return true
        }
      },
      initData() {  // 初始化数据
        //this.form.orgId = this.searchForm.orgId;
        //this.form.period = moment(parseInt(this.searchForm.period)).format('YYYY-MM')//设置默月的日期

       
        if (this.orgInfo && this.orgInfo.id) { //获取默认orgId
          this.search.orgId = this.orgInfo.id
          this.search.orgName = this.orgInfo.name
          this.search.orgLongNum = this.orgInfo.longNumber
        } else {
          this.$message.warning('请选择组织!')
        }

        //初始化vuex业务日期
        if(this.planYearMonth){
            this.search.period = new Date(this.planYearMonth).getTime()
            //console.log(this.search.period)
        }

        let month1 = Number(this.planYearMonth.split('-')[1])
        this.month = month1

        let query = this.$route.query
        if(query.orgId){
            this.search.orgId = query.orgId
            let secondsTime = new Date(query.yearMonth).getTime()
            this.search.period = secondsTime
        }

      },
      countAllAmountCM (data, type) {
        let count = 0
        data.forEach(row => {
          //console.log(row.jcclTotal)
          count += this.countAmount(row, type)
          //console.log(row)
        })
        return count
      },
      //合计
      footerMethod ({ columns, data }) {
        return [
          columns.map((column, columnIndex) => {
            if (columnIndex === 1) {
              return '合计'
            }else if(columnIndex === 2){
              return '-'
            }else if(columnIndex === 3){
              return '-'
            }
            if (columnIndex === 4) {
              return `${this.countAllAmountCM(data, 1)}`
            } else if (columnIndex === 5) {
              return `${this.countAllAmountCM(data, 2)}`
            } else if (columnIndex === 6) {
              return `${this.countAllAmountCM(data, 3)}`
            } else if (columnIndex === 7) {
              return `${this.countAllAmountCM(data, 4)}`
            } else if (columnIndex === 8) {
              return `${this.countAllAmountCM(data, 5)}`
            } else if (columnIndex === 9) {
              return `${this.countAllAmountCM(data, 6)}`
            } else if (columnIndex === 10) {
              return `${this.countAllAmountCM(data, 7)}`
            } else if (columnIndex === 11) {
              return `${this.countAllAmountCM(data, 8)}`
            } else if (columnIndex === 12) {
              return `${this.countAllAmountCM(data, 9)}`
            } else if (columnIndex === 13) {
              return `${this.countAllAmountCM(data, 10)}`
            } else if (columnIndex === 14) {
              return `${this.countAllAmountCM(data, 11)}`
            } else if (columnIndex === 15) {
              return `${this.countAllAmountCM(data, 12)}`
            } else if (columnIndex === 16) {
              return `${this.countAllAmountCM(data, 13)}`
            } else if (columnIndex === 17) {
              return `${this.countAllAmountCM(data, 14)}`
            } else if (columnIndex === 18) {
              return `${this.countAllAmountCM(data, 15)}`
            } else if (columnIndex === 19) {
              return `${this.countAllAmountCM(data, 16)}`
            } else if (columnIndex === 20) {
              return `${this.countAllAmountCM(data, 17)}`
            } else if (columnIndex === 21) {
              return `${this.countAllAmountCM(data, 18)}`
            } else if (columnIndex === 22) {
              return `${this.countAllAmountCM(data, 19)}`
            } else if (columnIndex === 23) {
              return `${this.countAllAmountCM(data, 20)}`
            } else if (columnIndex === 24) {
              return `${this.countAllAmountCM(data, 21)}`
            } else if (columnIndex === 25) {
              return `-`
            } else if (columnIndex === 26) {
              return `-`
            } else if (columnIndex === 27) {
              return `-`
            } else if (columnIndex === 28) {
              return `${this.countAllAmountCM(data, 23)}`
            } else if (columnIndex === 29) {
              return `${this.countAllAmountCM(data, 24)}`
            } else if (columnIndex === 30) {
              return `${this.countAllAmountCM(data, 25)}`
            } else if (columnIndex === 31) {
              return `${this.countAllAmountCM(data, 26)}`
            }

          })
        ]
      },
      countAmount(row, type){
          if(type == 1){
              //console.log(row.jcclTotal)
              return Number(row.jcclTotal)
          }else if(type == 2){  //妊辰
              return Number(row.gravidity)
          }else if(type == 3){
              return Number(row.lactation)
          }else if(type == 4){
              return Number(row.ablactation)   //25日前可断奶哺乳母猪头数
          }else if(type == 5){
              return Number(row.barren)   //空怀
          }else if(type == 6){
              return Number(row.jcdt)   //经产待淘
          }else if(type == 7){  //11月配经产计划
              return Number(row.novPjcPlan)
          }else if(type == 8){
              return Number(row.hbclTotal)
          }else if(type == 9){  //日龄≤100天
              return Number(row.firstTimeQuantum)
          }else if(type == 10){
              return Number(row.secondTimeQuantum)
          }else if(type == 11){
              return Number(row.thirdTimeQuantum)
          }else if(type == 12){   //190天＜日龄≤220天
              return Number(row.fourthTimeQuantum)
          }else if(type == 13){   //220天＜日龄≤240天
              return Number(row.fifthTimeQuantum)
          }else if(type == 14){   //240天＜日龄≤280天
              return Number(row.sixthTimeQuantum)
          }else if(type == 15){   //>280天
              return Number(row.seventhTimeQuantum)
          }else if(type == 16){   //11月配后备计划
              return Number(row.novPhbPlan)
          }else if(type == 17){   //11月配种计划
              return Number(row.novPzPlan)
          }else if(type == 18){   //11月配种计划分解1-7日
              return Number(row.novFirstWeek)
          }else if(type == 19){   //11月配种计划分解8-14日
              return Number(row.novSecondWeek)
          }else if(type == 20){   //11月配种计划分解15-21日
              return Number(row.novThirdWeek)
          }else if(type == 21){   //11月配种计划分解22-月底日
              return Number(row.novFourthWeek)
          }else if(type == 22){   //11月配种计划分解22-月底日
              return Number(row.novFourthWeek)
          }else if(type == 23){   //下一月配种计划小计
              return Number(row.nextMonthPzTotal)
          }else if(type == 24){   //下一月配后备
              return Number(row.nextMonthPhb)
          }else if(type == 25){   //下二月配种计划小计
              return Number(row.nextTwoMonthPzTotal)
          }else if(type == 26){   //下二月配后备
              return Number(row.nextTwoMonthPhb)
          }

      },

      /************************子表合计***************************** */
      changeTotal(type, total, num){
          let body = this.$refs.xTable.getRecordset()
          let { insertRecords, removeRecords, updateRecords } = body   //子表数据
          for(let i=0; i<removeRecords.length; i++){
            removeRecords[i].isDelete = 1
          }
          let updateData = [...insertRecords, ...updateRecords, ...this.tableData]
          for(let i=0; i<updateData.length; i++){
              //console.log(type)
              //console.log(updateData[i].fieldScale)
              if(Number(updateData[i].fieldScale) == type){
                  if(num == 1){
                      updateData[i].jcclTotal = total
                  }else if(num == 2){
                      updateData[i].hbclTotal = total
                  }else if(num == 3){
                      updateData[i].novPzPlan = total
                  }
              }else{
                //console.log('@@@@@@@@')
              }
          }
      },
      //c出苗小计
      countAmountCM (row, type) {
        if(type == 1){   //当前经产小计
            // console.log('111', row.gravidity)
            // console.log('222', row.lactation)
            // console.log('333', row.ablactation)
            // console.log('444', row.barren)
            // console.log('555', row.jcdt)   + this.$utils.toNumber(row.ablactation) 25日前可断奶   + this.$utils.toNumber(row.jcdt)  经产待淘
            let total =  this.$utils.toNumber(row.gravidity) + this.$utils.toNumber(row.lactation) + this.$utils.toNumber(row.barren)  //jcdt
            //this.changeTotal(this.$utils.toNumber(row.fieldScale), total, 1)
            return total
        }else if(type == 2){  //后备存栏小计
            let total =  this.$utils.toNumber(row.firstTimeQuantum) + this.$utils.toNumber(row.secondTimeQuantum) + this.$utils.toNumber(row.thirdTimeQuantum) + this.$utils.toNumber(row.fourthTimeQuantum) + this.$utils.toNumber(row.fifthTimeQuantum) + this.$utils.toNumber(row.sixthTimeQuantum) + this.$utils.toNumber(row.seventhTimeQuantum)
            //this.changeTotal(this.$utils.toNumber(row.fieldScale), total, 2)
            return total
        }else if(type == 3){  //11月配种计划
            let total =  this.$utils.toNumber(row.novFirstWeek) + this.$utils.toNumber(row.novSecondWeek) + this.$utils.toNumber(row.novThirdWeek) + this.$utils.toNumber(row.novFourthWeek)
            let totalA = this.$utils.toNumber(row.novPjcPlan) + this.$utils.toNumber(row.novPhbPlan)
            //this.changeTotal(this.$utils.toNumber(row.fieldScale), total, 3)
            if(total == totalA){
                this.novPzPlanStatus = true
            }else{
                this.novPzPlanStatus = false
            }
            return total
        }

      },

      //获取罗马数据
      getLM(){
          request({
              url: `/BUSINESSREPORT/breedPlanEntry/getPZJH`,
              method: 'get',
              params: {
                forgid: this.search.orgId,   //组织id
                period: this.formatDate1(this.search.period)  //业务期间
              }
          })
          .then(e => {
              if(e.status == 200){
                  //console.log(e.data.data)
                  //控制保存，提交按钮状态
                  if(e.data.isSave){
                      this.isSave = e.data.isSave
                  }
                  let getArr = e.data.data
                  if(getArr.length){
                      
                      let insertArr = []
                      for(let i=0; i<getArr.length; i++){
                          let obj = {}
                          obj.parvialFieldName = getArr[i].FCNAME   //分厂名称
                          obj.parvialFieldId = getArr[i].FCID    //分厂ID
                          obj.fieldScale = getArr[i].分场规模    //分场规模
                          obj.gravidity = getArr[i].妊娠    //妊娠
                          obj.lactation = getArr[i].哺乳
                          obj.ablactation = getArr[i].可断奶哺乳母猪头数
                          obj.barren = getArr[i].空怀
                          obj.jcdt = getArr[i].经产待淘
                          obj.firstTimeQuantum = getArr[i].小于100日龄
                          obj.secondTimeQuantum = getArr[i].大于100小于160日龄
                          obj.thirdTimeQuantum = getArr[i].大于160小于190日龄
                          obj.fourthTimeQuantum = getArr[i].大于190小于220日龄
                          obj.fifthTimeQuantum = getArr[i].大于220小于240日龄
                          obj.sixthTimeQuantum = getArr[i].大于240小于280日龄
                          obj.seventhTimeQuantum = getArr[i].大于280日龄
                          obj.partFarmer = getArr[i].FCPNAME    //分厂长
                          obj.farmer = getArr[i].ZCPNAME    //厂长

                          obj.pigId = this.search.orgId
                          obj.pigName = this.search.orgName
                          
                          insertArr.push(obj)
                      }
                      this.insertZB = insertArr
                  }
                  
                  this.brnStatus = false
              }else{
                  this.$XModal.message({ message: '获取失败', status: 'error' })
              }

          })
      },
      searchZB(){  //搜索
          this.tableData = []
          this.findZBList()
      },

      //主表插入行
      insertEventP () {
        let Pbody = this.$refs.PxTable.getRecordset()  //主表新增，更新，删除数据
        let { insertRecords, removeRecords, updateRecords } = Pbody

        if(this.parentTableData.length == 0 && insertRecords.length == 0){  //主表没有数据
            let record = this.PBinsert
            this.$refs.PxTable.insert(record)
            .then(({ row }) => this.$refs.PxTable.setActiveCell(row, 'key'))
        }else{
            this.$XModal.message({ message: '主表已有信息，请先删除', status: 'error' })
        }
      },

      //获取主表列表
      findZBList(){
          request({
              url: `/BUSINESSREPORT/breedPlan/queryPageInfo/1/100`,
              method: 'get',
              params: {
                orgId: this.search.orgId,   //组织
                period: this.formatDate(this.search.period, 'yyyy-MM')  //业务期间
              }
          })
          .then(e => {
              if(e.status == 200){
                  let data = e.data.list
                  this.parentTableData = data
                  
                  if(data[0]){

                    this.createTime = data[0].createTime
                    this.submitDate = data[0].submitDate

                    data[0].createTime = this.formatDate1(Number(data[0].createTime))
                    data[0].submitDate = data[0].submitDate ? this.formatDate1(Number(data[0].submitDate)) : ''
                    this.formData = data[0]
                    //console.log(data[0])

                    this.parentId = data[0].id
                    this.statusText = data[0].status
                    this.findList(1, 100)
                  }else{
                    this.tableData = []
                    this.formData = {}
                    this.statusText = 4
                  }

              }else{
                  this.$XModal.message({ message: '保存失败！', status: 'error' })
              }

          })
      },
      //获取子表列表
      findList (pageNum, pageSize) {
          const _this = this
          this.loading = true
          request({
              url: `/BUSINESSREPORT/breedPlanEntry/queryPageInfo/${pageNum}/${pageSize}`,
              method: 'get',
              params: { parentId: _this.parentId }
          })
          .then(e => {
              if(e.status == 200){
                  let data = e.data.list
                  this.tableData = data
                  //this.page4.totalResult = e.data.total
                  this.loading = false
              }else{
                  this.$XModal.message({ message: '保存失败！', status: 'error' })
              }

          })
      },

      /*************************保存提交******************************** */
      //保存
      saveEvent (status1, flag) {
        //console.log(this.novPzPlanStatus)
        //判断是否有反审核权限
        if(flag){
            request({
                url: `/BUSINESSREPORT/orgSpRecord/checkReportIsSp`,
                method: 'get',
                params: { orgId: this.search.orgId, dateMonth: this.formatDate1(this.search.period) }
            })
            .then(e => {
                if(e.status == 200){
                    //this.$XModal.message({ message: '成功', status: 'success' })
                }else{
                    this.$XModal.message({ message: '无反审核权限', status: 'error' })
                    return;
                }
            })
        }

        let body = this.$refs.xTable.getRecordset()
        let { insertRecords, removeRecords, updateRecords } = body   //子表
        //判断子表无数据无法提交
        if(this.tableData == 0){
            if(insertRecords.length == 0){
                this.$XModal.message({ message: `子表无数据`, status: 'error' })
                return;
            }
        }else{
            if((this.tableData.length <= removeRecords.length)){
                if(insertRecords.length == 0){
                    this.$XModal.message({ message: `子表无数据`, status: 'error' })
                    return;
                }
            }
        }
        //改变删除列表isDetele状态
        for(let i=0; i<removeRecords.length; i++){
          removeRecords[i].isDelete = 1
        }

        let check = []
        let checkC = JSON.parse(JSON.stringify(this.formData))  //深拷贝
        checkC.orgName = this.search.orgName
        checkC.orgId = this.search.orgId
        checkC.period = this.search.period
        checkC.createTime = this.createTime
        checkC.submitDate = this.submitDate
        check.push(checkC)

        //判断是否导入
        if(this.isImport){
            let importData = this.$refs.xTable.getTableData().tableData
            //console.log(this.recordData)
            //console.log(importData)
            if(importData.length == 0){
                this.isImport = false
                this.$XModal.message({ message: `子表无数据`, status: 'error' })
                return
            }else{
                for(let i=0; i<this.recordData.length; i++){
                    this.recordData[i].isDelete = 1
                }
                //去除isDelete为1，并没有ID的数据
                let sendRecordData = []
                for(let i=0; i<this.recordData.length; i++){
                    if(this.recordData[i].id != null){
                        sendRecordData.push(this.recordData[i])
                    }
                }
                check[0].breedPlanEntryList = [...sendRecordData, ...importData, ...this.delZBRable]
            }
        }else{
            if (insertRecords.length || removeRecords.length || updateRecords.length) {
                check[0].breedPlanEntryList = [...insertRecords, ...updateRecords, ...this.delZBRable]  //子表的数据
            } else {
                check[0].breedPlanEntryList = []
                if(!this.parentTableData.length){
                    this.$XModal.message({ message: `子表无数据`, status: 'error' })
                    return;
                }
            }
        }
       
        //console.log(check)
        for(let i=0; i<check.length; i++){
            check[i].period = this.formatDate1(check[i].period)
            //console.log(check[i].period)
        }

        this.$refs.xTable.validate(valid => {
            check[0].status = status1

            let data = this.count(check)
            // if(data == undefined){
            //     this.$XModal.message({ message: `第${i+1}行本月配经产母猪数+配后备母猪数=本月配种计划数，请检查数据逻辑。`, status: 'error' })
            //     return;
            // }
            
            if (valid) {
              request({
                  url: '/BUSINESSREPORT/breedPlan/save',
                  method: 'post',
                  data
              })
              .then(e => {
                  if(e.status == 200){
                      if(status1 == 0 && flag == false){
                          this.$XModal.message({ message: '保存成功！', status: 'success' })
                      }else if(status1 == 1){
                          this.$XModal.message({ message: '提交成功！', status: 'success' })
                      }else if(status1 == 2){
                          this.$XModal.message({ message: '审核成功！', status: 'success' })
                      }else if(status1 == 0 && flag == true){
                          this.$XModal.message({ message: '反审核成功！', status: 'success' })
                      }
                      this.delZBRable = []   //删除记录置空
                      this.recordData = []   //清空导入之前记录的数据
                      this.findZBList()
                  }else{
                      this.$XModal.message({ message: '保存失败！', status: 'error' })
                  }
              })
            }else{
                this.$XModal.message({ message: '必填字段必须填写', status: 'error' })
            }
        })

      },
      //保存计算
      count(data){
          let dataNew = data[0].breedPlanEntryList
          for(let i=0; i<dataNew.length; i++){  
              //当前经产存栏合计
              dataNew[i].jcclTotal = Number(dataNew[i].gravidity) + Number(dataNew[i].lactation) + Number(dataNew[i].barren)
              
              dataNew[i].hbclTotal = Number(dataNew[i].firstTimeQuantum) + Number(dataNew[i].secondTimeQuantum) + Number(dataNew[i].thirdTimeQuantum) + Number(dataNew[i].fourthTimeQuantum) 
              + Number(dataNew[i].fifthTimeQuantum) + Number(dataNew[i].sixthTimeQuantum) + Number(dataNew[i].seventhTimeQuantum)
              
              dataNew[i].novPzPlan = Number(dataNew[i].novFirstWeek) + Number(dataNew[i].novSecondWeek) + Number(dataNew[i].novThirdWeek) + Number(dataNew[i].novFourthWeek)
              //console.log(dataNew[i].novPzPlan)

              let sum = Number(dataNew[i].novPhbPlan) + Number(dataNew[i].novPjcPlan)
              
              if(sum != dataNew[i].novPzPlan ){
                  this.$XModal.message({ message: `第${i+1}行本月配经产母猪数+配后备母猪数=本月配种计划数，请检查数据逻辑`, status: 'error' })
                  return;
              }

              //判断下一月，下二月合计，数量
              //console.log('合计', dataNew[i].nextMonthPzTotal)
              //console.log('数量', dataNew[i].nextMonthPhb)
              if(dataNew[i].nextMonthPzTotal < dataNew[i].nextMonthPhb){   //nextMonthPzTotal  nextMonthPhb
                  this.$XModal.message({ message: `第${i+1}行${((this.month + 1) > 12 ? ((this.month + 1) - 12) : (this.month + 1)) }月配种计划小计>${((this.month + 1) > 12 ? ((this.month + 1) - 12) : (this.month + 1)) }月配种计划其中配后备数。`, status: 'error' })
                  return
              }
              if(dataNew[i].nextTwoMonthPzTotal < dataNew[i].nextTwoMonthPhb){
                  this.$XModal.message({ message: `第${i+1}行${((this.month + 2) > 12 ? ((this.month + 2) - 12) : (this.month + 2)) }月配种计划小计>${((this.month + 2) > 12 ? ((this.month + 2) - 12) : (this.month + 2)) }月配种计划其中配后备数。`, status: 'error' })
                  return
              }
          }
          return data
      },
      //提交时间格式化
      formatDate1(date) { 
          var date = new Date(date)
          var year = date.getFullYear(); 
          var month = date.getMonth() + 1;
          month = month <10 ? '0' + month : month
          return year + "-" + month; 
       },
      /***************************主表删除********************************* */
      //选中主表删除
      getSelectionEventP () {
          let removeRecords = this.$refs.PxTable.getSelectRecords()
          let a = this.$XModal.confirm('您确定要删除吗？')
          a.then(e => {
              //console.log(e)
              if(e == 'confirm'){
                  //console.log(removeRecords)
                  let data =  []
                  for(let i=0; i<removeRecords.length; i++){
                      data.push(removeRecords[i].id)
                  }
                  //console.log(data)
                  this.PBdel(data)
              }
          })
      },
      //删除主表数据
      PBdel(data){
          request({
              url: '/BUSINESSREPORT/breedPlan/delete',
              method: 'post',
              data
          })
          .then(e => {
              if(e.status == 200){
                  this.$XModal.message({ message: '删除成功！', status: 'success' })
                  this.$refs.PxTable.removeSelecteds()
                  this.delPBTable = 1   //主表删除状态
                  this.parentTableData = []  //父表删除清空父表
                  this.tableData = []  //父表删除清空子表
                  this.statusText = 4  //改变按钮状态
              }else{
                  this.$XModal.message({ message: '删除失败！', status: 'error' })
              }
          })
      },

      //选中子表删除
      getSelectionEvent () {
          let removeRecords = this.$refs.xTable.getSelectRecords()
          if(removeRecords.length == 0){
              this.$XModal.message({ message: '请先选择要删除的行！', status: 'warning' })
              return
          }
          let a = this.$XModal.confirm('您确定要删除吗？')
          let delDataArr = [];
          a.then(e => {
              //console.log(e)
              if(e == 'confirm'){
                  for(let i=0; i<removeRecords.length; i++){
                    removeRecords[i].isDelete = 1
                    if(removeRecords[i].id){
                        delDataArr.push(removeRecords[i])
                    }
                    
                  }
                  this.delZBRable = [...delDataArr, ...this.delZBRable]
                  this.$refs.xTable.removeSelecteds()
              }
          })

      },

      //子表插入
      insertEvent() {
        const record = this.insertZB
        this.$refs.xTable.insert(record)
          .then(({ row }) => this.$refs.xTable.setActiveCell(row, 'type'))
      },

      getSelectLabel (value, list, valueProp = 'value', labelField = 'label') {
        let item = this.$utils.find(list, item => item[valueProp] === value)
        return item ? item[labelField] : null
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
      //格式华时间
      formatDate (value, format) {
        return this.$utils.toDateString(value, format)
      },
      
    },
  }
</script>

<style scoped lang="scss">
  
  /deep/ .col-grey {
    background-color: #F5FAFC;
  }


  .page-content {
    box-sizing: border-box;
    margin: 10px 10px;
    padding: 16px 20px 20px 20px;
    border-radius: 5px;
    background-color: #fff;

    .content-head {
      padding: 0px 0 16px 0px;

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
  .vxe-button+.vxe-button{
    margin-left: 10px;
  }

  .el-date-editor.el-input, .el-date-editor.el-input__inner {
    width: 180px;
  }

  /deep/ .el-input.is-disabled .el-input__inner {
    border: 1px solid #E4E7ED !important;
  }


  .sub-btn {
      background-color: rgba(25,137,250,1);
      color: #ffffff
  }

  .add-btn {
    border: 1px solid rgba(25,137,250,1);
    color:rgba(25,137,250,1);
  }
  .del-btn {
    border:1px solid rgba(245,108,108,1);
    color:rgba(245,108,108,1);
  }
  .import-btn {
    background:rgba(25,137,250,1);
    color:rgba(255,255,255,1);
  }
  .export-btn {
    border:1px solid rgba(25,137,250,1);
    color:rgba(0,136,255,1);
  }
</style>
