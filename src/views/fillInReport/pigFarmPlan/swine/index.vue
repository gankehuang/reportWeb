<template>
  <div class="swine-warp">
    <!-- <div class="form-title">
    </div>-->
    <formTitle title="种猪场种猪存栏计划">
      <div slot="context">
        <page-form v-bind="formOptions" :model="formData" :editable="!formData" ref="PageForm"></page-form>
      </div>
      <div slot="title-suffix">
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
            :height="childTableHeight"
            :resizable="true"
            :data="entryData"
            :edit-rules="validRules"
            :edit-config="(!formData.status || formData.status === 0)?{trigger: 'click', mode: 'row'}:{}"
            @select-all="selectAllEntry"
            @select-change="selectChangeEntry"
          >
            <vxe-table-column type="checkbox" class-name="check-box" width="60"></vxe-table-column>
            <vxe-table-column type="index" title="序号" width="100"></vxe-table-column>
            <vxe-table-column field="orgName" title="猪场名称"></vxe-table-column>
            <vxe-table-column field="sex" title="性别" :edit-render="{name: 'default'}">
              <template v-slot:edit="scope">
                <el-select v-model="scope.row.sex" @change="selectChange($event,scope.row)">
                  <el-option
                    v-for="item in sexList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
              </template>
              <template v-slot="{ row }">{{ getSelectLabel(row.sex, sexList) }}</template>
            </vxe-table-column>
            <vxe-table-column field="variety" title="品种" :edit-render="{name: 'default'}">
              <template v-slot:edit="scope">
                <el-select v-model="scope.row.variety" @change="selectChange($event,scope.row)">
                  <el-option
                    v-for="item in varietyList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
              </template>
              <template v-slot="{ row }">{{ getSelectLabel(row.variety, varietyList) }}</template>
            </vxe-table-column>
            <!-- <vxe-table-column field="balance" header-align="center" align="right" title="平衡"></vxe-table-column> -->
            <vxe-table-column title="种猪存栏结构">
              <vxe-table-column field="oneStructure" header-align="center" align="right" title="50日龄以下" :edit-render="{name: 'input'}">
                <template v-slot:edit="{ row }">
                  <el-input
                    type="number"
                    v-model="row.oneStructure"
                    @wheel.native.prevent="stopScrollFun($event)"
                    @input="inputEvent('oneStructure',row)"
                  ></el-input>
                </template>
              </vxe-table-column>
              <vxe-table-column field="twoStructure" header-align="center" align="right" title="50-80日龄" :edit-render="{name: 'input'}">
                <template v-slot:edit="{ row }">
                  <el-input
                    type="number"
                    v-model="row.twoStructure"
                    @wheel.native.prevent="stopScrollFun($event)"
                    @input="inputEvent('twoStructure',row)"
                  ></el-input>
                </template>
              </vxe-table-column>
              <vxe-table-column
                field="threeStructure"
                title="80-110日龄"
                header-align="center" 
                align="right"
                :edit-render="{name: 'input'}"
              >
                <template v-slot:edit="{ row }">
                  <el-input
                    type="number"
                    v-model="row.threeStructure"
                    @wheel.native.prevent="stopScrollFun($event)"
                    @input="inputEvent('threeStructure',row)"
                  ></el-input>
                </template>
              </vxe-table-column>
              <vxe-table-column
                field="fourStructure"
                title="110日龄以上"
                header-align="center" 
                align="right"
                :edit-render="{name: 'input'}"
              >
                <template v-slot:edit="{ row }">
                  <el-input
                    type="number"
                    v-model="row.fourStructure"
                    @wheel.native.prevent="stopScrollFun($event)"
                    @input="inputEvent('fourStructure',row)"
                  ></el-input>
                </template>
              </vxe-table-column>
            </vxe-table-column>
            <vxe-table-column field="planRemain" header-align="center" align="right" title="计划自留">
              <template v-slot:edit="{ row }">
                <el-input
                  type="number"
                  v-model="row.planRemain"
                  @wheel.native.prevent="stopScrollFun($event)"
                  @input="inputEvent('planRemain',row)"
                ></el-input>
              </template>
            </vxe-table-column>
          </vxe-table>
        </div>
        <div class="content-head" slot="title-suffix">
          <el-button
            v-if="!formData.status || formData.status === 0"
            class="add-btn"
            @click="insertEntryEvent()"
            size="small"
            :disabled="loading"
          >行新增</el-button>
          <el-button v-if="!formData.status || formData.status === 0" class="del-btn" @click="delEntryEvent" size="small" :disabled="loading">行删除</el-button>
          <el-button
            class="export-btn"
            @click="exportDataEvent"
            size="small"
            icon="el-icon-upload2"
            :disabled="loading"
          >导出</el-button>
          <el-upload
            v-if="!formData.status || formData.status === 0"
            style="display:inline-block;margin-left:10px;"
            ref="upload"
            :limit="1"
            :show-file-list="false"
            action="reserved/excelUpload"
            accept=".xls,.xlsx"
            :http-request="importDataEvent"
            :file-list="fileList">
            <el-button icon="el-icon-download" size="small" class="import-btn">导入</el-button>
          </el-upload>
          <!-- <el-button
            size="small"
            icon="el-icon-rank"
            @click="handleFullscreen"
          >{{fullscreen?'退出全屏':'全屏'}}</el-button> -->
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
  getTree,
  getVariety,
  checkReportIsSp,
  getIntroduction,
  checkReportIsSave
} from "@/api/swine";
// import {getTree} from "@/api/projectFunds.js";
import treeSelect from "@/components/TreeSelect";
import formTitle from "@/components/formTitle/formTitle";
import PageForm from "@/components/form/Form";
import { mapGetters } from "vuex";
import { exportReport } from '@/utils/export'
import { deepClone } from "@/utils/index";
import request from '@/utils/request'

