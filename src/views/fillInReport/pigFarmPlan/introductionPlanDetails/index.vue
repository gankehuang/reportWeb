<template>
    <div class="content-container">

        <vxe-toolbar
          setting
          export
          :refresh="{query: findList}"
        >
          <template v-slot:buttons>
            <vxe-button @click="insertEvent">新增</vxe-button>
            <vxe-button @click="getSelectionEvent">删除选中</vxe-button>
            <vxe-button @click="saveEvent">保存</vxe-button>
          </template>
        </vxe-toolbar>

        <vxe-table
          border
          ref="xTable"
          height="500"
          :loading="loading"
          :data="tableData"
          :edit-rules="validRules"
          :edit-config="{trigger: 'click', mode: 'row'}">
          <vxe-table-column type="checkbox" width="60"></vxe-table-column>
          <vxe-table-column field="bh" title="编号" width="150"></vxe-table-column>
          <vxe-table-column field="tbrq" title="填报日期" width="200" :edit-render="{name: 'input', attrs: {type: 'date'}}"></vxe-table-column>

          <vxe-table-column field="submiter" title="提交人" width="150" :edit-render="{name: 'input', props: {placeholder: '请输入'}}"></vxe-table-column>
          <vxe-table-column field="submitDate" title="提交日期" width="200" :edit-render="{name: 'input', attrs: {type: 'date'}}"></vxe-table-column>
          <vxe-table-column field="approver" title="审批人" width="150" :edit-render="{name: 'input', props: {placeholder: '请输入'}}"></vxe-table-column>
          <vxe-table-column field="approveDate" title="审批日期" width="200" :edit-render="{name: 'input', attrs: {type: 'date'}}"></vxe-table-column>
          <vxe-table-column field="status" title="状态" width="150" :edit-render="{name: 'select', options: optionList}"></vxe-table-column>

          <vxe-table-column title="操作" width="150">
            <template v-slot="{ row }">
                <vxe-button type="text" @click="linkTo(row)">详情</vxe-button>
            </template>
          </vxe-table-column>

        </vxe-table>

        <vxe-pager
          border
          :current-page.sync="page4.currentPage"
          :page-size.sync="page4.pageSize"
          :total="page4.totalResult"
          @page-change="pageChange"
          :layouts="['PrevJump', 'PrevPage', 'Number', 'NextPage', 'NextJump', 'Sizes', 'FullJump', 'Total']">
        </vxe-pager>
    </div>
</template>

