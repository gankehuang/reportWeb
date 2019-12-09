<template>
  <div class="swine-warp">
     <formTitle title="猪场生产指标计划">
        <div slot="context">
          <page-form v-bind="formOptions" :model="formData" :editable="!formData" ref="PageForm"></page-form>
        </div>
        <div slot="title-suffix" v-if="FCSave">
          <el-button
            class="sav-btn"
            size="small"
            @click="saveEvent(0)"
            v-if="saveStatus && (!formData.status || formData.status === 0)"
            :disabled="loading"
          >保存</el-button>
          <el-button
            class="sub-btn"
            size="small"
            @click="saveEvent(1)"
            v-if="formData.status === 0"
            :disabled="loading"
          >提交</el-button>
          <el-button
            class="audit-btn"
            size="small"
            @click="saveEvent(2)"
            v-if="formData.status === 1"
            :disabled="loading"
          >审核</el-button>
          <el-button
            class="noAudit-btn"
            size="small"
            @click="auditEvent(0)"
            v-if="formData.status === 2"
            :disabled="loading"
          >反审核</el-button>
        </div>
      </formTitle>

    <div class="space-line"></div>

    <div ref="pageContent">
      <formTitle title="子表信息">
        <div slot="context">
          <vxe-table
            border
            ref="xxTable"
            highlight-hover-row
            :height="childTableHeight"
            :resizable="true"
            :data="entryData"
            :loading="loading"
            :row-class-name="rowClassName"
            :span-method="rowspanMethod"
            :edit-config="(form.type==='7' && FCSave)?{trigger: 'click', mode: 'cell', activeMethod: activeCellMethod}:{}"
          >
            <vxe-table-column field="stage" title="阶段" class-name="stage" align="center" width="100"></vxe-table-column>
            <vxe-table-column field="quota" title="指标" class-name="quota"></vxe-table-column>
            <vxe-table-column field="total" title="合计" class-name="total" header-align="center" align="right" :edit-render="{name: 'input'}">
              <template v-slot:edit="{ row }">
                <el-input type="total" v-model="row.total" v-if="row.quota === '7KG仔猪成本(元/头)'"></el-input>
                <span v-else>{{ row.total }}</span>
              </template>
            </vxe-table-column>
            <vxe-table-column :title="(month<=12?month:month-12)+'月份计划分解'">
              <vxe-table-column field="oneWeek" header-align="center" align="right" title="1-7日" :edit-render="{name: 'input'}">
                <template v-slot:edit="{ row }">
                  <el-input type="number" v-model="row.oneWeek" @wheel.native.prevent="stopScrollFun($event)" @input="inputEvent('oneWeek',row)"></el-input>
                </template>
              </vxe-table-column>
              <vxe-table-column field="towWeek" header-align="center" align="right" title="8-14日" :edit-render="{name: 'input'}">
                <template v-slot:edit="{ row }">
                  <el-input type="number" v-model="row.towWeek" @wheel.native.prevent="stopScrollFun($event)" @input="inputEvent('towWeek',row)"></el-input>
                </template>
              </vxe-table-column>
              <vxe-table-column field="threeWeek" header-align="center" align="right" title="15-21日" :edit-render="{name: 'input'}">
                <template v-slot:edit="{ row }">
                  <el-input type="number" v-model="row.threeWeek" @wheel.native.prevent="stopScrollFun($event)" @input="inputEvent('threeWeek',row)"></el-input>
                </template>
              </vxe-table-column>
              <vxe-table-column field="fourWeek" header-align="center" align="right" title="22-30日" :edit-render="{name: 'input'}">
                <template v-slot:edit="{ row }">
                  <el-input type="number" v-model="row.fourWeek" @wheel.native.prevent="stopScrollFun($event)" @input="inputEvent('fourWeek',row)"></el-input>
                </template>
              </vxe-table-column>
            </vxe-table-column>
            <vxe-table-column field="nextMonthAims" header-align="center" align="right" :title="((month+1)<=12?(month+1):month-11)+'月份计划'" :edit-render="{name: 'input'}">
              <template v-slot:edit="{ row }">
                <el-input type="number" v-model="row.nextMonthAims" @wheel.native.prevent="stopScrollFun($event)" @input="inputEvent('nextMonthAims',row)"></el-input>
              </template>
            </vxe-table-column>
            <vxe-table-column field="twoMonthAims" header-align="center" align="right" :title="((month+2)<=12?(month+2):month-10)+'月份计划'" :edit-render="{name: 'input'}">
              <template v-slot:edit="{ row }">
                <el-input type="number" v-model="row.twoMonthAims" @wheel.native.prevent="stopScrollFun($event)" @input="inputEvent('twoMonthAims',row)"></el-input>
              </template>
            </vxe-table-column>
          </vxe-table>
        </div>
        <div class="content-head" slot="title-suffix">
          <el-button class="export-btn" size="small" icon="el-icon-upload2" @click="exportDataEvent" :disabled="loading">
          导出</el-button>
          <el-upload
            v-if="(form.type === '7' && (!formData.status || formData.status === 0))"
            style="display:inline-block;margin-left:10px;"
            ref="upload"
            :limit="1"
            :show-file-list="false"
            action="plan/excelUpload"
            accept=".xls,.xlsx"
            :http-request="importDataEvent"
            :file-list="fileList">
            <el-button icon="el-icon-download" size="small" class="import-btn">导入</el-button>
          </el-upload>
          <!-- <el-button size="small" icon="el-icon-rank" @click="handleFullscreen">{{fullscreen?'退出全屏':'全屏'}}</el-button> -->
        </div>
      </formTitle>
    </div>
  </div>
</template>

<script>
import {
  getList,
  addSWine,
  deleteById,
  getSCIndex,
  getCMPig,
  checkFCSave
} from "@/api/productionPlan";
import { getTree, checkReportIsSp, checkReportIsSave } from "@/api/swine";
import productionPlan from "@/views/fillInReport/pigFarmPlan/productionQuota/productionPlan.json";
import { sum, avg, end, intNumber, preNumber, disabledRow } from "@/views/fillInReport/pigFarmPlan/productionQuota/entryLabel.js";
import treeSelect from "@/components/TreeSelect";
import { changeTwoDecimal2, deepClone } from "@/utils/index";
import formTitle from "@/components/formTitle/formTitle";
import PageForm from "@/components/form/Form";
import { mapGetters } from 'vuex';
import { exportReport } from '@/utils/export'
import request from '@/utils/request'

