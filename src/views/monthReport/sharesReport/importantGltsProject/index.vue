<template>
  <div v-loading.fullscreen.lock="loading">
    <!--    内容区-->
    <formTitle title="重要管理提升项目">
      <div slot="context">
        <page-form
          v-bind="formOptions"
          :model="mode?mode:{}"
          :editable="false"
          ref="PageForm"
        ></page-form>
      </div>
      <div slot="title-suffix">
        <template v-if="mode">
          <template v-if="mode.status<0">
            <el-button size="small" @click="save(0,'保存')" class="el-button-audit">保存</el-button>
          </template>
          <template v-else-if="mode.status==0">
            <el-button size="small" @click="deleteInfo" class="el-button-delete">删除</el-button>
            <el-button size="small" @click="save(0,'保存')" class="el-button-audit">保存</el-button>
            <el-button size="small" @click="submit()" class="el-button-submit">提交</el-button>
          </template>
          <template v-else-if="mode.status==1 ">
           <!-- <el-button size="small" @click="approve(0,'驳回')" class="el-button-unaudit">驳回</el-button> -->
            <el-button size="small" @click="approve(2,'审核')" class="el-button-audit">审核</el-button>
          </template>
          <template v-else-if="mode.status==2&& mode.isApprove==0">
            <el-button size="small" @click="approve(0,'反审核')" class="el-button-unaudit">反审核</el-button>
          </template>
        </template>
      </div>
    </formTitle>
    <div class="page-content" ref="pageContent">
      <div id="toolbar">
        <vxe-toolbar>
          <template v-slot:buttons>
            <div style="height: 32px;display: flex; align-items: center;">
              <span class="dot" style="margin-right: 10px;"></span>
              <span class="title">子表信息</span>
            </div>
          </template>
          <template v-slot:tools>
            <el-button size="small" @click="addLine" v-if="editable" class="el-button-audit">新增行</el-button>
            <el-button size="small" @click="deleteLine" v-if="editable" class="el-button-unaudit">删除行</el-button>
            <el-button size="small" @click="exportDataEvent" icon="el-icon-upload2"
                       class="el-button-audit">导出
            </el-button>
            <!--						<el-button size="small"  @click="importDataEvent" v-if="editable" icon="el-icon-download" class="el-button-submit">导入</el-button>-->
            <el-upload
            v-if="editable"
             style="display:inline-block;margin-left:10px;"
             ref="upload"
             :limit="1"
             :show-file-list="false"
             action="/projectPromotEntry/importExcelByList"
             accept=".xls,.xlsx"
             :http-request="importDataEvent"
             :file-list="fileList">
             <el-button icon="el-icon-download" size="small" class="el-button-submit">导入</el-button>
           </el-upload>
          <!-- <el-button size="small"  class="el-button-full"
                       icon="el-icon-rank" @click="handleFullscreen">{{fullscreen?'退出全屏':'全屏'}}
            </el-button> -->
          </template>
        </vxe-toolbar>
      </div>
      <vxe-table fit align="left" header-align="left" highlight-hover-row border
                 :height="childTableHeight" resizable
                 show-overflow ref="childxTable" :edit-rules="validRules"
                 :edit-config="editable?{trigger: 'click', mode: 'row',showStatus: false}:{}"
                 :data="mode.projectPromoteEntry?mode.projectPromoteEntry:[]">
        <vxe-table-column v-if="editable" type="checkbox" width="60" align="center" fixed="left"></vxe-table-column>
        <vxe-table-column title="项目名称" field="projectName" :edit-render="{name: 'input'}"
                          fixed="left" show-overflow="false" min-width="180"></vxe-table-column>
        <vxe-table-column title="项目主要内容" field="projectContent" :edit-render="{name: 'input'}"
                         show-overflow="false"  width="100"></vxe-table-column>
        <vxe-table-column title="交付结果" field="projectResults" :edit-render="{name: 'input'}"
                          show-overflow="false" width="100"></vxe-table-column>

        <vxe-table-column title="达成目标" field="projectGoal" :edit-render="{name: 'input'}"
                          show-overflow="false" width="100"></vxe-table-column>
        <vxe-table-column title="对标企业" field="dbCompany" :edit-render="{name: 'input'}" show-overflow="false" width="100"></vxe-table-column>
        <vxe-table-column title="项目启动时间" field="projectStartTime" :edit-render="{name: 'input'}" width="100" show-overflow="false" >
          <template v-slot:edit="{ row }">
            <el-date-picker v-model="row.projectStartTime" type="date" format="yyyy-MM-dd" value-format="timestamp"
                            style="width: 100%;"></el-date-picker>
          </template>
          <template v-slot="{ row }">
            {{formatDate(row.projectStartTime,'yyyy-MM-dd')}}
          </template>
        </vxe-table-column>
        <vxe-table-column title="目标完成时间" field="goalFinishTime" :edit-render="{type: 'default'}" width="100" show-overflow="false" >
          <template v-slot:edit="{ row }">
            <el-date-picker v-model="row.goalFinishTime" type="date" format="yyyy-MM-dd" value-format="timestamp"
                            style="width: 100%;"></el-date-picker>
          </template>
          <template v-slot="{ row }">{{ formatDate(row.goalFinishTime,'yyyy-MM-dd')}}</template>
        </vxe-table-column>
        <vxe-table-column title="上月节点目标" field="lastMonthGoal" :edit-render="{name: 'input'}"
                          show-overflow="false" width="100">
            <template #header>
              {{ monthText(-1) + '节点目标' }}
            </template>
        </vxe-table-column>
        <vxe-table-column title="上月节点达成情况" field="lastMonthCondition" :edit-render="{name: 'input'}"
                          show-overflow="false" width="100">
          <template #header>
              {{ monthText(-1) + '节点达成情况' }}
          </template>
        </vxe-table-column>
        <vxe-table-column title="差距与原因分析" field="causeAnalysis" :edit-render="{name: 'input'}"
                          show-overflow="false" width="100"></vxe-table-column>
        <vxe-table-column title="应对策略及措施" field="respondMethod" :edit-render="{name: 'input'}"
                          show-overflow="false" width="100"></vxe-table-column>
        <vxe-table-column title="下月节点目标" field="nextMonthGoal" :edit-render="{name: 'input'}"
                          show-overflow="false" width="100">
        	<template #header>
              {{ monthText(1) + '节点目标' }}
          </template>
        </vxe-table-column>
        <vxe-table-column title="组长" field="groupLeader" :edit-render="{name: 'input'}" show-overflow="false" width="100"></vxe-table-column>
        <vxe-table-column title="成员" field="member" :edit-render="{name: 'input'}" show-overflow="false" width="100"></vxe-table-column>
        <vxe-table-column title="直接上级" field="superiorName" :edit-render="{name: 'input'}"
                          show-overflow="false" width="100"></vxe-table-column>
      </vxe-table>
    </div>
  </div>
