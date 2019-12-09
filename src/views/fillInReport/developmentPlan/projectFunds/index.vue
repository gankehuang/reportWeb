<template>
  <div v-loading.lock="fullscreenLoading">
    <formTitle title="项目资金计划及追踪">
      <div slot="context">
        <page-form
          v-bind="formOptions"
          :model="formData"
          :editable="false"
          ref="PageForm"></page-form>
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
    
    <!-- 子表内容 -->
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
            action="/projectFundingFeedback/excelUpload"
            accept=".xls,.xlsx"
            :http-request="importDataEvent"
            :file-list="fileList">
            <el-button
              icon="el-icon-download"
              size="small"
              v-if="curStatus == 0 && checkReportIsSave"
              class="import-btn">导入</el-button>
          </el-upload>
        
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
        <vxe-table-column type="checkbox" width="70" align="center" fixed="left"></vxe-table-column>
        <vxe-table-column type="index" title="序号" width="60" fixed="left"></vxe-table-column>
        <vxe-table-column
          field="companyName"
          title="单位名称"
          :edit-render="{name: 'input'}"
          min-width="150"
          fixed="left"></vxe-table-column>
        <vxe-table-column
          field="declarationProject"
          title="申报项目"
          :edit-render="{name: 'input'}"
          min-width="150"></vxe-table-column>
        <vxe-table-column title="项目申报">
          <vxe-table-column
            field="plannedDate"
            title="计划申报日期"
            :edit-render="{type: 'default'}"
            min-width="170">
            <template v-slot:edit="{ row }">
              <el-date-picker
                v-model="row.plannedDate"
                type="date"
                format="yyyy-MM-dd"
                value-format="timestamp"
                style="width: 100%;"></el-date-picker>
            </template>
            <template
              v-slot="{ row }">{{formatDate(row.plannedDate,'yyyy-MM-dd')}}
            </template>
          </vxe-table-column>
          <vxe-table-column
            field="actualFilingDate"
            title="实际申报日期"
            min-width="170"
            :edit-render="{type: 'default'}">
            <template v-slot:edit="{ row }">
              <el-date-picker
                v-model="row.actualFilingDate"
                type="date"
                format="yyyy-MM-dd"
                value-format="timestamp"
                style="width: 100%;"
              ></el-date-picker>
            </template>
            <template
              v-slot="{ row }">{{formatDate(row.actualFilingDate,'yyyy-MM-dd')}}
            </template>
          </vxe-table-column>
          <vxe-table-column
            field="subsidyAmount"
            title="计划补贴金额（万元）"
            align="right"
            :edit-render="{name: 'input'}"
            min-width="100">
            <template v-slot:edit="{ row }">
              <el-input
                v-model="row.subsidyAmount"
                type="number"
                @wheel.native.prevent="stopScrollFun($event)"></el-input>
            </template>
          </vxe-table-column>
        </vxe-table-column>
        <vxe-table-column title="补贴到账">
          <vxe-table-column
            field="arrivalPlannedDate"
            title="计划到账日期"
            :edit-render="{type: 'default'}"
            min-width="170">
            <template v-slot:edit="{ row }">
              <el-date-picker
                v-model="row.arrivalPlannedDate"
                type="date"
                format="yyyy-MM-dd"
                value-format="timestamp"
                style="width: 100%;"></el-date-picker>
            </template>
            <template v-slot="{ row }">{{formatDate(row.arrivalPlannedDate,'yyyy-MM-dd')}}
            </template>
          </vxe-table-column>
          <vxe-table-column
            field="actualArrivalDate"
            title="实际到账日期"
            min-width="170"
            :edit-render="{type: 'default'}">
            <template v-slot:edit="{ row }">
              <el-date-picker
                v-model="row.actualArrivalDate"
                type="date"
                format="yyyy-MM-dd"
                value-format="timestamp"
                style="width: 100%;"></el-date-picker>
            </template>
            <template v-slot="{ row }">{{formatDate(row.actualArrivalDate,'yyyy-MM-dd')}}</template>
          </vxe-table-column>
          <vxe-table-column
            field="actualArrivalAmount"
            title="实际到账金额（万元）"
            :edit-render="{name: 'input'}"
            min-width="100"
            align="right">
            <template v-slot:edit="{ row }">
              <el-input
                v-model="row.actualArrivalAmount"
                type="number"
                @wheel.native.prevent="stopScrollFun($event)"></el-input>
            </template>
          </vxe-table-column>
        </vxe-table-column>
        <vxe-table-column
          field="whichWeek"
          title="业务周"
          :edit-render="{type: 'default'}"
          min-width="110">
          <template v-slot:edit="scope">
            <el-select v-model="scope.row.whichWeek">
              <el-option
                v-for="item in roleList"
                :key="item.value"
                :label="item.label"
                :value="item.value"></el-option>
            </el-select>
          </template>
          <template v-slot="{ row }">{{ getSelectLabel(row.whichWeek, roleList) }}</template>
        </vxe-table-column>
        <vxe-table-column
          field="responsibleName"
          title="责任人"
          :edit-render="{name: 'input'}"
          width="100"></vxe-table-column>
      </vxe-table>
    </div>
  </div>
  <!-- 主表内容 -->
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
  } from '@/api/projectFunds/projectFunds'
  import {mapGetters} from 'vuex'
  import formTitle from '@/components/formTitle/formTitle'
  import PageForm from '@/components/form/Form'
  import {changeTwoDecimal2} from '@/utils/index'
  import {exportReport} from '@/utils/export'

  export default {
    name: 'projectFunds',
    components: {
      formTitle,
      PageForm
    },
    data() {
      return {
        fullscreenLoading: false,
        loading: false,
        searchForm: {
          orgName: '',
          orgId: '',
          period: ''
        },
        fileList: [],
        curStatus: 0,
        mainTableData: [],
        tableData: [],
        fullscreen: false,
        childTableHeight: 300,
        formData: {},
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
        validRules: {
          companyName: [
            {required: true, message: '单位名称必须填写！'}
          ],
          declarationProject: [
            {required: true, message: '申报项目必须填写！'}
          ],
          arrivalPlannedDate: [
            {required: true, message: '计划到账日期必须填写！'}
          ],
          subsidyAmount: [
            {required: true, message: '计划补贴金额必须填写！'}
          ],
          plannedDate: [
            {required: true, message: '计划申报日期必须填写！'}
          ],
          whichWeek: [{required: true, message: '业务周必须填写！'}],
          responsibleName: [
            {required: true, message: '责任人必须填写！'}
          ]
        },
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
        checkReportIsSave: true, // 判断报表是否可以保存
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
        this.computedDOMHeight()
        this._onFullscreenchange() // 监听全屏
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
            this.fullscreenLoading = false
          })
      },
      _transformData(data) {
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
          if (item._XID) {
            this.curSelect_XIDArr.push(item._XID)
          }
        });
      },
      insertChildren() {
        if (this.curStatus !== 0) {
          this.$message.warning('当前状态不能新增子表！');

          return;
        }

        let record = {areaName: this.searchForm.orgName};

        this.$refs.xTable
          .insert(record)
          .then(({row}) => this.getInsertEvent());
      },
      getInsertEvent() {
        let insertRecords = this.$refs.xTable.getInsertRecords();
        this.tableData.unshift(insertRecords[0])
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

        let commitData = {
          delectIds: this.delectIds,
          lord: this.mainTableData,
          entrys: this.tableData
        };

        this.loading = true;
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
      stopScrollFun(evt) {    //禁止滚动
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
      formatDate(value, format) {
        return this.$utils.toDateString(value, format)
      },
      getSelectLabel(value, list, valueProp = 'value', labelField = 'label') {
        let item = this.$utils.find(
          list,
          item => item[valueProp] === value
        );
        return item ? item[labelField] : null
      },
      editClose({row, rowIndex, $rowIndex, column, columnIndex, $columnIndex, cell}) {
        if (column.property === 'subsidyAmount') {
          if (row.subsidyAmount < 0) {
            this.$message.warning('请输入正数');
            row.subsidyAmount = '';
          } else {
            row.subsidyAmount = changeTwoDecimal2(row.subsidyAmount);
          }
        }

      },
      footerMethod({columns, data}) {
        return [
          columns.map((column, columnIndex) => {
            if (columnIndex === 0) {
              return '合计';
            }
            if (['subsidyAmount', 'actualArrivalAmount'].includes(column.property)) {
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
      activeCellMethod({row, rowIndex, column, columnIndex}) {
        console.log(columnIndex, column.property);
        if (this.curStatus == 0) {
          if (column.property === 'actualFilingDate' ||
            column.property === 'actualArrivalDate' ||
            column.property === 'actualArrivalAmount') {
            return false
          } else {
            return true
          }

        } else {
          if (this.curStatus == 2 &&   // 反馈
            (column.property === 'actualFilingDate' ||
              column.property === 'actualArrivalDate' ||
              column.property === 'actualArrivalAmount')) {
            return true
          } else {
            return false
          }
        }
      },
      computedDOMHeight() {
        let curClientHeight = document.body.clientHeight;  // 当前屏幕高度
        let pageContentHeight = curClientHeight - this.$refs.pageContent.getBoundingClientRect().top;  // 子表区距离屏幕顶部的高度
        this.$refs.pageContent.style.height = (pageContentHeight - 10) + 'px';
        let contentHeadHeight = document.querySelectorAll('.content-head')[0].offsetHeight;

        this.childTableHeight = pageContentHeight - contentHeadHeight - 60
      },
      handleFullscreen() {  // 切换全屏
        this._toggleFullscreen(this.fullscreen, this.$refs.pageContent)
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
      _onFullscreenchange() { // 监听全屏事件
        document.addEventListener('fullscreenchange', () => {
          this.fullscreen = this._isFullscreenEnable()
        }, false)

        document.addEventListener('mozfullscreenchange', () => {
          this.fullscreen = this._isFullscreenEnable()
        }, false)

        document.addEventListener('webkitfullscreenchange', () => {
          this.fullscreen = this._isFullscreenEnable()
        }, false)

        document.addEventListener('msfullscreenchange', () => {
          this.fullscreen = this._isFullscreenEnable()
        }, false)
      },
      _isFullscreenEnable() { // 判断当前是否在全屏状态
        return document.fullscreenElement ||
          document.msFullscreenElement ||
          document.mozFullScreenElement ||
          document.webkitFullscreenElement ||
          document.fullscreen || false
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
          url: `projectFundingFeedback/downloadExcel`,
          fileName: '项目资金计划及追踪',
          data: {entrys: this.tableData}
        };
        exportReport(data);
      },
    }
  }
</script>
<style lang="scss" scoped>
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
  
  /*/deep/ .vxe-table--header-wrapper {*/
  /*    .vxe-edit-icon {*/
  /*        display: none;*/
  /*    }*/
  /*}*/
  
  .el-date-editor {
    width: auto;
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
