<template>
  <div class="wrap">
    <div>
      <!-- 查询区 -->
     <div class="title-box">
       <div class="title-left">
         <span class="dot"></span>
         <span class="title">预警配置</span>
       </div>
       <div class="button-style">
         <el-button size="small" plain class="el-button-audit" @click="save">保存</el-button>
         <el-button size="small" plain v-show="showAuditBtn" @click="audit">审核</el-button>
       </div>
     </div>

      <!--  内容区-->
      <div style="margin-bottom: 20px;">
        <vxe-table
          ref="xTable"
          border
          resizable
          height="210"
          highlight-hover-row
          highlight-current-row
          @cell-click="cellClickEvent"
          :edit-config="editConfig"
          v-on="$listeners"
          :data="listData">
          <!--<vxe-table-column type="checkbox" align="center" width="50"></vxe-table-column>-->
          <vxe-table-column type="index" width="60" align="center" title="序号"></vxe-table-column>
          <vxe-table-column v-for="column in tableHead"   v-bind="column" :align="column.align ? column.align : 'center'">
          </vxe-table-column>
        </vxe-table>
      </div>
    </div>
  </div>
</template>

<script>
  import { anyTypeDateFormat } from '@/utils/dateUtils'
  import { mapGetters } from 'vuex'
  import request from '@/utils/request'
  import moment from 'moment'
  export default {
    name: 'tempHead',
    props: {
      url: {
        type: String,
        required: true
      },
      addNewDataFormatter: { // 新增数据
        type: Function
      },
      queryDataFormatter: {
        type: Function
      },
      disabled: {
        type: Boolean,
        default: () => false
      },
      params: {
        type: Object
      },
      showDelBtn: {
        type: Boolean,
        default: () => true
      },
      showAuditBtn: {
        type: Boolean,
        default: () => true
      },
      tableHead: {
        type: Array,
        default: () => {
          return [
            {
              field: 'orgName',
              minWidth: '120',
              title: '组织'
            }, {
              field: 'period',
              minWidth: '120',
              title: '业务期间',
              editRender: { name: 'input' }
            }, {
              field: 'createTime',
              minWidth: '120',
              title: '填报日期',
              formatter: ({ cellValue }) => {
                return cellValue && anyTypeDateFormat(cellValue)
              }
            }, {
              field: 'submiter',
              minWidth: '120',
              title: '提交人'
            }, {
              field: 'name',
              minWidth: '120',
              title: '名称'
            }, {
              field: 'submitDate',
              minWidth: '120',
              title: '提交日期'
            }, {
              field: 'approve',
              minWidth: '120',
              title: '审批人'
            }, {
              field: 'approveDate',
              minWidth: '120',
              title: '审批日期'
            }, {
              field: 'status',
              minWidth: '120',
              title: '状态'
            }
          ]
        }
      }
    },
    data() {
      return {
        searchForm: {},
        listData: [],
        orgList: [],
        postLabelMap: {
          'SYBZC': '事业部总裁',
          'PQZJL': '片区总经理',
          'PQYFFZ': '片区育肥副总',
          'PQFZFZ': '片区繁殖副总',
          'FZFGS': '繁殖分公司',
          'YFFGS': '育肥分公司',
        },
        levelList: [{
          label: '事业部',
          value: 1
        },{
          label: '片区',
          value: 3
        },{
          label: '分公司',
          value: 4
        },{
          label: '猪场/服务部',
          value: 5
        }], // 6 分场
        postMap: {
          1: [{
            label: '事业部总裁',
            value: 'SYBZC'
          }],
          3: [{
            label: '片区总经理',
            value: 'PQZJL'
          },{
            label: '片区育肥副总',
            value: 'PQYFFZ'
          },{
            label: '片区繁殖副总',
            value: 'PQFZFZ'
          }],
          4: [{
            label: '繁殖分公司',
            value: 'FZFGS'
          },{
            label: '育肥分公司',
            value: 'YFFGS'
          }],
          5: [{
            label: '猪场',
            value: 'ZC'
          },{
            label: '服务部',
            value: 'FWB'
          }]
        }
      }
    },
    methods: {
      cellClickEvent ({ row, rowIndex, column, columnIndex }, event) {
        this.$emit('getRowData',row)
      },
      queryData() {
        let query = {
          ...this.searchForm
        }
        if (this.params) {
          query = {
            ...query,
            ...this.params
          }
        }
        request({
          url: this.url,
          params: query
        }).then(res => {
          if (this.queryDataFormatter) {
            this.listData = this.queryDataFormatter(res.data)
          }
          this.$emit('dataChange', this.listData)
        })
      },
      refreshData () {
        this.queryData()
      },
      addNew() {
        if (this.listData > 0) {
          return
        }
        let record = {}
        if (this.addNewDataFormatter){
          record = this.addNewDataFormatter({ searchForm: this.searchForm })
        } else {
          record = {
            orgName: this.orgInfo.name,
            orgId: this.orgInfo.id,
            orgLongNum: this.orgInfo.longNumber
          }
        }
        this.listData.push(record)
        this.$refs.xTable.insert(record)
          .then(({ row }) => this.$refs.xTable.setActiveRow(row))
      },
      activeRowMethod() {
        return !this.disabled
      },
      getData() {
        return this.$refs.xTable.getTableData()
      },
      del () {
        if (this.$refs.xTable.getSelectRecords() == 0 ){
          this.$message.warning('请选择一行进行删除!')
          return
        }
        this.$confirm('是否确认删除?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$emit('del',this.$refs.xTable.getSelectRecords())
        })
      },
      save () {
        this.$emit('save',this.getData())
      },
      audit () {
        this.$emit('audit')
      }
    },
    created() {
      // searchForm.businessMonth
      // this.$set(this.searchForm, 'businessMonth', moment().format('YYYY-MM'))
    },
    watch: {
      orgInfo: {
        handler (val) {
          if (val) {
            // this.searchForm.orgId = val.id
            this.searchForm.post = this.postMap[val.type] ? this.postMap[val.type][0].value : ''
            this.searchForm.level = parseInt(val.type)
            const obj = {
              level: parseInt(val.type),
              post: this.postMap[val.type] ? this.postMap[val.type][0].value : ''
            }
            // this.$set(this.searchForm, obj)
            this.searchForm = obj
            this.queryData()
          }
        },
        immediate: true,
        deep: true
      },
      searchForm: {
        handler (val) {
          this.queryData()
        },
        deep: true
      },
      params: {
        handler (val) {
          this.queryData()
        },
        deep: true
      }
    },
    computed: {
      filterPosts () {
        if (!this.searchForm.level) {
          return []
        } else {
          return this.postMap[this.searchForm.level]
        }
      },
      editConfig () {
        if (this.disabled) {
          return {}
        } else {
          return {
            trigger: 'click',
            mode: 'row',
            showStatus: true
          }
        }
      },
      ...mapGetters(['orgInfo'])
    }
  }
</script>

<style scoped lang="scss">
  .wrap {
    padding:0 20px;
  }
  .title-box {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    .title-left {
      flex: 0 0 30%;
      .dot {
        display: inline-block;
        margin-right: 10px;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: #4A75D0;
      }

      .title {
        color: #4d4d4d;
        font-size: 14px;
        font-family: PingFangSC;
        font-weight: 600;
      }
    }
  }

  .button-style{
    flex: 0 0 70%;
    text-align: right;
  }
</style>
