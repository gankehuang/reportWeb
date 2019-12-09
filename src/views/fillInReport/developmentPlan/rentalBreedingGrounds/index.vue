<template>
  <div v-loading.lock="fullscreenLoading">
    <formTitle title="已租赁猪场管理计划及追踪">
      <div slot="context">
        <page-form v-bind="formOptions" :model="formData" :editable="false" ref="PageForm"></page-form>
      </div>
      <div slot="title-suffix">
        <el-button class="sav-btn"
                   size="small"
                   :disabled="loading"
                   @click="validEvent('save')"
                   plain
                   v-if="curStatus == 0 && checkReportIsSave">保存
        </el-button>
        <el-button size="small"
                   class="sub-btn"
                   :disabled="loading"
                   @click="validEvent('submit')"
                   plain
                   v-if="curStatus == 0">提交
        </el-button>
        <el-button size="small"
                   class="audit-btn"
                   :disabled="loading"
                   @click="saveEvent('toExamine')"
                   plain
                   v-if="curStatus == 1">审核
        </el-button>
        <el-button size="small"
                   class="noAudit-btn"
                   :disabled="loading"
                   @click="saveEvent('backToExamine')"
                   plain
                   v-if="curStatus == 2 && !ifAedit">反审核
        </el-button>
        <el-button size="small"
                   :disabled="loading"
                   @click="saveEvent('feedback')"
                   plain
                   v-if="curStatus == 2">反馈
        </el-button>
      </div>
    </formTitle>
    
    <!-- 表内容 -->
    <div class="page-content" ref="pageContent">
      <el-row class="content-head" type="flex" align="middle">
        <el-col :span="12">
          <span class="dot"></span>
          <span class="title">子表信息</span>
        </el-col>
        <el-col :span="12" class="content-head-right">
          <el-button @click="insertChildren"
                     :disabled="loading"
                     class="add-btn"
                     size="small">新增行
          </el-button>
          <el-button @click="delEntryEvent"
                     class="del-btn"
                     :disabled="loading"
                     size="small">删除行
          </el-button>
          <el-button @click="exportDataEvent"
                     size="small"
                     class="export-btn"
                     icon="el-icon-upload2">导出
          </el-button>
          
          <el-upload
            style="display:inline-block;margin-left:10px;"
            ref="upload"
            :limit="1"
            :show-file-list="false"
            action="/leaseFarmFeedback/excelUpload"
            accept=".xls,.xlsx"
            :http-request="importDataEvent"
            :file-list="fileList">
            <el-button
              v-if="curStatus == 0 && checkReportIsSave"
              icon="el-icon-download"
              size="small"
              class="import-btn">导入</el-button>
          </el-upload>
          
          <!--          <el-button size="small" icon="el-icon-rank" @click="handleFullscreen">{{fullscreen?'退出全屏':'全屏'}}-->
          <!--          </el-button>-->
        </el-col>
      </el-row>
      
      <vxe-table
        ref="xTable"
        :data="tableData"
        border
        resizable
        :edit-config="{trigger: 'click', mode: 'cell', activeMethod: activeCellMethod}"
        :edit-rules="validRules"
        @select-all="selectAllEntry"
        @select-change="selectChangeEntry"
        @edit-closed="editClose"
        :footer-method="footerMethod"
        show-footer
        :height="childTableHeight">
        <vxe-table-column type="checkbox" width="60" align="center" fixed="left"></vxe-table-column>
        <vxe-table-column type="index" title="序号" width="60" fixed="left"></vxe-table-column>
        <vxe-table-column field="areaName" title="片区" min-width="130" fixed="left"></vxe-table-column>
        <vxe-table-column
          field="whichWeek"
          min-width="120"
          title="业务周"
          :edit-render="{type: 'default'}">
          <template v-slot:edit="scope">
            <el-select v-model="scope.row.whichWeek">
              <el-option v-for="item in roleList"
                         :key="item.value"
                         :label="item.label"
                         :value="item.value"></el-option>
            </el-select>
          </template>
          <template v-slot="{ row }">{{ getSelectLabel(row.whichWeek, roleList) }}</template>
        </vxe-table-column>
        <vxe-table-column
          field="branchOfficeName"
          title="分公司"
          min-width="140"
          :edit-render="{name: 'input'}">
        </vxe-table-column>
        <vxe-table-column
          field="pigFarm"
          title="猪场"
          min-width="140"
          :edit-render="{name: 'input'}">
        </vxe-table-column>
        <vxe-table-column
          field="geographicLocation"
          title="地理位置"
          min-width="140"
          :edit-render="{name: 'input'}">
        </vxe-table-column>
        <vxe-table-column title="租赁情况">
          <vxe-table-column
            title="出租方名称"
            field="lessorName"
            :edit-render="{name: 'input'}"
            min-width="140">
          </vxe-table-column>
          <vxe-table-column
            field="contractDate"
            title="合同签订日期"
            min-width="170"
            :edit-render="{name: 'default'}">
            <template v-slot:edit="{ row }">
              <el-date-picker
                v-model="row.contractDate"
                type="date"
                format="yyyy-MM-dd"
                value-format="timestamp"
                style="width: 100%;"
              ></el-date-picker>
            </template>
            <template v-slot="{ row }">{{formatDate(row.contractDate,'yyyy-MM-dd')}}</template>
          </vxe-table-column>
          <vxe-table-column
            field="originalSowSize"
            title="原母猪规模(头)"
            min-width="140"
            :edit-render="{name: 'input'}"
            align="right">
            <template v-slot:edit="{row}">
              <el-input
                type="number"
                v-model="row.originalSowSize"
                @wheel.native.prevent="stopScrollFun($event)">
              </el-input>
            </template>
          </vxe-table-column>
          <vxe-table-column
            field="rawFatPigScale"
            title="原肥猪规模(头)"
            min-width="140"
            :edit-render="{name: 'input'}"
            align="right">
            <template v-slot:edit="{row}">
              <el-input
                type="number"
                v-model="row.rawFatPigScale"
                @wheel.native.prevent="stopScrollFun($event)">
              </el-input>
            </template>
          </vxe-table-column>
          <vxe-table-column
            field="annualRent"
            title="年租金（万元）"
            min-width="140"
            :edit-render="{name: 'input'}"
            align="right">
            <template v-slot:edit="{row}">
              <el-input
                type="number"
                v-model="row.annualRent"
                @wheel.native.prevent="stopScrollFun($event)">
              </el-input>
            </template>
          </vxe-table-column>
          <vxe-table-column
            field="rentPaymentMethod"
            title="租金支付方式"
            min-width="140"
            :edit-render="{name: 'input'}">
          </vxe-table-column>
          <vxe-table-column
            field="startDate"
            title="开始计租日期"
            min-width="170"
            :edit-render="{name: 'default'}">
            <template v-slot:edit="{ row }">
              <el-date-picker
                v-model="row.startDate"
                type="date"
                format="yyyy-MM-dd"
                value-format="timestamp"
                style="width: 100%;"
              ></el-date-picker>
            </template>
            <template v-slot="{ row }">{{formatDate(row.startDate,'yyyy-MM-dd')}}</template>
          </vxe-table-column>
          <vxe-table-column
            field="toDateOfrent"
            title="到租日期"
            min-width="170"
            :edit-render="{name: 'default'}">
            <template v-slot:edit="{ row }">
              <el-date-picker
                v-model="row.toDateOfrent"
                type="date"
                format="yyyy-MM-dd"
                value-format="timestamp"
                style="width: 100%;">
              </el-date-picker>
            </template>
            <template v-slot="{ row }">{{formatDate(row.toDateOfrent,'yyyy-MM-dd')}}</template>
          </vxe-table-column>
          <vxe-table-column
            field="depositPaid"
            title="已付定金/预付定金（万元）"
            min-width="120"
            :edit-render="{name: 'input'}"
            align="right">
            <template v-slot:edit="{row}">
              <el-input
                type="number"
                v-model="row.depositPaid"
                @wheel.native.prevent="stopScrollFun($event)">
              </el-input>
            </template>
          </vxe-table-column>
          <vxe-table-column
            field="payPrice"
            title="已付租金（万元）"
            min-width="120"
            :edit-render="{name: 'input'}"
            align="right">
            <template v-slot:edit="{row}">
              <el-input
                type="number"
                v-model="row.payPrice"
                @wheel.native.prevent="stopScrollFun($event)">
              </el-input>
            </template>
          </vxe-table-column>
          <vxe-table-column
            field="manager"
            title="具体经办人"
            width="120"
            :edit-render="{name: 'input'}">
          </vxe-table-column>
        </vxe-table-column>
        <vxe-table-column title="改造计划">
          <vxe-table-column
            field="whetherTransform"
            title="是否需要改造"
            min-width="120"
            :edit-render="{name: 'default'}">
            <template v-slot:edit="scope">
              <el-select v-model="scope.row.whetherTransform">
                <el-option
                  v-for="item in isTrans"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </template>
            <template v-slot="{ row }">{{ getSelectLabel(row.whetherTransform, isTrans) }}</template>
          </vxe-table-column>
          <vxe-table-column
            field="transformationMethod"
            title="改造方式"
            min-width="120"
            :edit-render="{name: 'default'}">
            <template v-slot:edit="scope">
              <el-select
                v-model="scope.row.transformationMethod"
                v-if="scope.row.whetherTransform === '1'">
                <el-option
                  v-for="item in TransformationWays"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </template>
            <template v-slot="{ row }">
              <span v-if="row.whetherTransform === '1'">
                {{ getSelectLabel(row.transformationMethod, TransformationWays) }}
              </span>
            </template>
          </vxe-table-column>
          <vxe-table-column
            field="reformerName"
            title="改造方"
            min-width="150"
            :edit-render="{name: 'default'}">
            <template v-slot:edit="{ row }">
              <el-input v-model="row.reformerName" v-if="row.whetherTransform === '1'"></el-input>
            </template>
            <template v-slot="{row}">
              <span v-if="row.whetherTransform === '1'">{{row.reformerName}}</span>
            </template>
          </vxe-table-column>
          <vxe-table-column
            field="plannedStartDate"
            title="计划开工日期"
            min-width="170"
            :edit-render="{name: 'default'}">
            <template v-slot:edit="{ row }">
              <el-date-picker
                v-model="row.plannedStartDate"
                type="date"
                format="yyyy-MM-dd"
                value-format="timestamp"
                style="width: 100%;"
                v-if="row.whetherTransform === '1'">
              </el-date-picker>
            </template>
            <template v-slot="{ row }">
              <span v-if="row.whetherTransform === '1'">{{formatDate(row.plannedStartDate,'yyyy-MM-dd')}}</span>
            </template>
          </vxe-table-column>
          <vxe-table-column
            field="plannedCompletionDate"
            title="计划完工日期"
            min-width="170"
            :edit-render="{name: 'default'}">
            <template v-slot:edit="{ row }">
              <el-date-picker
                v-model="row.plannedCompletionDate"
                type="date"
                format="yyyy-MM-dd"
                value-format="timestamp"
                style="width: 100%;"
                v-if="row.whetherTransform === '1'">
              </el-date-picker>
            </template>
            <template v-slot="{ row }">
              <span v-if="row.whetherTransform === '1'">{{formatDate(row.plannedCompletionDate,'yyyy-MM-dd')}}</span>
            </template>
          </vxe-table-column>
          <vxe-table-column
            field="sowSize"
            title="改造后母猪规模（头）"
            min-width="120"
            :edit-render="{name: 'default'}"
            align="right">
            <template v-slot:edit="{row}">
              <el-input
                type="number"
                v-model="row.sowSize"
                v-if="row.whetherTransform === '1'"
                @wheel.native.prevent="stopScrollFun($event)">
              </el-input>
            </template>
            <template v-slot="{row}">
              <span v-if="row.whetherTransform === '1'">{{row.sowSize}}</span>
            </template>
          </vxe-table-column>
          <vxe-table-column
            field="scaleFatPig"
            title="改造后肥猪规模（头）"
            min-width="120"
            :edit-render="{name: 'default'}"
            align="right">
            <template v-slot:edit="{row}">
              <el-input
                type="number"
                v-model="row.scaleFatPig"
                v-if="row.whetherTransform === '1'"
                @wheel.native.prevent="stopScrollFun($event)">
              </el-input>
            </template>
            <template v-slot="{row}">
              <span v-if="row.whetherTransform === '1'">{{row.scaleFatPig}}</span>
            </template>
          </vxe-table-column>
        </vxe-table-column>
        <vxe-table-column title="退租计划">
          <vxe-table-column
            field="ehetherRent"
            title="是否退租"
            min-width="150"
            :edit-render="{name: 'select', options: isHire }">
            <template v-slot:edit="scope">
              <el-select v-model="scope.row.ehetherRent">
                <el-option
                  v-for="item in isHire"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </template>
            <template v-slot="{ row }">{{ getSelectLabel(row.ehetherRent, isHire) }}</template>
          </vxe-table-column>
          <vxe-table-column
            field="withdrawalDate"
            title="退租日期"
            min-width="170"
            :edit-render="{name: 'default'}">
            <template v-slot:edit="{ row }">
              <el-date-picker
                v-model="row.withdrawalDate"
                type="date"
                format="yyyy-MM-dd"
                value-format="timestamp"
                style="width: 100%;"
                v-if="row.ehetherRent === '1'">
              </el-date-picker>
            </template>
            <template v-slot="{ row }">
              <span v-if="row.ehetherRent === '1'">{{formatDate(row.withdrawalDate,'yyyy-MM-dd')}}</span>
            </template>
          </vxe-table-column>
        </vxe-table-column>
        <vxe-table-column title="改造完成情况">
          <vxe-table-column
            field="reformCompleteDate"
            title="实际完工日期"
            min-width="170"
            :edit-render="{name: 'default'}">
            <template v-slot:edit="{ row }">
              <el-date-picker
                v-model="row.reformCompleteDate"
                type="date"
                format="yyyy-MM-dd"
                value-format="timestamp"
                style="width: 100%;">
              </el-date-picker>
            </template>
            <template v-slot="{ row }">
              <span>{{formatDate(row.reformCompleteDate,'yyyy-MM-dd')}}</span>
            </template>
          </vxe-table-column>
          <vxe-table-column
            field="reformCompleteSow"
            title="改造后母猪规模(头)"
            align="right"
            min-width="120"
            :edit-render="{name: 'default'}">
            <template v-slot:edit="{row}">
              <el-input
                type="number"
                v-model="row.reformCompleteSow"
                @wheel.native.prevent="stopScrollFun($event)">
              </el-input>
            </template>
            <template v-slot="{row}">
              <span>{{row.reformCompleteSow}}</span>
            </template>
          </vxe-table-column>
          <vxe-table-column
            field="reformCompleteFatPig"
            title="改造后肥猪规模(头)"
            min-width="120"
            align="right"
            :edit-render="{name: 'default'}">
            <template v-slot:edit="{row}">
              <el-input
                type="number"
                v-model="row.reformCompleteFatPig"
                @wheel.native.prevent="stopScrollFun($event)">
              </el-input>
            </template>
            <template v-slot="{row}">
              <span>{{row.reformCompleteFatPig}}</span>
            </template>
          </vxe-table-column>
        </vxe-table-column>
        <vxe-table-column title="投产计划">
          <vxe-table-column
            field="startIntroductionDate"
            title="开始引种日期"
            min-width="170"
            :edit-render="{name: 'default'}">
            <template v-slot:edit="{ row }">
              <el-date-picker
                v-model="row.startIntroductionDate"
                type="date"
                format="yyyy-MM-dd"
                value-format="timestamp"
                style="width: 100%;">
              </el-date-picker>
            </template>
            <template v-slot="{ row }">{{formatDate(row.startIntroductionDate,'yyyy-MM-dd')}}</template>
          </vxe-table-column>
          <vxe-table-column
            field="sourceField"
            title="引种来源场"
            width="120"
            :edit-render="{name: 'input'}">
          </vxe-table-column>
          <vxe-table-column
            field="fieldLengthArriva"
            title="场长到岗时间（已到岗写姓名）"
            min-width="170"
            :edit-render="{name: 'input'}">
          </vxe-table-column>
          <vxe-table-column
            field="breedingDirector"
            title="配种主任到岗时间（已到岗写姓名）"
            min-width="170"
            :edit-render="{name: 'input'}">
          </vxe-table-column>
          <vxe-table-column
            field="deliveryDirector"
            title="分娩主任到岗时间（已到岗写姓名）"
            min-width="170"
            :edit-render="{name: 'input'}">
          </vxe-table-column>
        </vxe-table-column>
        <vxe-table-column
          field="remarks"
          title="备注"
          min-width="140"
          :edit-render="{name: 'input'}">
        </vxe-table-column>
      </vxe-table>
    </div>
  </div>
