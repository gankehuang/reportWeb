<template>
  <div v-loading.fullscreen.lock="loading">
    <!--顶部操作区-->
    <formTitle title="肥猪上市计划">
      <div slot="context">
        <page-form
          v-bind="formOptions"
          :model="formData"
          :editable="false"
          ref="PageForm"
        ></page-form>
      </div>
      <!--   <div slot="title-suffix">
           &lt;!&ndash;   <el-button type="default" size="small"  @click="auditData" v-if="projectId&&status==1">
                  审核
                </el-button>
                <el-button type="default" size="small"  @click="reverseAuditData" v-if="projectId&&status==2&&isCanUnAudit=='Y'">
                  反审
                </el-button>&ndash;&gt;
           <el-button type="default" @click="exportDataEvent" size="small">
             导出
           </el-button>
         </div>-->
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
                     @click="exportChildData('monoutplan\/exportExcel','肥猪上市计划')">导出
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
          <vxe-table-column title="养户批次" width="100" fixed="left"    field="fbatchname">
            <template v-slot="{row}">
              {{row.fbatchname || '-'}}
            </template>
          </vxe-table-column>
          <vxe-table-column title="管理员" width="100"   fixed="left"  field="fmanagername">
            <template v-slot="{row}">
              {{row.fmanagername || '-'}}
            </template>
          </vxe-table-column>
          <vxe-table-column title="现存栏数量" width="100"  align="right"   field="fcurqty">
            <template v-slot="{row}">
              {{row.fcurqty || '-'}}
            </template>
          </vxe-table-column>
          <vxe-table-column title="现存栏日龄" width="100"   align="right"  field="fcurday">
            <template v-slot="{row}">
              {{row.fcurday || '-'}}
            </template>
          </vxe-table-column>
          <vxe-table-column title="计划上市日龄" width="100"  align="right"   field="cfplanday">
            <template v-slot="{row}">
              {{row.cfplanday || '-'}}
            </template>
          </vxe-table-column>
          <vxe-table-column title="计划出栏均重" width="100"  align="right"  field="fplanavgweight">
            <template v-slot="{row}">
              {{row.fplanavgweight || '-'}}
            </template>
          </vxe-table-column>
          <vxe-table-column field="fplandate" title="计划上市日期"   width="100" >
            <template v-slot:edit="{ row }">
              <el-date-picker v-model="row.fplandate" type="date" value-format="yyyy-MM-dd"></el-date-picker>
            </template>
            <template v-slot="{ row }">{{ timeFormat(row.fplandate)}}</template>
          </vxe-table-column>
          <vxe-table-column title="计划上市数"  align="right"   width="100" field="fplanqty">
            <template v-slot="{row}">
              {{row.fplanqty || '-'}}
            </template>
          </vxe-table-column>
          <vxe-table-column title="已出栏日龄"  align="right"   width="100" field="fplanqty">
            <template v-slot="{row}">
              {{row.favtoutday || '-'}}
            </template>
          </vxe-table-column>
          <vxe-table-column title="已出栏头数"  align="right"  width="100" field="favtoutqty">
            <template v-slot="{row}">
              {{row.favtoutqty || '-'}}
            </template>
          </vxe-table-column>
          <vxe-table-column title="已出栏均重"   align="right"  width="100" field="favtavgweight">
            <template v-slot="{row}">
              {{row.favtavgweight || '-'}}
            </template>
          </vxe-table-column>
          <vxe-table-column title="预计批次存活率(%)"  align="right"  width="150"  field="fchl">
            <template v-slot="{row}">
              {{row.fchl || '-'}}
            </template>
          </vxe-table-column>
          <vxe-table-column title="预计单头毛利" width="100"   align="right"  field="foneprofit">
            <template v-slot="{row}">
              {{row.foneprofit || '-'}}
            </template>
          </vxe-table-column>
          <vxe-table-column title="预估单斤成本" width="100"   align="right"  field="fonecost">
            <template v-slot="{row}">
              {{row.fonecost || '-'}}
            </template>
          </vxe-table-column>
          <vxe-table-column title="其中：猪苗采购成本"  align="right"  width="180" field="fpigpurcost">
            <template v-slot="{row}">
              {{row.fpigpurcost || '-'}}
            </template>
          </vxe-table-column>
          <vxe-table-column title="出栏类型"   width="100" field="fouttype">
            <template v-slot="{row}">
              {{row.fouttype || '-'}}
            </template>
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
  import {queryList,getById,auditId,reverseAuditId} from "@/api/serviceDepartment/promotionPig";
  import  common from '../conserveLoans/common'
  import formTitle from "@/components/formTitle/formTitle";
  import PageForm from "@/components/form/Form";
  import {mapGetters} from  'vuex'
  export default {
    name: 'maintenanceLoan',
    components: {formTitle,PageForm},
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
          this.tableData=this.mainTableData[rowIndex].monoutPlanEntryPage.list;
        }
      },
      getProjectList(query){
        this.loading=true;
        let params=query;
        if(this.$route.query.orgId){
          params.flag=1
        }
        queryList(10,1,params).then(res=>{
          this.loading=false;
          this.mainTableData=res.data;
          if(res.data.length>0){
            this.formData=res.data[0];
            this.projectId=res.data[0].id;
            this.status=res.data[0].status;
            this.isCanUnAudit=res.data[0].isCanUnAudit;
            this.tableData=res.data[0].monoutPlanEntryPage.list;
            this.tablePage.totalResult=res.data[0].monoutPlanEntryPage.total;
            if(this.$route.query.orgId){
              this.orgName=res.data[0].fservicedeptname;
            }
          }else{
            this.tableData=[]
            this.formData={};
          }
        }).catch(error=>{
          this.loading=false;
          console.log(error);
        })
      },
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