export default {
  name: "index",
  components: { treeSelect, formTitle, PageForm },
  created() {
    // 获取猪种类
    getVariety().then(res => {
      if (res.status === 200) {
        this.varietyList = res.data;
      }
    });
    // 获取list
    this.form.orgName = this.$store.getters.orgInfo.name;
    this.form.orgId = this.$store.getters.orgInfo.id;
    this.form.period = this.$store.getters.planYearMonth;
    // console.log(this.$store.getters.planYearMonth);
    this.getList();
    this.checkSave();
  },
  computed: {
    ...mapGetters(["orgInfo", "planYearMonth"])
  },
  // 监听执行
  watch: {
    orgInfo(val) {
      this.form.orgName = this.$store.getters.orgInfo.name;
      this.form.orgId = this.$store.getters.orgInfo.id;
      this.form.period = this.$store.getters.planYearMonth;
      this.getList();
      this.checkSave();
    },
    planYearMonth(val) {
      this.form.orgName = this.$store.getters.orgInfo.name;
      this.form.orgId = this.$store.getters.orgInfo.id;
      this.form.period = this.$store.getters.planYearMonth;
      this.getList();
      this.checkSave();
    }
  },
  data() {
    return {
      childTableHeight: 300, // 子表高度
      introduction: 0, // 引种自留数
      reverseAuditStatus: true, // 是否可以反审核
      saveStatus: true, // 是否可以保存
      entryIds: [], // checked的子表行的id数组
      lastEntryIds: [],
      entryIndex: [], // checked的子表行的X-ID数组
      props: {
        label: "name",
        value: "longNumber"
      },
      sexList: [
        {
          label: "公",
          value: 0
        },
        {
          label: "母",
          value: 1
        }
      ],
      varietyList: [],
      form: {
        orgName: "",
        orgId: "",
        period: new Date()
      },
      validRules: {
        // 校验规则
        sex: [
          {
            required: true,
            message: "性别必须填写"
          }
        ],
        variety: [
          {
            required: true,
            message: "种类必须填写"
          }
        ],
        oneStructure: [
          {
            required: true,
            message: "50日龄以下必须填写"
          }
        ],
        twoStructure: [
          {
            required: true,
            message: "50-80日龄必须填写"
          }
        ],
        threeStructure: [
          {
            required: true,
            message: "80-110日龄必须填写"
          }
        ],
        fourStructure: [
          {
            required: true,
            message: "110日龄以上必须填写"
          }
        ],
        /* planRemain: [
          {
            required: true,
            message: "计划自留必须填写"
          }
        ] */
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
      loading: false,
      fullscreen: "",
      fileList: [],
    };
  },
  mounted() {
    window.onresize = () => {
      // this.fullscreen = this._isFullscreenEnable()
      // 动态监听窗口大小
      return (() => {
        this.computedDOMHeight();
      })();
    };

    this.$nextTick(() => {
      // 根据当前屏幕高度计算子表内容区高度
      this.computedDOMHeight();
      this._onFullscreenchange()
    });
  },
  methods: {
    insertEntryEvent() {
      if (this.formData.status === 0 || !this.formData.status) {
        const record = { orgName: this.form.orgName };
        this.$refs.xxTable
          .insert(record)
          .then(({ row }) => this.getInsertEvent());
      } else {
        this.$message.warning("该条数据不能新增子表！");
      }
    },
    getInsertEvent() {
      let insertRecords = this.$refs.xxTable.getInsertRecords();
      insertRecords[0].status = 0;
      this.entryData.unshift(insertRecords[0]);
    },
    delEntryEvent() {
      let i = this.entryData.length;
      while (i--) {
        if (this.entryIndex.includes(this.entryData[i]._XID)) {
          this.entryData.splice(i, 1);
        }
      }
      this.lastEntryIds = this.lastEntryIds.concat(deepClone(this.entryIds));
      // console.log(this.lastEntryIds)
    },
    saveEvent(sign) {
      if (this.entryData.length) {
        this.entryData.forEach((ele, index) => {
          ele.sort = index;
        });
        this.formData.status = sign;
        this.$refs.xxTable.validate(valid => {
          if (valid) {
            this.loading = true;
            addSWine({
              deleteList: this.lastEntryIds,
              pigReserved: this.formData,
              pigReservedEntries: this.entryData
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
        });
      } else {
        this.$message.warning("子表不能为空！")
      }
    },
    auditEvent(sign) {
      if (this.form.orgId) {
        this.entryData.forEach((ele, index) => {
          ele.sort = index;
        });
        this.formData.status = sign;
        this.$refs.xxTable.validate(valid => {
          if (valid) {
            this.loading = true;
            addSWine({
              deleteList: this.entryIds,
              pigReserved: this.formData,
              pigReservedEntries: this.entryData
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
        });
      }
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
    // 取引种数getIntroduction
    selectChange(event, row) {
      if ([0, 1].includes(row.sex) && row.variety) {
        let params = {
          month: this.formatDate(this.form.period, "yyyy-MM"),
          sex: row.sex,
          species: row.variety,
          supplierId: this.form.orgId
        };
        getIntroduction(params).then(res => {
          if (res.status === 200) {
            console.log("Introduction",res.data)
            this.introduction = res.data;
            row.planRemain = res.data;
          }
        });
      }
    },
    // 引种数变更
    introductionChange() {
      if (this.formData.status === 0) {
        this.entryData.forEach(ele => {
          let params = {
            month: this.formatDate(this.form.period, "yyyy-MM"),
            sex: ele.sex,
            species: ele.variety,
            supplierId: this.form.orgId
          };
          getIntroduction(params).then(res => {
            if (res.status === 200) {
              ele.planRemain = res.data;
            }
          });
        })
      }
    },
    selectAllEntry(data) {
      this.entryIds = data.selection.map(e => e.id);
      this.entryIndex = data.selection.map(e => e._XID);
    },
    selectChangeEntry(data) {
      this.entryIds = data.selection.map(e => e.id);
      this.entryIndex = data.selection.map(e => e._XID);
    },
    getSelectLabel(value, list, valueProp = "value", labelField = "label") {
      let item = this.$utils.find(list, item => item[valueProp] === value);
      return item ? item[labelField] : null;
    },
    formatDate(value, format) {
      return this.$utils.toDateString(value, format);
    },
    getList() {
      this.loading = true;
      this.form.period = new Date(this.form.period).getTime();
      getList(this.form)
        .then(res => {
          if (res.status === 200) {
            if (res.data[0]) {
              this.formData = res.data[0].pigReserved;
              this.entryData = res.data[0].pigReservedEntries;
              this.introductionChange();
            } else {
              this.formData = {
                submiterName: this.$store.getters.name,
                submiter: this.$store.getters.userId,
                submitDate: new Date().getTime(),
                orgName: this.form.orgName,
                orgId: this.form.orgId,
                orgLongNum: this.$store.getters.orgInfo.longNumber,
                period: this.formatDate(this.form.period, "yyyy-MM")
              };
              this.entryData = [];
            }
            this.checkReport(this.formData);
            this.loading = false;
          }
        })
        .catch(() => {
          this.loading = false;
        });
    },
    checkReport(data) {
      let params = {
        orgId: data.orgId,
        dateMonth: data.period
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
    // 导出数据
    exportDataEvent(){
      let exportData = deepClone(this.entryData)
      exportData.forEach(ele => {
        ele.sexName = this.getSelectLabel(ele.sex,this.sexList);
        ele.variety = this.getSelectLabel(ele.variety,this.varietyList)
      })
      if(exportData.length){
        let myObj = {
          method: 'post',
          url:'reserved/exportExcel',
          fileName: '种猪存栏计划表',
          data: exportData
        }
        exportReport(myObj)
      }else{
        this.$message({
          message: "无数据不能导出！",
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
        url: `${process.env.BASE_API}/BUSINESSREPORT/reserved/excelUpload`,
        method: 'post',
        data: formData,
      }).then(res => {
        this.$refs.upload.clearFiles();
        if (res.status === 200) {
          res.data.forEach(ele => {
            if ([0,1].includes(ele.sex) && ele.variety) {
              let params = {
                month: this.formatDate(this.form.period, "yyyy-MM"),
                sex: ele.sex,
                species: ele.variety,
                supplierId: this.form.orgId
              };
              getIntroduction(params).then(res => {
                if (res.status === 200) {
                  ele.planRemain = res.data;
                }
              });
            }
          })
          let ids = this.entryData.map(ele => ele.id);
          if (ids.length && !ids.includes(undefined || null)) {
            this.lastEntryIds = ids
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
      if (evt.preventDefault) {
        // Firefox
        evt.preventDefault();
        evt.stopPropagation();
      } else {
        // IE
        evt.cancelBubble = true;
        evt.returnValue = false;
      }
      return false;
    },
    computedDOMHeight() {
      let curClientHeight = document.body.clientHeight; // 当前屏幕高度
      let pageContentHeight =
        curClientHeight - this.$refs.pageContent.getBoundingClientRect().top;
      this.$refs.pageContent.style.height = pageContentHeight - 10 + "px";
      let contentHeadHeight = document.querySelectorAll(".content-head")[0]
        .offsetHeight;
      this.childTableHeight = pageContentHeight - contentHeadHeight - 70;
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
  }
};
</script>

<style lang="scss" scoped>
.swine-warp {
  // margin: 10px;
  // background-color: white;
  /* .form-title {
    // padding: 10px 20px;
  } */
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
  .space-line {
    width: 100%;
    height: 3px;
    background-color: whitesmoke;
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
  /* .entry-warp {
    margin: 10px 0;
    // padding: 10px;
    background: #fff;
    /deep/ .content-warp {
      padding: 0;
    }
  } */
  /deep/ .vxe-table--header-wrapper {
    .vxe-edit-icon {
      display: none;
    }
  }
  .el-date-editor {
    width: auto;
  }
  /deep/ .vxe-table--main-wrapper .vxe-table--body-wrapper .vxe-table--body .vxe-body--row {
    .check-box {
      text-align: center;
    }
  }
}
</style>