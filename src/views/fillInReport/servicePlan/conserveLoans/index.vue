<template>
  <div v-loading.fullscreen.lock="loading">
    <!--顶部操作区-->
    <formTitle title="养户贷计划">
      <div slot="context">
        <page-form
          v-bind="formOptions"
          :model="formData"
          :editable="false"
          ref="PageForm"
        ></page-form>
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
          <el-button style="border:1px solid #1989FA;color:#1989FA;"
                     size="small"
                     icon="el-icon-upload2"
                     @click="exportChildData('custLoanPlan\/exportExcel','养户贷计划')">导出
          </el-button>
          <el-button size="small"
                     icon="el-icon-rank" @click="handleFullscreen">{{fullscreen?'退出全屏':'全屏'}}
          </el-button>
        </el-col>
      </el-row>
        <vxe-table
          ref="xTable"
          resizable
          :height="childTableHeight"
          highlight-hover-row
          :data="tableData"
          border>
          <vxe-table-column title="养户名称"   fixed="left" field="fcustinfoname">
            <template v-slot="{row}">
              {{row.fcustinfoname || '-'}}
            </template>
          </vxe-table-column>
          <vxe-table-column title="养户类型"   fixed="left" field="fcusttype">
            <template v-slot="{row}">
              {{row.fcusttype || '-'}}
            </template>
          </vxe-table-column>
          <vxe-table-column title="饲养规模"   align="right"  field="ffeedingscale">
            <template v-slot="{row}">
              {{row.ffeedingscale || '-'}}
            </template>
          </vxe-table-column>
          <vxe-table-column title="现存保证金"  align="right"   field="fbalance">
            <template v-slot="{row}">
              {{row.fbalance || '-'}}
            </template>
          </vxe-table-column>
          <vxe-table-column title="在养批次投苗数"  align="right"   width="150px" field="ftmts">
            <template v-slot="{row}">
              {{row.ftmts || '-'}}
            </template>
          </vxe-table-column>
          <vxe-table-column title="现存栏"  align="right"   field="fcurcnt">
            <template v-slot="{row}">
              {{row.fcurcnt || '-'}}
            </template>
          </vxe-table-column>
          <vxe-table-column title="单头贷款金额(元)"   align="right" field="fheadloanamt">
            <template v-slot="{row}">
              {{row.fheadloanamt || '-'}}
            </template>
          </vxe-table-column>
          <vxe-table-column title="预计贷款金额(万元)"   align="right"  field="fextiloanamt">
            <template v-slot="{row}">
              {{row.fextiloanamt || '-'}}
            </template>
          </vxe-table-column>
          <vxe-table-column field="floandate"   title="贷款办理日期" width="150">
            <template v-slot="{row}">{{ timeFormat(row.floandate)}}</template>
          </vxe-table-column>
        </vxe-table>
        <vxe-pager
          border
          :loading="loading"
          :current-page="tablePage.currentPage"
          :page-size="tablePage.pageSize"
          :total="tablePage.totalResult"
          :layouts="['PrevPage', 'JumpNumber', 'NextPage', 'FullJump', 'Sizes', 'Total']"
          @page-change="handlePageChange">
        </vxe-pager>
      </div>
    </div>
</template>

<script>
  import {queryList,getById,auditId,reverseAuditId} from "@/api/serviceDepartment/conserveLoans";
  import  orgTree from "./orgTree"
  import treeSelect from "@/components/TreeSelect";
  import {mapGetters} from  'vuex'
  import common from  './common'
  import formTitle from "@/components/formTitle/formTitle";
  import PageForm from "@/components/form/Form";
  export default {
    name: 'maintenanceLoan',
    components: {orgTree,treeSelect,formTitle,PageForm},
    mixins:[common],
    data(){
      return {
      }
    },
    computed:{
      ...mapGetters(['orgInfo','planYearMonth','token'])
    },

    methods:{
      auditData(){//审核
        this.$confirm('此操作将进行审核操作, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          console.log(this);
          auditId(this.projectId).then(res=>{
            if(res.status==200){
              this.$message.success('审核成功！');
              this.getProjectList(this.searchForm);
            }
          }).catch(err=>{
            console.log(err);
          })
        }).catch(() => {

        });
      },
      reverseAuditData(){//反审核操作
        this.$confirm('此操作将进行反审操作, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          reverseAuditId(this.projectId).then(res=>{
            if(res.status==200){
              this.$message.success('反审核成功！');
              this.getProjectList(this.searchForm);
            }
          }).catch(err=>{
            console.log(err);
          })
        }).catch(() => {

        });
      },
      cellClickEvent({ row, rowIndex, column, columnIndex }, event){
        if(this.mainTableData.length>0){
          this.projectId=this.mainTableData[rowIndex].id;
          this.tableData=this.mainTableData[rowIndex].custLoanPlanEntryPage.list;
        }
      },
      getProjectList(query){
        this.loading=true;
        queryList(this.tablePage.pageSize,this.tablePage.currentPage,query).then(res=>{
          this.loading=false;
          this.formData=res.data[0];
          if(res.data.length>0){
            this.projectId=res.data[0].id;
            this.isCanUnAudit=res.data[0].isCanUnAudit;
            this.tableData=res.data[0].custLoanPlanEntryPage.list;
            this.tablePage.totalResult=res.data[0].custLoanPlanEntryPage.total;
            this.status=res.data[0].status;
            if(this.$route.query.orgId){
              this.orgName=res.data[0].fservicedeptname;
            }
          }else{
            this.formData={};
            this.tableData=[];
          }
        }).catch(error=>{
          this.loading=false;
          console.log(error);
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
  .page-head {
    margin: 10px 10px;
    padding: 0 0px 20px;
    border-radius: 5px;
    background-color: #fff;
  }
  /deep/ .page-form-container{
    margin:0 !important;
  }
  .page-content {
    box-sizing: border-box;
    margin: 10px 10px;
    padding: 16px 20px;
    border-radius: 5px;
    background-color: #fff;

    .content-head {
      padding: 0 0 16px 0;
      .dot{
        margin-right: 10px;
      }
      .title {
        font-weight: bold;
        font-size: 14px;
        color: #333333;
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
