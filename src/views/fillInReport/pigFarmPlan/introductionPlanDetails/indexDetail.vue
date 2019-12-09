<template>
    <div v-loading.lock="fullscreenLoading">
      <formTitle title="引种计划">
        <div slot="context">
          <page-form style="margin: 0;"
            v-bind="formOptions"
            :model="formData"
            :editable="false"
            ref="PageForm"
          ></page-form>
        </div>
        <div slot="title-suffix" v-if="isLastPage">
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
              <el-button @click="insertEvent" :disabled="brnStatus" v-if="statusText != 1 && statusText != 2 && isLastPage" size="small" class="add-btn">行新增</el-button>
              <el-button @click="getSelectionEvent" v-if="statusText != 1 && statusText != 2  && isLastPage" size="small" class="del-btn">行删除</el-button>
              <el-upload  v-if="statusText != 1 && statusText != 2  && isLastPage"
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
          border
          :height="childTableHeight"
          ref="xTable"
          highlight-current-row
          :loading="loading"
          :edit-rules="validRules"
          :data="tableData"
          :edit-config="{trigger: 'click', mode: 'row', activeMethod: activeCellMethod}">
          <vxe-table-column type="checkbox" width="40" fixed="left" align="left"></vxe-table-column>
          <!-- <vxe-table-column field="areaName" title="片区" width="120"></vxe-table-column> -->
          <vxe-table-column field="branchName" title="分公司" width="100" fixed="left" align="left"></vxe-table-column>
          <vxe-table-column field="pigName" title="猪场名称(代养场)" width="100" fixed="left" align="left"></vxe-table-column>
          <vxe-table-column field="loadScale" title="母猪规模" width="80" align="right" :edit-render="{name: 'input', props: {placeholder: '请输入'}}"></vxe-table-column>
          <vxe-table-column field="breedingStock" title="经产母猪存栏" align="right" width="80"></vxe-table-column>
          <vxe-table-column field="reserveStock" title="后备母猪存栏" align="right" width="80"></vxe-table-column>

          <vxe-table-column field="importedMonth" title="引种月份" width="140" align="left" :edit-render="{type: 'default'}">
            <template v-slot:edit="{ row }">
              <el-date-picker v-model="row.importedMonth" type="month" format="yyyy-MM" style="width: 110px" size="small"></el-date-picker>
            </template>
            <template v-slot="{ row }">{{ formatDate1(row.importedMonth, 'yyyy-MM') }}</template>
          </vxe-table-column>
          <vxe-table-column field="importedDate" title="引种日期" align="left" sortable width="120" :edit-render="{type: 'default'}">
            <template v-slot:edit="scope">
              <el-select v-model="scope.row.importedDate" @change="$refs.xTable.updateStatus(scope)">
                <el-option v-for="item in optionList" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </template>
            <template v-slot="{ row }">{{ getSelectLabel(row.importedDate, optionList) }}</template>
          </vxe-table-column>
          <vxe-table-column field="importedNum" title="引种数量" width="80" align="right" :edit-render="{name: 'input'}">
            <template v-slot:edit="{ row }">
              <el-input
                type="number"
                v-model="row.importedNum"
                @wheel.native.prevent="stopScrollFun($event)"
                @input="inputEvent('importedNum',row)"
              ></el-input>
            </template>
          </vxe-table-column>
          <vxe-table-column field="importedDayAge" title="引种日龄" align="right" width="80" :edit-render="{name: 'input'}">
            <template v-slot:edit="{ row }">
              <el-input
                type="number"
                v-model="row.importedDayAge"
                @wheel.native.prevent="stopScrollFun($event)"
                @input="inputEvent('importedDayAge',row)"
              ></el-input>
            </template>
          </vxe-table-column>
          <vxe-table-column field="importedType" title="引种类型" align="left" width="100" :edit-render="{type: 'default'}">
            <template v-slot:edit="scope">
              <el-select v-model="scope.row.importedType" @change="$refs.xTable.updateStatus(scope)">
                <el-option v-for="item in optionList1" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </template>
            <template v-slot="{ row }">{{ getSelectLabel(row.importedType, optionList1) }}</template>
          </vxe-table-column>
          <vxe-table-column field="sex" title="性别" width="80" align="left" :edit-render="{type: 'default'}">
            <template v-slot:edit="scope">
              <el-select v-model="scope.row.sex" @change="$refs.xTable.updateStatus(scope)">
                <el-option v-for="item in optionList2" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </template>
            <template v-slot="{ row }">{{ getSelectLabel(row.sex, optionList2) }}</template>
          </vxe-table-column>
          <vxe-table-column field="species" title="品种" width="80" align="left" :edit-render="{type: 'default'}">
            <template v-slot:edit="scope">
              <el-select v-model="scope.row.species" @change="$refs.xTable.updateStatus(scope)">
                <el-option v-for="item in optionList3" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </template>
            <template v-slot="{ row }">{{ getSelectLabel(row.species, optionList3) }}</template>
          </vxe-table-column>
          <vxe-table-column field="supplier" title="供应商" width="140" align="left" :edit-render="{type: 'default'}">
              <template v-slot:edit="scope">
                <div>
                    <el-input v-model="scope.row.supplier" @input="$refs.xTable.updateStatus(scope)"  v-if="scope.row.importedType < 2"></el-input>
                    <el-input v-model="scope.row.supplier" @input="$refs.xTable.updateStatus(scope)" v-if="scope.row.importedType == 2"></el-input>
                    <div v-if="scope.row.importedType == 3">
                        <el-select v-model="scope.row.supplier" style="width: 100px" size="small"
                          placeholder="搜索选择"
                          @change="onSelectDrug($event, scope)"
                          prefix-icon="el-icon-search"
                          filterable
                          remote
                          reserve-keyword
                          :remote-method="remoteMethod"
                          :loading="loading">
                          <el-option
                            v-for="item in optionList9"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                          </el-option>
                        </el-select>
                        <i class="el-icon-search" style="float: left; margin-top: 10px"></i>
                    </div>

                </div>
              </template>
              <template v-slot="{ row }">
                <div v-if="row.importedType == 3">{{ row.supplier }}</div>
                <div v-if="row.importedType < 2">{{ row.supplier }}</div>
                <div v-if="row.importedType == 2">{{ row.pigName }}</div>
              </template>
              <!-- <template v-slot="{ row }"><div v-if="row.importedType == 2">{{ row.pigName }}</div></template> -->
          </vxe-table-column>
          <vxe-table-column field="responsibler" title="责任人（具体经办人）" width="120" align="left" :edit-render="{name: 'input', props: {placeholder: '请输入'}}"></vxe-table-column>
          <vxe-table-column field="leadershiper" title="分管领导（经办人上级）" width="120" align="left" :edit-render="{name: 'input', props: {placeholder: '请输入'}}"></vxe-table-column>
          <vxe-table-column field="progress" title="进展情况" width="100" align="left" :edit-render="{type: 'default'}">
            <template v-slot:edit="scope">
              <el-select v-model="scope.row.progress" @change="$refs.xTable.updateStatus(scope)">
                <el-option v-for="item in optionList4" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </template>
            <template v-slot="{ row }">{{ getSelectLabel(row.progress, optionList4) }}</template>
          </vxe-table-column>
          <vxe-table-column field="measures" title="应对措施" width="100" align="left" :edit-render="{name: 'input', props: {placeholder: '请输入'}}"></vxe-table-column>
        </vxe-table>

      </div>
  </div>