<script>
    import request from '@/utils/request'
    export default {
        name: 'introductionPlanDetails',
        data() {
            return {
                page4: {   //分页
                  currentPage: 1,
                  pageSize: 10,
                  totalResult: 300
                },

                loading: false,
                tableData: [],
                optionList: [  //引种日期
                  { label: '--请选择--', value: null },
                  { label: '保存', value: 0 },
                  { label: '更新', value: 1 },
                  { label: '删除', value: 2 }
                ],

                validRules: {
                  submiter: [{ required: true, message: '必须填写' }],
                  submitDate: [{ required: true, message: '必须填写' }],
                  approver: [{ required: true, message: '必须填写' }],
                  approveDate: [{ required: true, message: '必须填写' }],
                  status: [{ required: true, message: '必须填写' }]
                }
            }
        },
        computed: {
            role() {
                return this.name === 'admin' ? '超级管理员' : '普通用户';
            }
        },
        created(){
            this.findList(1, 10)
        },
        activated(){

        },
        deactivated(){

        },
        methods: {
            linkTo(id){
                //console.log(id)
                // this.$router.push({
                //     path: `/introductionPlanDetails/indexDetail/${id}`
                // })
                this.$router.push({ path: '/introductionPlanDetails/indexDetail', query: id});
            },

            //获取列表
            findList (pageNum, pageSize) {
              this.loading = true
              request({
                url: `/BUSINESSREPORT/exoticPlan/queryPageInfo/${pageNum}/${pageSize}`,
                method: 'get',
                params: {  }
              })
              .then(e => {
                if(e.status == 200){
                  let data = e.data.list
                  for(let i=0; i<data.length; i++){  //changeDateFormat
                      data[i].submitDate = this.changeDateFormat(data[i].submitDate)
                      data[i].approveDate = this.changeDateFormat(data[i].approveDate)
                  }
                  this.tableData = data
                  this.page4.totalResult = e.data.total
                  this.loading = false
                }else{
                  this.$XModal.message({ message: '保存失败！', status: 'error' })
                }

              })
            },
            //翻页
            pageChange(e){
                //console.log(e.currentPage)
                this.findList(e.currentPage, e.pageSize)
            },
            //插入行
            insertEvent () {
              let record = {}
              this.$refs.xTable.insert(record)
                .then(({ row }) => this.$refs.xTable.setActiveCell(row, 'key'))
            },
            //保存
            saveEvent () {
              let body = this.$refs.xTable.getRecordset()
              console.log(body)
              let { insertRecords, removeRecords, updateRecords } = body
              if (insertRecords.length || removeRecords.length || updateRecords.length) {
                this.$refs.xTable.validate(valid => {
                  //console.log('新增的数据', valid)
                  if (valid) {
                    let data = [...insertRecords, ...updateRecords]
                    request({
                        url: '/BUSINESSREPORT/exoticPlan/save',
                        method: 'post',
                        data
                    })
                    .then(e => {
                        if(e.status == 200){
                            this.$XModal.message({ message: '保存成功！', status: 'success' })
                        }else{
                            this.$XModal.message({ message: '保存失败！', status: 'error' })
                        }
                    })

                  }
                })
              } else {
                this.$XModal.message({ message: '网络错误', status: 'error' })
              }
            },
            //选中删除
            getSelectionEvent () {
                let removeRecords = this.$refs.xTable.getSelectRecords()
                let a = this.$XModal.confirm('您确定要删除吗？')
                a.then(e => {
                    console.log(e)
                    if(e == 'confirm'){
                        console.log(removeRecords)
                        let data =  []
                        for(let i=0; i<removeRecords.length; i++){
                            data.push(removeRecords[i].id)
                        }
                        console.log(data)
                        this.del(data)
                    }
                })

            },
            //删除数据
            del(data){
                request({
                    url: '/BUSINESSREPORT/exoticPlan/delete',
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
            //日期格式转换
            changeDateFormat(cellval) {
                if (cellval != null) {
                    var date = new Date(parseInt(cellval.replace("/Date(", "").replace(")/", ""), 10));
                    var month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
                    var currentDate = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
                    return date.getFullYear() + "-" + month + "-" + currentDate;
                }
            },

            // 通用行合并函数（将相同多列数据合并为一行）
            rowspanMethod ({ row, $rowIndex, column, data }) {
              let fields = ['key']
              let cellValue = row[column.property]
              if (cellValue && fields.includes(column.property)) {
                let prevRow = data[$rowIndex - 1]
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
            //自定义列合并函数
            colspanMethod({ row, rowIndex, column, columnIndex, data }) {
              if (rowIndex  === 0) {
                if (columnIndex === 0) {
                  return {
                    rowspan: 1,
                    colspan: 2
                  };
                } else if (columnIndex === 1) {
                  return {
                    rowspan: 0,
                    colspan: 0
                  };
                }
              }
            }
        }
    }

</script>


<style scoped>
    .el-divider__text{ font-size: 20px; background-color: #F0F0F0}
    .box-card{ width: 18%; display: inline-block; margin: 10px; vertical-align: top; }
    .clearfix span{ font-weight: bold }

    .content-container{
      margin: 20px 16px;
      padding: 8px;
      background-color: #fff;
      height: calc(100vh - 90px);
    }
</style>
<style>
    .el-upload--text {height: 40px; width: 100px; border: none; line-height: 40px; background-color: #F0F0F0}
</style>
