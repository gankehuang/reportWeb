<template>
  <div>
    <div class="search-container" v-loading.fullscreen.lock="loading">
      <el-row :gutter="10">
        <el-col :xs="24" :sm="18" :md="18" :lg="14" :xl="14">
          <el-form :inline="true" :model="searchForm">
            <el-form-item label="组织" size="small">
							<auto-search v-model="searchForm.org" @change="getProjectData" :placeholder="'请选择'" :props="props" url="/BUILD/projectNew/getListAll"></auto-search>
            </el-form-item>
            <el-form-item label="业务期间" size="small">
              <el-date-picker v-model="searchForm.qj" type="month" placeholder="选择月" format="yyyy-MM-dd" value-format="yyyy-MM-dd">
							</el-date-picker>
            </el-form-item>
            <el-form-item size="small">
              <el-button type="default">查询</el-button>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :xs="24" :sm="6" :md="6" :lg="10" :xl="10">
          <div class="pull-right">
            <el-button type="default" size="small" class="add-btn" plain @click="addTemplate">新增</el-button>
            <el-button type="default" size="small" class="edit-btn" @click="editTemplate">编辑</el-button>
            <el-button type="default" size="small" class="save-btn" plain>下载</el-button>
            <el-button type="default" size="small" class="del-btn" plain @click="del">删除</el-button>
          </div>
        </el-col>
      </el-row>
    </div>
    <div class="data-main-container">
      <div class="data-container">
        <data-table
          :head="tableHead"
          :data="list"
          :loading="loading"
          :total="total"
          :offset="offset"
          @handlePageChange="dataTablePageChange"
          @handleSizeChange="dataTableSizeChange"
          @handleSelectionChange="handleSelectionChange"
        >
          <template v-slot:applicantDate="scope">
            {{formatterTime(scope.data.applicantDate)}}
          </template>
          <template v-slot:status="scope">
            <span class="status-text">{{scope.data.status | stateFilters}}</span>
          </template>
          <template v-slot:toolbar="scope">
            <el-button type="text" size="small" @click="look(scope.data.id,scope.data.taskId,scope.data.status,scope.data.processId)">详情</el-button>
            <el-button type="text" size="small" v-if="scope.data.taskId && scope.data.status != 2" @click="audit(scope.data)">{{scope.data.status == 3?'提交':'审核'}}</el-button>
          </template>
        </data-table>
      </div>
    </div>
  </div>
</template>

<script>
  import DataTable from '@/components/DataTable'
  import DataTableMixin from "@/components/mixins/DataTableMixin";
  import autoSearch from "@/components/form/form-select-data"

  import {deleteById} from '@/api/materialManager/index'
  import baseUrl from "@/api/buildManager/baseApiUrl";
  import {deepClone, parseTime} from "@/utils";
  export default {
    name: "index",
    components: {
      DataTable,
      autoSearch
    },
    directives: {},
    mixins: [DataTableMixin],
    model: {},
    props: {},
    data() {
      return {
      	loading: false,
        searchForm: {},
        props:{
	        label:'name',
	        value:'id'
	      },
        tableHead: [
          {
            prop: "org",
            align: "center",
            label: "组织"
          }, 
          {
            prop: "qj",
            align: "center",
            label: "业务期间"
          }, 
          {
            prop: "busyDate",
            align: "center",
            label: "填报日期"
          },
          {
            prop: "submiter",
            align: "center",
            label: "提交人"
          },
          {
            prop: "submitDate",
            align: "center",
            label: "提交日期"
          },
          {
            prop: "approver",
            align: "center",
            label: "审批人"
          },
          {
            prop: "approvalDate",
            align: "center",
            type: "slot",
            label: "审批日期"
          },
          {
            prop: "status",
            align: "center",
            type: "slot",
            label: "状态"
          }
        ],
        tableData: [],
        selectionId: '',
        selectionData: [],
        billState: '',
        status:'',
        statusText:['保存','审批中','通过','驳回']
      }
    },
    computed: {},
    watch: {},
    created() {
      this.$nextTick(() => {
        this.dataTableInit();
      });
    },
    mounted(){
    },
    filters: {
      stateFilters(stateCode) {
        const formState = [
          { value: 0, label: "保存" },
          { value: 1, label: "审核中" },
          { value: 2, label: "通过" },
          { value: 3, label: "拒绝" }
        ];
        const res = formState.filter(ele => ele.value === stateCode);
        if (res.length) {
          return res.map(item => item.label)[0];
        }else {
          return '不明'
        }
      }
    },
    methods: {
    	getProjectData() {

			},
      handleSelectionChange(data) {
        this.selectionData = data;
        if(data&&data.length>0){
          this.selectionId = data[0].id;
          this.status=data[0].status;
          this.billState = data[0].status
        }
      },
      formatterTime(val){
        if (val) {
          return parseTime(parseInt(val),'{y}-{m}-{d}')
        }
      },
      dataTableBeforeInit() {
        this._url = `${baseUrl}/material/selectPage`;
        const params = {
          pageSize: this.offset,
          pageNum: this.page
        };
        this._params = Object.assign(params,this._query);
        return true
      },
      editTemplate(){
        if (!this.selectionId) {
          this.$message({
            message: '请勾选一条数据再操作',
            type: 'warning'
          });
          return false;
        } else if (this.selectionData.length>1) {
          this.$message.error("不能选择多条数据");
          return false
        } else {
          if(this.selectionData[0].taskId){
            if(this.selectionData[0].status!=0){
              this.$message.error('该条数据不能编辑');
              return false;
            }
          }else{
            if(this.selectionData[0].status!=0){
              this.$message.error('该条数据不能编辑');
              return false;
            }
          }
          this.$router.push({name: "importantTzProjectadd",query: {id: this.selectionId,status:this.status,isLook:false}})
        }
      },
      audit(data) {
        if (data.taskId) {
          this.$router.push({
            name: "add",
            query: {
              id: data.id,
              workflow: 1,
              status: data.status,
              processId:data.processId,
              taskId: data.taskId,
            }
          });
        } else {
          this.$message({
            message: "该单据不能审核",
            type: "warning"
          });
        }
      },
      addTemplate(){
        this.$router.push("importantTzProjectadd")
      },
      look(id,taskId,status,processId) {
        let look=true;
        taskId?look=false:look=true;
        debugger
        this.$router.push({
          name: "importantTzProjectadd",
          query: { id: id, taskId:taskId,status:-5,processId:processId,isLook: true }
        });
      },
      del() {
        const ids = this.selectionData.map(i => i.id);
        if (!this.selectionData.length) {
          this.$message({
            message: '请勾选一条数据再操作',
            type: 'warning'
          });
        } else if (this.selectionData[0].status==1) {
          this.$message({
            message: '勾选的单据正在审核中，不能删除',
            type: 'warning'
          });
        } else {
          this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            deleteById(ids).then(res => {
              if (res.status === 200) {
                this.$message({
                  message: '删除成功',
                  type: 'success'
                });
                this.dataTableInit()
              }
            })
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '已取消删除'
            });
          });

        }
      }
    }
  }
</script>

<style scoped lang="scss">
  .searchBar .el-form-item .el-form-item__label{
    line-height: 40px !important;
  }
  .mb-15{
    margin-bottom: 15px;
  }
</style>
