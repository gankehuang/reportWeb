<template>
  <div v-loading.fullscreen.lock="loading">
    <!--顶部操作区-->
    <formTitle title="服务部生产指标计划">
      <div slot="context">
        <page-form
          v-bind="formOptions"
          :model="formData"
          :editable="false"
          ref="PageForm"
        ></page-form>
      </div>
      <!--  <div slot="title-suffix">
          &lt;!&ndash;   <el-button type="default" size="small"  @click="auditData" v-if="projectId&&status==1">
                 审核
               </el-button>
               <el-button type="default" size="small"  @click="reverseAuditData" v-if="projectId&&status==2&&isCanUnAudit=='Y'">
                 反审
               </el-button>&ndash;&gt;
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
                     @click="exportChildData('divisionMonthlyPlanBill\/exportExcel','服务部生产指标计划')">导出
          </el-button>
          <el-button size="small"
                     icon="el-icon-rank" @click="handleFullscreen">{{fullscreen?'退出全屏':'全屏'}}
          </el-button>
        </el-col>
      </el-row>
        <vxe-table
          border
          id="childTable"
          :cell-style="cellStyle"
          :height="childTableHeight"
          :cell-class-name="cellClassName"
          :span-method="rowspanMethod"
          ref="xTable"
          :data="tableData">
          <vxe-table-column  title="项目" fixed="left"  >
            <vxe-table-column fixed="left" title="一级项目"   field="fproject1">
              <template v-slot="{row }">
                {{row.fproject1  || '-'}}
              </template>
            </vxe-table-column>
            <vxe-table-column fixed="left" title="二级项目"   field="fproject2">
              <template v-slot="{row }">
                {{row.fproject2  || '-'}}
              </template>
            </vxe-table-column>
          </vxe-table-column>
          <vxe-table-column fixed="left" field="findicator"  width="280px"  title="指标">
            <template v-slot="{row }">
              {{row.findicator  || '-'}}
            </template>
          </vxe-table-column>
          <vxe-table-column field="fnextmonthplancount"  align="right"   :title="formatMonth(0)+'月计划合计'">
            <template v-slot="{row }">
              {{row.fnextmonthplancount  || '-'}}
            </template>
          </vxe-table-column>
          <vxe-table-column :title="formatMonth(0)+'月计划分解'"  >
            <vxe-table-column field="fnextmonth17"  align="right"   title="1-7日">
              <template v-slot="{row }">
                {{row.fnextmonth17  || '-'}}
              </template>
            </vxe-table-column>
            <vxe-table-column field="fnextmonth814"   align="right"  title="8-14日">
              <template v-slot="{row }">
                {{row.fnextmonth814  || '-'}}
              </template>
            </vxe-table-column>
            <vxe-table-column field="fnextmonth1521"  align="right"  title="15-21日">
              <template v-slot="{row }">
                {{row.fnextmonth1521  || '-'}}
              </template>
            </vxe-table-column>
            <vxe-table-column field="fnextmonth2230"  align="right"  title="22-30日">
              <template v-slot="{row }">
                {{row.fnextmonth2230  || '-'}}
              </template>
            </vxe-table-column>
          </vxe-table-column>
          <vxe-table-column field="fnext2monthplan"  align="right"   :title="formatMonth(1)+'月目标'">
            <template v-slot="{row }">
              {{row.fnext2monthplan  || '-'}}
            </template>
          </vxe-table-column>
          <vxe-table-column field="fnext3monthplan"   align="right"   :title="formatMonth(2)+'月目标'">
            <template v-slot="{row}">
              {{row.fnext3monthplan || '-'}}
            </template>
          </vxe-table-column>
        </vxe-table>
      </div>
  </div>
</template>

