<template>
  <div v-loading.lock="fullscreenLoading">
    <formTitle title="出苗计划">
      <div slot="context">
        <page-form
          v-bind="formOptions"
          :model="formData"
          :editable="false"
          ref="PageForm"
        ></page-form>
      </div>
      <div slot="title-suffix">
        <div v-if="isSave == 1">
            <el-button @click="saveEvent(0, false)" class="save-btn" size="small" v-if="(statusText == 4 || statusText == 0)">保存</el-button> 
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
        ref="xTable"
        resizable
        show-footer
        :footer-method="footerMethod"
        :cell-class-name="cellClassName"
        :edit-config="{trigger: 'click', mode: 'row',activeMethod: activeCellMethod}"
        :loading="loading"
        :span-method="rowspanMethod"
        :data="tableData"
        :edit-rules="validRules"
        highlight-current-row
        :mouse-config="{selected: true}"
        :keyboard-config="{isArrow: true, isDel: true, isTab: true, isEdit: true}"
        border>
        <vxe-table-column type="checkbox" width="40" fixed="left"></vxe-table-column>
        <vxe-table-column title="分场" width="110" style="margin: 0; padding: 0" align="left" field="parvialFieldName" fixed="left"></vxe-table-column>
        <vxe-table-column title="出苗小计">
          <vxe-table-column title="小计" width="70" align="right" field="cmTotal">
            <template v-slot="{ row }">
              <span>{{ countAmountCM(row, 1) }}</span>
            </template>
          </vxe-table-column>
          <vxe-table-column title="1-7日出栏数" width="70" align="right" field="cmFirstWeek"></vxe-table-column>  
          <vxe-table-column title="8-14日出栏数" width="70" align="right" field="cmSecondWeek"></vxe-table-column> 
          <vxe-table-column title="15-21日出栏数" width="70" align="right" field="cmThirdWeek"></vxe-table-column>
          <vxe-table-column title="22-月底出栏数" width="70" align="right" field="cmFourthWeek"></vxe-table-column>
        </vxe-table-column>
        <vxe-table-column title="其中：自留保育/育肥">
          <vxe-table-column title="小计" width="70" align="right" field="zlTotal">
            <template v-slot="{ row }">
              <span>{{ countAmountCM(row, 2) }}</span>
            </template>
          </vxe-table-column>
          <vxe-table-column field="zlFirstWeek" align="right" title="1-7日出栏数" width="80" :edit-render="{name: 'input'}">
            <template v-slot:edit="{ row }">
              <el-input
                type="number"
                v-model="row.zlFirstWeek"
                @wheel.native.prevent="stopScrollFun($event)"
                @input="inputEvent('zlFirstWeek',row)"
              ></el-input>
            </template>
          </vxe-table-column>
          <vxe-table-column field="zlSecondWeek" align="right" title="8-14日出栏数" width="80" :edit-render="{name: 'input'}">
            <template v-slot:edit="{ row }">
              <el-input
                type="number"
                v-model="row.zlSecondWeek"
                @wheel.native.prevent="stopScrollFun($event)"
                @input="inputEvent('zlSecondWeek',row)"
              ></el-input>
            </template>
          </vxe-table-column>
          <vxe-table-column field="zlThirdWeek" align="right" title="15-21日出栏数" width="80" :edit-render="{name: 'input'}">
            <template v-slot:edit="{ row }">
              <el-input
                type="number"
                v-model="row.zlThirdWeek"
                @wheel.native.prevent="stopScrollFun($event)"
                @input="inputEvent('zlThirdWeek',row)"
              ></el-input>
            </template>
          </vxe-table-column>
          <vxe-table-column field="zlFourthWeek" align="right" title="22-月底出栏数" width="80" :edit-render="{name: 'input'}">
            <template v-slot:edit="{ row }">
              <el-input
                type="number"
                v-model="row.zlFourthWeek"
                @wheel.native.prevent="stopScrollFun($event)"
                @input="inputEvent('zlFourthWeek',row)"
              ></el-input>
            </template>
          </vxe-table-column>
        </vxe-table-column>
        <vxe-table-column title="其中：外销猪苗">  
          <vxe-table-column title="小计" width="80" align="right" field="wxTotal">
            <template v-slot="{ row }">
              <span>{{ countAmountCM(row, 3) }}</span>
            </template>
          </vxe-table-column>
          <vxe-table-column field="wxFirstWeek" align="right" title="1-7日出栏数" width="80" :edit-render="{name: 'input'}">
            <template v-slot:edit="{ row }">
              <el-input
                type="number"
                v-model="row.wxFirstWeek"
                @wheel.native.prevent="stopScrollFun($event)"
                @input="inputEvent('wxFirstWeek',row)"
              ></el-input>
            </template>
          </vxe-table-column>
          <vxe-table-column field="wxSecondWeek" align="right" title="8-14日出栏数" width="80" :edit-render="{name: 'input'}">
            <template v-slot:edit="{ row }">
              <el-input
                type="number"
                v-model="row.wxSecondWeek"
                @wheel.native.prevent="stopScrollFun($event)"
                @input="inputEvent('wxSecondWeek',row)"
              ></el-input>
            </template>
          </vxe-table-column>
          <vxe-table-column field="wxThirdWeek" align="right" title="15-21日出栏数" width="80" :edit-render="{name: 'input'}">
            <template v-slot:edit="{ row }">
              <el-input
                type="number"
                v-model="row.wxThirdWeek"
                @wheel.native.prevent="stopScrollFun($event)"
                @input="inputEvent('wxThirdWeek',row)"
              ></el-input>
            </template>
          </vxe-table-column>
          <vxe-table-column field="wxFourthWeek" align="right" title="22-月底出栏数" width="80" :edit-render="{name: 'input'}">
            <template v-slot:edit="{ row }">
              <el-input
                type="number"
                v-model="row.wxFourthWeek"
                @wheel.native.prevent="stopScrollFun($event)"
                @input="inputEvent('wxFourthWeek',row)"
              ></el-input>
            </template>
          </vxe-table-column>
        </vxe-table-column>
        <vxe-table-column title="其中：7kg小种猪">
          <vxe-table-column title="小计" width="80" align="right" field="xzzTotal">  
            <template v-slot="{ row }">
              <span>{{ countAmountCM(row, 4) }}</span>
            </template>
          </vxe-table-column>
          <vxe-table-column field="xzzFirstWeek" align="right" title="1-7日出栏数" width="80" :edit-render="{name: 'input'}">
            <template v-slot:edit="{ row }">
              <el-input
                type="number"
                v-model="row.xzzFirstWeek"
                @wheel.native.prevent="stopScrollFun($event)"
                @input="inputEvent('xzzFirstWeek',row)"
              ></el-input>
            </template>
          </vxe-table-column>
          <vxe-table-column field="xzzSecondWeek" align="right" title="8-14日出栏数" width="80" :edit-render="{name: 'input'}">
            <template v-slot:edit="{ row }">
              <el-input
                type="number"
                v-model="row.xzzSecondWeek"
                @wheel.native.prevent="stopScrollFun($event)"
                @input="inputEvent('xzzSecondWeek',row)"
              ></el-input>
            </template>
          </vxe-table-column>
          <vxe-table-column field="xzzThirdWeek" align="right" title="15-21日出栏数" width="80" :edit-render="{name: 'input'}">
            <template v-slot:edit="{ row }">
              <el-input
                type="number"
                v-model="row.xzzThirdWeek"
                @wheel.native.prevent="stopScrollFun($event)"
                @input="inputEvent('xzzThirdWeek',row)"
              ></el-input>
            </template>
          </vxe-table-column>
          <vxe-table-column field="xzzFourthWeek" align="right" title="22-月底出栏数" width="80" :edit-render="{name: 'input'}">
            <template v-slot:edit="{ row }">
              <el-input
                type="number"
                v-model="row.xzzFourthWeek"
                @wheel.native.prevent="stopScrollFun($event)"
                @input="inputEvent('xzzFourthWeek',row)"
              ></el-input>
            </template>
          </vxe-table-column>
        </vxe-table-column>
        <vxe-table-column title="其中：调服务部">
          <vxe-table-column title="小计" width="80" align="right" field="fwbTotal">  
            <template v-slot="{ row }">
              <span>{{ countAmountCM(row, 5) }}</span>
            </template>
          </vxe-table-column>
          <vxe-table-column title="1-7日出栏数" align="right" width="80" field="fwbFirstWeek">
            <template v-slot="{ row }">
              <span>{{ countAmountCM(row, 6) }}</span>
            </template>
          </vxe-table-column>
          <vxe-table-column title="8-14日出栏数" align="right" width="80" field="fwbSecondWeek">
            <template v-slot="{ row }">
              <span>{{ countAmountCM(row, 7) }}</span>
            </template>
          </vxe-table-column>
          <vxe-table-column title="15-21日出栏数" align="right" width="80" field="fwbThirdWeek">
            <template v-slot="{ row }">
              <span>{{ countAmountCM(row, 8) }}</span>
            </template>
          </vxe-table-column>
          <vxe-table-column title="22-月底出栏数" align="right" width="80" field="fwbFourthWeek">
            <template v-slot="{ row }">
              <span>{{ countAmountCM(row, 9) }}</span>
            </template>
          </vxe-table-column>
        </vxe-table-column>
        <vxe-table-column :title="((month + 1) > 12 ? ((month + 1) - 12) : (month + 1)) + '月出苗计划'">
            <vxe-table-column title="出苗小计" width="80" align="right" field="cmNextTwoMonth"></vxe-table-column>
            <vxe-table-column field="zlNextTwoMonth" align="right" title="其中：自留保育/育肥" width="80" :edit-render="{name: 'input'}">
              <template v-slot:edit="{ row }">
                <el-input
                  type="number"
                  v-model="row.zlNextTwoMonth"   
                  @wheel.native.prevent="stopScrollFun($event)"
                  @input="inputEvent('zlNextTwoMonth',row)"
                ></el-input>
              </template>
            </vxe-table-column>
            <vxe-table-column field="wxNextTwoMonth" align="right" title="其中：外销猪苗" width="80" :edit-render="{name: 'input'}">
              <template v-slot:edit="{ row }">
                <el-input
                  type="number"
                  v-model="row.wxNextTwoMonth"
                  @wheel.native.prevent="stopScrollFun($event)"
                  @input="inputEvent('wxNextTwoMonth',row)"
                ></el-input>
              </template>
            </vxe-table-column>
            <vxe-table-column field="xzzNextTwoMonth" align="right" title="其中：7kg小种猪" width="80" :edit-render="{name: 'input'}">
              <template v-slot:edit="{ row }">
                <el-input
                  type="number"
                  v-model="row.xzzNextTwoMonth"
                  @wheel.native.prevent="stopScrollFun($event)"
                  @input="inputEvent('xzzNextTwoMonth',row)"
                ></el-input>
              </template>
            </vxe-table-column>
            <vxe-table-column title="其中：调服务部" align="right" width="80" field="fwbNextTwoMonth">
              <template v-slot="{ row }">   
                <span>{{ countAmountCM(row, 10) }}</span>
              </template>
            </vxe-table-column>
        </vxe-table-column>
        <vxe-table-column :title="((month + 2) > 12 ? ((month + 2) - 12) : (month + 2))+ '月出苗计划'">
            <vxe-table-column title="出苗小计" width="80" align="right" field="cmNextThreeMonth"></vxe-table-column>
            <vxe-table-column field="zlNextThreeMonth" title="其中：自留保育/育肥" align="right" width="80" :edit-render="{name: 'input'}">
              <template v-slot:edit="{ row }">  
                <el-input
                  type="number"
                  v-model="row.zlNextThreeMonth"
                  @wheel.native.prevent="stopScrollFun($event)"
                  @input="inputEvent('zlNextThreeMonth',row)"
                ></el-input>
              </template>
            </vxe-table-column>
             <vxe-table-column field="wxNextThreeMonth" align="right" title="其中：外销猪苗" width="80" :edit-render="{name: 'input'}">
              <template v-slot:edit="{ row }">
                <el-input
                  type="number"
                  v-model="row.wxNextThreeMonth"
                  @wheel.native.prevent="stopScrollFun($event)"
                  @input="inputEvent('wxNextThreeMonth',row)"
                ></el-input>
              </template>
            </vxe-table-column>
            <vxe-table-column field="xzzNextThreeMonth" align="right" title="其中：7kg小种猪" width="80" :edit-render="{name: 'input'}">
              <template v-slot:edit="{ row }">
                <el-input
                  type="number"
                  v-model="row.xzzNextThreeMonth"
                  @wheel.native.prevent="stopScrollFun($event)"
                  @input="inputEvent('xzzNextThreeMonth',row)"
                ></el-input>
              </template>
            </vxe-table-column>
            <vxe-table-column title="其中：调服务部" width="80" align="right" field="fwbNextThreeMonth">
              <template v-slot="{ row }">   
                <span>{{ countAmountCM(row, 11) }}</span>
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
    name: 'seedlingPlanDetailsDetails',
    components: { formTitle, PageForm},
    data() {
      return {
        month: 0,
        fullscreen: false,
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

        brnStatus: true,
        //搜索
        search: {
          orgId: '123',   //组织
          orgName: '',
          orgLongNum: '',
          period: 1574318252000,  //业务期间

        },
        //业务期间下拉数据
        options: [
          { value: '0', label: '组织'},
          { value: '1', label: '分公司'},
          { value: '2', label: '片区'}
        ],
        optionList5: [  //父标状态
          { label: '请选择', value: null },
          { label: '保存', value: '0' },
          { label: '更新', value: '1' },
          { label: '删除', value: '2' }
        ],
        optionList6: [  //分厂选项
          { label: '分场1', value: 0 },
          { label: '分场2', value: 1 },
          { label: '分场3', value: 2 }
        ],
        parentTableData: [],

        tableData: [],
        page4: {   //分页
          currentPage: 1,
          pageSize: 10,
          totalResult: 300
        },
        loading: false,
        validRules: { // 校验规则
          zlFirstWeek: [
            { required: true, message: '必须填写' },
            { pattern: /^[+]{0,1}(\d+)$/, message: '必须为正整数' }
          ],
          zlSecondWeek: [
            { required: true, message: '必须填写' },
            { pattern: /^[+]{0,1}(\d+)$/, message: '必须为正整数' }
          ],
          zlThirdWeek: [
            { required: true, message: '必须填写' },
            { pattern: /^[+]{0,1}(\d+)$/, message: '必须为正整数' }
          ],
          zlFourthWeek: [
            { required: true, message: '必须填写' },
            { pattern: /^[+]{0,1}(\d+)$/, message: '必须为正整数' }
          ],

          wxFirstWeek: [
            { required: true, message: '必须填写' },
            { pattern: /^[+]{0,1}(\d+)$/, message: '必须为正整数' }
          ],
          wxSecondWeek: [
            { required: true, message: '必须填写' },
            { pattern: /^[+]{0,1}(\d+)$/, message: '必须为正整数' }
          ],
          wxThirdWeek: [
            { required: true, message: '必须填写' },
            { pattern: /^[+]{0,1}(\d+)$/, message: '必须为正整数' }
          ],
          wxFourthWeek: [
            { required: true, message: '必须填写' },
            { pattern: /^[+]{0,1}(\d+)$/, message: '必须为正整数' }
          ],

          xzzFirstWeek: [
            { required: true, message: '必须填写' },
            { pattern: /^[+]{0,1}(\d+)$/, message: '必须为正整数' }
          ],
          xzzSecondWeek: [
            { required: true, message: '必须填写' },
            { pattern: /^[+]{0,1}(\d+)$/, message: '必须为正整数' }
          ],
          xzzThirdWeek: [
            { required: true, message: '必须填写' },
            { pattern: /^[+]{0,1}(\d+)$/, message: '必须为正整数' }
          ],
          xzzFourthWeek: [
            { required: true, message: '必须填写' },
            { pattern: /^[+]{0,1}(\d+)$/, message: '必须为正整数' }
          ],
          // fwbFirstWeek: [
          //   { required: true, message: '必须填写' }
          // ],
          // fwbSecondWeek: [
          //   { required: true, message: '必须填写' }
          // ],
          // fwbThirdWeek: [
          //   { required: true, message: '必须填写' }
          // ],
          // fwbFourthWeek: [
          //   { required: true, message: '必须填写' }
          // ],

          // fwbNextThreeMonth: [
          //   { required: true, message: '必须填写' },
          //   { pattern: /^[+]{0,1}(\d+)$/, message: '必须为正整数' }
          // ],

          xzzNextThreeMonth: [
            { required: true, message: '必须填写' },
            { pattern: /^[+]{0,1}(\d+)$/, message: '必须为正整数' }
          ],
          wxNextThreeMonth: [
            { required: true, message: '必须填写' },
            { pattern: /^[+]{0,1}(\d+)$/, message: '必须为正整数' }
          ],
          zlNextThreeMonth: [
            { required: true, message: '必须填写' },
            { pattern: /^[+]{0,1}(\d+)$/, message: '必须为正整数' }
          ],
          cmNextThreeMonth: [
            { required: true, message: '必须填写' },
            { pattern: /^[+]{0,1}(\d+)$/, message: '必须为正整数' }
          ],

          // fwbNextTwoMonth: [
          //   { required: true, message: '必须填写' },
          //   { pattern: /^[+]{0,1}(\d+)$/, message: '必须为正整数' }
          // ],
          xzzNextTwoMonth: [
            { required: true, message: '必须填写' },
            { pattern: /^[+]{0,1}(\d+)$/, message: '必须为正整数' }
          ],
          wxNextTwoMonth: [
            { required: true, message: '必须填写' },
            { pattern: /^[+]{0,1}(\d+)$/, message: '必须为正整数' }
          ],
          zlNextTwoMonth: [
            { required: true, message: '必须填写' },
            { pattern: /^[+]{0,1}(\d+)$/, message: '必须为正整数' }
          ],
          cmNextTwoMonth: [
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

        createTime: '',
        submitDate: '',

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
        //console.log(newVal)
        this.search.orgId = newVal.id
        this.search.orgName = newVal.name
        this.search.orgLongNum = newVal.longNumber
        
        this.tableData = []   //切换组织子表清空
        this.findZBList()  //切换组织刷新数据
        this.statusText = 4   //按钮状态置回

        this.brnStatus = true
        this.getLM()
      },
      planYearMonth(newVal, oldVal){ //动态监听切换时间
        this.search.period = (new Date(newVal)).getTime()
        this.getLM()
        this.findZBList()
        let month1 = Number(newVal.split('-')[1])
        this.month = month1
      }
    },
    created(){
        const _this = this
        let nowData = Date.now()  
        this.search.period = nowData
        this.initData()
        
        this.formData = { orgId: this.search.orgId, orgName: this.search.orgName, orgLongNumber: this.search.orgLongNum, period: this.formatDate1(this.search.period) }

        this.getLM()
        this.findZBList()

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
        if(['cmTotal', 'zlTotal', 'wxTotal', 'xzzTotal', 'fwbTotal', 'cmNextTwoMonth', 'cmNextThreeMonth'].includes(column.property)){
          return 'col-grey'
        }
      },
      //表格合计
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
            }
            if(columnIndex === 2){
              return `${this.countAllAmountCM(data, 1)}`
            } else if (columnIndex === 3) {
              return `${this.countAllAmountCM(data, 2)}`
            } else if (columnIndex === 4) {
              return `${this.countAllAmountCM(data, 3)}`
            }  else if (columnIndex === 5) {
              return `${this.countAllAmountCM(data, 4)}`
            } else if (columnIndex === 6) {
              return `${this.countAllAmountCM(data, 5)}`
            } else if (columnIndex === 7) {
              return `${this.countAllAmountCM(data, 6)}`
            } else if (columnIndex === 8) {
              return `${this.countAllAmountCM(data, 7)}`
            } else if (columnIndex === 9) {
              return `${this.countAllAmountCM(data, 8)}`
            } else if (columnIndex === 10) {
              return `${this.countAllAmountCM(data, 9)}`
            } else if (columnIndex === 11) {
              return `${this.countAllAmountCM(data, 10)}`
            } else if (columnIndex === 12) {
              return `${this.countAllAmountCM(data, 11)}`
            } else if (columnIndex === 13) {
              return `${this.countAllAmountCM(data, 12)}`
            } else if (columnIndex === 14) {
              return `${this.countAllAmountCM(data, 13)}`
            } else if (columnIndex === 15) {
              return `${this.countAllAmountCM(data, 14)}`
            } else if (columnIndex === 16) {
              return `${this.countAllAmountCM(data, 15)}`
            } else if (columnIndex === 17) {
              return `${this.countAllAmountCM(data, 16)}`
            } else if (columnIndex === 18) {
              return `${this.countAllAmountCM(data, 17)}`
            } else if (columnIndex === 19) {
              return `${this.countAllAmountCM(data, 18)}`
            } else if (columnIndex === 20) {
              return `${this.countAllAmountCM(data, 19)}`
            } else if (columnIndex === 21) {
              return `${this.countAllAmountCM(data, 20)}`
            } else if (columnIndex === 22) {
              return `${this.countAllAmountCM(data, 21)}`
            } else if (columnIndex === 23) {
              return `${this.countAllAmountCM(data, 22)}`
            } else if (columnIndex === 24) {
              return `${this.countAllAmountCM(data, 23)}`
            } else if (columnIndex === 25) {
              return `${this.countAllAmountCM(data, 24)}`
            } else if (columnIndex === 26) {
              return `${this.countAllAmountCM(data, 25)}`
            } else if (columnIndex === 27) {
              return `${this.countAllAmountCM(data, 26)}`
            } else if (columnIndex === 28) {
              return `${this.countAllAmountCM(data, 27)}`
            } else if (columnIndex === 29) {
              return `${this.countAllAmountCM(data, 28)}`
            } else if (columnIndex === 30) {
              return `${this.countAllAmountCM(data, 29)}`
            } else if (columnIndex === 31) {
              return `${this.countAllAmountCM(data, 30)}`
            } else if (columnIndex === 32) {
              return `${this.countAllAmountCM(data, 31)}`
            } else if (columnIndex === 33) {
              return `${this.countAllAmountCM(data, 32)}`
            } else if (columnIndex === 34) {
              return `${this.countAllAmountCM(data, 33)}`
            } else if (columnIndex === 35) {
              return `${this.countAllAmountCM(data, 34)}`
            } else if (columnIndex === 36) {
              return `${this.countAllAmountCM(data, 35)}`
            }

          })
        ]
      },
      countAmount(row, type){
          if(type == 1){  //出苗小计
              return Number(row.cmTotal)
          }else if(type == 2){ 
              return Number(row.cmFirstWeek)
          }else if(type == 3){
              return Number(row.cmSecondWeek)
          }else if(type == 4){
              return Number(row.cmThirdWeek)   
          }else if(type == 5){
              return Number(row.cmFourthWeek)
          }else if(type == 6){
              return Number(row.zlTotal)   //育肥小计
          }else if(type == 7){  
              return Number(row.zlFirstWeek)
          }else if(type == 8){
              return Number(row.zlSecondWeek)
          }else if(type == 9){  
              return Number(row.zlThirdWeek)
          }else if(type == 10){
              return Number(row.zlFourthWeek)
          }else if(type == 11){  //外销小计
              return Number(row.wxTotal) 
          }else if(type == 12){  
              return Number(row.wxFirstWeek)
          }else if(type == 13){   
              return Number(row.wxSecondWeek)
          }else if(type == 14){   
              return Number(row.wxThirdWeek)
          }else if(type == 15){   
              return Number(row.wxFourthWeek)
          }else if(type == 16){     //小种猪小计
              return Number(row.xzzTotal)
          }else if(type == 17){   
              return Number(row.xzzFirstWeek)
          }else if(type == 18){   
              return Number(row.xzzSecondWeek)
          }else if(type == 19){   
              return Number(row.xzzThirdWeek)
          }else if(type == 20){   
              return Number(row.xzzFourthWeek)
          }else if(type == 21){   //调服务部小计
              return Number(row.fwbTotal)
          }else if(type == 22){   
              return Number(row.fwbFirstWeek)
          }else if(type == 23){   
              return Number(row.fwbSecondWeek)
          }else if(type == 24){   
              return Number(row.fwbThirdWeek)
          }else if(type == 25){   
              return Number(row.fwbFourthWeek)
          }else if(type == 26){  //出苗下二月计划 
              return Number(row.cmNextTwoMonth)
          }else if(type == 27){  
              return Number(row.zlNextTwoMonth)
          }else if(type == 28){  
              return Number(row.wxNextTwoMonth)
          }else if(type == 29){  
              return Number(row.xzzNextTwoMonth)
          }else if(type == 30){ 
              return Number(row.fwbNextTwoMonth)
          }else if(type == 31){   //出苗下三月计划
              return Number(row.cmNextThreeMonth)
          }else if(type == 32){   
              return Number(row.zlNextThreeMonth)
          }else if(type == 33){  
              return Number(row.wxNextThreeMonth)
          }else if(type == 34){   
              return Number(row.xzzNextThreeMonth)
          }else if(type == 35){  
              return Number(row.fwbNextThreeMonth)
          }

      },

      /**************************全屏****************************/
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
      /********************自动计算表格高度************************/
      computedDOMHeight() {
        let curClientHeight = document.body.clientHeight  // 当前屏幕高度
        let pageContentHeight = curClientHeight - this.$refs.pageContent.getBoundingClientRect().top
        this.$refs.pageContent.style.height = (pageContentHeight - 10) + 'px'
        let contentHeadHeight = document.querySelectorAll('.content-head')[0].offsetHeight
        this.childTableHeight = pageContentHeight - contentHeadHeight - 50
      },

      //正整数校验
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

      //导出数据
      exportData() {  
        let data = this.$refs.xTable.getTableData()
        let tableData = this.exportCount(data.tableData)
        if(tableData.length == 0){
            this.$message.warning('无导出数据!')
            return
        }
        exportReport({
          url: 'sproutPlanEntry/exportSproutPlanEntryPageInfo',
          method: 'post',
          data: tableData,
          fileName: '出苗计划填报表'
        });
      },
      exportCount(data){
          let dataNew = data
          //console.log(data)
          for(let i=0; i<dataNew.length; i++){  
              dataNew[i].cmTotal = Number(dataNew[i].cmFirstWeek) + Number(dataNew[i].cmSecondWeek) + Number(dataNew[i].cmThirdWeek) + Number(dataNew[i].cmFourthWeek)
              dataNew[i].zlTotal = Number(dataNew[i].zlFirstWeek) + Number(dataNew[i].zlSecondWeek) + Number(dataNew[i].zlThirdWeek) + Number(dataNew[i].zlFourthWeek)
              dataNew[i].wxTotal = Number(dataNew[i].wxFirstWeek) + Number(dataNew[i].wxSecondWeek) + Number(dataNew[i].wxThirdWeek) + Number(dataNew[i].wxFourthWeek)
              dataNew[i].xzzTotal = Number(dataNew[i].xzzFirstWeek) + Number(dataNew[i].xzzSecondWeek) + Number(dataNew[i].xzzThirdWeek) + Number(dataNew[i].xzzFourthWeek)
              //其中调服务部1-7数
              dataNew[i].fwbFirstWeek = Number(dataNew[i].cmFirstWeek) - Number(dataNew[i].zlFirstWeek) - Number(dataNew[i].wxFirstWeek) - Number(dataNew[i].xzzFirstWeek)
              //其中调服务部8-15数
              dataNew[i].fwbSecondWeek = Number(dataNew[i].cmSecondWeek) - Number(dataNew[i].zlSecondWeek) - Number(dataNew[i].wxSecondWeek) - Number(dataNew[i].xzzSecondWeek)
              //其中调服务部15-21数
              dataNew[i].fwbThirdWeek = Number(dataNew[i].cmThirdWeek) - Number(dataNew[i].zlThirdWeek) - Number(dataNew[i].wxThirdWeek) - Number(dataNew[i].xzzThirdWeek)
              //其中调服务部22-月底数
              dataNew[i].fwbFourthWeek = Number(dataNew[i].cmFourthWeek) - Number(dataNew[i].zlFourthWeek) - Number(dataNew[i].wxFourthWeek) - Number(dataNew[i].xzzFourthWeek)
              //服务部合计
              dataNew[i].fwbTotal = Number(dataNew[i].fwbFirstWeek) + Number(dataNew[i].fwbSecondWeek) + Number(dataNew[i].fwbThirdWeek) + Number(dataNew[i].fwbFourthWeek)
             
              //下一月出苗计划其中调服务部数
              dataNew[i].fwbNextTwoMonth = Number(dataNew[i].cmNextTwoMonth) - Number(dataNew[i].zlNextTwoMonth) - Number(dataNew[i].wxNextTwoMonth) - Number(dataNew[i].xzzNextTwoMonth)
              //下二月出苗计划其中调服务部数
              dataNew[i].fwbNextThreeMonth = Number(dataNew[i].cmNextThreeMonth) - Number(dataNew[i].zlNextThreeMonth) - Number(dataNew[i].wxNextThreeMonth) - Number(dataNew[i].xzzNextThreeMonth)

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
          url: `/BUSINESSREPORT/sproutPlanEntry/importSproutPlanEntry`,
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

          let query = this.$route.query
          if(query.orgId){
              this.search.orgId = query.orgId
              let secondsTime = new Date(query.yearMonth).getTime()
              this.search.period = secondsTime
          }
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
              if(updateData[i].zlTotal == type){
                  if(num == 1){
                      updateData[i].cmTotal = total
                  }else if(num == 2){
                      updateData[i].zlTotal = total
                  }else if(num == 3){
                      updateData[i].wxTotal = total
                  }else if(num == 4){
                      updateData[i].xzzTotal = total
                  }else if(num == 5){
                      updateData[i].fwbTotal = total
                  }else if(num == 6){
                      updateData[i].fwbFirstWeek = total
                  }else if(num == 7){
                      updateData[i].fwbSecondWeek = total
                  }else if(num == 8){
                      updateData[i].fwbThirdWeek = total
                  }else if(num == 9){
                      updateData[i].fwbFourthWeek = total
                  }

              }
          }
      },
      //出苗小计
      countAmountCM (row, type) {
        if(type == 1){  //出苗小计
            let total =  this.$utils.toNumber(row.cmFirstWeek) + this.$utils.toNumber(row.cmSecondWeek) + this.$utils.toNumber(row.cmThirdWeek) + this.$utils.toNumber(row.cmFourthWeek)
            //this.changeTotal(row.zlTotal, total, 1)
            return total
        }else if(type == 2){  //自留保育
            let total =  this.$utils.toNumber(row.zlFirstWeek) + this.$utils.toNumber(row.zlSecondWeek) + this.$utils.toNumber(row.zlThirdWeek) + this.$utils.toNumber(row.zlFourthWeek)
            //this.changeTotal(row.zlTotal, total, 2)
            return total
        }else if(type == 3){  //外销猪苗
            let total =  this.$utils.toNumber(row.wxFirstWeek) + this.$utils.toNumber(row.wxSecondWeek) + this.$utils.toNumber(row.wxThirdWeek) + this.$utils.toNumber(row.wxFourthWeek)
            //this.changeTotal(row.zlTotal, total, 3)
            return total
        }else if(type == 4){  //7kg小种猪
            let total =  this.$utils.toNumber(row.xzzFirstWeek) + this.$utils.toNumber(row.xzzSecondWeek) + this.$utils.toNumber(row.xzzThirdWeek) + this.$utils.toNumber(row.xzzFourthWeek)
            //this.changeTotal(row.zlTotal, total, 4)
            return total
        }else if(type == 5){  //调服务部
            let total =  this.$utils.toNumber(row.fwbFirstWeek) + this.$utils.toNumber(row.fwbSecondWeek) + this.$utils.toNumber(row.fwbThirdWeek) + this.$utils.toNumber(row.fwbFourthWeek)
            //let total =  this.$utils.toNumber(row.cmTotal) - this.$utils.toNumber(row.zlTotal) - this.$utils.toNumber(row.wxTotal) - this.$utils.toNumber(row.xzzTotal)
            //this.changeTotal(row.zlTotal, total, 5)
            return total
        }else if(type == 6){  //1-7日出栏数
            let total =  this.$utils.toNumber(row.cmFirstWeek) - this.$utils.toNumber(row.zlFirstWeek) - this.$utils.toNumber(row.wxFirstWeek) - this.$utils.toNumber(row.xzzFirstWeek)
            return total
            //this.changeTotal(row.zlTotal, total, 6)
            //console.log(total)
            
        }else if(type == 7){  //8-14日出栏数
            let total =  this.$utils.toNumber(row.cmSecondWeek) - this.$utils.toNumber(row.zlSecondWeek) - this.$utils.toNumber(row.wxSecondWeek) - this.$utils.toNumber(row.xzzSecondWeek)
            //this.changeTotal(row.zlTotal, total, 7)
            return total
        }else if(type == 8){  //15-21日出栏数
            let total =  this.$utils.toNumber(row.cmThirdWeek) - this.$utils.toNumber(row.zlThirdWeek) - this.$utils.toNumber(row.wxThirdWeek) - this.$utils.toNumber(row.xzzThirdWeek)
            //this.changeTotal(row.zlTotal, total, 8)
            return total
        }else if(type == 9){  //22-30日出栏数
            let total =  this.$utils.toNumber(row.cmFourthWeek) - this.$utils.toNumber(row.zlFourthWeek) - this.$utils.toNumber(row.wxFourthWeek) - this.$utils.toNumber(row.xzzFourthWeek)
            //this.changeTotal(row.zlTotal, total, 9)
            return total
        }else if(type == 10){  //下一月出苗计划 其中调服务部
            let total =  this.$utils.toNumber(row.cmNextTwoMonth) - this.$utils.toNumber(row.zlNextTwoMonth) - this.$utils.toNumber(row.wxNextTwoMonth) - this.$utils.toNumber(row.xzzNextTwoMonth)
            //this.changeTotal(row.zlTotal, total, 9)
            return total
        }else if(type == 11){  //下二月出苗计划 其中调服务部
            let total =  this.$utils.toNumber(row.cmNextThreeMonth) - this.$utils.toNumber(row.zlNextThreeMonth) - this.$utils.toNumber(row.wxNextThreeMonth) - this.$utils.toNumber(row.xzzNextThreeMonth)
            //this.changeTotal(row.zlTotal, total, 9)
            return total
        }
         //
      },
      //获取罗马数据
      getLM(){
          request({
              url: `/BUSINESSREPORT/sproutPlanEntry/getCMJH`,
              method: 'get',
              params: {
                forgid: this.search.orgId,   //组织id
                period: this.formatDate1(this.search.period)  //业务期间
              }
          })
          .then(e => {
              if(e.status == 200){
                  let LMInfo = e.data.data
                  
                  //console.log(LMInfo)
                  //控制保存，提交按钮状态
                  if(e.data.isSave){
                      this.isSave = e.data.isSave
                  }
                  if(LMInfo.length){
                    let insertArr = []
                    for(let i=0; i<LMInfo.length; i++){
                      let obj = {}
                      obj.parvialFieldName = LMInfo[i].FCNAME
                      obj.parvialFieldId = LMInfo[i].FCID
                      obj.pigName = this.search.orgName
                      obj.pigId = this.search.orgId

                      obj.cmFirstWeek = (LMInfo[i].日龄1_7出栏 * 0.98).toFixed(0)
                      obj.cmSecondWeek = (LMInfo[i].日龄8_14出栏 * 0.96).toFixed(0)
                      obj.cmThirdWeek = (LMInfo[i].日龄15_21出栏 * 0.95).toFixed(0)
                      obj.cmFourthWeek = (LMInfo[i].日龄22_30出栏 * 0.94).toFixed(0)
                      //下二月出苗计划
                      obj.cmNextTwoMonth = Number(LMInfo[i].下下月1_7日出栏) + Number(LMInfo[i].下下月8_14日出栏) + Number(LMInfo[i].下下月15_21日出栏) + Number(LMInfo[i].下下月22_30日出栏)
                      //下三月出苗计划
                      obj.cmNextThreeMonth = Number(LMInfo[i].下下下月1_7日出栏) + Number(LMInfo[i].下下下月8_14日出栏) + Number(LMInfo[i].下下下月15_21日出栏) + Number(LMInfo[i].下下下月22_30日出栏)
                      
                      obj.pigId = this.search.orgId
                      obj.pigName = this.search.orgName
                      //console.log(obj)
                      insertArr.push(obj)   
                    }
                    this.insertZB = insertArr
                  }
                  this.brnStatus = false
              }
          })
      },

      /*********************************************************** */

      searchZB(){  //搜索
          this.tableData = []
          this.findZBList()
      },

      //获取主表列表
      findZBList(){
          request({
              url: `/BUSINESSREPORT/sproutPlan/queryPageInfo/1/100`,
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
                    //console.log(this.formData)

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
              url: `/BUSINESSREPORT/sproutPlanEntry/queryPageInfo/${pageNum}/${pageSize}`,
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
        checkC.orgLongNumber = this.search.orgLongNum
        checkC.createTime = this.createTime
        checkC.submitDate = this.submitDate
        check.push(checkC)

        //判断是否导入
        if(this.isImport){
            let importData = this.$refs.xTable.getTableData().tableData
            console.log(this.recordData)
            console.log(importData)
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
                check[0].sproutPlanEntryList = [...sendRecordData, ...importData, ...this.delZBRable]
            }
        }else{
            //整个子表提交数据
            if (insertRecords.length || removeRecords.length || updateRecords.length) {
                check[0].sproutPlanEntryList = [...insertRecords, ...updateRecords, ...this.delZBRable]  //子表的数据
            } else {
                check[0].sproutPlanEntryList = []
                if(!this.parentTableData.length){
                    this.$XModal.message({ message: `子表无数据`, status: 'error' })
                    return;
                }
            }
        }

        //转换主表计划期间时间格式
        for(let i=0; i<check.length; i++){
            check[i].period = this.formatDate1(check[i].period)
        }
        //console.log(check)
        this.$refs.xTable.validate(valid => {
            check[0].status = status1

            let data = this.count(check)
            if(data == undefined){
                return;
            }
            
            if (valid) {
              request({
                  url: '/BUSINESSREPORT/sproutPlan/save',
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
          let dataNew = data[0].sproutPlanEntryList
          //console.log(data)
          for(let i=0; i<dataNew.length; i++){  
              dataNew[i].cmTotal = Number(dataNew[i].cmFirstWeek) + Number(dataNew[i].cmSecondWeek) + Number(dataNew[i].cmThirdWeek) + Number(dataNew[i].cmFourthWeek)
              dataNew[i].zlTotal = Number(dataNew[i].zlFirstWeek) + Number(dataNew[i].zlSecondWeek) + Number(dataNew[i].zlThirdWeek) + Number(dataNew[i].zlFourthWeek)
              dataNew[i].wxTotal = Number(dataNew[i].wxFirstWeek) + Number(dataNew[i].wxSecondWeek) + Number(dataNew[i].wxThirdWeek) + Number(dataNew[i].wxFourthWeek)
              dataNew[i].xzzTotal = Number(dataNew[i].xzzFirstWeek) + Number(dataNew[i].xzzSecondWeek) + Number(dataNew[i].xzzThirdWeek) + Number(dataNew[i].xzzFourthWeek)
              //其中调服务部1-7数
              dataNew[i].fwbFirstWeek = Number(dataNew[i].cmFirstWeek) - Number(dataNew[i].zlFirstWeek) - Number(dataNew[i].wxFirstWeek) - Number(dataNew[i].xzzFirstWeek)
              //其中调服务部8-15数
              dataNew[i].fwbSecondWeek = Number(dataNew[i].cmSecondWeek) - Number(dataNew[i].zlSecondWeek) - Number(dataNew[i].wxSecondWeek) - Number(dataNew[i].xzzSecondWeek)
              //其中调服务部15-21数
              dataNew[i].fwbThirdWeek = Number(dataNew[i].cmThirdWeek) - Number(dataNew[i].zlThirdWeek) - Number(dataNew[i].wxThirdWeek) - Number(dataNew[i].xzzThirdWeek)
              //其中调服务部22-月底数
              dataNew[i].fwbFourthWeek = Number(dataNew[i].cmFourthWeek) - Number(dataNew[i].zlFourthWeek) - Number(dataNew[i].wxFourthWeek) - Number(dataNew[i].xzzFourthWeek)
              //服务部合计
              dataNew[i].fwbTotal = Number(dataNew[i].fwbFirstWeek) + Number(dataNew[i].fwbSecondWeek) + Number(dataNew[i].fwbThirdWeek) + Number(dataNew[i].fwbFourthWeek)
             
              //下一月出苗计划其中调服务部数
              dataNew[i].fwbNextTwoMonth = Number(dataNew[i].cmNextTwoMonth) - Number(dataNew[i].zlNextTwoMonth) - Number(dataNew[i].wxNextTwoMonth) - Number(dataNew[i].xzzNextTwoMonth)
              //下二月出苗计划其中调服务部数
              dataNew[i].fwbNextThreeMonth = Number(dataNew[i].cmNextThreeMonth) - Number(dataNew[i].zlNextThreeMonth) - Number(dataNew[i].wxNextThreeMonth) - Number(dataNew[i].xzzNextThreeMonth)

              if(dataNew[i].fwbFirstWeek < 0){
                  this.$XModal.message({ message: `第${i+1}行，其中调服务部：1-7出栏数不能为负数`, status: 'error' })
                  return;
              }
              if(dataNew[i].fwbSecondWeek < 0){
                  this.$XModal.message({ message: `第${i+1}行，其中调服务部：8-14出栏数不能为负数`, status: 'error' })
                  return;
              }
              if(dataNew[i].fwbThirdWeek < 0){
                  this.$XModal.message({ message: `第${i+1}行，其中调服务部：15-21出栏数不能为负数`, status: 'error' })
                  return;
              }
              if(dataNew[i].fwbFourthWeek < 0){
                  this.$XModal.message({ message: `第${i+1}行，其中调服务部：22-月底出栏数不能为负数`, status: 'error' })
                  return;
              }
              if(dataNew[i].fwbNextTwoMonth < 0){
                  this.$XModal.message({ message: `第${i+1}行，下一月其中调服务部：不能为负数`, status: 'error' })
                  return;
              }
              if(dataNew[i].fwbNextThreeMonth < 0){
                  this.$XModal.message({ message: `第${i+1}行，下二月其中调服务部：不能为负数`, status: 'error' })
                  return;
              }
              
          }
          //console.log(dataNew)
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
      /**************************************************************** */

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
              url: '/BUSINESSREPORT/sproutPlan/delete',
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
                  //this.delZBRable = delDataArr
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

      //子表插入
      insertEvent() {
        const record = this.insertZB
        //console.log(this.insertZB)
        this.$refs.xTable.insert(record)
          .then(({ row }) => this.$refs.xTable.setActiveCell(row, 'type'))
      },

      getSelectLabel (value, list, valueProp = 'value', labelField = 'label') {
        let item = this.$utils.find(list, item => item[valueProp] === value)
        return item ? item[labelField] : null
      },
      //返回
      goBack(){
          this.$router.push('/seedlingPlanDetails/index')
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