</template>

<script>
    import formTitle from "@/components/formTitle/formTitle";
    import PageForm from "@/components/form/Form";
    import {mapGetters} from 'vuex'
      import axios from 'axios'
    import { getToken } from '@/utils/auth'
    import moment from 'moment'
    import common from '../taskbill/common'
    import importantGltsProjectHttp from "@/api/businessUnit/importantGltsProject/index"

    export default {
        name: 'index',
        components: {
            formTitle, PageForm
        },
        mixins: [common],
        data() {
            return {
              fileList: [],
                validRules: { // 校验规则
                    projectName: [{
                        required: true,
                        message: '项目名称必须填写'
                    }],
                    projectContent: [{
                        required: true,
                        message: '项目主要内容必须填写'
                    }],
                    projectResults: [{
                        required: true,
                        message: '交付结果必须填写'
                    }],
                    projectGoal: [{
                        required: true,
                        message: '达成目标必须填写'
                    }],
                    dbCompany: [{
                        required: true,
                        message: '对标企业必须填写'
                    }],
                    projectStartTime: [{
                        required: true,
                        message: '项目启动时间必须填写'
                    }],
                    goalFinishTime: [{
                        required: true,
                        message: '目标完成时间必须填写'
                    }],
                    lastMonthGoal: [{
                        required: true,
                        message: '上月节点目标必须填写'
                    }],
                    lastMonthCondition: [{
                        required: true,
                        message: '上月达成情况必须填写'
                    }],
                    causeAnalysis: [{
                        required: true,
                        message: '差距与原因分析必须填写'
                    }],
                    respondMethod: [{
                        required: true,
                        message: '应对策略及措施必须填写'
                    }],
                    nextMonthGoal: [{
                        required: true,
                        message: '下月节点目标必须填写'
                    }],
                    groupLeader: [{
                        required: true,
                        message: '组长必须填写'
                    }],
                    member: [{
                        required: true,
                        message: '成员必须填写'
                    }],
                    superiorName: [{
                        required: true,
                        message: '直接上级必须填写'
                    }]
                },
                mode: {status: -1}
            }
        },
        computed: {
            ...mapGetters([
                'orgInfo', 'planYearMonth'
            ]),
            editable: function () {
                if (this.mode && (!this.mode.status || this.mode.status < 1)) {
                    return true;
                }
                return false;
            }
        },
        created() {
        },
        methods: {
            submit() {
                this.$refs.childxTable.validate(valid => {
                    if (valid) {
//		              	this.$XModal.message({ status: 'success', message: '校验成功！' })
                        this.save(1,'提交')
                    } else {
//		              this.$XModal.message({ status: 'error', message: '校验不通过！' })
                    }
                })
            },
            /**
             * status 2 审核通过  0 保存
             */
            approve(status,message) {
                let _self = this;
                let req = {
                    id: this.mode.id,
                    status: status
                };
                _self.loading = true
                importantGltsProjectHttp.approve(req).then((res) => {
                    _self.loading = false
                    if (res.status == 200) {
                        this.$message({
                            message: message+'成功',
                            type: 'success'
                        });
                        _self.find();
                    } else {
                        this.$message({
                            message: message+'失败',
                            type: 'warning'
                        });
                    }
                }).catch((err) => {
                    _self.loading = false
                })
            },
            save(status,message) {
                let _self = this;
                let parentItem = this.getFormData(status);
                if (!parentItem.projectPromoteEntry || parentItem.projectPromoteEntry.length == 0) {
                    this.$message({
                        message: '无项目信息,请添加',
                        type: 'error'
                    });
                    return;
                }

                if (!parentItem.orgId) {
                    this.$message({
                        message: '请选择组织',
                        type: 'warning'
                    });
                    return;
                }

                if (!parentItem.period) {
                    this.$message({
                        message: '请选择期间',
                        type: 'warning'
                    });
                    return;
                }

                _self.loading = true
                importantGltsProjectHttp.add(parentItem).then((res) => {
                    _self.loading = false

                    if (res.status == 200) {

                        this.$message({
                            message: message+'成功',
                            type: 'success'
                        });
                        _self.find();
                    } else {
                        this.$message({
                            message: message+'失败',
                            type: 'warning'
                        });
                    }

                }).catch((err) => {
                    _self.loading = false
                })
            },
            find() {
                let _self = this;
                let req = {
                    orgId: this.searchForm.orgId,
                    period: this.searchForm.period
                }
                _self.loading = true
                importantGltsProjectHttp.find(req)
                    .then((res) => {
                        _self.loading = false
                        if (res.status == 200) {
                            _self.loading = false
                            if (res.data) {
                                _self.mode = res.data
                            } else {
                                _self.mode = {
                                    status: -1,
                                    orgId: this.searchForm.orgId,
                                    period: this.searchForm.period
                                }
                            }

                        } else {
                            _self.mode = null;
                        }

                    }).catch((err) => {
                    _self.loading = false
                });

            },
            deleteInfo() {
            	let _self = this
							_self.loading = true
							importantGltsProjectHttp.deleteInfo(this.mode.id).then((res) => {
								_self.loading = false
								if(res.status == 200) {
									this.$message({
							          message: '删除成功',
							          type: 'success'
							        });
									_self.mode = {
									    status: -1,
									    orgId: this.searchForm.orgId,
									    period: this.searchForm.period
									}
								}else{
									this.$message({
							          message: '删除失败',
							          type: 'success'
							        });
								}

							}).catch((err) => {
								_self.loading = false
							});
						},
            getFormData(btnStatus) {
                let parentItem = Object.assign({}, this.mode);
                parentItem.status = btnStatus;
                let data = this.$refs.childxTable.getTableData().fullData;
                let removeRecords = this.$refs.childxTable.getRemoveRecords() // 获取操作

                for (let index in removeRecords) {
                    removeRecords[index].isDelete = 1;
                }

//				let updateRecords = this.$refs.childxTable.getUpdateRecords() // 获取更新
//				let insertRecords = this.$refs.childxTable.getInsertRecords() // 获取新增

                let projectPromoteEntry = data.concat(removeRecords);

                parentItem.projectPromoteEntry = projectPromoteEntry;
                return parentItem;
            },
            addLine() { // 增加一行
                let record = {}
                this.$refs.childxTable.insertAt(record)
                    .then(({
                               row
                           }) => this.$refs.childxTable.setActiveCell(row, 'projectName'))
            },
            deleteLine() { // 删除数据
                this.$refs.childxTable.removeSelecteds()
                let removeRecords = this.$refs.childxTable.getRemoveRecords()
            },
            formatDate(value, format) {
                if (value) {
                    return this.$utils.toDateString(value, format)
                } else {
                    return ''
                }

            },
            exportDataEvent() {
                // this.$refs.childxTable.exportData({type: 'xml'})
                let data = this.$refs.childxTable.getTableData().fullData;
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
                url: `${process.env.BASE_API}/BUSINESSREPORT/projectPromotEntry/exportExcelByList`,
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
                  link.setAttribute('download', '重要管理提升项目' + '.xlsx');
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
            importDataEvent(params) {
                // this.$refs.childxTable.importData()

                  // 导入报表
                 const _file = params.file;
                let _self = this;
                 if (!this._checkImportReport(_file)) {
                   return;
                 }

                 let formData = new FormData();
                 formData.append("file", _file);
                 importantGltsProjectHttp.importReport(formData).then(res => {
                   this.$refs.upload.clearFiles();
                   if (res.status === 200) {
                     _self.$refs.childxTable.remove()
                   	 _self.$refs.childxTable.insertAt(res.data)
                     this.$message.success('导入成功');
                   } else {
                     this.$message.error('导入失败');
                   }
                 }).catch(err => {
                   this.$refs.upload.clearFiles();
                   this.$message.error(`${err}`);
                 });
            }
        }
    }
</script>

<style scoped lang="scss">

  .page-content {
    box-sizing: border-box;
    margin: 10px 10px;
    padding: 0 20px;
    border-radius: 5px;
    background-color: #fff;

    .content-head {
      padding: 5px 0 10px 0;

      .title {
        font-weight: bold;
        color: #333333;
      }

      /*.content-head-right {
        text-align: right;
      }*/
    }
  }

  .vxe-toolbar {
    padding: 16px 0 16px 0;
  }

  .title {
    font-weight: bold;
    color: #333333;
    font-size: 14px;
  }

</style>