<script>
  import {queryList,getById,auditId,reverseAuditId} from "@/api/serviceDepartment/monthSummaryPlan";
  import  common from '../conserveLoans/common' //公共的方法
  import  orgTree from "../conserveLoans/orgTree"
  import {mapGetters} from  'vuex'
  import formTitle from "@/components/formTitle/formTitle";
  import PageForm from "@/components/form/Form";
  export default {
    name: 'maintenanceLoan',
    components: {formTitle,PageForm},
    mixins:[common],
    data(){
      return {
        tableAfterData:[],//尾缀数据
      }
    },
    computed:{
      ...mapGetters(['orgInfo','planYearMonth','token'])
    },
    methods:{
      cellStyle ({ row, rowIndex, column, columnIndex }) {
        if (column.property === 'findicator') {
          if (row.displayFlag== '1') {
            return {
              textAlign: 'left'
            }
          }else if(row.displayFlag== '2'){
            return {
              textAlign:'right'
            }
          }
        }
      },
      cellClassName ({ row, rowIndex, column, columnIndex }) {
        if(['fproject1','fproject2','findicator'].includes(column.property)){
          return 'col-grey'
        }
      },
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
      // 转换横向树结构
      toColTreeData () {
        let options = { children: 'children' }
        let list = []
        let keyMap = {}
        this.$utils.eachTree(this.treeData, (item, index, result, paths, parent) => {
          keyMap[item.id] = item
          item.keys = parent ? parent.keys.concat([item.id]) : [item.id]
          if (!item.children || !item.children.length) {
            let row = { }
            item.keys.forEach((key, index) => {
              let level = index + 1
              let obj = keyMap[key]
              row[`check_${level}`] = false
              row[`id_${level}`] = obj.id
              row[`name_${level}`] = obj.name
            })
            list.push(row)
          }
        }, options)
        this.keyMap = keyMap
        this.tableData = list.map((item,index)=>{ //拼接合并单元格默认数据和后台返回数据
          return{
            ...item,
            ...this.tableAfterData[index]
          }
        });
      },
      // 通用行合并函数（将相同多列数据合并为一行）
      rowspanMethod ({ row, $rowIndex, column,columnIndex,data }) {
        const fields = ['fproject1','fproject2','findicator']
        const cellValue = row[column.property]
        if (cellValue && fields.includes(column.property)) {
          const prevRow = data[$rowIndex - 1]
          let nextRow = data[$rowIndex + 1]
          if (prevRow && prevRow[column.property] === cellValue) {
            return { rowspan: 0, colspan: 1 }
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

              /*if($rowIndex==0){
                return { rowspan: 3, colspan: 2 }
              }else{
                return { rowspan: countRowspan, colspan: 1 }
              }*/
       /* if([0,1,2].includes($rowIndex)) {
          if(columnIndex===1){
            return {
              rowspan: 0, colspan: 0
            }
          }
        }*/
      },
      cellClickEvent({ row, rowIndex, column, columnIndex }, event){
        console.log(rowIndex);
        if(this.mainTableData.length>0){
          this.tableData=this.mainTableData[rowIndex].divisionMpbePage.list;
          // this.toColTreeData(); //拼接左侧静态数据和右侧动态数据
        }
      },
      getProjectList(query){
        this.loading=true;
        queryList(100,1,query).then(res=>{
          this.loading=false;
          this.mainTableData=res.data;
          if(res.data.length>0){ //有数据时
            this.formData=res.data[0]
            this.projectId=res.data[0].id;
            this.status=res.data[0].status;
            this.tableData=res.data[0].divisionMpbePage.list;//获取右侧动态数据
            this.isCanUnAudit=res.data[0].isCanUnAudit;
            if(this.$route.query.orgId){
              this.orgName=res.data[0].fstorageorgunitname;
            }
            // this.toColTreeData(); //拼接左侧静态数据和右侧动态数据
          }else{ //无数据时
            this.tableData=[]
            this.formData={};
          }
        }).catch(error=>{
          this.loading=false;
          console.log(error);
        })
      },
      headSpan(){
        let spanTag = document.getElementById('childTable').getElementsByTagName("tr")[0].getElementsByTagName("th")[0]; //设置第一行第一个单元格，占2行3列
        spanTag.colSpan="3"
        spanTag.rowSpan="2"
        let removeTag = document.getElementById('childTable').getElementsByTagName("tr")[1].getElementsByTagName("th")[0];
        let removeTag1 = document.getElementById('childTable').getElementsByTagName("tr")[1].getElementsByTagName("th")[1];
        document.getElementById('childTable').getElementsByTagName("tr")[1].removeChild(removeTag) //移除第二行第一列
        document.getElementById('childTable').getElementsByTagName("tr")[1].removeChild(removeTag1)//移除第二行第二列
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
  /deep/ .col-grey {
    background-color: #F8F8F9;
    color: #333333;
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