</template>
<script>
  import {
    add,
    getAll,
    update,
    unAudit,
    audit,
    feedback,
    importReport
  } from '@/api/rentalBreedingGrounds/index'
  import {mapGetters} from 'vuex'
  import formTitle from '@/components/formTitle/formTitle'
  import PageForm from '@/components/form/Form'
  import {changeTwoDecimal2} from '@/utils/index'
  import {exportReport} from '@/utils/export'

  export default {
    name: 'rentalBreedingGrounds',
    components: {
      formTitle,
      PageForm
    },
    data() {
      return {
        fileList: [],
        searchForm: {
          orgName: '',
          orgId: '',
          period: ''
        },
        curStatus: 0,
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
              fontStyle: {color: '#2BB687'},
              valueFormat: true
            }
          ]
        },
        loading: false,
        fullscreenLoading: false,
        mainTableData: {},
        tableData: [],
        fullscreen: false,
        formData: {},
        childTableHeight: 300,
        TransformationWays: [
          {
            label: '改建',
            value: 0
          },
          {
            label: '重建',
            value: 1
          },
          {
            label: '扩建',
            value: 2
          }
        ],
        roleList: [
          {
            label: '第一周',
            value: 1
          },
          {
            label: '第二周',
            value: 2
          },
          {
            label: '第三周',
            value: 3
          },
          {
            label: '第四周',
            value: 4
          }
        ],
        validRules: {
          whichWeek: [{required: true, message: '业务周必须填写！'}],
          branchOfficeName: [
            {required: true, message: '分公司必须填写！'}
          ],
          geographicLocation: [
            {required: true, message: '地理位置必须填写！'}
          ],
          lessorName: [
            {required: true, message: '出租方名称必须填写！'}
          ],
          contractDate: [
            {required: true, message: '合同签订日期必须填写！'}
          ],
          pigFarm: [{required: true, message: '猪场必须填写！'}],
          originalSowSize: [
            {required: true, message: '原母猪规模必须填写！'}
          ],
          rawFatPigScale: [
            {required: true, message: '原肥猪规模必须填写！'}
          ],
          annualRent: [{required: true, message: '年租金必须填写！'}],
          rentPaymentMethod: [
            {required: true, message: '租金支付方式必须填写！'}
          ],
          startDate: [
            {required: true, message: '开始计租日期必须填写！'}
          ],
          toDateOfrent: [
            {required: true, message: '到租日期必须填写！'}
          ],
          depositPaid: [
            {required: true, message: '已付定金/预付租金必须填写！'}
          ],
          payPrice: [{required: true, message: '已付租金必须填写！'}],
          manager: [{required: true, message: '具体经办人必须填写！'}],
          whetherTransform: [
            {required: true, message: '是否需要改造必须填写！'}
          ],
          ehetherRent: [
            {required: true, message: '是否退租必须填写！'}
          ],
          startIntroductionDate: [{required: true, message: '开始引种日期必须填写！'}],
          sourceField: [
            {required: true, message: '引种来源场必须填写！'}
          ],
          fieldLengthArriva: [
            {required: true, message: '场长到岗时间必须填写！'}
          ],
          breedingDirector: [
            {required: true, message: '配种主任到岗时间必须填写！'}
          ],
          deliveryDirector: [
            {required: true, message: '分娩主任到岗时间必须填写！'}
          ]
        },
        isHire: [
          {
            label: '是',
            value: '1'
          },
          {
            label: '否',
            value: '0'
          }
        ],
        isTrans: [
          {
            label: '是',
            value: '1'
          },
          {
            label: '否',
            value: '0'
          }
        ],
        statusList: [
          {
            label: '已保存',
            value: 0
          },
          {
            label: '已提交',
            value: 1
          },
          {
            label: '已审核',
            value: 2
          }
        ],
        ifAedit: 1,  // 判断报表是否可以反审核
        checkReportIsSave: true,  // 判断报表是否可以保存
        delectIds: [],  // 所有删除有Id的数组
        curSelect_XIDArr: []  // 当前次选中有_XID的数组
      }
    },
    computed: {
      ...mapGetters(['orgInfo', 'planYearMonth'])
    },
    watch: {
      orgInfo(newVal, oldVal) { // 动态监听切换组织
        this.searchForm.orgId = newVal.id;
        this.searchForm.orgName = newVal.name;
        this.getList();
      },
      planYearMonth(newVal, oldVal) {  // 动态监听计划期间
        this.searchForm.period = newVal;
        this.getList();
      }
    },
    created() {
      this.initData();
      this.getList();
    },
    activated() {
      this.$nextTick(() => {
        this.computedDOMHeight()
      })
    },
    destroyed() {
      window.removeEventListener('resize', this.computedDOMHeight, false)
    },
    mounted() {
      this.$nextTick(() => {  // 根据当前屏幕高度计算子表内容区高度
        this.computedDOMHeight();
        this._onFullscreenchange(); // 监听全屏
        window.addEventListener('resize', this.computedDOMHeight, false)
      });
    },
    methods: {
      initData() {  // 初始化数据
        if (this.orgInfo && this.orgInfo.id) { //获取默认orgId
          this.searchForm.orgId = this.orgInfo.id;
          this.searchForm.orgName = this.orgInfo.name
        } else {
          this.$message.warning('请选择组织!')
        }

        if (this.planYearMonth) {
          this.searchForm.period = this.planYearMonth
        } else {
          this.$message.warning('请选择计划期间!')
        }
      },
      getList() {  // 获取页面信息
        if (!this.searchForm.orgId) {
          this.$message({
            message: '请选择组织！',
            type: 'warning'
          });
          return
        }

        if (!this.searchForm.period) {
          this.$message({
            message: '请选择业务期间',
            type: 'warning'
          });
          return
        }

        this.fullscreenLoading = true;
        this.delectIds = [];
        getAll(this.searchForm)
          .then(res => {
            this.fullscreenLoading = false;
            if (res.status === 200) {
              this.checkReportIsSave = true;
              this.ifAedit = res.data.ifAedit;

              this._transformData(res.data);
            } else {
              this.checkReportIsSave = false;
            }
          })
          .catch(() => {
            this.fullscreenLoading = false;
          })
      },
      _transformData(data) {  // 转化数据
        if (data.length) {
          this.mainTableData = data[0].lord;
          this.curStatus = this.mainTableData.status;
          this.formData = {
            submiterName: this.mainTableData.submiterName,
            submitDate: this.mainTableData.submitDate ? this.formatDate(this.mainTableData.submitDate, 'yyyy-MM') : '',
            appover: this.mainTableData.appover,
            appoverDate: this.mainTableData.appoverDate ? this.formatDate(this.mainTableData.appoverDate, 'yyyy-MM') : '',
            status: this.mainTableData.status,
            creatorTime: this.mainTableData.creatorTime,
            planPeriod: this.mainTableData.planPeriod
          };

          this.tableData = data[0].entrys;

        } else {
          this.mainTableData = {};
          this.curStatus = 0;
          this.tableData = []
        }
      },
      insertChildren() {  // 子表插入一行
        if (this.curStatus !== 0) {
          this.$message.warning('当前状态下不能新增子表！');

          return;
        }

        let record = {areaName: this.searchForm.orgName};

        this.$refs.xTable
          .insert(record)
          .then(({row}) => this.getInsertEvent());

      },
      getInsertEvent() {  // 获取新增的子表
        let insertRecords = this.$refs.xTable.getInsertRecords();
        this.tableData.unshift(insertRecords[0]);
      },
      delEntryEvent() {
        if (this.curStatus !== 0) {
          this.$message.warning('当前状态不能删除子表行！');

          return;
        }

        let i = this.tableData.length;
        while (i--) {
          if (this.curSelect_XIDArr.includes(this.tableData[i]._XID)) {
            if (this.tableData[i].id) {
              this.delectIds.push(this.tableData[i].id)
            }

            this.tableData.splice(i, 1);
          }
        }
      },
      selectAllEntry(data) {
        this._operateSelectChildTable(data);
      },
      selectChangeEntry(data) {
        this._operateSelectChildTable(data);
      },
      _operateSelectChildTable(data) {
        this.curSelect_XIDArr = [];

        data.selection.forEach((item, index) => {
          this.curSelect_XIDArr.push(item._XID);
        });
      },
      stopScrollFun(evt) { //禁止滚动
        evt = evt || window.event;
        if (evt.preventDefault) {
          // Firefox
          evt.preventDefault();
          evt.stopPropagation()
        } else {
          // IE
          evt.cancelBubble = true;
          evt.returnValue = false
        }
        return false
      },
      validEvent(item) {  // 保存时校验
        this.$refs.xTable.validate(valid => {
          if (valid) {
            if (!this.tableData.length) {
              this.$message.warning("子表数据不能为空");
              return;
            }
            this.saveEvent(item)
          } else {
            this.$XModal.message({
              status: 'error',
              message: '校验不通过！'
            })
          }
        })
      },
      saveEvent(operateType) {
        this.loading = true;
        let commitData = {
          delectIds: this.delectIds,
          lord: this.mainTableData,
          entrys: this.tableData
        };

        if (operateType === 'save') {
          commitData.lord.status = 0;
          commitData.lord.orgId = this.orgInfo.id;
          commitData.lord.period = this.planYearMonth;

          update([commitData])
            .then(res => {
              this.loading = false;
              if (res.status === 200) {
                this.$message.success('操作成功！');
                this.mainTableData = {};
                this.getList();
              }
            })
            .catch(() => {
              this.loading = false;
            })

        } else if (operateType === 'submit') {
          commitData.lord.submitDate = new Date().getTime();
          commitData.lord.submiter = this.$store.getters.userId;
          commitData.lord.submiterName = this.$store.getters.name;
          commitData.lord.status = 1;
          update([commitData])
            .then(res => {
              this.loading = false;
              if (res.status === 200) {
                this.$message.success('操作成功！');
                this.getList();
              }
            })
            .catch(() => {
              this.loading = false;
            })
        } else if (operateType === 'toExamine') {
          audit(commitData)
            .then(res => {
              this.loading = false;
              if (res.status === 200) {
                this.$message.success('操作成功！');
                this.getList();
              }
            })
            .catch(() => {
              this.loading = false;
            })
        } else if (operateType === 'backToExamine') {
          unAudit(commitData)
            .then(res => {
              this.loading = false;
              if (res.status === 200) {
                this.$message.success('操作成功！');
                this.getList();
              }
            })
            .catch(() => {
              this.loading = false;
            })
        } else if (operateType === 'feedback') {
          feedback(commitData)
            .then(res => {
              this.loading = false;
              if (res.status === 200) {
                this.$message.success('操作成功！');
                this.getList();
              }
            })
            .catch(() => {
              this.loading = false
            })
        }
      },
      formatDate(value, format) {  // 格式化时间
        return this.$utils.toDateString(value, format)
      },
      getSelectLabel(value, list, valueProp = 'value', labelField = 'label') {
        let item = this.$utils.find(
          list,
          item => item[valueProp] === value
        );
        return item ? item[labelField] : null
      },
      footerMethod({columns, data}) {
        return [
          columns.map((column, columnIndex) => {
            if (columnIndex === 0) {
              return '合计';
            }
            if (['originalSowSize', 'actualArrivalAmount',
              'rawFatPigScale', 'annualRent',
              'depositPaid', 'payPrice',
              'sowSize', 'scaleFatPig',
              'reformCompleteSow', 'reformCompleteFatPig'].includes(column.property)) {
              let result = this.$utils.sum(data, column.property);
              if (result) {
                return parseInt(result)
              } else {
                return 0;
              }

            }
            return '-'
          }),
        ]
      },
      editClose({row, rowIndex, $rowIndex, column, columnIndex, $columnIndex, cell}) { // 输入校验
        let regTest = /^[1-9]\d*$/;

        if (column.property === 'originalSowSize') {
          if (!/^(\d+)*$/.test(row.originalSowSize)) {
            this.$message.warning('请输入正整数')
            row.originalSowSize = ''
          }

          return
        }

        if (column.property === 'rawFatPigScale') {
          if (!/^(\d+)*$/.test(row.rawFatPigScale)) {
            this.$message.warning('请输入正整数')
            row.rawFatPigScale = ''
          }

          return
        }

        if (column.property === 'annualRent') {
          if (row.annualRent < 0) {
            this.$message.warning('请输入正数')
            row.annualRent = ''
          } else {
            row.annualRent = changeTwoDecimal2(row.annualRent)
          }

          return
        }


        if (column.property === 'annualRent') {
          if (row.annualRent < 0) {
            this.$message.warning('请输入正数')
            row.annualRent = ''
          } else {
            row.annualRent = changeTwoDecimal2(row.annualRent)
          }

          return
        }

        if (column.property === 'originalSowSize') {
          if (!regTest.test(row.originalSowSize)) {
            this.$message.warning('请输入正整数')
            row.originalSowSize = ''
          }

          return
        }

        if (column.property === 'rawFatPigScale') {
          if (!regTest.test(row.rawFatPigScale)) {
            this.$message.warning('请输入正整数')
            row.rawFatPigScale = ''
          }

          return
        }

        if (column.property === 'depositPaid') {
          if (row.depositPaid < 0) {
            this.$message.warning('请输入正数')
            row.depositPaid = ''
          } else {
            row.depositPaid = changeTwoDecimal2(row.depositPaid)
          }

          return
        }

        if (column.property === 'payPrice') {
          if (row.payPrice < 0) {
            this.$message.warning('请输入正数')
            row.payPrice = ''
          } else {
            row.payPrice = changeTwoDecimal2(row.payPrice)
          }

          return
        }

        if (column.property === 'sowSize') {
          if (!regTest.test(row.sowSize)) {
            this.$message.warning('请输入正整数')
            row.sowSize = ''
          }

          return
        }

        if (column.property === 'scaleFatPig') {
          if (!regTest.test(row.scaleFatPig)) {
            this.$message.warning('请输入正整数')
            row.scaleFatPig = ''
          }
        }
      },
      activeCellMethod({row, rowIndex, column, columnIndex}) {  // 是否可以输入
        if (this.curStatus == 0) {
          if (column.property === 'reformCompleteDate' ||
            column.property === 'reformCompleteSow' ||
            column.property === 'reformCompleteFatPig') {
            return false
          } else {
            return true
          }

        } else {
          if (this.curStatus == 2 &&   // 反馈
            (column.property === 'reformCompleteDate' ||
              column.property === 'reformCompleteSow' ||
              column.property === 'reformCompleteFatPig' ||
              column.property === 'startIntroductionDate' ||
              column.property === 'sourceField' ||
              column.property === 'fieldLengthArriva' ||
              column.property === 'breedingDirector' ||
              column.property === 'deliveryDirector')) {
            return true
          } else {
            return false
          }
        }
      },
      computedDOMHeight() { // 计算内容区高度
        let curClientHeight = document.body.clientHeight  // 当前屏幕高度
        let pageContentHeight = curClientHeight - this.$refs.pageContent.getBoundingClientRect().top;  // 子表区距离屏幕顶部的高度

        this.$refs.pageContent.style.height = (pageContentHeight - 10) + 'px';

        let contentHeadHeight = document.querySelectorAll('.content-head')[0].offsetHeight;

        this.childTableHeight = pageContentHeight - contentHeadHeight - 60
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
      },
      _isFullscreenEnable() {
        return document.fullscreenElement ||
          document.msFullscreenElement ||
          document.mozFullScreenElement ||
          document.webkitFullscreenElement ||
          document.fullscreen || false;
      },
      _onFullscreenchange() {  // 监听全屏
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
      _checkImportReport(_file) {  // 校验导入文件
        if (this.curStatus !== 0) {
          this.$refs.upload.clearFiles();
          this.$message.warning('当前状态下不能导入数据！');
          return false;
        }

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
      importDataEvent(params) {   // 导入报表
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
        importReport(formData).then(res => {
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
      exportDataEvent() {  // 导出
        this.tableData.forEach((item, index) => {
          item.serialNumber = index + 1
        });
        
        let data = {
          method: 'post',
          url: `leaseFarmFeedback/downloadExcel`,
          fileName: '已租赁猪场管理计划及追踪',
          data: {entrys: this.tableData}
        };
        exportReport(data);
      },
    }
  }
</script>
<style lang="scss" scoped>
  .sav-btn {
    color: rgba(25, 137, 250, 1);
    border: 1px solid rgba(25, 137, 250, 1);
    
    &:hover {
      color: rgba(0, 136, 255, 1);
      background: #c5d9f3;
    }
  }
  
  .sub-btn {
    color: white;
    background: rgba(25, 137, 250, 1);
    border: 1px solid rgba(25, 137, 250, 1);
    
    &:hover {
      color: rgba(255, 255, 255, 1);
      background: rgba(25, 116, 207, 1);
    }
  }
  
  .audit-btn {
    background: #ffffff;
    color: rgba(0, 136, 255, 1);
    border: 1px solid #1989fa;
    
    &:hover {
      background: #c5d9f3;
      color: rgba(0, 136, 255, 1);
    }
  }
  
  .noAudit-btn {
    background: #ffffff;
    color: rgba(245, 108, 108, 1);
    border: 1px solid rgba(245, 108, 108, 1);
    
    &:hover {
      background: rgba(254, 240, 240, 1);
      color: rgba(245, 108, 108, 1);
    }
  }
  
  .add-btn {
    color: #1989fa;
    border: 1px solid #1989fa;
    
    &:hover {
      color: #1989fa;
      border: 1px solid #1974cf;
    }
  }
  
  .del-btn {
    color: #f56c6c;
    border: 1px solid #f56c6c;
    
    &:hover {
      color: #1989fa;
      border: 1px solid #1974cf;
    }
  }
  
  .el-date-editor {
    width: auto;
  }
  
  .import-btn {
    background: #1989fa;
    color: rgba(255, 255, 255, 1);
    border: 1px solid #1989fa;
    
    &:hover {
      background: #1974cf;
      color: rgba(255, 255, 255, 1);
    }
  }
  
  .export-btn {
    background: #ffffff;
    color: rgba(0, 136, 255, 1);
    border: 1px solid #1989fa;
    
    &:hover {
      background: #c5d9f3;
      color: rgba(0, 136, 255, 1);
    }
  }
  
  .page-content {
    box-sizing: border-box;
    margin: 10px 10px;
    padding: 16px 20px;
    background-color: #fff;
    
    .content-head {
      margin-bottom: 20px;
      
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
  
  .el-date-editor.el-input, .el-date-editor.el-input__inner {
    width: 180px;
  }
  
  /deep/ .el-input.is-disabled .el-input__inner {
    border: 1px solid #E4E7ED !important;
  }
</style>