export default {
  name: "index",
  components: { treeSelect, formTitle, PageForm },
  created() {
    // 获取list
    this.form.orgName = this.$store.getters.orgInfo.name;
    this.form.orgId = this.$store.getters.orgInfo.id;
    this.form.period = this.$store.getters.planYearMonth;
    this.form.type = this.$store.getters.orgInfo.type;
    // console.log(this.$store.getters.orgInfo)
    // console.log(this.$store.getters.planYearMonth)
    this.getIndex()
    // this.getList();
    this.getCM();
    this.checkSave();
    this.checkReport();
    if (this.$store.getters.orgInfo.type === '7') {
      this.checkFCSave();
    }
  },
  computed: {
    ...mapGetters([ 'orgInfo', 'planYearMonth' ])
  },
  // 监听执行
  watch: {
    orgInfo(val) {
      this.$set(this.form,"orgName",this.$store.getters.orgInfo.name);
      this.$set(this.form,"orgId",this.$store.getters.orgInfo.id);
      this.$set(this.form,"period",this.$store.getters.planYearMonth);
      this.$set(this.form,"type",this.$store.getters.orgInfo.type);
      this.getIndex()
      // this.getList();
      this.getCM();
      this.checkSave();
      this.checkReport();
      if (this.$store.getters.orgInfo.type === '7') {
        this.checkFCSave();
      } else {
        this.FCSave = true;
      }
    },
    planYearMonth(val) {
      this.form.orgName = this.$store.getters.orgInfo.name;
      this.form.orgId = this.$store.getters.orgInfo.id;
      this.form.period = this.$store.getters.planYearMonth;
      this.$set(this.form,"type",this.$store.getters.orgInfo.type);
      this.month = new Date(this.$store.getters.planYearMonth).getMonth() + 1;
      this.getIndex()
      // this.getList();
      this.getCM();
      this.checkSave();
      this.checkReport();
      if (this.$store.getters.orgInfo.type === '7') {
        this.checkFCSave();
      } else {
        this.FCSave = true;
      }
    }
  },
  data() {
    return {
      month: new Date(this.$store.getters.planYearMonth).getMonth() + 1, // 当前月
      childTableHeight: 300, // 子表高度
      entryIds: [], // 子表行的id数组
      reverseAuditStatus: true, // 是否可以反审核
      saveStatus: true, // 是否可以保存
      FCSave: true, // 判断分厂是否可以修改
      form: {
        orgName: "",
        orgId: "",
        period: new Date(),
        type: ""
      },
      formOptions: {
        labelWidth: "150px",
        options: [
          {
            label: "提交人",
            prop: "submiterName",
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
            prop: "approver",
            span: 4.8
          },
          {
            label: "审批日期",
            prop: "approveDate",
            span: 4.8
          },
          {
            label: "状态",
            prop: "status",
            span: 4.8,
            valueFormat: true,
            fontStyle: { color: "#2BB687" }
          }
        ]
      },
      formData: {},
      entryData: [],
      entryHeader: productionPlan,
      loading: false,
      SCIndexData: {},
      CMData: [],
      fullscreen: '',
      fileList: [],
    };
  },
  mounted() {
    window.onresize = () => {  // 动态监听窗口大小
      // this.fullscreen = this._isFullscreenEnable()
      return (() => {
        this.computedDOMHeight()
      })()
    }

    this.$nextTick(() => {  // 根据当前屏幕高度计算子表内容区高度
      this.computedDOMHeight()
      this._onFullscreenchange()
    })
  },
  methods: {
    saveEvent(sign) {
      if (this.formData) {
        this.loading = true;
          this.entryData.forEach((ele, index) => {
            ele.sort = index;
            if (ele.quota === "内调仔猪均价(元/头)") {
              if (this.CMData[0]) {
                let total = (((ele.oneWeek?ele.oneWeek:0)*(this.CMData[0].fwb_first_week?this.CMData[0].fwb_first_week:0)) +
                  ((ele.towWeek?ele.towWeek:0)*(this.CMData[0].fwb_second_week?this.CMData[0].fwb_second_week:0)) +
                  ((ele.threeWeek?ele.threeWeek:0)*(this.CMData[0].fwb_third_week?this.CMData[0].fwb_third_week:'')) +
                  ((ele.fourWeek?ele.fourWeek:0)*(this.CMData[0].fwb_fourth_week?this.CMData[0].fwb_fourth_week:0)))
                let ecscv = (this.CMData[0].fwb_first_week?this.CMData[0].fwb_first_week:0)+(this.CMData[0].fwb_second_week?this.CMData[0].fwb_second_week:0)+(this.CMData[0].fwb_third_week?this.CMData[0].fwb_third_week:0)+(this.CMData[0].fwb_fourth_week?this.CMData[0].fwb_fourth_week:0)
                ele.total = (ecscv && total)?changeTwoDecimal2(total/ecscv):''
              }
            }
            if (["外销仔猪均价(元/头)","外销7kg小种猪均价(元/头)"].includes(ele.quota)) {
              if (this.CMData[0]) {
                let total = (((ele.oneWeek?ele.oneWeek:0)*(this.CMData[0].wx_first_week?this.CMData[0].wx_first_week:0)) +
                  ((ele.towWeek?ele.towWeek:0)*(this.CMData[0].wx_second_week?this.CMData[0].wx_second_week:0)) +
                  ((ele.threeWeek?ele.threeWeek:0)*(this.CMData[0].wx_third_week?this.CMData[0].wx_third_week:'')) +
                  ((ele.fourWeek?ele.fourWeek:0)*(this.CMData[0].wx_fourth_week?this.CMData[0].wx_fourth_week:0)))
                let ecscv = (this.CMData[0].wx_first_week?this.CMData[0].wx_first_week:0)+(this.CMData[0].wx_second_week?this.CMData[0].wx_second_week:0)+(this.CMData[0].wx_third_week?this.CMData[0].wx_third_week:0)+(this.CMData[0].wx_fourth_week?this.CMData[0].wx_fourth_week:0)
                ele.total = (ecscv && total)?changeTwoDecimal2(total/ecscv):''
              }
            }
          });
          this.formData.status = sign;
          addSWine({
            deleteList: this.entryIds,
            productionPlan: this.formData,
            productionPlanEntries: this.entryData
          })
            .then(res => {
              if (res.status === 200) {
                let message = null;
                if (sign === 0) {
                  message = "保存成功！"
                } else if (sign === 1) {
                  message = "提交成功！"
                } else if (sign === 2) {
                  message = "审核成功！"
                }
                this.$message.success(message);
                
                this.getList();
                
                this.loading = false;
              }
            })
            .catch(() => {
              this.loading = false;
        });
      }
    },
    auditEvent(sign) {
      if (this.formData) {
        this.loading = true;
          this.entryData.forEach((ele, index) => {
            ele.sort = index;
          });
          this.formData.status = sign;
          addSWine({
            deleteList: this.entryIds,
            productionPlan: this.formData,
            productionPlanEntries: this.entryData
          })
            .then(res => {
              if (res.status === 200) {
                this.$message.success("反审核成功！");
                this.getList();
                this.loading = false;
              }
            })
            .catch(() => {
              this.loading = false;
        });
      }
    },
    formatDate(value, format) {
      return this.$utils.toDateString(value, format);
    },
    rowspanMethod({ row, $rowIndex, column, data }) {
      let fields = ["stage"];
      let cellValue = row[column.property];
      if (cellValue && fields.includes(column.property)) {
        let prevRow = data[$rowIndex - 1];
        let nextRow = data[$rowIndex + 1];
        if (prevRow && prevRow[column.property] === cellValue) {
          return { rowspan: 0, colspan: 0 };
        } else {
          let countRowspan = 1;
          while (nextRow && nextRow[column.property] === cellValue) {
            nextRow = data[++countRowspan + $rowIndex];
          }
          if (countRowspan > 1) {
            return { rowspan: countRowspan, colspan: 1 };
          }
        }
      }
    },
    getList() {
      this.loading = true;
      this.form.period = new Date(this.form.period).getTime();
      let cloneForm = deepClone(this.form);
      if (this.formData.id && this.form.type !== '7') {
        cloneForm.type = '7';
      }
      getList(cloneForm)
        .then(res => {
          if (res.status === 200) {
            if (res.data[0]) {
              if (res.data[0].productionPlan) {
                this.formData = res.data[0].productionPlan;
              } else if (this.form.type !== '7') {
                this.formData = {
                  submiterName: this.$store.getters.name,
                  submiter: this.$store.getters.userId,
                  submitDate: new Date().getTime(),
                  orgName: this.form.orgName,
                  orgId: this.form.orgId,
                  period: this.formatDate(this.form.period, "yyyy-MM"),
                  type: this.form.type
                };
              }
              this.entryData = res.data[0].productionPlanEntries;
            } else {
              this.formData = {
                submiterName: this.$store.getters.name,
                submiter: this.$store.getters.userId,
                submitDate: new Date().getTime(),
                orgName: this.form.orgName,
                orgId: this.form.orgId,
                period: this.formatDate(this.form.period, "yyyy-MM"),
                type: this.form.type
              };
              if (this.form.type === '7') {
                this.entryData = deepClone(this.entryHeader);
              } else {
                this.entryData = []
              }
            }
          }
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
    },
    inputEvent(key,row) {
      let reg = /^[0-9]*$/;
      let intReg = /^(0|[1-9][0-9]*)(\.\d+)?$/;
      if (row[key]) {
        row[key] = changeTwoDecimal2(row[key])
        if (!intReg.test(row[key])) {
          row[key] = '';
          if (["oneWeek","towWeek","threeWeek","fourWeek"].includes(key)) {
            row.total = '';
          }
          return
        }
        if (!reg.test(row[key]) && intNumber.includes(row.quota)) {
          // this.$message.warning("请输入正确的数！");
          row[key] = '';
          if (["oneWeek","towWeek","threeWeek","fourWeek"].includes(key)) {
            row.total = '';
          }
          return
        }
      }
      let hasNumber = 0;
      if (preNumber.includes(row.quota)) {
        if (row[key] > 100) {
          row[key] = ''
        }
      }
      if (row.oneWeek && row.oneWeek !== 0 && row.oneWeek !== "0") {
        hasNumber+=1;
      }
      if (row.towWeek && row.towWeek !== 0 && row.towWeek !== "0") {
        hasNumber+=1;
      }
      if (row.threeWeek && row.threeWeek !== 0 && row.threeWeek !== "0") {
         hasNumber+=1;
      }
      if (row.fourWeek && row.fourWeek !== 0 && row.fourWeek !== "0") {
         hasNumber+=1;
      }
      if (sum.includes(row.quota)) {
        let total =
          parseFloat(row.oneWeek ? row.oneWeek : 0) +
          parseFloat(row.towWeek ? row.towWeek : 0) +
          parseFloat(row.threeWeek ? row.threeWeek : 0) +
          parseFloat(row.fourWeek ? row.fourWeek : 0);
        row.total = total?changeTwoDecimal2(total):'';
        // 更改
        if (["后备死亡率(%)"].includes(row.quota)) {
          let index = this.entryData.findIndex(ele => ele.quota === "后备母猪死亡数(头)");
          let index1 = this.entryData.findIndex(ele => ele.quota === "后备死亡率(%)");
          if (this.SCIndexData.hbcl[0]) {
            this.$set(this.entryData[index],"oneWeek",this.SCIndexData.hbcl[0].CNUM?parseInt(this.SCIndexData.hbcl[0].CNUM*(row.oneWeek?row.oneWeek:0)/100):'')
            this.$set(this.entryData[index],"towWeek",this.SCIndexData.hbcl[0].CNUM?parseInt(this.SCIndexData.hbcl[0].CNUM*(row.towWeek?row.towWeek:0)/100):'')
            this.$set(this.entryData[index],"threeWeek",this.SCIndexData.hbcl[0].CNUM?parseInt(this.SCIndexData.hbcl[0].CNUM*(row.threeWeek?row.threeWeek:0)/100):'')
            this.$set(this.entryData[index],"fourWeek",this.SCIndexData.hbcl[0].CNUM?parseInt(this.SCIndexData.hbcl[0].CNUM*(row.fourWeek?row.fourWeek:0)/100):'')
            let total1 = (this.entryData[index].oneWeek?this.entryData[index].oneWeek:0) + (this.entryData[index].towWeek?this.entryData[index].towWeek:0) 
              + (this.entryData[index].threeWeek?this.entryData[index].threeWeek:0) + (this.entryData[index].fourWeek?this.entryData[index].fourWeek:0)
            this.$set(this.entryData[index],"total",total1?total1:'')
            this.$set(this.entryData[index],"nextMonthAims",this.SCIndexData.hbcl[0].CNUM?parseInt(this.SCIndexData.hbcl[0].CNUM*this.entryData[index1].nextMonthAims/(114/30*100)):'');
            this.$set(this.entryData[index],"twoMonthAims",this.SCIndexData.hbcl[0].CNUM?parseInt(this.SCIndexData.hbcl[0].CNUM*this.entryData[index1].twoMonthAims/(114/30*100)):'');
          }
        }
        if (["月度批次空返率(%)"].includes(row.quota)) {
          let index = this.entryData.findIndex(ele => ele.quota === "空怀数(头)");
          let index1 = this.entryData.findIndex(ele => ele.quota === "月度批次空返率(%)");
          if (this.SCIndexData.jccl[0]) {
            this.$set(this.entryData[index],"oneWeek",this.SCIndexData.jccl[0].CNUM?parseInt(this.SCIndexData.jccl[0].CNUM*this.entryData[index1].oneWeek/(114/30*100)):'');
            this.$set(this.entryData[index],"towWeek",this.SCIndexData.jccl[0].CNUM?parseInt(this.SCIndexData.jccl[0].CNUM*this.entryData[index1].towWeek/(114/30*100)):'');
            this.$set(this.entryData[index],"threeWeek",this.SCIndexData.jccl[0].CNUM?parseInt(this.SCIndexData.jccl[0].CNUM*this.entryData[index1].threeWeek/(114/30*100)):'');
            this.$set(this.entryData[index],"fourWeek",this.SCIndexData.jccl[0].CNUM?parseInt(this.SCIndexData.jccl[0].CNUM*this.entryData[index1].fourWeek/(114/30*100)):'');
            let total = (this.entryData[index].oneWeek?this.entryData[index].oneWeek:0) + (this.entryData[index].towWeek?this.entryData[index].towWeek:0) + (this.entryData[index].threeWeek?this.entryData[index].threeWeek:0) + (this.entryData[index].fourWeek?this.entryData[index].fourWeek:0)
            this.$set(this.entryData[index],"total",total?total:'');
            this.$set(this.entryData[index],"nextMonthAims",this.SCIndexData.jccl[0].CNUM?parseInt(this.SCIndexData.jccl[0].CNUM*this.entryData[index1].nextMonthAims/(114/30*100)):'');
            this.$set(this.entryData[index],"twoMonthAims",this.SCIndexData.jccl[0].CNUM?parseInt(this.SCIndexData.jccl[0].CNUM*this.entryData[index1].twoMonthAims/(114/30*100)):'');
          }
        }
        if (["月度批次流产率(%)"].includes(row.quota)) {
          let index = this.entryData.findIndex(ele => ele.quota === "流产数(头)");
          let index1 = this.entryData.findIndex(ele => ele.quota === "月度批次流产率(%)");
          if (this.SCIndexData.jccl[0]) {
            this.$set(this.entryData[index],"oneWeek",this.SCIndexData.jccl[0].CNUM?parseInt(this.SCIndexData.jccl[0].CNUM*this.entryData[index1].oneWeek/(114/30*100)):'');
            this.$set(this.entryData[index],"towWeek",this.SCIndexData.jccl[0].CNUM?parseInt(this.SCIndexData.jccl[0].CNUM*this.entryData[index1].towWeek/(114/30*100)):'');
            this.$set(this.entryData[index],"threeWeek",this.SCIndexData.jccl[0].CNUM?parseInt(this.SCIndexData.jccl[0].CNUM*this.entryData[index1].threeWeek/(114/30*100)):'');
            this.$set(this.entryData[index],"fourWeek",this.SCIndexData.jccl[0].CNUM?parseInt(this.SCIndexData.jccl[0].CNUM*this.entryData[index1].fourWeek/(114/30*100)):'');
            let total = (this.entryData[index].oneWeek?this.entryData[index].oneWeek:0) + (this.entryData[index].towWeek?this.entryData[index].towWeek:0) + (this.entryData[index].threeWeek?this.entryData[index].threeWeek:0) + (this.entryData[index].fourWeek?this.entryData[index].fourWeek:0)
            this.$set(this.entryData[index],"total",total?total:'');
            this.$set(this.entryData[index],"nextMonthAims",this.SCIndexData.jccl[0].CNUM?parseInt(this.SCIndexData.jccl[0].CNUM*this.entryData[index1].nextMonthAims/(114/30*100)):'');
            this.$set(this.entryData[index],"twoMonthAims",this.SCIndexData.jccl[0].CNUM?parseInt(this.SCIndexData.jccl[0].CNUM*this.entryData[index1].twoMonthAims/(114/30*100)):'');
          }
        }
        if (["经产母猪死亡率(%)"].includes(row.quota)) {
          let index = this.entryData.findIndex(ele => ele.quota === "经产母猪死亡数(头)");
          let index1 = this.entryData.findIndex(ele => ele.quota === "经产母猪死亡率(%)");
          if (this.SCIndexData.jccl[0]) {
            this.$set(this.entryData[index],"oneWeek",this.SCIndexData.jccl[0].CNUM?parseInt((row.oneWeek?row.oneWeek:0)*this.SCIndexData.jccl[0].CNUM/100):'');
            this.$set(this.entryData[index],"towWeek",this.SCIndexData.jccl[0].CNUM?parseInt((row.towWeek?row.towWeek:0)*this.SCIndexData.jccl[0].CNUM/100):'');
            this.$set(this.entryData[index],"threeWeek",this.SCIndexData.jccl[0].CNUM?parseInt((row.threeWeek?row.threeWeek:0)*this.SCIndexData.jccl[0].CNUM/100):'');
            this.$set(this.entryData[index],"fourWeek",this.SCIndexData.jccl[0].CNUM?parseInt((row.fourWeek?row.fourWeek:0)*this.SCIndexData.jccl[0].CNUM/100):'');
            let total = (this.entryData[index].oneWeek?this.entryData[index].oneWeek:0) + (this.entryData[index].towWeek?this.entryData[index].towWeek:0) + (this.entryData[index].threeWeek?this.entryData[index].threeWeek:0) + (this.entryData[index].fourWeek?this.entryData[index].fourWeek:0)
            this.$set(this.entryData[index],"total",total?total:'');
            this.$set(this.entryData[index],"nextMonthAims",this.SCIndexData.jccl[0].CNUM?parseInt((row.nextMonthAims?row.nextMonthAims:0)*this.SCIndexData.jccl[0].CNUM/100):'');
            this.$set(this.entryData[index],"twoMonthAims",this.SCIndexData.jccl[0].CNUM?parseInt((row.twoMonthAims?row.twoMonthAims:0)*this.SCIndexData.jccl[0].CNUM/100):'');
          }
        }
        if (["肥猪死亡率(%)"].includes(row.quota)) {
          let index = this.entryData.findIndex(ele => ele.quota === "肥猪死亡数(头)");
          let index1 = this.entryData.findIndex(ele => ele.quota === "肥猪死亡率(%)");
          if (this.SCIndexData.fzcl[0]) {
            this.$set(this.entryData[index],"oneWeek",this.SCIndexData.fzcl[0].CNUM?parseInt((row.oneWeek?row.oneWeek:0)*this.SCIndexData.fzcl[0].CNUM):'');
            this.$set(this.entryData[index],"towWeek",this.SCIndexData.fzcl[0].CNUM?parseInt((row.towWeek?row.towWeek:0)*this.SCIndexData.fzcl[0].CNUM):'');
            this.$set(this.entryData[index],"threeWeek",this.SCIndexData.fzcl[0].CNUM?parseInt((row.threeWeek?row.threeWeek:0)*this.SCIndexData.fzcl[0].CNUM):'');
            this.$set(this.entryData[index],"fourWeek",this.SCIndexData.fzcl[0].CNUM?parseInt((row.fourWeek?row.fourWeek:0)*this.SCIndexData.fzcl[0].CNUM):'');
            let total = (this.entryData[index].oneWeek?this.entryData[index].oneWeek:0) + (this.entryData[index].towWeek?this.entryData[index].towWeek:0) + (this.entryData[index].threeWeek?this.entryData[index].threeWeek:0) + (this.entryData[index].fourWeek?this.entryData[index].fourWeek:0)
            this.$set(this.entryData[index],"total",total?total:'');
            this.$set(this.entryData[index],"nextMonthAims",this.SCIndexData.fzcl[0].CNUM?parseInt(0.01*this.SCIndexData.fzcl[0].CNUM):'');
            this.$set(this.entryData[index],"twoMonthAims",this.SCIndexData.fzcl[0].CNUM?parseInt(0.01*this.SCIndexData.fzcl[0].CNUM):'');
          }
        }
        // 更改
        if (row.quota === "后备母猪死亡数(头)") {
          let index = this.entryData.findIndex(ele => ele.quota === "后备死亡率(%)");
          let total = row.total?((this.entryData[index].oneWeek?this.entryData[index].oneWeek:0)*(row.oneWeek?row.oneWeek:0) + 
              (this.entryData[index].towWeek?this.entryData[index].towWeek:0)*(row.towWeek?row.towWeek:0) + 
              (this.entryData[index].threeWeek?this.entryData[index].threeWeek:0)*(row.threeWeek?row.threeWeek:0) +
              (this.entryData[index].fourWeek?this.entryData[index].fourWeek:0)*(row.fourWeek?row.fourWeek:0))/row.total:''
          this.$set(this.entryData[index],"total",total?changeTwoDecimal2(total):'')
          if (this.entryData[index].total) {
            this.$set(this.entryData[index],"nextMonthAims",this.entryData[index].total)
            this.$set(this.entryData[index],"twoMonthAims",this.entryData[index].total)
          }
          /* if (this.SCIndexData.fzcl[0]) {
            // this.$set(this.entryData[index],"oneWeek",this.SCIndexData.fzcl[0].CNUM?changeTwoDecimal2((row.oneWeek ? row.oneWeek : 0)/this.SCIndexData.fzcl[0].CNUM):'');
            // this.$set(this.entryData[index],"towWeek",this.SCIndexData.fzcl[0].CNUM?changeTwoDecimal2((row.towWeek ? row.towWeek : 0)/this.SCIndexData.fzcl[0].CNUM):'');
            // this.$set(this.entryData[index],"threeWeek",this.SCIndexData.fzcl[0].CNUM?changeTwoDecimal2((row.threeWeek ? row.threeWeek : 0)/this.SCIndexData.fzcl[0].CNUM):'');
            // this.$set(this.entryData[index],"fourWeek",this.SCIndexData.fzcl[0].CNUM?changeTwoDecimal2((row.fourWeek ? row.fourWeek : 0)/this.SCIndexData.fzcl[0].CNUM):'');
          } */
        }
        if (row.quota === "后备母猪淘汰数(头)") {
          let index = this.entryData.findIndex(ele => ele.quota === "后备淘汰率(%)");
          if (this.SCIndexData.hbcl[0]) {
            this.$set(this.entryData[index],"oneWeek",this.SCIndexData.hbcl[0].CNUM?changeTwoDecimal2((row.oneWeek ? row.oneWeek : 0)/this.SCIndexData.hbcl[0].CNUM):'');
            this.$set(this.entryData[index],"towWeek",this.SCIndexData.hbcl[0].CNUM?changeTwoDecimal2((row.towWeek ? row.towWeek : 0)/this.SCIndexData.hbcl[0].CNUM):'');
            this.$set(this.entryData[index],"threeWeek",this.SCIndexData.hbcl[0].CNUM?changeTwoDecimal2((row.threeWeek ? row.threeWeek : 0)/this.SCIndexData.hbcl[0].CNUM):'');
            this.$set(this.entryData[index],"fourWeek",this.SCIndexData.hbcl[0].CNUM?changeTwoDecimal2((row.fourWeek ? row.fourWeek : 0)/this.SCIndexData.hbcl[0].CNUM):'');
          }
          let total = row.total?((this.entryData[index].oneWeek?this.entryData[index].oneWeek:0)*(row.oneWeek?row.oneWeek:0) + 
              (this.entryData[index].towWeek?this.entryData[index].towWeek:0)*(row.towWeek?row.towWeek:0) + 
              (this.entryData[index].threeWeek?this.entryData[index].threeWeek:0)*(row.threeWeek?row.threeWeek:0) +
              (this.entryData[index].fourWeek?this.entryData[index].fourWeek:0)*(row.fourWeek?row.fourWeek:0))/row.total:''
          this.$set(this.entryData[index],"total",total?changeTwoDecimal2(total):'')
          this.$set(this.entryData[index],"nextMonthAims",this.SCIndexData.hbcl[0].CNUM?changeTwoDecimal2((row.nextMonthAims ? row.nextMonthAims : 0)/this.SCIndexData.hbcl[0].CNUM):'')
          this.$set(this.entryData[index],"twoMonthAims",this.SCIndexData.hbcl[0].CNUM?changeTwoDecimal2((row.twoMonthAims ? row.twoMonthAims : 0)/this.SCIndexData.hbcl[0].CNUM):'')
        }
        if (row.quota === "完结批次总头数(头)") {
          let index = this.entryData.findIndex(ele => ele.quota === "完结批次利用率(%)");
          let index1 = this.entryData.findIndex(ele => ele.quota === "完结批次死亡率(%)");
          let total = row.total?((this.entryData[index].oneWeek?this.entryData[index].oneWeek:0)*(row.oneWeek?row.oneWeek:0) + 
            (this.entryData[index].towWeek?this.entryData[index].towWeek:0)*(row.towWeek?row.towWeek:0) + 
            (this.entryData[index].threeWeek?this.entryData[index].threeWeek:0)*(row.threeWeek?row.threeWeek:0) +
            (this.entryData[index].fourWeek?this.entryData[index].fourWeek:0)*(row.fourWeek?row.fourWeek:0))/row.total:''
          this.$set(this.entryData[index],"total",total?changeTwoDecimal2(total):'')
          let total1 = row.total?((this.entryData[index1].oneWeek?this.entryData[index1].oneWeek:0)*(row.oneWeek?row.oneWeek:0) + 
            (this.entryData[index1].towWeek?this.entryData[index1].towWeek:0)*(row.towWeek?row.towWeek:0) + 
            (this.entryData[index1].threeWeek?this.entryData[index1].threeWeek:0)*(row.threeWeek?row.threeWeek:0) +
            (this.entryData[index1].fourWeek?this.entryData[index1].fourWeek:0)*(row.fourWeek?row.fourWeek:0))/row.total:''
          this.$set(this.entryData[index1],"total",total1?changeTwoDecimal2(total1):'')
          if (this.entryData[index].total) {
            this.$set(this.entryData[index],"nextMonthAims",this.entryData[index].total)
            this.$set(this.entryData[index],"twoMonthAims",this.entryData[index].total)
          }
          if (this.entryData[index1].total) {
            this.$set(this.entryData[index1],"nextMonthAims",this.entryData[index1].total)
            this.$set(this.entryData[index1],"twoMonthAims",this.entryData[index1].total)
          }
        }
        if (row.quota === "断配猪10天发情数(头)") {
          let index = this.entryData.findIndex(ele => ele.quota === "断配猪10天发情率(%)");
          let total = row.total?((this.entryData[index].oneWeek?this.entryData[index].oneWeek:0)*(row.oneWeek?row.oneWeek:0) + 
            (this.entryData[index].towWeek?this.entryData[index].towWeek:0)*(row.towWeek?row.towWeek:0) + 
            (this.entryData[index].threeWeek?this.entryData[index].threeWeek:0)*(row.threeWeek?row.threeWeek:0) +
            (this.entryData[index].fourWeek?this.entryData[index].fourWeek:0)*(row.fourWeek?row.fourWeek:0))/row.total:''
          this.$set(this.entryData[index],"total",total?changeTwoDecimal2(total):'')
        }
        if (row.quota === "35天前配种数(头)") {
          let index = this.entryData.findIndex(ele => ele.quota === "35天受孕率(%)");
          let total = row.total?((this.entryData[index].oneWeek?this.entryData[index].oneWeek:0)*(row.oneWeek?row.oneWeek:0) + 
            (this.entryData[index].towWeek?this.entryData[index].towWeek:0)*(row.towWeek?row.towWeek:0) + 
            (this.entryData[index].threeWeek?this.entryData[index].threeWeek:0)*(row.threeWeek?row.threeWeek:0) +
            (this.entryData[index].fourWeek?this.entryData[index].fourWeek:0)*(row.fourWeek?row.fourWeek:0))/row.total:''
          this.$set(this.entryData[index],"total",total?changeTwoDecimal2(total):'')
          /* if (this.entryData[index].total) {
            this.$set(this.entryData[index],"nextMonthAims",this.entryData[index].total)
            this.$set(this.entryData[index],"twoMonthAims",this.entryData[index].total)
          } */
        }
        if (row.quota === "空怀数(头)") {
          let index = this.entryData.findIndex(ele => ele.quota === "月度批次空返率(%)");
          let total = row.total?((this.entryData[index].oneWeek?this.entryData[index].oneWeek:0)*(row.oneWeek?row.oneWeek:0) + 
            (this.entryData[index].towWeek?this.entryData[index].towWeek:0)*(row.towWeek?row.towWeek:0) + 
            (this.entryData[index].threeWeek?this.entryData[index].threeWeek:0)*(row.threeWeek?row.threeWeek:0) +
            (this.entryData[index].fourWeek?this.entryData[index].fourWeek:0)*(row.fourWeek?row.fourWeek:0))/row.total:''
          this.$set(this.entryData[index],"total",total?changeTwoDecimal2(total):'')
          if (this.entryData[index].total) {
            this.$set(this.entryData[index],"nextMonthAims",this.entryData[index].total)
            this.$set(this.entryData[index],"twoMonthAims",this.entryData[index].total)
          }
        }
        if (row.quota === "流产数(头)") {
          let index = this.entryData.findIndex(ele => ele.quota === "月度批次流产率(%)");
          let total = row.total?((this.entryData[index].oneWeek?this.entryData[index].oneWeek:0)*(row.oneWeek?row.oneWeek:0) + 
            (this.entryData[index].towWeek?this.entryData[index].towWeek:0)*(row.towWeek?row.towWeek:0) + 
            (this.entryData[index].threeWeek?this.entryData[index].threeWeek:0)*(row.threeWeek?row.threeWeek:0) +
            (this.entryData[index].fourWeek?this.entryData[index].fourWeek:0)*(row.fourWeek?row.fourWeek:0))/row.total:''
          this.$set(this.entryData[index],"total",total?changeTwoDecimal2(total):'')
          if (this.entryData[index].total) {
            this.$set(this.entryData[index],"nextMonthAims",this.entryData[index].total)
            this.$set(this.entryData[index],"twoMonthAims",this.entryData[index].total)
          }
        }
        if (row.quota === "经产母猪淘汰数(头)") {
          let index = this.entryData.findIndex(ele => ele.quota === "经产母猪淘汰率(%)");
          if (this.SCIndexData.jccl[0]) {
            this.$set(this.entryData[index],"oneWeek",row.oneWeek?changeTwoDecimal2((row.oneWeek)/this.SCIndexData.jccl[0].CNUM*100):'');
            this.$set(this.entryData[index],"towWeek",row.towWeek?changeTwoDecimal2((row.towWeek)/this.SCIndexData.jccl[0].CNUM*100):'');
            this.$set(this.entryData[index],"threeWeek",row.threeWeek?changeTwoDecimal2((row.threeWeek)/this.SCIndexData.jccl[0].CNUM*100):'');
            this.$set(this.entryData[index],"fourWeek",row.fourWeek?changeTwoDecimal2((row.fourWeek)/this.SCIndexData.jccl[0].CNUM*100):'');
          }
          let total = row.total?((this.entryData[index].oneWeek?this.entryData[index].oneWeek:0)*(row.oneWeek?row.oneWeek:0) + 
            (this.entryData[index].towWeek?this.entryData[index].towWeek:0)*(row.towWeek?row.towWeek:0) + 
            (this.entryData[index].threeWeek?this.entryData[index].threeWeek:0)*(row.threeWeek?row.threeWeek:0) +
            (this.entryData[index].fourWeek?this.entryData[index].fourWeek:0)*(row.fourWeek?row.fourWeek:0))/row.total:''
          this.$set(this.entryData[index],"total",total?changeTwoDecimal2(total):'')
          if (this.entryData[index].total) {
            this.$set(this.entryData[index],"nextMonthAims",this.SCIndexData.jccl[0].CNUM?changeTwoDecimal2((row.nextMonthAims?row.nextMonthAims:0)/this.SCIndexData.jccl[0].CNUM*100):'')
            this.$set(this.entryData[index],"twoMonthAims",this.SCIndexData.jccl[0].CNUM?changeTwoDecimal2((row.twoMonthAims?row.twoMonthAims:0)/this.SCIndexData.jccl[0].CNUM*100):'')
          }
        }
        if (row.quota === "其中：零胎母猪淘汰数(头)") {
          let index = this.entryData.findIndex(ele => ele.quota === "经产母猪淘汰数(头)");
          if (row[key] > this.entryData[index][key]) {
            row.total = (row.total - row[key])?(row.total - row[key]):''
            row[key] = ''
          }
        }
        if (["经产母猪死亡数(头)"].includes(row.quota)) {
          let index = this.entryData.findIndex(ele => ele.quota === "经产母猪死亡率(%)");
          let total = row.total?((this.entryData[index].oneWeek?this.entryData[index].oneWeek:0)*(row.oneWeek?row.oneWeek:0) + 
            (this.entryData[index].towWeek?this.entryData[index].towWeek:0)*(row.towWeek?row.towWeek:0) + 
            (this.entryData[index].threeWeek?this.entryData[index].threeWeek:0)*(row.threeWeek?row.threeWeek:0) +
            (this.entryData[index].fourWeek?this.entryData[index].fourWeek:0)*(row.fourWeek?row.fourWeek:0))/row.total:''
          this.$set(this.entryData[index],"total",total?changeTwoDecimal2(total):'')
          if (this.entryData[index].total) {
            this.$set(this.entryData[index],"nextMonthAims",this.entryData[index].total)
            this.$set(this.entryData[index],"twoMonthAims",this.entryData[index].total)
          }
        }
        if (["分娩窝数(头)"].includes(row.quota)) {
          let index = this.entryData.findIndex(ele => ele.quota === "胎产总仔数(头)");
          let total = row.total?((this.entryData[index].oneWeek?this.entryData[index].oneWeek:0)*(row.oneWeek?row.oneWeek:0) + 
            (this.entryData[index].towWeek?this.entryData[index].towWeek:0)*(row.towWeek?row.towWeek:0) + 
            (this.entryData[index].threeWeek?this.entryData[index].threeWeek:0)*(row.threeWeek?row.threeWeek:0) +
            (this.entryData[index].fourWeek?this.entryData[index].fourWeek:0)*(row.fourWeek?row.fourWeek:0))/row.total:''
          this.$set(this.entryData[index],"total",total?changeTwoDecimal2(total):'')
          // 胎产活仔(头)
          let index1 = this.entryData.findIndex(ele => ele.quota === "胎产活仔(头)");
          let total1 = row.total?((this.entryData[index1].oneWeek?this.entryData[index1].oneWeek:0)*(row.oneWeek?row.oneWeek:0) + 
            (this.entryData[index1].towWeek?this.entryData[index1].towWeek:0)*(row.towWeek?row.towWeek:0) + 
            (this.entryData[index1].threeWeek?this.entryData[index1].threeWeek:0)*(row.threeWeek?row.threeWeek:0) +
            (this.entryData[index1].fourWeek?this.entryData[index1].fourWeek:0)*(row.fourWeek?row.fourWeek:0))/row.total:''
          this.$set(this.entryData[index1],"total",total?changeTwoDecimal2(total):'')
        }
        if (["哺乳死亡率(%)"].includes(row.quota)) {
          let index = this.entryData.findIndex(ele => ele.quota === "PSY");
          let index1 = this.entryData.findIndex(ele => ele.quota === "胎产活仔(头)");
          let index2 = this.entryData.findIndex(ele => ele.quota === "配种分娩率(%)");
          let nextMonthAims = (365/142)*(this.entryData[index2].nextMonthAims/100)*this.entryData[index1].nextMonthAims*(1-row.nextMonthAims/100);
          let twoMonthAims = (365/142)*(this.entryData[index2].twoMonthAims/100)*this.entryData[index1].twoMonthAims*(1-row.twoMonthAims/100);
          this.entryData[index].total = changeTwoDecimal2((365/142)*(1-(row.total?row.total:0)/100)*(this.entryData[index1].total?this.entryData[index1].total:0)*(this.entryData[index2].total?this.entryData[index2].total/100:0))
          this.$set(this.entryData[index],"oneWeek",this.entryData[index].total);
          this.$set(this.entryData[index],"towWeek",this.entryData[index].total);
          this.$set(this.entryData[index],"threeWeek",this.entryData[index].total);
          this.$set(this.entryData[index],"fourWeek",this.entryData[index].total);
          this.entryData[index].nextMonthAims = changeTwoDecimal2(nextMonthAims);
          this.entryData[index].twoMonthAims = changeTwoDecimal2(twoMonthAims);
        }
        if (["30天死亡数(头)"].includes(row.quota)) {
          let index = this.entryData.findIndex(ele => ele.quota === "30天死亡率(%)");
          let total = row.total?((this.entryData[index].oneWeek?this.entryData[index].oneWeek:0)*(row.oneWeek?row.oneWeek:0) + 
            (this.entryData[index].towWeek?this.entryData[index].towWeek:0)*(row.towWeek?row.towWeek:0) + 
            (this.entryData[index].threeWeek?this.entryData[index].threeWeek:0)*(row.threeWeek?row.threeWeek:0) +
            (this.entryData[index].fourWeek?this.entryData[index].fourWeek:0)*(row.fourWeek?row.fourWeek:0))/row.total:''
          this.$set(this.entryData[index],"total",total?changeTwoDecimal2(total):'')
          if (this.entryData[index].total) {
            this.$set(this.entryData[index],"nextMonthAims",this.entryData[index].total)
            this.$set(this.entryData[index],"twoMonthAims",this.entryData[index].total)
          }
        }
        if (["肥猪死亡数(头)"].includes(row.quota)) {
          let index = this.entryData.findIndex(ele => ele.quota === "肥猪死亡率(%)");
          let total = row.total?((this.entryData[index].oneWeek?this.entryData[index].oneWeek:0)*(row.oneWeek?row.oneWeek:0) + 
            (this.entryData[index].towWeek?this.entryData[index].towWeek:0)*(row.towWeek?row.towWeek:0) + 
            (this.entryData[index].threeWeek?this.entryData[index].threeWeek:0)*(row.threeWeek?row.threeWeek:0) +
            (this.entryData[index].fourWeek?this.entryData[index].fourWeek:0)*(row.fourWeek?row.fourWeek:0))/row.total:''
          this.$set(this.entryData[index],"total",total?changeTwoDecimal2(total):'')
          if (this.entryData[index].total) {
            this.$set(this.entryData[index],"nextMonthAims",this.entryData[index].total)
            this.$set(this.entryData[index],"twoMonthAims",this.entryData[index].total)
          }
        }
        /* if (["肥猪批次死亡数(头)"].includes(row.quota)) {
          let index = this.entryData.findIndex(ele => ele.quota === "肥猪批次死亡率(%)");
          let total = row.total?((this.entryData[index].oneWeek?this.entryData[index].oneWeek:0)*(row.oneWeek?row.oneWeek:0) + 
            (this.entryData[index].towWeek?this.entryData[index].towWeek:0)*(row.towWeek?row.towWeek:0) + 
            (this.entryData[index].threeWeek?this.entryData[index].threeWeek:0)*(row.threeWeek?row.threeWeek:0) +
            (this.entryData[index].fourWeek?this.entryData[index].fourWeek:0)*(row.fourWeek?row.fourWeek:0))/row.total:''
          this.$set(this.entryData[index],"total",total?changeTwoDecimal2(total):'')
          if (this.entryData[index].total) {
            this.$set(this.entryData[index],"nextMonthAims",this.entryData[index].total)
            this.$set(this.entryData[index],"twoMonthAims",this.entryData[index].total)
          }
        } */
        if (row.quota === "肥猪上市头数(头)") {
          let index = this.entryData.findIndex(ele => ele.quota === "上市正品率(%)");
          let index1 = this.entryData.findIndex(ele => ele.quota === "其中：上市次品数(头)");
          this.$set(this.entryData[index],"oneWeek",row.oneWeek?(1-((this.entryData[index1].oneWeek?this.entryData[index1].oneWeek:0)/row.oneWeek))*100:'');
          this.$set(this.entryData[index],"towWeek",row.towWeek?(1-((this.entryData[index1].towWeek?this.entryData[index1].towWeek:0)/row.towWeek))*100:'');
          this.$set(this.entryData[index],"threeWeek",row.threeWeek?(1-((this.entryData[index1].threeWeek?this.entryData[index1].threeWeek:0)/row.threeWeek))*100:'');
          this.$set(this.entryData[index],"fourWeek",row.fourWeek?(1-((this.entryData[index1].fourWeek?this.entryData[index1].fourWeek:0)/row.fourWeek))*100:'');
          let total = ((this.entryData[index].oneWeek?this.entryData[index].oneWeek:0) + (this.entryData[index].towWeek?this.entryData[index].towWeek:0) +(this.entryData[index].threeWeek?this.entryData[index].threeWeek:0) + (this.entryData[index].fourWeek?this.entryData[index].fourWeek:0))/hasNumber;
          this.entryData[index].total = total?changeTwoDecimal2(total):'';
          this.$set(this.entryData[index],"nextMonthAims",row.nextMonthAims?(1-((this.entryData[index1].nextMonthAims?this.entryData[index1].nextMonthAims:0)/row.nextMonthAims))*100:'');
          this.$set(this.entryData[index],"twoMonthAims",row.twoMonthAims?(1-((this.entryData[index1].twoMonthAims?this.entryData[index1].twoMonthAims:0)/row.twoMonthAims))*100:'');
          let index4 = this.entryData.findIndex(ele => ele.quota === "肥猪平均销售体重(斤/头)");
          let total4 = row.total?(((this.entryData[index4].oneWeek?this.entryData[index4].oneWeek:0)*(row.oneWeek?row.oneWeek:0)+
            (this.entryData[index4].towWeek?this.entryData[index4].towWeek:0)*(row.towWeek?row.towWeek:0)+
            (this.entryData[index4].threeWeek?this.entryData[index4].threeWeek:0)*(row.threeWeek?row.threeWeek:0)+
            (this.entryData[index4].fourWeek?this.entryData[index4].fourWeek:0)*(row.fourWeek?row.fourWeek:0))/row.total):''
          this.entryData[index4].total = total4?changeTwoDecimal2(total4):'';
          let index5 = this.entryData.findIndex(ele => ele.quota === "肥猪平均销售价格(元/斤)");
          let divisor = (this.entryData[index4].oneWeek?this.entryData[index4].oneWeek:0)*(row.oneWeek?row.oneWeek:0)+
            (this.entryData[index4].towWeek?this.entryData[index4].towWeek:0)*(row.towWeek?row.towWeek:0)+
            (this.entryData[index4].threeWeek?this.entryData[index4].threeWeek:0)*(row.threeWeek?row.threeWeek:0)+
            (this.entryData[index4].fourWeek?this.entryData[index4].fourWeek:0)*(row.fourWeek?row.fourWeek:0)
          let total5 = divisor?(((this.entryData[index4].oneWeek?this.entryData[index4].oneWeek:0)*(row.oneWeek?row.oneWeek:0)*(this.entryData[index5].oneWeek?this.entryData[index5].oneWeek:0)+
            (this.entryData[index4].towWeek?this.entryData[index4].towWeek:0)*(this.entryData[index5].towWeek?this.entryData[index5].towWeek:0)*(row.towWeek?row.towWeek:0)+
            (this.entryData[index4].threeWeek?this.entryData[index4].threeWeek:0)*(this.entryData[index5].threeWeek?this.entryData[index5].threeWeek:0)*(row.threeWeek?row.threeWeek:0)+
            (this.entryData[index4].fourWeek?this.entryData[index4].fourWeek:0)*(this.entryData[index5].fourWeek?this.entryData[index5].fourWeek:0)*(row.fourWeek?row.fourWeek:0))/divisor):''
          this.entryData[index5].total = total5?changeTwoDecimal2(total5):'';
          let index3 = this.entryData.findIndex(ele => ele.quota === "单斤标准成本(元/斤)");
          let total3 = divisor?(((this.entryData[index3].oneWeek?this.entryData[index3].oneWeek:0)*(row.oneWeek?row.oneWeek:0)*(this.entryData[index4].oneWeek?this.entryData[index4].oneWeek:0)+
            (this.entryData[index3].towWeek?this.entryData[index3].towWeek:0)*(this.entryData[index4].towWeek?this.entryData[index4].towWeek:0)*(row.towWeek?row.towWeek:0)+
            (this.entryData[index3].threeWeek?this.entryData[index3].threeWeek:0)*(this.entryData[index4].threeWeek?this.entryData[index4].threeWeek:0)*(row.threeWeek?row.threeWeek:0)+
            (this.entryData[index3].fourWeek?this.entryData[index3].fourWeek:0)*(this.entryData[index4].fourWeek?this.entryData[index4].fourWeek:0)*(row.fourWeek?row.fourWeek:0))/divisor):''
          this.entryData[index3].total = total3?changeTwoDecimal2(total3):'';
          let index6 = this.entryData.findIndex(ele => ele.quota === "肥猪料肉比(kg)");
          let total6 = divisor?(((this.entryData[index6].oneWeek?this.entryData[index6].oneWeek:0)*(row.oneWeek?row.oneWeek:0)*(this.entryData[index4].oneWeek?this.entryData[index4].oneWeek:0)+
            (this.entryData[index6].towWeek?this.entryData[index6].towWeek:0)*(this.entryData[index4].towWeek?this.entryData[index4].towWeek:0)*(row.towWeek?row.towWeek:0)+
            (this.entryData[index6].threeWeek?this.entryData[index6].threeWeek:0)*(this.entryData[index4].threeWeek?this.entryData[index4].threeWeek:0)*(row.threeWeek?row.threeWeek:0)+
            (this.entryData[index6].fourWeek?this.entryData[index6].fourWeek:0)*(this.entryData[index4].fourWeek?this.entryData[index4].fourWeek:0)*(row.fourWeek?row.fourWeek:0))/divisor):''
          this.entryData[index6].total = total6?changeTwoDecimal2(total6):'';
          let index7 = this.entryData.findIndex(ele => ele.quota === "提前上市猪占比(%)");
          let index8 = this.entryData.findIndex(ele => ele.quota === "其中：提前上市数(头)");
          this.$set(this.entryData[index7],"oneWeek",changeTwoDecimal2(row.oneWeek?(this.entryData[index8].oneWeek?this.entryData[index8].oneWeek:0)/row.oneWeek*100:''))
          this.$set(this.entryData[index7],"towWeek",changeTwoDecimal2(row.towWeek?(this.entryData[index8].towWeek?this.entryData[index8].towWeek:0)/row.towWeek*100:''))
          this.$set(this.entryData[index7],"threeWeek",changeTwoDecimal2(row.towWeek?(this.entryData[index8].threeWeek?this.entryData[index8].threeWeek:0)/row.threeWeek*100:''))
          this.$set(this.entryData[index7],"fourWeek",changeTwoDecimal2(row.fourWeek?(this.entryData[index8].fourWeek?this.entryData[index8].fourWeek:0)/row.fourWeek*100:''))
          this.$set(this.entryData[index7],"total",changeTwoDecimal2(row.total?(this.entryData[index8].total?this.entryData[index8].total:0)/row.total*100:''))
          this.$set(this.entryData[index7],"nextMonthAims",changeTwoDecimal2(row.nextMonthAims?(this.entryData[index8].nextMonthAims?this.entryData[index8].nextMonthAims:0)/row.nextMonthAims*100:''))
          this.$set(this.entryData[index7],"twoMonthAims",changeTwoDecimal2(row.twoMonthAims?(this.entryData[index8].twoMonthAims?this.entryData[index8].twoMonthAims:0)/row.twoMonthAims*100:''))
        }
        if (row.quota === "其中：上市次品数(头)") {
          let index = this.entryData.findIndex(ele => ele.quota === "上市正品率(%)");
          let index1 = this.entryData.findIndex(ele => ele.quota === "其中：上市次品数(头)");
          let index2 = this.entryData.findIndex(ele => ele.quota === "肥猪上市头数(头)");
          if (row[key] > this.entryData[index2][key]) {
            row.total = (row.total - row[key])?(row.total - row[key]):''
            row[key] = ''
          }
          this.$set(this.entryData[index],"oneWeek",this.entryData[index2].oneWeek?changeTwoDecimal2((1-((this.entryData[index1].oneWeek?this.entryData[index1].oneWeek:0)/this.entryData[index2].oneWeek))*100):'');
          this.$set(this.entryData[index],"towWeek",this.entryData[index2].towWeek?changeTwoDecimal2((1-((this.entryData[index1].towWeek?this.entryData[index1].towWeek:0)/this.entryData[index2].towWeek))*100):'');
          this.$set(this.entryData[index],"threeWeek",this.entryData[index2].threeWeek?changeTwoDecimal2((1-((this.entryData[index1].threeWeek?this.entryData[index1].threeWeek:0)/this.entryData[index2].threeWeek))*100):'');
          this.$set(this.entryData[index],"fourWeek",this.entryData[index2].fourWeek?changeTwoDecimal2((1-((this.entryData[index1].fourWeek?this.entryData[index1].fourWeek:0)/this.entryData[index2].fourWeek))*100):'');
          this.entryData[index].total = hasNumber?changeTwoDecimal2((this.entryData[index].oneWeek + this.entryData[index].towWeek +this.entryData[index].threeWeek +this.entryData[index].fourWeek)/hasNumber):100;
          this.$set(this.entryData[index],"nextMonthAims",this.entryData[index2].nextMonthAims?changeTwoDecimal2((1-((this.entryData[index1].nextMonthAims?this.entryData[index1].nextMonthAims:0)/this.entryData[index2].nextMonthAims))*100):'');
          this.$set(this.entryData[index],"twoMonthAims",this.entryData[index2].twoMonthAims?changeTwoDecimal2((1-((this.entryData[index1].twoMonthAims?this.entryData[index1].twoMonthAims:0)/this.entryData[index2].twoMonthAims))*100):'');
        }
        if (row.quota === "其中：提前上市数(头)") {
          let index = this.entryData.findIndex(ele => ele.quota === "提前上市猪占比(%)");
          let index1 = this.entryData.findIndex(ele => ele.quota === "肥猪上市头数(头)");
          if (row[key] > this.entryData[index1][key]) {
            row.total = (row.total - row[key])?(row.total - row[key]):''
            row[key] = ''
          }
          this.$set(this.entryData[index],"oneWeek",this.entryData[index1].oneWeek?changeTwoDecimal2((row.oneWeek?row.oneWeek:0)/this.entryData[index1].oneWeek*100):'');
          this.$set(this.entryData[index],"towWeek",this.entryData[index1].towWeek?changeTwoDecimal2((row.towWeek?row.towWeek:0)/this.entryData[index1].towWeek*100):'');
          this.$set(this.entryData[index],"threeWeek",this.entryData[index1].threeWeek?changeTwoDecimal2((row.threeWeek?row.threeWeek:0)/this.entryData[index1].threeWeek*100):'');
          this.$set(this.entryData[index],"fourWeek",this.entryData[index1].fourWeek?changeTwoDecimal2((row.fourWeek?row.fourWeek:0)/this.entryData[index1].fourWeek*100):'');
          this.$set(this.entryData[index],"total",this.entryData[index1].total?changeTwoDecimal2((row.total?row.total:0)/(this.entryData[index1].total?this.entryData[index1].total:0)*100):'')
          this.$set(this.entryData[index],"nextMonthAims",changeTwoDecimal2(this.entryData[index1].nextMonthAims?(row.nextMonthAims?row.nextMonthAims:0)/(this.entryData[index1].nextMonthAims?this.entryData[index1].nextMonthAims:0)*100:''))
          this.$set(this.entryData[index],"twoMonthAims",changeTwoDecimal2(this.entryData[index1].twoMonthAims?(row.twoMonthAims?row.twoMonthAims:0)/(this.entryData[index1].twoMonthAims?this.entryData[index1].twoMonthAims:0)*100:''))
        }
        if (row.quota === "兽药采购金额(万元)" || row.quota === "兽药耗用金额(万元)") {
          let index = this.entryData.findIndex(ele => ele.quota === "兽药库存金额(万元)");
          let index1 = this.entryData.findIndex(ele => ele.quota === "兽药耗用金额(万元)");
          let index2 = this.entryData.findIndex(ele => ele.quota === "兽药采购金额(万元)");
          let index3 = this.entryData.findIndex(ele => ele.quota === "兽药库存天数(天)");
          if (!this.SCIndexData.syqckc[0]) {
            this.SCIndexData.syqckc[0] = {}
            this.SCIndexData.syqckc[0].CNUM = 0;
          }
          if (!this.SCIndexData.sysyhy[0]) {
            this.SCIndexData.sysyhy[0] = {}
            this.SCIndexData.sysyhy[0].CNUM = 0;
          }
          let syTotal = changeTwoDecimal2(this.SCIndexData.syqckc[0].CNUM?this.SCIndexData.syqckc[0].CNUM/10000:0)
          if (key === "oneWeek") {
            syTotal = syTotal?syTotal:0+(this.entryData[index2].oneWeek?this.entryData[index2].oneWeek:0)
          }
          if (key === "towWeek") {
            syTotal = syTotal?syTotal:0+(this.entryData[index2].oneWeek?this.entryData[index2].oneWeek:0)+(this.entryData[index2].towWeek?this.entryData[index2].towWeek:0)-(this.entryData[index1].oneWeek?this.entryData[index1].oneWeek:0)
          }
          if (key === "threeWeek") {
            syTotal = syTotal?syTotal:0+(this.entryData[index2].threeWeek?this.entryData[index2].threeWeek:0)+(this.entryData[index2].towWeek?this.entryData[index2].towWeek:0)+(this.entryData[index2].oneWeek?this.entryData[index2].oneWeek:0)-(this.entryData[index1].oneWeek?this.entryData[index1].oneWeek:0)-(this.entryData[index1].towWeek?this.entryData[index1].towWeek:0)
          }
          if (key === "fourWeek") {
            syTotal = syTotal?syTotal:0+(this.entryData[index2].fourWeek?this.entryData[index2].fourWeek:0)+(this.entryData[index2].threeWeek?this.entryData[index2].threeWeek:0)+(this.entryData[index2].towWeek?this.entryData[index2].towWeek:0)+(this.entryData[index2].oneWeek?this.entryData[index2].oneWeek:0)-(this.entryData[index1].oneWeek?this.entryData[index1].oneWeek:0)-(this.entryData[index1].towWeek?this.entryData[index1].towWeek:0)-(this.entryData[index1].threeWeek?this.entryData[index1].threeWeek:0)
          }
         
          if (["兽药耗用金额(万元)"].includes(row.quota)) {
            if (row[key] > Math.ceil(syTotal)) {
              row.total = (row.total - row[key])?changeTwoDecimal2(row.total - row[key]):''
              row[key] = ''
            }
          }
          this.$set(this.entryData[index],"oneWeek",this.entryData[index2].oneWeek?changeTwoDecimal2((this.SCIndexData.syqckc[0].CNUM/10000+parseFloat(this.entryData[index2].oneWeek?this.entryData[index2].oneWeek:0)-parseFloat(this.entryData[index1].oneWeek?this.entryData[index1].oneWeek:0))):'');
          this.$set(this.entryData[index],"towWeek",this.entryData[index2].towWeek?changeTwoDecimal2((this.SCIndexData.syqckc[0].CNUM/10000+parseFloat(this.entryData[index2].towWeek?this.entryData[index2].towWeek:0)+parseFloat(this.entryData[index2].oneWeek?this.entryData[index2].oneWeek:0)-parseFloat(this.entryData[index1].towWeek?this.entryData[index1].towWeek:0)-parseFloat(this.entryData[index1].oneWeek?this.entryData[index1].oneWeek:0))):'');
          this.$set(this.entryData[index],"threeWeek",this.entryData[index2].threeWeek?changeTwoDecimal2((this.SCIndexData.syqckc[0].CNUM/10000+parseFloat(this.entryData[index2].threeWeek?this.entryData[index2].threeWeek:0)+parseFloat(this.entryData[index2].towWeek?this.entryData[index2].towWeek:0)+parseFloat(this.entryData[index2].oneWeek?this.entryData[index2].oneWeek:0)-parseFloat(this.entryData[index1].threeWeek?this.entryData[index1].threeWeek:0)-parseFloat(this.entryData[index1].towWeek?this.entryData[index1].towWeek:0)-parseFloat(this.entryData[index1].oneWeek?this.entryData[index1].oneWeek:0))):'');
          this.$set(this.entryData[index],"fourWeek",this.entryData[index2].fourWeek?changeTwoDecimal2((this.SCIndexData.syqckc[0].CNUM/10000+parseFloat(this.entryData[index2].fourWeek?this.entryData[index2].fourWeek:0)+parseFloat(this.entryData[index2].threeWeek?this.entryData[index2].threeWeek:0)+parseFloat(this.entryData[index2].towWeek?this.entryData[index2].towWeek:0)+parseFloat(this.entryData[index2].oneWeek?this.entryData[index2].oneWeek:0)-parseFloat(this.entryData[index1].fourWeek?this.entryData[index1].fourWeek:0)-parseFloat(this.entryData[index1].threeWeek?this.entryData[index1].threeWeek:0)-parseFloat(this.entryData[index1].towWeek?this.entryData[index1].towWeek:0)-parseFloat(this.entryData[index1].oneWeek?this.entryData[index1].oneWeek:0))):'');
          this.entryData[index].total = this.entryData[index].fourWeek?this.entryData[index].fourWeek:''
          this.$set(this.entryData[index3],"oneWeek",this.SCIndexData.sysyhy[0].CNUM?changeTwoDecimal2((parseFloat(this.entryData[index].oneWeek?this.entryData[index].oneWeek:0))/(this.SCIndexData.sysyhy[0].CNUM/10000)*30):'');
          this.$set(this.entryData[index3],"towWeek",this.SCIndexData.sysyhy[0].CNUM?changeTwoDecimal2((parseFloat(this.entryData[index].towWeek?this.entryData[index].towWeek:0))/(this.SCIndexData.sysyhy[0].CNUM/10000)*30):'');
          this.$set(this.entryData[index3],"threeWeek",this.SCIndexData.sysyhy[0].CNUM?changeTwoDecimal2((parseFloat(this.entryData[index].threeWeek?this.entryData[index].threeWeek:0))/(this.SCIndexData.sysyhy[0].CNUM/10000)*30):'');
          this.$set(this.entryData[index3],"fourWeek",this.SCIndexData.sysyhy[0].CNUM?changeTwoDecimal2((parseFloat(this.entryData[index].fourWeek?this.entryData[index].fourWeek:0))/(this.SCIndexData.sysyhy[0].CNUM/10000)*30):'');
          this.entryData[index3].total = this.entryData[index3].fourWeek?this.entryData[index3].fourWeek:''
        }
        if (row.quota === "饲料采购数量(吨)" || row.quota === "饲料耗用数量(吨)") {
          let index = this.entryData.findIndex(ele => ele.quota === "饲料库存数量(吨)");
          let index1 = this.entryData.findIndex(ele => ele.quota === "饲料耗用数量(吨)");
          let index2 = this.entryData.findIndex(ele => ele.quota === "饲料采购数量(吨)");
          let index3 = this.entryData.findIndex(ele => ele.quota === "饲料库存天数(天)");
          if (!this.SCIndexData.slqckc[0]) {
            this.SCIndexData.slqckc[0] = {}
            this.SCIndexData.slqckc[0].CNUM = 0;
          }
          if (!this.SCIndexData.slsyhy[0]) {
            this.SCIndexData.slsyhy[0] = {}
            this.SCIndexData.slsyhy[0].CNUM = 0;
          }
          let syTotal = changeTwoDecimal2(this.SCIndexData.slqckc[0].CNUM?this.SCIndexData.slqckc[0].CNUM/10000:0)
          if (key === "oneWeek") {
            syTotal = syTotal?syTotal:0+(this.entryData[index2].oneWeek?this.entryData[index2].oneWeek:0)
          }
          if (key === "towWeek") {
            syTotal = syTotal?syTotal:0+(this.entryData[index2].oneWeek?this.entryData[index2].oneWeek:0)+(this.entryData[index2].towWeek?this.entryData[index2].towWeek:0)-(this.entryData[index1].oneWeek?this.entryData[index1].oneWeek:0)
          }
          if (key === "threeWeek") {
            syTotal = syTotal?syTotal:0+(this.entryData[index2].threeWeek?this.entryData[index2].threeWeek:0)+(this.entryData[index2].towWeek?this.entryData[index2].towWeek:0)+(this.entryData[index2].oneWeek?this.entryData[index2].oneWeek:0)-(this.entryData[index1].oneWeek?this.entryData[index1].oneWeek:0)-(this.entryData[index1].towWeek?this.entryData[index1].towWeek:0)
          }
          if (key === "fourWeek") {
            syTotal = syTotal?syTotal:0+(this.entryData[index2].fourWeek?this.entryData[index2].fourWeek:0)+(this.entryData[index2].threeWeek?this.entryData[index2].threeWeek:0)+(this.entryData[index2].towWeek?this.entryData[index2].towWeek:0)+(this.entryData[index2].oneWeek?this.entryData[index2].oneWeek:0)-(this.entryData[index1].oneWeek?this.entryData[index1].oneWeek:0)-(this.entryData[index1].towWeek?this.entryData[index1].towWeek:0)-(this.entryData[index1].threeWeek?this.entryData[index1].threeWeek:0)
          }
         
          if (["饲料耗用数量(吨)"].includes(row.quota)) {
            if (row[key] > Math.ceil(syTotal)) {
              row.total = (row.total - row[key])?changeTwoDecimal2(row.total - row[key]):''
              row[key] = ''
            }
          }
          this.$set(this.entryData[index],"oneWeek",this.entryData[index2].oneWeek?changeTwoDecimal2((this.SCIndexData.slqckc[0].CNUM/10000+parseFloat(this.entryData[index2].oneWeek?this.entryData[index2].oneWeek:0)-parseFloat(this.entryData[index1].oneWeek?this.entryData[index1].oneWeek:0))):'');
          this.$set(this.entryData[index],"towWeek",this.entryData[index2].towWeek?changeTwoDecimal2((this.SCIndexData.slqckc[0].CNUM/10000+parseFloat(this.entryData[index2].towWeek?this.entryData[index2].towWeek:0)+parseFloat(this.entryData[index2].oneWeek?this.entryData[index2].oneWeek:0)-parseFloat(this.entryData[index1].towWeek?this.entryData[index1].towWeek:0)-parseFloat(this.entryData[index1].oneWeek?this.entryData[index1].oneWeek:0))):'');
          this.$set(this.entryData[index],"threeWeek",this.entryData[index2].threeWeek?changeTwoDecimal2((this.SCIndexData.slqckc[0].CNUM/10000+parseFloat(this.entryData[index2].threeWeek?this.entryData[index2].threeWeek:0)+parseFloat(this.entryData[index2].towWeek?this.entryData[index2].towWeek:0)+parseFloat(this.entryData[index2].oneWeek?this.entryData[index2].oneWeek:0)-parseFloat(this.entryData[index1].threeWeek?this.entryData[index1].threeWeek:0)-parseFloat(this.entryData[index1].towWeek?this.entryData[index1].towWeek:0)-parseFloat(this.entryData[index1].oneWeek?this.entryData[index1].oneWeek:0))):'');
          this.$set(this.entryData[index],"fourWeek",this.entryData[index2].fourWeek?changeTwoDecimal2((this.SCIndexData.slqckc[0].CNUM/10000+parseFloat(this.entryData[index2].fourWeek?this.entryData[index2].fourWeek:0)+parseFloat(this.entryData[index2].threeWeek?this.entryData[index2].threeWeek:0)+parseFloat(this.entryData[index2].towWeek?this.entryData[index2].towWeek:0)+parseFloat(this.entryData[index2].oneWeek?this.entryData[index2].oneWeek:0)-parseFloat(this.entryData[index1].fourWeek?this.entryData[index1].fourWeek:0)-parseFloat(this.entryData[index1].threeWeek?this.entryData[index1].threeWeek:0)-parseFloat(this.entryData[index1].towWeek?this.entryData[index1].towWeek:0)-parseFloat(this.entryData[index1].oneWeek?this.entryData[index1].oneWeek:0))):'');
          this.entryData[index].total = this.entryData[index].fourWeek?this.entryData[index].fourWeek:''
          this.$set(this.entryData[index3],"oneWeek",this.SCIndexData.slsyhy[0].CNUM?changeTwoDecimal2((parseFloat(this.entryData[index].oneWeek?this.entryData[index].oneWeek:0))/(this.SCIndexData.slsyhy[0].CNUM/10000)*30):'');
          this.$set(this.entryData[index3],"towWeek",this.SCIndexData.slsyhy[0].CNUM?changeTwoDecimal2((parseFloat(this.entryData[index].towWeek?this.entryData[index].towWeek:0))/(this.SCIndexData.slsyhy[0].CNUM/10000)*30):'');
          this.$set(this.entryData[index3],"threeWeek",this.SCIndexData.slsyhy[0].CNUM?changeTwoDecimal2((parseFloat(this.entryData[index].threeWeek?this.entryData[index].threeWeek:0))/(this.SCIndexData.slsyhy[0].CNUM/10000)*30):'');
          this.$set(this.entryData[index3],"fourWeek",this.SCIndexData.slsyhy[0].CNUM?changeTwoDecimal2((parseFloat(this.entryData[index].fourWeek?this.entryData[index].fourWeek:0))/(this.SCIndexData.slsyhy[0].CNUM/10000)*30):'');
          this.entryData[index3].total = this.entryData[index3].fourWeek?this.entryData[index3].fourWeek:''
        }
        if (["114天前配种数(头)","分娩窝数(头)"].includes(row.quota)) {
          let index = this.entryData.findIndex(ele => ele.quota === "114天前配种数(头)");
          let index1 = this.entryData.findIndex(ele => ele.quota === "分娩窝数(头)");
          let index2 = this.entryData.findIndex(ele => ele.quota === "配种分娩率(%)");
          this.$set(this.entryData[index2],"oneWeek",this.entryData[index].oneWeek?changeTwoDecimal2((this.entryData[index1].oneWeek)/this.entryData[index].oneWeek*100):'');
          this.$set(this.entryData[index2],"towWeek",this.entryData[index].towWeek?changeTwoDecimal2((this.entryData[index1].towWeek)/this.entryData[index].towWeek*100):'');
          this.$set(this.entryData[index2],"threeWeek",this.entryData[index].threeWeek?changeTwoDecimal2((this.entryData[index1].threeWeek)/this.entryData[index].threeWeek*100):'');
          this.$set(this.entryData[index2],"fourWeek",this.entryData[index].fourWeek?changeTwoDecimal2((this.entryData[index1].fourWeek)/this.entryData[index].fourWeek*100):'');
          this.entryData[index2].total = (this.entryData[index1].total&&this.entryData[index].total)?changeTwoDecimal2(this.entryData[index1].total/this.entryData[index].total):''
        }
      } else if (avg.includes(row.quota)) {
        let index = null;
        let index1 = null ;
        if (["外销仔猪均价(元/头)","内调仔猪均价(元/头)","外销7kg小种猪均价(元/头)"].includes(row.quota)) {
          let index3 = null;
          if (row.quota === "外销仔猪均价(元/头)") {
            index3 = this.entryData.findIndex(ele => ele.quota === "外销仔猪均价(元/头)");
          }
          if (row.quota === "内调仔猪均价(元/头)") {
            index3 = this.entryData.findIndex(ele => ele.quota === "内调仔猪均价(元/头)");
            if (this.CMData[0]) {
              let total = (((this.entryData[index3].oneWeek?this.entryData[index3].oneWeek:0)*(this.CMData[0].fwb_first_week?this.CMData[0].fwb_first_week:0)) +
                ((this.entryData[index3].towWeek?this.entryData[index3].towWeek:0)*(this.CMData[0].fwb_second_week?this.CMData[0].fwb_second_week:0)) +
                ((this.entryData[index3].threeWeek?this.entryData[index3].threeWeek:0)*(this.CMData[0].fwb_third_week?this.CMData[0].fwb_third_week:'')) +
                ((this.entryData[index3].fourWeek?this.entryData[index3].fourWeek:0)*(this.CMData[0].fwb_fourth_week?this.CMData[0].fwb_fourth_week:0)))
              let ecscv = (this.CMData[0].fwb_first_week?this.CMData[0].fwb_first_week:0)+(this.CMData[0].fwb_second_week?this.CMData[0].fwb_second_week:0)+(this.CMData[0].fwb_third_week?this.CMData[0].fwb_third_week:0)+(this.CMData[0].fwb_fourth_week?this.CMData[0].fwb_fourth_week:0)
              this.$set(this.entryData[index3],"total",(ecscv && total)?changeTwoDecimal2(total/ecscv):'')
              // this.$set(this.entryData[index3],"nextMonthAims",ecscv?changeTwoDecimal2(total/ecscv):'')
              // this.$set(this.entryData[index3],"twoMonthAims",ecscv?changeTwoDecimal2(total/ecscv):'')
            }
            return
          }
          if (row.quota === "外销7kg小种猪均价(元/头)") {
            index3 = this.entryData.findIndex(ele => ele.quota === "外销7kg小种猪均价(元/头)");
          }
          if (this.CMData[0]) {
            let total = (((this.entryData[index3].oneWeek?this.entryData[index3].oneWeek:0)*(this.CMData[0].wx_first_week?this.CMData[0].wx_first_week:0)) +
              ((this.entryData[index3].towWeek?this.entryData[index3].towWeek:0)*(this.CMData[0].wx_second_week?this.CMData[0].wx_second_week:0)) +
              ((this.entryData[index3].threeWeek?this.entryData[index3].threeWeek:0)*(this.CMData[0].wx_third_week?this.CMData[0].wx_third_week:'')) +
              ((this.entryData[index3].fourWeek?this.entryData[index3].fourWeek:0)*(this.CMData[0].wx_fourth_week?this.CMData[0].wx_fourth_week:0)))
            let ecscv = (this.CMData[0].wx_first_week?this.CMData[0].wx_first_week:0)+(this.CMData[0].wx_second_week?this.CMData[0].wx_second_week:0)+(this.CMData[0].wx_third_week?this.CMData[0].wx_third_week:0)+(this.CMData[0].wx_fourth_week?this.CMData[0].wx_fourth_week:0)
            this.$set(this.entryData[index3],"total",(ecscv && total)?changeTwoDecimal2(total/ecscv):'')
          }
          return
        }
        if (row.quota === "肥猪平均销售价格(元/斤)") {
          let index3 = this.entryData.findIndex(ele => ele.quota === "肥猪上市头数(头)");
          let index4 = this.entryData.findIndex(ele => ele.quota === "肥猪平均销售体重(斤/头)");
          let index5 = this.entryData.findIndex(ele => ele.quota === "肥猪平均销售价格(元/斤)");
          let total = (((this.entryData[index3].oneWeek?this.entryData[index3].oneWeek:0)*(this.entryData[index4].oneWeek?this.entryData[index4].oneWeek:0)*(row.oneWeek?row.oneWeek:0))+
           ((this.entryData[index3].towWeek?this.entryData[index3].towWeek:0)*(this.entryData[index4].towWeek?this.entryData[index4].towWeek:0)*(row.towWeek?row.towWeek:0)) +
           ((this.entryData[index3].threeWeek?this.entryData[index3].threeWeek:0)*(this.entryData[index4].threeWeek?this.entryData[index4].threeWeek:0)*(row.threeWeek?row.threeWeek:0)) +
           ((this.entryData[index3].fourWeek?this.entryData[index3].fourWeek:0)*(this.entryData[index4].fourWeek?this.entryData[index4].fourWeek:0)*(row.fourWeek?row.fourWeek:0)))/((this.entryData[index3].oneWeek?this.entryData[index3].oneWeek:0)*(this.entryData[index4].oneWeek?this.entryData[index4].oneWeek:0)
            + (this.entryData[index3].towWeek?this.entryData[index3].towWeek:0)*(this.entryData[index4].towWeek?this.entryData[index4].towWeek:0)+(this.entryData[index3].threeWeek?this.entryData[index3].threeWeek:0)*(this.entryData[index4].threeWeek?this.entryData[index4].threeWeek:0)+
            (this.entryData[index3].fourWeek?this.entryData[index3].fourWeek:0)*(this.entryData[index4].fourWeek?this.entryData[index4].fourWeek:0))
          this.$set(this.entryData[index5],"total",total?changeTwoDecimal2(total):0)
          return
        }
        if (["单斤标准成本(元/斤)"].includes(row.quota)) {
          let index3 = this.entryData.findIndex(ele => ele.quota === "肥猪上市头数(头)");
          let index4 = this.entryData.findIndex(ele => ele.quota === "肥猪平均销售体重(斤/头)");
          let index5 = this.entryData.findIndex(ele => ele.quota === "单斤标准成本(元/斤)");
          let cstotal = ((this.entryData[index3].oneWeek?this.entryData[index3].oneWeek:0)*(this.entryData[index4].oneWeek?this.entryData[index4].oneWeek:0)
            + (this.entryData[index3].towWeek?this.entryData[index3].towWeek:0)*(this.entryData[index4].towWeek?this.entryData[index4].towWeek:0)+(this.entryData[index3].threeWeek?this.entryData[index3].threeWeek:0)*(this.entryData[index4].threeWeek?this.entryData[index4].threeWeek:0)+
            (this.entryData[index3].fourWeek?this.entryData[index3].fourWeek:0)*(this.entryData[index4].fourWeek?this.entryData[index4].fourWeek:0))
          let total = (((this.entryData[index3].oneWeek?this.entryData[index3].oneWeek:0)*(this.entryData[index4].oneWeek?this.entryData[index4].oneWeek:0)*(row.oneWeek?row.oneWeek:0))+
           ((this.entryData[index3].towWeek?this.entryData[index3].towWeek:0)*(this.entryData[index4].towWeek?this.entryData[index4].towWeek:0)*(row.towWeek?row.towWeek:0)) +
           ((this.entryData[index3].threeWeek?this.entryData[index3].threeWeek:0)*(this.entryData[index4].threeWeek?this.entryData[index4].threeWeek:0)*(row.threeWeek?row.threeWeek:0)) +
           ((this.entryData[index3].fourWeek?this.entryData[index3].fourWeek:0)*(this.entryData[index4].fourWeek?this.entryData[index4].fourWeek:0)*(row.fourWeek?row.fourWeek:0)))
          this.$set(this.entryData[index5],"total",(total && cstotal)?changeTwoDecimal2(total/cstotal):'')
          return
        }
        if (["肥猪料肉比(kg)"].includes(row.quota)) {
          let index3 = this.entryData.findIndex(ele => ele.quota === "肥猪平均销售体重(斤/头)");
          let index4 = this.entryData.findIndex(ele => ele.quota === "肥猪上市头数(头)");
          let index5 = this.entryData.findIndex(ele => ele.quota === "肥猪料肉比(kg)");
          let total = (((this.entryData[index3].oneWeek?this.entryData[index3].oneWeek:0)*(this.entryData[index4].oneWeek?this.entryData[index4].oneWeek:0)*(row.oneWeek?row.oneWeek:0))+
           ((this.entryData[index3].towWeek?this.entryData[index3].towWeek:0)*(this.entryData[index4].towWeek?this.entryData[index4].towWeek:0)*(row.towWeek?row.towWeek:0)) +
           ((this.entryData[index3].threeWeek?this.entryData[index3].threeWeek:0)*(this.entryData[index4].threeWeek?this.entryData[index4].threeWeek:0)*(row.threeWeek?row.threeWeek:0)) +
           ((this.entryData[index3].fourWeek?this.entryData[index3].fourWeek:0)*(this.entryData[index4].fourWeek?this.entryData[index4].fourWeek:0)*(row.fourWeek?row.fourWeek:0)))/((this.entryData[index3].oneWeek?this.entryData[index3].oneWeek:0)*(this.entryData[index4].oneWeek?this.entryData[index4].oneWeek:0)
            + (this.entryData[index3].towWeek?this.entryData[index3].towWeek:0)*(this.entryData[index4].towWeek?this.entryData[index4].towWeek:0)+(this.entryData[index3].threeWeek?this.entryData[index3].threeWeek:0)*(this.entryData[index4].threeWeek?this.entryData[index4].threeWeek:0)+
            (this.entryData[index3].fourWeek?this.entryData[index3].fourWeek:0)*(this.entryData[index4].fourWeek?this.entryData[index4].fourWeek:0))
          this.$set(this.entryData[index5],"total",total?changeTwoDecimal2(total):'')
          return
        }
        if (["后备淘汰率(%)"].includes(row.quota)) {
          index = this.entryData.findIndex(ele => ele.quota === "后备母猪淘汰数(头)");
          index1 = this.entryData.findIndex(ele => ele.quota === "后备淘汰率(%)");
        }
        if (["完结批次利用率(%)"].includes(row.quota)) {
          index = this.entryData.findIndex(ele => ele.quota === "完结批次总头数(头)");
          index1 = this.entryData.findIndex(ele => ele.quota === "完结批次利用率(%)");
        }
        if (["完结批次死亡率(%)"].includes(row.quota)) {
          index = this.entryData.findIndex(ele => ele.quota === "完结批次总头数(头)");
          index1 = this.entryData.findIndex(ele => ele.quota === "完结批次死亡率(%)");
        }
        if (["断配猪10天发情率(%)"].includes(row.quota)) {
          index = this.entryData.findIndex(ele => ele.quota === "断配猪10天发情数(头)");
          index1 = this.entryData.findIndex(ele => ele.quota === "断配猪10天发情率(%)");
        }
        if (["35天受孕率(%)"].includes(row.quota)) {
          index = this.entryData.findIndex(ele => ele.quota === "35天前配种数(头)");
          index1 = this.entryData.findIndex(ele => ele.quota === "35天受孕率(%)");
        }
        if (["经产母猪淘汰率(%)"].includes(row.quota)) {
          index = this.entryData.findIndex(ele => ele.quota === "经产母猪淘汰数(头)");
          index1 = this.entryData.findIndex(ele => ele.quota === "经产母猪淘汰率(%)");
        }
        if (["胎产总仔数(头)"].includes(row.quota)) {
          index = this.entryData.findIndex(ele => ele.quota === "分娩窝数(头)");
          index1 = this.entryData.findIndex(ele => ele.quota === "胎产总仔数(头)");
        }
        if (["胎产活仔(头)"].includes(row.quota)) {
          index = this.entryData.findIndex(ele => ele.quota === "分娩窝数(头)");
          index1 = this.entryData.findIndex(ele => ele.quota === "胎产活仔(头)");
          let index3 = this.entryData.findIndex(ele => ele.quota === "PSY");
          let index4 = this.entryData.findIndex(ele => ele.quota === "配种分娩率(%)");
          let index5 = this.entryData.findIndex(ele => ele.quota === "哺乳死亡率(%)");
          this.$set(this.entryData[index3],"oneWeek",changeTwoDecimal2((365/142)*(row.oneWeek?row.oneWeek:'')*(this.entryData[index4].oneWeek?this.entryData[index4].oneWeek:0)*(1-(this.entryData[index5].oneWeek?this.entryData[index5].oneWeek:0)/100)));
          this.$set(this.entryData[index3],"towWeek",changeTwoDecimal2((365/142)*(row.towWeek?row.towWeek:'')*(this.entryData[index4].towWeek?this.entryData[index4].towWeek:0)*(1-(this.entryData[index5].towWeek?this.entryData[index5].towWeek:0)/100)));
          this.$set(this.entryData[index3],"threeWeek",changeTwoDecimal2((365/142)*(row.threeWeek?row.threeWeek:'')*(this.entryData[index4].threeWeek?this.entryData[index4].threeWeek:0)*(1-(this.entryData[index5].threeWeek?this.entryData[index5].threeWeek:0)/100)));
          this.$set(this.entryData[index3],"fourWeek",changeTwoDecimal2((365/142)*(row.fourWeek?row.fourWeek:'')*(this.entryData[index4].fourWeek?this.entryData[index4].fourWeek:0)*(1-(this.entryData[index5].fourWeek?this.entryData[index5].fourWeek:0)/100)));
          this.entryData[index3].total = changeTwoDecimal2((365/142)*(row.total?row.total:0)*(this.entryData[index4].total?this.entryData[index4].total:0)*(1-(this.entryData[index5].total?this.entryData[index5].total:0)/100))
          if (this.entryData[index3].total) {
            this.entryData[index3].nextMonthAims = this.entryData[index3].total;
            this.entryData[index3].twoMonthAims = this.entryData[index3].total;
          }
          let index6 = this.entryData.findIndex(ele => ele.quota === "产活仔总数(头)");
          if (this.SCIndexData.fmws[0]) {
            this.$set(this.entryData[index6],"oneWeek",this.SCIndexData.fmws[0].FISRTWEEK?changeTwoDecimal2(this.SCIndexData.fmws[0].FISRTWEEK*(row.oneWeek?row.oneWeek:0)):'');
            this.$set(this.entryData[index6],"towWeek",this.SCIndexData.fmws[0].SECONDWEEK?changeTwoDecimal2(this.SCIndexData.fmws[0].SECONDWEEK*(row.towWeek?row.towWeek:0)):'');
            this.$set(this.entryData[index6],"threeWeek",this.SCIndexData.fmws[0].THIRDTWEEK?changeTwoDecimal2(this.SCIndexData.fmws[0].THIRDTWEEK*(row.threeWeek?row.threeWeek:0)):'');
            this.$set(this.entryData[index6],"fourWeek",this.SCIndexData.fmws[0].FOURTHWEEK?changeTwoDecimal2(this.SCIndexData.fmws[0].FOURTHWEEK*(row.fourWeek?row.fourWeek:0)):'');
            let total6 = (this.entryData[index6].oneWeek?this.entryData[index6].oneWeek:0)+(this.entryData[index6].towWeek?this.entryData[index6].towWeek:0) +
              (this.entryData[index6].threeWeek?this.entryData[index6].threeWeek:0)+(this.entryData[index6].fourWeek?this.entryData[index6].fourWeek:0)
            this.$set(this.entryData[index6],"total",total6?parseInt(total6):'');
            this.$set(this.entryData[index6],"nextMonthAims",this.SCIndexData.fmws[0].NEXTMONTH?changeTwoDecimal2(this.SCIndexData.fmws[0].NEXTMONTH*(row.nextMonthAims?row.nextMonthAims:0)):'');
            this.$set(this.entryData[index6],"twoMonthAims",this.SCIndexData.fmws[0].NEXT2MONTH?changeTwoDecimal2(this.SCIndexData.fmws[0].NEXT2MONTH*(row.twoMonthAims?row.twoMonthAims:0)):'');
          }
        }
        if (["30天死亡率(%)"].includes(row.quota)) {
          index = this.entryData.findIndex(ele => ele.quota === "30天死亡数(头)");
          index1 = this.entryData.findIndex(ele => ele.quota === "30天死亡率(%)");
          if (this.SCIndexData.tms[0]) {
            this.$set(this.entryData[index],"oneWeek",this.SCIndexData.tms[0].FIRSTWEEK?parseInt((row.oneWeek?row.oneWeek:0)*this.SCIndexData.tms[0].FIRSTWEEK):'');
            this.$set(this.entryData[index],"towWeek",this.SCIndexData.tms[0].SECONDWEEK?parseInt((row.towWeek?row.towWeek:0)*this.SCIndexData.tms[0].SECONDWEEK):'');
            this.$set(this.entryData[index],"threeWeek",this.SCIndexData.tms[0].THIRDWEEK?parseInt((row.threeWeek?row.threeWeek:0)*this.SCIndexData.tms[0].THIRDWEEK):'');
            this.$set(this.entryData[index],"fourWeek",this.SCIndexData.tms[0].FOURTHWEEK?parseInt((row.fourWeek?row.fourWeek:0)*this.SCIndexData.tms[0].FOURTHWEEK):'');
            let total = (this.entryData[index].oneWeek?this.entryData[index].oneWeek:0) + (this.entryData[index].towWeek?this.entryData[index].towWeek:0) + (this.entryData[index].threeWeek?this.entryData[index].threeWeek:0) + (this.entryData[index].fourWeek?this.entryData[index].fourWeek:0)
            this.$set(this.entryData[index],"total",total?total:'');
          }
        }
        /* if (["肥猪批次死亡率(%)"].includes(row.quota)) {
          index = this.entryData.findIndex(ele => ele.quota === "肥猪批次死亡数(头)");
          index1 = this.entryData.findIndex(ele => ele.quota === "肥猪批次死亡率(%)");
        } */
        if (["肥猪平均销售体重(斤/头)"].includes(row.quota)) {
          index = this.entryData.findIndex(ele => ele.quota === "肥猪上市头数(头)");
          index1 = this.entryData.findIndex(ele => ele.quota === "肥猪平均销售体重(斤/头)");
          let index5 = this.entryData.findIndex(ele => ele.quota === "肥猪料肉比(kg)");
          let total = (((this.entryData[index5].oneWeek?this.entryData[index5].oneWeek:0)*(this.entryData[index].oneWeek?this.entryData[index].oneWeek:0)*(row.oneWeek?row.oneWeek:0))+
           ((this.entryData[index5].towWeek?this.entryData[index5].towWeek:0)*(this.entryData[index].towWeek?this.entryData[index].towWeek:0)*(row.towWeek?row.towWeek:0)) +
           ((this.entryData[index5].threeWeek?this.entryData[index5].threeWeek:0)*(this.entryData[index].threeWeek?this.entryData[index].threeWeek:0)*(row.threeWeek?row.threeWeek:0)) +
           ((this.entryData[index5].fourWeek?this.entryData[index5].fourWeek:0)*(this.entryData[index].fourWeek?this.entryData[index].fourWeek:0)*(row.fourWeek?row.fourWeek:0)))/((this.entryData[index1].oneWeek?this.entryData[index1].oneWeek:0)*(this.entryData[index].oneWeek?this.entryData[index].oneWeek:0)
            + (this.entryData[index].towWeek?this.entryData[index].towWeek:0)*(this.entryData[index].towWeek?this.entryData[index].towWeek:0)+(this.entryData[index1].threeWeek?this.entryData[index1].threeWeek:0)*(this.entryData[index].threeWeek?this.entryData[index].threeWeek:0)+
            (this.entryData[index].fourWeek?this.entryData[index].fourWeek:0)*(this.entryData[index].fourWeek?this.entryData[index].fourWeek:0))
          this.$set(this.entryData[index5],"total",total?changeTwoDecimal2(total):'')
          let index6 = this.entryData.findIndex(ele => ele.quota === "单斤标准成本(元/斤)");
          let index7 = this.entryData.findIndex(ele => ele.quota === "肥猪上市头数(头)");
          let total6 = ((this.entryData[index6].oneWeek?this.entryData[index6].oneWeek:0)*(this.entryData[index].oneWeek?this.entryData[index].oneWeek:0)*(this.entryData[index1].oneWeek?this.entryData[index1].oneWeek:0)) + 
            ((this.entryData[index6].towWeek?this.entryData[index6].towWeek:0)*(this.entryData[index].towWeek?this.entryData[index].towWeek:0)*(this.entryData[index1].towWeek?this.entryData[index1].towWeek:0)) + 
            ((this.entryData[index6].threeWeek?this.entryData[index6].threeWeek:0)*(this.entryData[index].threeWeek?this.entryData[index].threeWeek:0)*(this.entryData[index1].threeWeek?this.entryData[index1].threeWeek:0)) +
            ((this.entryData[index6].fourWeek?this.entryData[index6].fourWeek:0)*(this.entryData[index].fourWeek?this.entryData[index].fourWeek:0)*(this.entryData[index1].fourWeek?this.entryData[index1].fourWeek:0))
          let escTotal = (this.entryData[index1].oneWeek?this.entryData[index1].oneWeek:0)*(this.entryData[index].oneWeek?this.entryData[index].oneWeek:0) + 
            (this.entryData[index1].towWeek?this.entryData[index1].towWeek:0)*(this.entryData[index].towWeek?this.entryData[index].towWeek:0) +
            (this.entryData[index1].threeWeek?this.entryData[index1].threeWeek:0)*(this.entryData[index].threeWeek?this.entryData[index].threeWeek:0) +
            (this.entryData[index1].fourWeek?this.entryData[index1].fourWeek:0)*(this.entryData[index].fourWeek?this.entryData[index].fourWeek:0)
          this.$set(this.entryData[index6],"total",(total6 && escTotal)?changeTwoDecimal2(total6/escTotal):'')
        }
        if (["断配猪10天发情率(%)"].includes(row.quota)) {
          index = this.entryData.findIndex(ele => ele.quota === "断配猪10天发情数(头)");
          index1 = this.entryData.findIndex(ele => ele.quota === "断配猪10天发情率(%)");
        }
        let total = ((this.entryData[index].oneWeek?this.entryData[index].oneWeek:0)*(row.oneWeek?row.oneWeek:0) + 
            (this.entryData[index].towWeek?this.entryData[index].towWeek:0)*(row.towWeek?row.towWeek:0) + 
            (this.entryData[index].threeWeek?this.entryData[index].threeWeek:0)*(row.threeWeek?row.threeWeek:0) +
            (this.entryData[index].fourWeek?this.entryData[index].fourWeek:0)*(row.fourWeek?row.fourWeek:0))
        if (this.entryData[index].total && total) {
          this.$set(this.entryData[index1],"total",changeTwoDecimal2(total/this.entryData[index].total))
        } else {
          this.$set(this.entryData[index1],"total",'')
        }
      } else if (end.includes(row.quota)) {
        row.total = row.fourWeek ? row.fourWeek : "";
      } else if (["配种分娩率(%)"].includes(row.quota)) {
        let index = this.entryData.findIndex(ele => ele.quota === "PSY");
        let index1 = this.entryData.findIndex(ele => ele.quota === "胎产活仔(头)");
        let index2 = this.entryData.findIndex(ele => ele.quota === "哺乳死亡率(%)");
        this.$set(this.entryData[index],"oneWeek",changeTwoDecimal2((365/142)*(row.oneWeek?row.oneWeek:'')*(this.entryData[index1].oneWeek?this.entryData[index1].oneWeek:0)*(1-(this.entryData[index2].oneWeek?this.entryData[index2].oneWeek:0)/100)));
        this.$set(this.entryData[index],"towWeek",changeTwoDecimal2((365/142)*(row.towWeek?row.towWeek:'')*(this.entryData[index1].towWeek?this.entryData[index1].towWeek:0)*(1-(this.entryData[index2].towWeek?this.entryData[index2].towWeek:0)/100)));
        this.$set(this.entryData[index],"threeWeek",changeTwoDecimal2((365/142)*(row.threeWeek?row.threeWeek:'')*(this.entryData[index1].threeWeek?this.entryData[index1].threeWeek:0)*(1-(this.entryData[index2].threeWeek?this.entryData[index2].threeWeek:0)/100)));
        this.$set(this.entryData[index],"fourWeek",changeTwoDecimal2((365/142)*(row.fourWeek?row.fourWeek:'')*(this.entryData[index1].fourWeek?this.entryData[index1].fourWeek:0)*(1-(this.entryData[index2].fourWeek?this.entryData[index2].fourWeek:0)/100)));
        this.entryData[index].total = changeTwoDecimal2((365/142)*(row.total?row.total:0)*(this.entryData[index1].total?this.entryData[index1].total:0)*(1-(this.entryData[index2].total?this.entryData[index2].total:0)/100))
        if (this.entryData[index].total) {
          this.entryData[index].nextMonthAims = this.entryData[index].total;
          this.entryData[index].twoMonthAims = this.entryData[index].total;
        }
      } else if (["配怀舍母猪日均耗料(kg)","猪苗次品率(%)","分娩舍母猪日均耗料(kg)"].includes(row.quota)) {
        let total =
          parseFloat(row.oneWeek ? row.oneWeek : 0) +
          parseFloat(row.towWeek ? row.towWeek : 0) +
          parseFloat(row.threeWeek ? row.threeWeek : 0) +
          parseFloat(row.fourWeek ? row.fourWeek : 0);
        row.total = total?changeTwoDecimal2(total/hasNumber):'';
      }
    },
    getIndex(id,period) {
      this.loading = true; // Va4AAAAZ7NnM567U  Va4AAAACFlPM567U  this.formatDate(period,"yyyy-MM")
      getSCIndex({ orgId: this.form.orgId, period: this.form.period }).then(res => { // "Va4AAAAAGsjM567U"
        JSON.parse(res.data).data.forEach(ele => {
          this.SCIndexData = Object.assign(this.SCIndexData, ele);
        });
        this.loading = false;
        console.log(this.SCIndexData);
        this.$nextTick(() => {
          this.defEntry();
        })
        this.getList()
      });
    },
    defEntry() {
      let Index16 = this.entryHeader.findIndex(ele => ele.quota === "总利润(万元)");
      if (this.SCIndexData.zll[0]) {
        this.$set(this.entryHeader[Index16],"oneWeek",this.SCIndexData.zll[0].CNUM?changeTwoDecimal2(this.SCIndexData.zll[0].CNUM/4/10000):'')
        this.$set(this.entryHeader[Index16],"towWeek",this.SCIndexData.zll[0].CNUM?changeTwoDecimal2(this.SCIndexData.zll[0].CNUM/4/10000):'')
        this.$set(this.entryHeader[Index16],"threeWeek",this.SCIndexData.zll[0].CNUM?changeTwoDecimal2(this.SCIndexData.zll[0].CNUM/4/10000):'')
        this.$set(this.entryHeader[Index16],"fourWeek",this.SCIndexData.zll[0].CNUM?changeTwoDecimal2(this.SCIndexData.zll[0].CNUM/4/10000):'')
        this.$set(this.entryHeader[Index16],"total",this.SCIndexData.zll[0].CNUM?changeTwoDecimal2(this.SCIndexData.zll[0].CNUM/10000):'');
        this.$set(this.entryHeader[Index16],"nextMonthAims",this.SCIndexData.zll[0].CNUM2?changeTwoDecimal2(this.SCIndexData.zll[0].CNUM2/10000):'')
        this.$set(this.entryHeader[Index16],"twoMonthAims",this.SCIndexData.zll[0].CNUM3?changeTwoDecimal2(this.SCIndexData.zll[0].CNUM3/10000):'')
      }
      let Index17 = this.entryHeader.findIndex(ele => ele.quota === "7KG仔猪成本(元/头)");
      if (this.SCIndexData.zzcb[0]) {
        this.$set(this.entryHeader[Index17],"oneWeek",this.SCIndexData.zzcb[0].CNUM?this.SCIndexData.zzcb[0].CNUM:'')
        this.$set(this.entryHeader[Index17],"towWeek",this.SCIndexData.zzcb[0].CNUM?this.SCIndexData.zzcb[0].CNUM:'')
        this.$set(this.entryHeader[Index17],"threeWeek",this.SCIndexData.zzcb[0].CNUM?this.SCIndexData.zzcb[0].CNUM:'')
        this.$set(this.entryHeader[Index17],"fourWeek",this.SCIndexData.zzcb[0].CNUM?this.SCIndexData.zzcb[0].CNUM:'')
        this.$set(this.entryHeader[Index17],"total",this.SCIndexData.zzcb[0].CNUM?this.SCIndexData.zzcb[0].CNUM:'')
        this.$set(this.entryHeader[Index17],"nextMonthAims",this.SCIndexData.zzcb[0].CNUM2?this.SCIndexData.zzcb[0].CNUM2:'')
        this.$set(this.entryHeader[Index17],"twoMonthAims",this.SCIndexData.zzcb[0].CNUM2?this.SCIndexData.zzcb[0].CNUM2:'')
      }
      let Index18 = this.entryHeader.findIndex(ele => ele.quota === "单斤销售成本(元/斤)");
      if (this.SCIndexData.djcb[0]) {
        this.$set(this.entryHeader[Index18],"oneWeek",this.SCIndexData.djcb[0].CNUM?this.SCIndexData.djcb[0].CNUM:'')
        this.$set(this.entryHeader[Index18],"towWeek",this.SCIndexData.djcb[0].CNUM?this.SCIndexData.djcb[0].CNUM:'')
        this.$set(this.entryHeader[Index18],"threeWeek",this.SCIndexData.djcb[0].CNUM?this.SCIndexData.djcb[0].CNUM:'')
        this.$set(this.entryHeader[Index18],"fourWeek",this.SCIndexData.djcb[0].CNUM?this.SCIndexData.djcb[0].CNUM:'')
        this.$set(this.entryHeader[Index18],"total",this.SCIndexData.djcb[0].CNUM?this.SCIndexData.djcb[0].CNUM:'')
        this.$set(this.entryHeader[Index18],"nextMonthAims",this.SCIndexData.djcb[0].CNUM?this.SCIndexData.djcb[0].CNUM:'')
        this.$set(this.entryHeader[Index18],"twoMonthAims",this.SCIndexData.djcb[0].CNUM?this.SCIndexData.djcb[0].CNUM:'')
      }
      // 未完
      let Index1 = this.entryHeader.findIndex(ele => ele.quota === "后备母猪死亡数(头)");
      let Index2 = this.entryHeader.findIndex(ele => ele.quota === "后备死亡率(%)");
      if (this.SCIndexData.hbcl[0]) { // 月初母猪头数
        this.$set(this.entryHeader[Index1],"oneWeek",this.SCIndexData.hbcl[0].CNUM?parseInt(this.SCIndexData.hbcl[0].CNUM*0.002):'')
        this.$set(this.entryHeader[Index1],"towWeek",this.SCIndexData.hbcl[0].CNUM?parseInt(this.SCIndexData.hbcl[0].CNUM*0.002):'')
        this.$set(this.entryHeader[Index1],"threeWeek",this.SCIndexData.hbcl[0].CNUM?parseInt(this.SCIndexData.hbcl[0].CNUM*0.002):'')
        this.$set(this.entryHeader[Index1],"fourWeek",this.SCIndexData.hbcl[0].CNUM?parseInt(this.SCIndexData.hbcl[0].CNUM*0.002):'')
        let total1 = (this.entryHeader[Index1].oneWeek?this.entryHeader[Index1].oneWeek:0) + (this.entryHeader[Index1].towWeek?this.entryHeader[Index1].towWeek:0) 
          + (this.entryHeader[Index1].threeWeek?this.entryHeader[Index1].threeWeek:0) + (this.entryHeader[Index1].fourWeek?this.entryHeader[Index1].fourWeek:0)
        this.$set(this.entryHeader[Index1],"total",total1?total1:'')
        this.$set(this.entryHeader[Index1],"nextMonthAims",this.SCIndexData.hbcl[0].CNUM?parseInt(this.SCIndexData.hbcl[0].CNUM*0.008):'')
        this.$set(this.entryHeader[Index1],"twoMonthAims",this.SCIndexData.hbcl[0].CNUM?parseInt(this.SCIndexData.hbcl[0].CNUM*0.008):'')
        this.$set(this.entryHeader[Index2],"total",total1?changeTwoDecimal2(total1*0.2/total1):'')
      }
      let Index3 = this.entryHeader.findIndex(ele => ele.quota === "35天受孕率(%)");
      let Index4 = this.entryHeader.findIndex(ele => ele.quota === "35天前配种数(头)");
      if (this.SCIndexData.pz35[0]) {
        this.$set(this.entryHeader[Index4],"oneWeek",this.SCIndexData.pz35[0].FIRSTWEEK?this.SCIndexData.pz35[0].FIRSTWEEK:'');
        this.$set(this.entryHeader[Index4],"towWeek",this.SCIndexData.pz35[0].SECONDWEEK?this.SCIndexData.pz35[0].SECONDWEEK:'');
        this.$set(this.entryHeader[Index4],"threeWeek",this.SCIndexData.pz35[0].THIRDWEEK?this.SCIndexData.pz35[0].THIRDWEEK:'');
        this.$set(this.entryHeader[Index4],"fourWeek",this.SCIndexData.pz35[0].FOURTHWEEK?this.SCIndexData.pz35[0].FOURTHWEEK:'');
        let total4 = this.SCIndexData.pz35[0].FIRSTWEEK+this.SCIndexData.pz35[0].SECONDWEEK+this.SCIndexData.pz35[0].THIRDWEEK+this.SCIndexData.pz35[0].FOURTHWEEK
        this.$set(this.entryHeader[Index4],"total",total4?total4:'');
        // 35天受孕率(%)
        this.$set(this.entryHeader[Index3],"total",this.entryHeader[Index4].total?93:'');
      }
      let Index5 = this.entryHeader.findIndex(ele => ele.quota === "月度批次空返率(%)");
      let Index6 = this.entryHeader.findIndex(ele => ele.quota === "空怀数(头)");
      if (this.SCIndexData.jccl[0]) {
        this.$set(this.entryHeader[Index6],"oneWeek",this.SCIndexData.jccl[0].CNUM?parseInt(this.SCIndexData.jccl[0].CNUM*this.entryHeader[Index5].oneWeek/(114/30*100)):'');
        this.$set(this.entryHeader[Index6],"towWeek",this.SCIndexData.jccl[0].CNUM?parseInt(this.SCIndexData.jccl[0].CNUM*this.entryHeader[Index5].towWeek/(114/30*100)):'');
        this.$set(this.entryHeader[Index6],"threeWeek",this.SCIndexData.jccl[0].CNUM?parseInt(this.SCIndexData.jccl[0].CNUM*this.entryHeader[Index5].threeWeek/(114/30*100)):'');
        this.$set(this.entryHeader[Index6],"fourWeek",this.SCIndexData.jccl[0].CNUM?parseInt(this.SCIndexData.jccl[0].CNUM*this.entryHeader[Index5].fourWeek/(114/30*100)):'');
        this.$set(this.entryHeader[Index6],"total",this.SCIndexData.jccl[0].CNUM?4*parseInt(this.SCIndexData.jccl[0].CNUM*this.entryHeader[Index5].oneWeek/(114/30*100)):'');
        this.$set(this.entryHeader[Index6],"nextMonthAims",this.SCIndexData.jccl[0].CNUM?parseInt(this.SCIndexData.jccl[0].CNUM*this.entryHeader[Index5].nextMonthAims/(114/30*100)):'');
        this.$set(this.entryHeader[Index6],"twoMonthAims",this.SCIndexData.jccl[0].CNUM?parseInt(this.SCIndexData.jccl[0].CNUM*this.entryHeader[Index5].twoMonthAims/(114/30*100)):'');
        let total5 = this.entryHeader[Index6].total?((this.entryHeader[Index5].oneWeek*this.entryHeader[Index6].oneWeek)+(this.entryHeader[Index5].towWeek*this.entryHeader[Index6].towWeek)+(this.entryHeader[Index5].threeWeek*this.entryHeader[Index6].threeWeek)+(this.entryHeader[Index5].fourWeek*this.entryHeader[Index6].fourWeek))/this.entryHeader[Index6].total:"";
        this.$set(this.entryHeader[Index5],"total",total5?changeTwoDecimal2(total5):'')
      }
      let Index7 = this.entryHeader.findIndex(ele => ele.quota === "月度批次流产率(%)");
      let Index8 = this.entryHeader.findIndex(ele => ele.quota === "流产数(头)");
      if (this.SCIndexData.jccl[0]) {
        this.$set(this.entryHeader[Index8],"oneWeek",this.SCIndexData.jccl[0].CNUM?parseInt(this.SCIndexData.jccl[0].CNUM*this.entryHeader[Index7].oneWeek/(114/30*100)):'');
        this.$set(this.entryHeader[Index8],"towWeek",this.SCIndexData.jccl[0].CNUM?parseInt(this.SCIndexData.jccl[0].CNUM*this.entryHeader[Index7].towWeek/(114/30*100)):'');
        this.$set(this.entryHeader[Index8],"threeWeek",this.SCIndexData.jccl[0].CNUM?parseInt(this.SCIndexData.jccl[0].CNUM*this.entryHeader[Index7].threeWeek/(114/30*100)):'');
        this.$set(this.entryHeader[Index8],"fourWeek",this.SCIndexData.jccl[0].CNUM?parseInt(this.SCIndexData.jccl[0].CNUM*this.entryHeader[Index7].fourWeek/(114/30*100)):'');
        this.$set(this.entryHeader[Index8],"total",this.SCIndexData.jccl[0].CNUM?4*parseInt(this.SCIndexData.jccl[0].CNUM*this.entryHeader[Index7].oneWeek/(114/30*100)):'');
        this.$set(this.entryHeader[Index8],"nextMonthAims",this.SCIndexData.jccl[0].CNUM?parseInt(this.SCIndexData.jccl[0].CNUM*this.entryHeader[Index7].nextMonthAims/(114/30*100)):'');
        this.$set(this.entryHeader[Index8],"twoMonthAims",this.SCIndexData.jccl[0].CNUM?parseInt(this.SCIndexData.jccl[0].CNUM*this.entryHeader[Index7].twoMonthAims/(114/30*100)):'');
        let total7 = this.entryHeader[Index8].total?((this.entryHeader[Index7].oneWeek*this.entryHeader[Index8].oneWeek)+(this.entryHeader[Index7].towWeek*this.entryHeader[Index8].towWeek)+(this.entryHeader[Index7].threeWeek*this.entryHeader[Index8].threeWeek)+(this.entryHeader[Index7].fourWeek*this.entryHeader[Index8].fourWeek))/this.entryHeader[Index8].total:"";
        this.$set(this.entryHeader[Index7],"total",total7?changeTwoDecimal2(total7):'')
      } 
      let Index10 = this.entryHeader.findIndex(ele => ele.quota === "经产母猪死亡数(头)");
      let Index26 = this.entryHeader.findIndex(ele => ele.quota === "经产母猪死亡率(%)");
      if (this.SCIndexData.jccl[0]) {
        this.$set(this.entryHeader[Index10],"oneWeek",this.SCIndexData.jccl[0].CNUM?parseInt(0.0006*this.SCIndexData.jccl[0].CNUM):'');
        this.$set(this.entryHeader[Index10],"towWeek",this.SCIndexData.jccl[0].CNUM?parseInt(0.0006*this.SCIndexData.jccl[0].CNUM):'');
        this.$set(this.entryHeader[Index10],"threeWeek",this.SCIndexData.jccl[0].CNUM?parseInt(0.0006*this.SCIndexData.jccl[0].CNUM):'');
        this.$set(this.entryHeader[Index10],"fourWeek",this.SCIndexData.jccl[0].CNUM?parseInt(0.0007*this.SCIndexData.jccl[0].CNUM):'');
        this.$set(this.entryHeader[Index10],"total",this.SCIndexData.jccl[0].CNUM?(3*parseInt(0.0006*this.SCIndexData.jccl[0].CNUM)+parseInt(0.0007*this.SCIndexData.jccl[0].CNUM)):'');
        this.$set(this.entryHeader[Index10],"nextMonthAims",this.SCIndexData.jccl[0].CNUM?parseInt(0.0025*this.SCIndexData.jccl[0].CNUM):'');
        this.$set(this.entryHeader[Index10],"twoMonthAims",this.SCIndexData.jccl[0].CNUM?parseInt(0.0025*this.SCIndexData.jccl[0].CNUM):'');
        let total26 = this.entryHeader[Index10].total?((this.entryHeader[Index26].oneWeek*this.entryHeader[Index10].oneWeek)+(this.entryHeader[Index26].towWeek*this.entryHeader[Index10].towWeek)+(this.entryHeader[Index26].threeWeek*this.entryHeader[Index10].threeWeek)+(this.entryHeader[Index26].fourWeek*this.entryHeader[Index10].fourWeek))/this.entryHeader[Index10].total:"";
        this.$set(this.entryHeader[Index26],"total",total26?changeTwoDecimal2(total26):'');
      }
      let Index11 = this.entryHeader.findIndex(ele => ele.quota === "母猪上产床(头)");
      if (this.SCIndexData.scf[0]) {
        this.$set(this.entryHeader[Index11],"oneWeek",this.SCIndexData.scf[0].FISRTWEEK?this.SCIndexData.scf[0].FISRTWEEK:'');
        this.$set(this.entryHeader[Index11],"towWeek",this.SCIndexData.scf[0].SECONDWEEK?this.SCIndexData.scf[0].SECONDWEEK:'');
        this.$set(this.entryHeader[Index11],"threeWeek",this.SCIndexData.scf[0].THIRDTWEEK?this.SCIndexData.scf[0].THIRDTWEEK:'');
        this.$set(this.entryHeader[Index11],"fourWeek",this.SCIndexData.scf[0].FOURTHWEEK?this.SCIndexData.scf[0].FOURTHWEEK:'');
        let total11 = this.SCIndexData.scf[0].FISRTWEEK+this.SCIndexData.scf[0].SECONDWEEK+this.SCIndexData.scf[0].THIRDTWEEK+this.SCIndexData.scf[0].FOURTHWEEK
        this.$set(this.entryHeader[Index11],"total",total11?total11:'');
        this.$set(this.entryHeader[Index11],"nextMonthAims",this.SCIndexData.scf[0].NEXTMONTH?this.SCIndexData.scf[0].NEXTMONTH:'')
        this.$set(this.entryHeader[Index11],"twoMonthAims",this.SCIndexData.scf[0].NEXT2MONTH?this.SCIndexData.scf[0].NEXT2MONTH:'')
      }
      let Index21 = this.entryHeader.findIndex(ele => ele.quota === "114天前配种数(头)");
      if (this.SCIndexData.pzs[0]) {
        this.$set(this.entryHeader[Index21],"oneWeek",this.SCIndexData.pzs[0].FIRSTWEEK?this.SCIndexData.pzs[0].FIRSTWEEK:'');
        this.$set(this.entryHeader[Index21],"towWeek",this.SCIndexData.pzs[0].SECONDWEEK?this.SCIndexData.pzs[0].SECONDWEEK:'');
        this.$set(this.entryHeader[Index21],"threeWeek",this.SCIndexData.pzs[0].THIRDWEEK?this.SCIndexData.pzs[0].THIRDWEEK:'');
        this.$set(this.entryHeader[Index21],"fourWeek",this.SCIndexData.pzs[0].FOURTHWEEK?this.SCIndexData.pzs[0].FOURTHWEEK:'');
        let total21 = this.SCIndexData.pzs[0].FIRSTWEEK+this.SCIndexData.pzs[0].SECONDWEEK+this.SCIndexData.pzs[0].THIRDWEEK+this.SCIndexData.pzs[0].FOURTHWEEK
        this.$set(this.entryHeader[Index21],"total",total21?total21:'');
        this.$set(this.entryHeader[Index21],"nextMonthAims",this.SCIndexData.pzs[0].NEXTMONTH?this.SCIndexData.pzs[0].NEXTMONTH:'')
        this.$set(this.entryHeader[Index21],"twoMonthAims",this.SCIndexData.pzs[0].NEXT2MONTH?this.SCIndexData.pzs[0].NEXT2MONTH:'')
      }
      let Index22 = this.entryHeader.findIndex(ele => ele.quota === "其中：已损失头数(头)");
      if (this.SCIndexData.ssts[0]) {
        this.$set(this.entryHeader[Index22],"oneWeek",this.SCIndexData.ssts[0].FIRSTWEEK?this.SCIndexData.ssts[0].FIRSTWEEK:'');
        this.$set(this.entryHeader[Index22],"towWeek",this.SCIndexData.ssts[0].SECONDWEEK?this.SCIndexData.ssts[0].SECONDWEEK:'');
        this.$set(this.entryHeader[Index22],"threeWeek",this.SCIndexData.ssts[0].THIRDWEEK?this.SCIndexData.ssts[0].THIRDWEEK:'');
        this.$set(this.entryHeader[Index22],"fourWeek",this.SCIndexData.ssts[0].FOURTHWEEK?this.SCIndexData.ssts[0].FOURTHWEEK:'');
        let total22 = this.SCIndexData.ssts[0].FIRSTWEEK+this.SCIndexData.ssts[0].SECONDWEEK+this.SCIndexData.ssts[0].THIRDWEEK+this.SCIndexData.ssts[0].FOURTHWEEK
        this.$set(this.entryHeader[Index22],"total",total22?total22:'');
        this.$set(this.entryHeader[Index22],"nextMonthAims",this.SCIndexData.ssts[0].NEXTMONTH?this.SCIndexData.ssts[0].NEXTMONTH:'')
        this.$set(this.entryHeader[Index22],"twoMonthAims",this.SCIndexData.ssts[0].NEXT2MONTH?this.SCIndexData.ssts[0].NEXT2MONTH:'')
      }
      let Index23 = this.entryHeader.findIndex(ele => ele.quota === "配种分娩率(%)");
      if (this.SCIndexData.pzs[0]) {
        this.$set(this.entryHeader[Index23],"oneWeek",this.SCIndexData.pzs[0].FIRSTWEEK?changeTwoDecimal2((this.SCIndexData.pzs[0].FIRSTWEEK-(this.SCIndexData.ssts[0]?this.SCIndexData.ssts[0].FIRSTWEEK:0))/this.SCIndexData.pzs[0].FISRTWEEK*100):'');
        this.$set(this.entryHeader[Index23],"towWeek",this.SCIndexData.pzs[0].SECONDWEEK?changeTwoDecimal2((this.SCIndexData.pzs[0].SECONDWEEK-(this.SCIndexData.ssts[0]?this.SCIndexData.ssts[0].SECONDWEEK:0))/this.SCIndexData.pzs[0].SECONDWEEK*100):'');
        this.$set(this.entryHeader[Index23],"threeWeek",this.SCIndexData.pzs[0].THIRDWEEK?changeTwoDecimal2(((this.SCIndexData.pzs[0].THIRDWEEK-(this.SCIndexData.ssts[0]?this.SCIndexData.ssts[0].THIRDWEEK:0))/this.SCIndexData.pzs[0].THIRDWEEK)*100):'');
        this.$set(this.entryHeader[Index23],"fourWeek",this.SCIndexData.pzs[0].FOURTHWEEK?changeTwoDecimal2((this.SCIndexData.pzs[0].FOURTHWEEK-(this.SCIndexData.ssts[0]?this.SCIndexData.ssts[0].FOURTHWEEK:0))/this.SCIndexData.pzs[0].FOURTHWEEK*100):'');
        let total23 = this.entryHeader[Index21].total?(this.entryHeader[Index21].total-this.entryHeader[Index22].total)/this.entryHeader[Index21].total:''
        this.$set(this.entryHeader[Index23],"total",(total23 || total23===0)?changeTwoDecimal2(total23*100):'');
        let nextMonthAims23 = (this.entryHeader[Index21].nextMonthAims-this.entryHeader[Index22].nextMonthAims)/this.entryHeader[Index21].nextMonthAims*100-8;
        let twoMonthAims23 = (this.entryHeader[Index21].twoMonthAims-this.entryHeader[Index22].twoMonthAims)/this.entryHeader[Index21].twoMonthAims*100-8;
        this.$set(this.entryHeader[Index23],"nextMonthAims",nextMonthAims23?changeTwoDecimal2(nextMonthAims23):'');
        this.$set(this.entryHeader[Index23],"twoMonthAims",twoMonthAims23?changeTwoDecimal2(twoMonthAims23):'');
      }
      let Index12 = this.entryHeader.findIndex(ele => ele.quota === "分娩窝数(头)");
      if (this.SCIndexData.fmws[0]) {
        this.$set(this.entryHeader[Index12],"oneWeek",this.SCIndexData.fmws[0].FISRTWEEK?this.SCIndexData.fmws[0].FISRTWEEK:'');
        this.$set(this.entryHeader[Index12],"towWeek",this.SCIndexData.fmws[0].SECONDWEEK?this.SCIndexData.fmws[0].SECONDWEEK:'');
        this.$set(this.entryHeader[Index12],"threeWeek",this.SCIndexData.fmws[0].THIRDTWEEK?this.SCIndexData.fmws[0].THIRDTWEEK:'');
        this.$set(this.entryHeader[Index12],"fourWeek",this.SCIndexData.fmws[0].FOURTHWEEK?this.SCIndexData.fmws[0].FOURTHWEEK:'');
        let total12 = this.SCIndexData.fmws[0].FISRTWEEK+this.SCIndexData.fmws[0].SECONDWEEK+this.SCIndexData.fmws[0].THIRDTWEEK+this.SCIndexData.fmws[0].FOURTHWEEK
        this.$set(this.entryHeader[Index12],"total",total12?total12:'');
        this.$set(this.entryHeader[Index12],"nextMonthAims",this.SCIndexData.fmws[0].NEXTMONTH?this.SCIndexData.fmws[0].NEXTMONTH:'')
        this.$set(this.entryHeader[Index12],"twoMonthAims",this.SCIndexData.fmws[0].NEXT2MONTH?this.SCIndexData.fmws[0].NEXT2MONTH:'')
      }
      let Index20 = this.entryHeader.findIndex(ele => ele.quota === "产活仔总数(头)");
      if (this.SCIndexData.fmws[0]) {
        this.$set(this.entryHeader[Index20],"oneWeek",this.SCIndexData.fmws[0].FISRTWEEK?changeTwoDecimal2(this.SCIndexData.fmws[0].FISRTWEEK*10.8):'');
        this.$set(this.entryHeader[Index20],"towWeek",this.SCIndexData.fmws[0].SECONDWEEK?changeTwoDecimal2(this.SCIndexData.fmws[0].SECONDWEEK*10.8):'');
        this.$set(this.entryHeader[Index20],"threeWeek",this.SCIndexData.fmws[0].THIRDTWEEK?changeTwoDecimal2(this.SCIndexData.fmws[0].THIRDTWEEK*10.8):'');
        this.$set(this.entryHeader[Index20],"fourWeek",this.SCIndexData.fmws[0].FOURTHWEEK?changeTwoDecimal2(this.SCIndexData.fmws[0].FOURTHWEEK*10.8):'');
        let total20 = (this.SCIndexData.fmws[0].FISRTWEEK+this.SCIndexData.fmws[0].SECONDWEEK+this.SCIndexData.fmws[0].THIRDTWEEK+this.SCIndexData.fmws[0].FOURTHWEEK)*10.8
        this.$set(this.entryHeader[Index20],"total",total20?parseInt(total20):'');
        this.$set(this.entryHeader[Index20],"nextMonthAims",this.SCIndexData.fmws[0].NEXTMONTH?changeTwoDecimal2(this.SCIndexData.fmws[0].NEXTMONTH*10.8):'');
        this.$set(this.entryHeader[Index20],"twoMonthAims",this.SCIndexData.fmws[0].NEXT2MONTH?changeTwoDecimal2(this.SCIndexData.fmws[0].NEXT2MONTH*10.8):'');
      }
      let Index24 = this.entryHeader.findIndex(ele => ele.quota === "胎产总仔数(头)");
      let Index25 = this.entryHeader.findIndex(ele => ele.quota === "胎产活仔(头)");
      if (this.entryHeader[Index12].total) {
        this.entryHeader[Index24].total = this.entryHeader[Index12].total*11.5/this.entryHeader[Index12].total;
        this.entryHeader[Index25].total = this.entryHeader[Index12].total*11.5/this.entryHeader[Index12].total;
      }
      let Index13 = this.entryHeader.findIndex(ele => ele.quota === "30天死亡数(头)");
      if (this.SCIndexData.tms[0]) {
        this.$set(this.entryHeader[Index13],"oneWeek",this.SCIndexData.tms[0].FIRSTWEEK?parseInt(0.015*this.SCIndexData.tms[0].FIRSTWEEK):'');
        this.$set(this.entryHeader[Index13],"towWeek",this.SCIndexData.tms[0].SECONDWEEK?parseInt(0.015*this.SCIndexData.tms[0].SECONDWEEK):'');
        this.$set(this.entryHeader[Index13],"threeWeek",this.SCIndexData.tms[0].THIRDWEEK?parseInt(0.015*this.SCIndexData.tms[0].THIRDWEEK):'');
        this.$set(this.entryHeader[Index13],"fourWeek",this.SCIndexData.tms[0].FOURTHWEEK?parseInt(0.015*this.SCIndexData.tms[0].FOURTHWEEK):'');
        let total13 = parseInt(0.015*this.SCIndexData.tms[0].FIRSTWEEK)+parseInt(0.015*this.SCIndexData.tms[0].SECONDWEEK)+parseInt(0.015*this.SCIndexData.tms[0].THIRDWEEK)+parseInt(0.015*this.SCIndexData.tms[0].FOURTHWEEK)
        this.$set(this.entryHeader[Index13],"total",total13?total13:'');
      }
      let Index27 = this.entryHeader.findIndex(ele => ele.quota === "PSY");
      let total27 = (365/142)*(this.entryHeader[Index23].total/100)*this.entryHeader[Index25].total*(1-1/100);
      let nextMonthAims27 = (365/142)*(this.entryHeader[Index23].nextMonthAims/100)*this.entryHeader[Index25].nextMonthAims*(1-4/100);
      let twoMonthAims27 = (365/142)*(this.entryHeader[Index23].twoMonthAims/100)*this.entryHeader[Index25].twoMonthAims*(1-4/100);
      this.$set(this.entryHeader[Index27],"oneWeek",total27?changeTwoDecimal2(total27):'')
      this.$set(this.entryHeader[Index27],"towWeek",total27?changeTwoDecimal2(total27):'')
      this.$set(this.entryHeader[Index27],"threeWeek",total27?changeTwoDecimal2(total27):'')
      this.$set(this.entryHeader[Index27],"fourWeek",total27?changeTwoDecimal2(total27):'')
      this.$set(this.entryHeader[Index27],"total",total27?changeTwoDecimal2(total27):'')
      this.$set(this.entryHeader[Index27],"nextMonthAims",nextMonthAims27?changeTwoDecimal2(nextMonthAims27):'');
      this.$set(this.entryHeader[Index27],"twoMonthAims",twoMonthAims27?changeTwoDecimal2(twoMonthAims27):'');
      let Index14 = this.entryHeader.findIndex(ele => ele.quota === "肥猪死亡数(头)");
      if (this.SCIndexData.fzcl[0]) {
        this.$set(this.entryHeader[Index14],"oneWeek",this.SCIndexData.fzcl[0].CNUM?parseInt(0.0025*this.SCIndexData.fzcl[0].CNUM):'');
        this.$set(this.entryHeader[Index14],"towWeek",this.SCIndexData.fzcl[0].CNUM?parseInt(0.0025*this.SCIndexData.fzcl[0].CNUM):'');
        this.$set(this.entryHeader[Index14],"threeWeek",this.SCIndexData.fzcl[0].CNUM?parseInt(0.0025*this.SCIndexData.fzcl[0].CNUM):'');
        this.$set(this.entryHeader[Index14],"fourWeek",this.SCIndexData.fzcl[0].CNUM?parseInt(0.0025*this.SCIndexData.fzcl[0].CNUM):'');
        this.$set(this.entryHeader[Index14],"total",this.SCIndexData.fzcl[0].CNUM?4*parseInt(0.0025*this.SCIndexData.fzcl[0].CNUM):'');
        this.$set(this.entryHeader[Index14],"nextMonthAims",this.SCIndexData.fzcl[0].CNUM?parseInt(0.01*this.SCIndexData.fzcl[0].CNUM):'');
        this.$set(this.entryHeader[Index14],"twoMonthAims",this.SCIndexData.fzcl[0].CNUM?parseInt(0.01*this.SCIndexData.fzcl[0].CNUM):'');
      }
      let Index28 = this.entryHeader.findIndex(ele => ele.quota === "肥猪死亡率(%)");
      let total28 = this.entryHeader[Index14].total?(parseInt(0.0025*this.SCIndexData.fzcl[0].CNUM)*0.0025*4)/this.entryHeader[Index14].total:''
    },
    getCM() {
      // this.form.orgId = "Va4AAACHQ3ztzlUp"
      this.form.period = new Date(this.form.period).getTime()
      getCMPig(this.form).then(res => {
        if (res.status === 200) {
          console.log("res",res)
          if (!res.data && this.$store.getters.orgInfo.type === '7') {
            this.$message.warning("出苗小计无数据！")
          }
          this.CMData = res.data
        }
      })
    },
    checkReport() {
      let params = {
        orgId: this.$store.getters.orgInfo.id,
        dateMonth: this.$store.getters.planYearMonth
      };
      checkReportIsSp(params).then(res => {
        if (res.status != 200) {
          this.reverseAuditStatus = false;
        }
      });
    },
    checkSave() {
      checkReportIsSave({orgId: this.$store.getters.orgInfo.id,dateMonth: this.$store.getters.planYearMonth}).then(res => {
        if (res.status !== 200) {
          this.saveStatus = false;
        }
      })
    },
    checkFCSave() {
      checkFCSave({orgId: this.form.orgId,period: this.$store.getters.planYearMonth}).then(res => {
        if (res.status == 200) {
          this.FCSave = res.data === "ok"?true:false;
          if (!this.FCSave) {
             this.$message.warning(res.data)
          }
        }
      })
    },
    // 导出数据
    exportDataEvent(){
      let exportParams = {
        productionPlan: {
          orgName: this.$store.getters.orgInfo.name,
          period: new Date(this.$store.getters.planYearMonth).getTime()
        },
        productionPlanEntries: this.entryData
      }
      if(this.entryData.length){
        let myObj = {
          method: 'post',
          url:'plan/exportExcel',
          fileName: '繁殖生产指标计划表',
          data: exportParams
        }
        exportReport(myObj)
      }else{
        this.$message({
          message: "无数据不能导出！！",
          type: "warning"
        });
      }
    },
    // 导入
    importDataEvent(params) {
      const _file = params.file;
      const isLt20M = _file.size / 1024 / 1024 < 20;
      let formData = new FormData();
      formData.append("file", _file);
      if (!isLt20M) {
        this.$refs.upload.clearFiles();
        this.$message.error("请上传20M以下的文件");
        return false;
      }
      request({
        url: `${process.env.BASE_API}/BUSINESSREPORT/plan/excelUpload`,
        method: 'post',
        data: formData,
      }).then(res => {
        this.$refs.upload.clearFiles();
        if (res.status === 200) {
          let ids = this.entryData.map(e => e.id);
          if (ids.length && !ids.includes(undefined || null)) {
            this.entryIds = ids
          }
          this.entryData = res.data;
          this.$message.success('导入成功');
        } else {
          this.$message.error('导入失败');
        }
      }).catch(err => {
        this.$refs.upload.clearFiles();
        this.$message.error(`${error}`);
      });
    },
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
    computedDOMHeight() {
      let curClientHeight = document.body.clientHeight  // 当前屏幕高度
      let pageContentHeight = curClientHeight - this.$refs.pageContent.getBoundingClientRect().top
      this.$refs.pageContent.style.height = (pageContentHeight - 10) + 'px'

      let contentHeadHeight = document.querySelectorAll('.content-head')[0].offsetHeight

      this.childTableHeight = pageContentHeight - contentHeadHeight - 70
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
      return document.fullscreenElement ||
        document.msFullscreenElement ||
        document.mozFullScreenElement ||
        document.webkitFullscreenElement ||
        document.fullscreen ||  false;
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
    activeCellMethod ({ row, rowIndex, column, columnIndex }) {
      if (disabledRow.includes(row.quota)) {
        return false;
      }
      if (row.quota === "35天前配种数(头)") {
        if (["oneWeek","towWeek","threeWeek","fourWeek"].includes(column.property)) {
          return false;
        }
      }
      return true;
    },
    rowClassName({ row, rowIndex }) {
      if (disabledRow.includes(row.quota)) {
        return "diasabled-row"
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.swine-warp {
  .sav-btn {
      color:rgba(25,137,250,1);
      border:1px solid rgba(25,137,250,1);
      &:hover {
        color:rgba(0,136,255,1);
        background:#c5d9f3;
      }
    }
    .sub-btn {
      color:white;
      background:rgba(25,137,250,1);
      border:1px solid rgba(25,137,250,1);
      &:hover{
        color:rgba(255,255,255,1);
        background:rgba(25,116,207,1);
      }
    }
    .audit-btn {
      background:#FFFFFF;
      color:rgba(0,136,255,1);
      border:1px solid #1989FA;
      &:hover{
        background:#c5d9f3;
        color:rgba(0,136,255,1);
      }
    }
    .noAudit-btn {
      background:#FFFFFF;
      color: rgba(245, 108, 108, 1);
      border: 1px solid rgba(245, 108, 108, 1);
      &:hover{
        background:rgba(254,240,240,1);
        color:rgba(245,108,108,1);
      }
    }
  .space-line {
    width: 100%;
    height: 3px;
    background-color: whitesmoke;
  }
  .import-btn {
      background:#1989FA;
      color:rgba(255,255,255,1);
      border:1px solid #1989FA;
      &:hover{
        background:#1974CF;
        color:rgba(255,255,255,1);
      }
    }
    .export-btn {
      background:#FFFFFF;
      color:rgba(0,136,255,1);
      border:1px solid #1989FA;
      &:hover{
        background:#c5d9f3;
        color:rgba(0,136,255,1);
      }
    }
  /deep/ .vxe-table--header-wrapper {
    .vxe-edit-icon {
      display: none;
    }
  }
  .el-date-editor {
    width: auto;
  }
  /deep/ .vxe-table--main-wrapper .vxe-table--body-wrapper .vxe-table--body .vxe-body--row{
    .stage{
      background-color: #F8F8F9;
    }
    .quota {
      background-color: #F8F8F9;
    }
    .total {
      background-color: #FFFDF3;
    }
  }
  /deep/ .vxe-table {
    .diasabled-row {
      background-color: #eeeeee;
    }
  }
}
</style>