</template>

<script>
    import formTitle from "@/components/formTitle/formTitle";  //主表组件
    import PageForm from "@/components/form/Form";
    import { mapGetters } from 'vuex'
    import request from '@/utils/request'
    import auth from '@/utils/auth.js'
    import { exportReport } from '@/utils/export'  //引入导出方法
    import { importReport } from '@/api/rentalBreedingGrounds/index'  //引入导入方法
    export default {
        name: 'introductionPlanDetailsDetail',
        components: { formTitle, PageForm },
        data() {
            return {
                fullscreen: false,   //全屏状态
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
                select: 'select',
                brnStatus: true,
                isLastPage: true,
                //搜索
                search: {
                  orgName: '',  //组织名称
                  orgId: '',   //组织
                  orgLongNum: '',
                  period: 1574318252000  //业务期间
                },
                //业务期间下拉数据
                options: [
                  { value: '0', label: '组织'},
                  { value: '1', label: '分公司'},
                  { value: '2', label: '片区'}
                ],

                page4: {   //分页
                  currentPage: 1,
                  pageSize: 10,
                  totalResult: 0
                },

                loading: false,
                tableData: [],

                optionList: [  //引种日期
                  { label: '1-7日', value: 1 },
                  { label: '8-14日', value: 2 },
                  { label: '15-21日', value: 3 },
                  { label: '22-月底', value: 4 }
                ],
                optionList1: [  //引种类型
                  { label: '外引', value: 0 },
                  { label: '提级', value: 1 },
                  { label: '自留', value: 2 },
                  { label: '内调', value: 3 }
                ],
                optionList2: [  //性别
                  { label: '公', value: 0 },
                  { label: '母', value: 1 }
                ],
                optionList3: [  //品种
                  { label: '无数据', value: null }
                ],
                optionList4: [  //进展情况
                  { label: '合同未签订', value: 0 },
                  { label: '合同已签订', value: 1 },
                  { label: '未确定种源', value: 2 }
                ],
                optionList6: [  //引用月份
                  { label: '请选择', value: 0 },
                  { label: '1月', value: 1 },
                  { label: '2月', value: 2 },
                  { label: '3月', value: 3 },
                  { label: '4月', value: 4 },
                  { label: '5月', value: 5 },
                  { label: '6月', value: 6 },
                  { label: '7月', value: 7 },
                  { label: '8月', value: 8 },
                  { label: '9月', value: 9 },
                  { label: '10月', value: 10 },
                  { label: '11月', value: 11 },
                  { label: '12月', value: 12 }
                ],

                optionList9: [  //供应商下拉
                  { label: '无数据', value: null },
                ],
                validRules: {
                  loadScale: [
                    { required: true, message: '必须填写' }
                  ],
                  importedMonth: [
                    { required: true, message: '必须填写' }
                  ],
                  // importedDate: [
                  //   { required: true, message: '必须填写' }
                  // ],
                  importedNum: [
                    { required: true, message: '必须填写' },
                    { pattern: /^[+]{0,1}(\d+)$/, message: '必须为正整数' }
                  ],
                  importedDayAge: [
                    { required: true, message: '必须填写' },
                    { pattern: /^[+]{0,1}(\d+)$/, message: '必须为正整数' }
                  ],
                  importedType: [
                    { required: true, message: '必须填写' }
                  ],
                  sex: [
                    { required: true, message: '必须填写' }
                  ],
                  species: [
                    { required: true, message: '必须填写' }
                  ],
                  responsibler: [
                    { required: true, message: '必须填写' }
                  ],
                  leadershiper: [
                    { required: true, message: '必须填写' }
                  ],
                  progress: [
                    { required: true, message: '必须填写' }
                  ],
                  supplier: [
                    { required: true, message: '必须填写' }
                  ],
                  measures: [
                    { required: true, message: '必须填写' }
                  ],
                },
                parentTableData: [],
                parentId: '',     //主标传过来的id

                delPBTable: 0,   //删除主表的数据标识
                delZBRable: [],  //删除子表数据

                insertZB: [{}],   //子表无数据时插入行数据
                insertZBNone: [{}],   //子表无数据时插入行数据

                PBinsert: {},
                statusText: 4,  //按钮状态

                createTime: '',
                submitDate: '',

                PZInsert: '',  //默认品种

                //引种日期插入
                SetMonth: null,
                setYear: null,

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
            //console.log(newVal)
            this.PBinsert = { orgId: this.search.orgId, orgName: this.search.orgName, orgLongNumber: this.search.orgLongNum, period: this.formatDate1(this.search.period) }
            this.tableData = []

            this.findZBList()
            this.tableData = []   //切换组织子表清空
            this.statusText = 4   //按钮状态置回

            this.brnStatus = true
            this.getLmInfo()
          },
          planYearMonth(newVal, oldVal){   //动态监听切换时间
            this.setYear = null
            this.SetMonth = null

            this.search.period = (new Date(newVal)).getTime()
            this.getLmInfo()

            let Zbinset = this.insertZB
            for(let i=0; i<4; i++){
                Zbinset[i].importedMonth = newVal
            }
            this.insertZB = Zbinset
            this.findZBList()
          }
        },
        created(){
            const _this = this
            let nowData = Date.now()
            this.search.period = nowData

            this.initData()  //初始化数据
            this.formData = { orgId: this.search.orgId, orgName: this.search.orgName, orgLongNumber: this.search.orgLongNum, period: this.formatDate1(this.search.period) }
            this.findZBList()  //获取子表信息
            this.getPZ()  //获取品种
            this.getLmInfo()  //获取罗马行插入信息
            setTimeout(function(){
              _this.getGYS()   //获取供应商
            }, 2000)
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
        activated(){

        },
        deactivated(){

        },
        computed: {
          ...mapGetters(['orgInfo', 'planYearMonth'])
        },
        methods: {
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
              let tableData = data.tableData
              if(tableData.length == 0){
                  this.$message.warning('无导出数据!')
                  return
              }
              exportReport({
                url: 'exoticPlanEntry/exportExoticPlanEntry',
                method: 'post',
                data: tableData,
                fileName: '引种计划填报表'
              });
            },

            //导入方法
            importDataEvent(params) {
              let data = this.$refs.xTable.getTableData().tableData
              this.recordData = [...data, ...this.recordData]  //记录导入之前的数据
              console.log(this.recordData)
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
                url: `/BUSINESSREPORT/exoticPlanEntry/importExoticPlanEntry`,
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
            onSelectDrug(e, scope){
                let obj = {};
                obj = this.optionList9.find((item)=>{
                  if(item.value == e){
                    return item
                  }
                });
                scope.row.supplier = obj.label
                scope.row.supplierId = obj.value
                this.$refs.xTable.updateStatus(scope)
            },
            initData() {  // 初始化数据
              //console.log(this.orgInfo)
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
              //汇总表穿透传递过来的参数
              let query = this.$route.query
              if(query.orgId){
                //console.log(query)
                  this.search.orgId = query.orgId
                  let secondsTime = new Date(query.yearMonth).getTime()
                  this.search.period = secondsTime
              }
            },
            //表格禁用
            activeCellMethod ({ column, columnIndex }) {
              if (this.statusText == 1 || this.statusText == 2) {
                return false
              }else {
                return true
              }
            },

            //供应商搜索下拉change事件
            remoteMethod(query){
                //console.log(query)
                this.getGYS(query)
            },
            //获取供应商信息
            getGYS(data){
              request({
                    url: `/BUSINESSREPORT/exoticPlanEntry/getCustinfo`,
                    method: 'get',
                    params: {
                      fname: data,   //组织id
                    }
                })
                .then(e => {
                    if(e.status == 200){
                        //console.log(e.data.data)
                        let GYS = e.data.data
                        let arr = []
                        for(let i=0; i<GYS.length; i++){
                          let obj= {}
                          obj.label = GYS[i].ORGNAME
                          obj.value = GYS[i].ORGID
                          arr.push(obj)
                        }
                        this.optionList9 = arr

                    }else{
                        this.$XModal.message({ message: '获取失败', status: 'error' })
                    }

                })
            },
            //从罗马接口获取信息
            getLmInfo(){
                //console.log(this.formatDate(this.search.period, 'yyyy-MM'))
                request({
                    url: `/BUSINESSREPORT/exoticPlanEntry/getYzInfo`,
                    method: 'get',
                    params: {
                      forgid: this.search.orgId,   //组织id
                      period: this.formatDate(this.search.period, 'yyyy-MM')  //业务期间
                    }
                })
                .then(e => {
                    if(e.status == 200){
                        //console.log(e.data.data)
                        //控制保存，提交按钮状态
                        if(e.data.isSave){
                            this.isSave = e.data.isSave
                        }
                        if(e.data.data.length){
                            let LMInfo = e.data.data[0]
                            /**************子表插入单条数据********************** */
                            let insertOneZB = []
                            let oneObj = {}
                            oneObj.branchName = LMInfo.FGSNAME ? LMInfo.FGSNAME : ''   //分公司
                            oneObj.branchId = LMInfo.FGSID   //分id
                            oneObj.pigName = LMInfo.ZCNAME   //猪场名称
                            oneObj.pigId = LMInfo.ZCID   //猪场id
                            oneObj.breedingStock = LMInfo.CNUM   //经产母猪
                            oneObj.reserveStock = LMInfo.CNUM2   //后备母猪存栏
                            oneObj.loadScale = LMInfo.SCALE   //交付栏舍
                            oneObj.sex = 1  //默认性别
                            oneObj.species = this.PZInsert //设置默认品种
                            oneObj.importedMonth = this.formatDate1(this.search.period)
                            insertOneZB.push(oneObj)
                            this.insertZBNone = insertOneZB
                            /**************子表插入多条数据********************** */
                            let insertArr = []  //子表新增插入数组
                            for(let i=0; i<6; i++){
                                let obj = {}
                                if(i<4){
                                    obj.branchName = LMInfo.FGSNAME ? LMInfo.FGSNAME : ''   //分公司
                                    obj.branchId = LMInfo.FGSID   //分id
                                    obj.pigName = LMInfo.ZCNAME   //猪场名称
                                    obj.pigId = LMInfo.ZCID   //猪场id
                                    obj.breedingStock = LMInfo.CNUM   //经产母猪
                                    obj.reserveStock = LMInfo.CNUM2   //后备母猪存栏
                                    obj.loadScale = LMInfo.SCALE   //交付栏舍
                                    obj.sex = 1  //默认性别
                                    obj.species = this.PZInsert //设置默认品种
                                    obj.importedMonth = this.formatDate1(this.search.period)
                                    obj.importedDate = i + 1

                                    insertArr.push(obj)
                                }
                            }

                            let YZMonth = this.formatDate1(this.search.period).split('-')   //引种月份
                            this.setYear = Number(YZMonth[0])  //拆分年
                            this.SetMonth = Number(YZMonth[1]) //拆分月

                            for(let i=0; i<2; i++){
                                let obj = {}
                                obj.branchName = LMInfo.FGSNAME ? LMInfo.FGSNAME : ''   //分公司
                                obj.branchId = LMInfo.FGSID   //分id
                                obj.pigName = LMInfo.ZCNAME   //猪场名称
                                obj.pigId = LMInfo.ZCID   //猪场id
                                obj.breedingStock = LMInfo.CNUM   //经产母猪
                                obj.reserveStock = LMInfo.CNUM2   //后备母猪存栏
                                obj.loadScale = LMInfo.SCALE   //交付栏舍
                                obj.sex = 1  //默认性别
                                obj.species = this.PZInsert //设置默认品种

                                //console.log(this.SetMonth + i + 1)
                                if( (this.SetMonth + i + 1) > 12 ){
                                    this.SetMonth = 1
                                    this.setYear ++
                                }else{
                                    this.SetMonth ++
                                }

                                if(this.SetMonth >= 10){
                                    obj.importedMonth = this.setYear + '-' + this.SetMonth
                                }else{
                                    let a = '0'+this.SetMonth
                                    obj.importedMonth = this.setYear + '-' + a
                                }
                                insertArr.push(obj)
                            }
                            this.insertZB = insertArr
                        }else{
                            //罗马接口没有获取到数据，设置插入引种月份为当前时间
                            let insertArr = []
                            let obj = {}
                            obj.importedMonth = this.formatDate1(this.search.period)
                            insertArr.push(obj)
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
            //品种
            getPZ() {
                const _this = this
                //this.loading = true
                request({
                    url: `/BUSINESSREPORT/exoticPlanEntry/getPigType`,
                    method: 'get',
                    params: { }
                })
                .then(e => {
                    if(e.status == 200){
                        let data = e.data
                        //this.option = data
                        this.optionList3 = data

                        this.PZInsert = data[0].value
                        //this.insertZB.species = data[0].value
                        //this.insertZB.sex = 1

                        //this.loading = false
                    }else{
                        this.$XModal.message({ message: '获取失败！', status: 'error' })
                    }

                })
            },

            //格式华时间
            formatDate (value, format) {
              return this.$utils.toDateString(value, format)
            },

            /**************************获取列表数据********************************* */
            //获取主表列表
            findZBList(){
                request({
                    url: `/BUSINESSREPORT/exoticPlan/queryPageInfo/1/100`,
                    method: 'get',
                    params: {
                      orgId: this.search.orgId,   //组织
                      period: this.formatDate(this.search.period, 'yyyy-MM')  //业务期间
                    }
                })
                .then(e => {
                    if(e.status == 200){
                        //console.log("data:"+JSON.stringify(e.data))
                        let data = e.data.list
                        this.parentTableData = data
                        this.isLastPage = e.data.isLastPage
                        if(data[0]){
                          this.createTime = data[0].createTime
                          this.submitDate = data[0].submitDate

                          data[0].createTime = this.formatDate1(Number(data[0].createTime))
                          data[0].submitDate = data[0].submitDate ? this.formatDate1(Number(data[0].submitDate)) : ''
                          this.formData = data[0]
                          //console.log(this.formData)

                          this.parentId = data[0].id
                          this.findList(1, 100)
                          this.statusText = data[0].status
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
                    url: `/BUSINESSREPORT/exoticPlanEntry/queryPageInfo/${pageNum}/${pageSize}`,
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
            //子表插入行
            insertEvent () {
              let record;
              let body = this.$refs.xTable.getRecordset()
              let { insertRecords, removeRecords, updateRecords } = body   //子表
              //console.log(body)

              //判断子表原先是否有数据
              if(this.tableData.length > 0 && removeRecords.length > 0 && insertRecords.length == 0){
                  record = this.insertZB
              }else{
                  if(this.tableData.length == 0){
                      if(insertRecords.length > 0){
                          record = this.insertZBNone
                      }else{
                          record = this.insertZB
                      }
                  }else{
                      record = this.insertZBNone
                  }
              }

              this.$refs.xTable.insert(record)
                .then(({ row }) => this.$refs.xTable.setActiveCell(row, 'key'))
            },

            //保存
            saveEvent (status1, flag) {
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
                  console.log(importData.length)
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
                      check[0].exoticPlanEntryList = [...sendRecordData, ...importData, ...this.delZBRable]
                  }
              }else{
                  //console.log(this.delZBRable)
                  if (insertRecords.length || removeRecords.length || updateRecords.length) {
                      check[0].exoticPlanEntryList = [...insertRecords, ...updateRecords, ...this.delZBRable]  //子表的数据
                      let a = check[0].exoticPlanEntryList
                      for(let i=0; i<a.length; i++){
                          //console.log(a[i].importedMonth)
                          let d = new Date(a[i].importedMonth);
                          let month = (d.getMonth() + 1) < 10 ? '0' + (d.getMonth() + 1) : d.getMonth() + 1
                          let datetime=d.getFullYear() + '-' + month;
                          check[0].exoticPlanEntryList[i].importedMonth = datetime
                      }
                  } else {
                      check[0].exoticPlanEntryList = []
                      if(!this.parentTableData.length){
                          this.$XModal.message({ message: `子表无数据`, status: 'error' })
                          return;
                      }
                  }
              }

              for(let i=0; i<check.length; i++){
                  check[i].period = this.formatDate1(check[i].period)

                  for(let j =0; j<check[i].exoticPlanEntryList.length; j++){
                      //console.log(check[i].exoticPlanEntryList[j].supplier)
                      if(check[i].exoticPlanEntryList[j].importedType == 2){  //判断引种类型改变供应商为猪场名称
                          check[i].exoticPlanEntryList[j].supplier = check[i].exoticPlanEntryList[j].pigName
                      }
                      //判断引种类型为外引时供应商为必填
                      // if(check[i].exoticPlanEntryList[j].importedType == 0 && check[i].exoticPlanEntryList[j].supplier == null){
                      //     this.$XModal.message({ message: '引种类型为外引时，供应商必填', status: 'error' })
                      //     return;
                      // }
                  }
              }

              this.$refs.xTable.validate(valid => {
                  check[0].status = status1
                  let data = check

                  if (valid) {
                    request({
                        url: '/BUSINESSREPORT/exoticPlan/save',
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
                            this.$XModal.message({ message: '操作失败！', status: 'error' })
                        }
                    })
                  }else{
                      this.$XModal.message({ message: '必填字段必须填写', status: 'error' })
                  }
              })

            },
            //提交时间格式化
            formatDate1(dateNew) { 
                let date = new Date(dateNew)
                let year = date.getFullYear()
                let month = date.getMonth() + 1
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
                    url: '/BUSINESSREPORT/exoticPlan/delete',
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

            /***************************子表删除********************************* */
            //选中子表删除
            getSelectionEvent () {
                let removeRecords = this.$refs.xTable.getSelectRecords()
                if(removeRecords.length == 0){
                    this.$XModal.message({ message: '请先选择要删除的行！', status: 'warning' })
                    return
                }
                let a = this.$XModal.confirm('您确定要删除吗？')
                a.then(e => {
                    //console.log(e)
                    let delDataArr = [];
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
            //删除子表数据
            del(data){
                request({
                    url: '/BUSINESSREPORT/exoticPlanEntry/delete',
                    method: 'post',
                    data
                })
                .then(e => {
                    if(e.status == 200){
                        this.$XModal.message({ message: '删除成功！', status: 'success' })
                        this.$refs.xTable.removeSelecteds()
                    }else{
                        this.$XModal.message({ message: '删除失败！', status: 'error' })
                    }
                })
            },

            // 通用行合并函数（将相同多列数据合并为一行）
            rowspanMethod ({ row, $rowIndex, column, data }) {
              let fields = ['key']
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
            //自定义列合并函数
            colspanMethod({ row, rowIndex, column, columnIndex, data }) {
              if (rowIndex  === 0) {
                if (columnIndex === 0) {
                  return {
                    rowspan: 1,
                    colspan: 2
                  };
                } else if (columnIndex === 1) {
                  return {
                    rowspan: 0,
                    colspan: 0
                  };
                }
              }
            },

            getSelectLabel (value, list, valueProp = 'value', labelField = 'label') {
              let item = this.$utils.find(list, item => item[valueProp] === value)
              return item ? item[labelField] : null
            },
            //返回
            goBack(){
                this.$router.push('/introductionPlanDetails/index')
            },
            cellClickEvent ({ row, rowIndex, column, columnIndex }, event) {
              //console.log(column)
            },

            //标准时间转成毫秒
            dateToMs (date) {
                let result = new Date(date).getTime();
                return result;
            },

            getSelectLabel (value, list, valueProp = 'value', labelField = 'label') {
              let item = this.$utils.find(list, item => item[valueProp] === value)
              return item ? item[labelField] : null
            },

        }
    }

</script>


<style scoped lang="scss">

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



  .page-content {
    box-sizing: border-box;
    margin: 10px 10px;
    padding: 16px 20px 20px 20px;
    border-radius: 0px;
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
</style>
