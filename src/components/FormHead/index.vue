<template>
  <div class="wrap">
    <div>
      <!-- 查询区 -->
      <el-row :gutter="10">
        <el-col :xs="24" :sm="18" :md="18" :lg="14" :xl="14">
          <el-form :inline="true" :model="searchForm">
            <el-form-item label="组织" size="small">
              <el-select disabled v-model="searchForm.orgId" placeholder="全部" style="width: 120px">
                <el-option v-for="item in orgList" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
            <slot name="searchPanel" v-bind:searchForm="searchForm">
              <el-form-item label="业务期间" size="small">
                <el-date-picker
                  v-model="searchForm.period"
                  style="width: 120px"
                  type="month"
                  placeholder="选择月"
                  format="yyyy-MM"
                  value-format="yyyy-MM">
                </el-date-picker>
              </el-form-item>
            </slot>
            <el-form-item size="small">
<!--              <el-button type="default" @click="queryData">查询</el-button>-->
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :xs="24" :sm="6" :md="6" :lg="10" :xl="10">
          <div class="pull-right">
            <el-button size="small" :disabled="disabled || listData.length >= 1" @click="addNew" plain>新增</el-button>
<!--						<el-button size="small" v-show="showDelBtn" class="save-btn" plain @click="del">删除</el-button>-->
						<el-button size="small" :disabled="disabled" plain @click="save">保存</el-button>
            <el-button size="small" :disabled="disabled" plain v-show="showSubmitBtn" @click="submit">提交</el-button>
            <el-button size="small" :disabled="disabled" v-show="showAuditBtn" plain @click="audit">审核</el-button>
          </div>
        </el-col>
      </el-row>

      <!--  内容区-->
      <div style="margin-bottom: 20px;">
        <vxe-table
          ref="xTable"
          border
          :loading="loading"
          resizable
          :edit-config="editConfig"
          v-on="$listeners"
          :data="listData">
          <vxe-table-column type="checkbox" align="center" width="50"></vxe-table-column>
          <vxe-table-column type="index" width="60" align="center" title="序号"></vxe-table-column>
          <vxe-table-column v-for="column in tableHead" v-bind="column" :align="column.align ? column.align : 'center'">
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
  import { status2Str } from '@/utils'
  export default {
    name: 'formHead',
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
      showDelBtn: {
        type: Boolean,
        default: () => true
      },
      showAuditBtn: {
        type: Boolean,
        default: () => true
      },
      showSubmitBtn: {
        type: Boolean,
        default: () => false
      },
      disabled: {
        type: Boolean,
        default: () => false
      },
      params: {
        type: Object
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
              title: '业务期间'
            }, {
              field: 'createTime',
              minWidth: '120',
              title: '填报日期',
              formatter: ({ cellValue }) => {
                return cellValue && anyTypeDateFormat(cellValue)
              }
            }, {
              field: 'submiterName',
              minWidth: '120',
              title: '提交人'
            }, {
              field: 'submitDate',
              minWidth: '120',
              title: '提交日期',
              formatter: ({ cellValue }) => {
                return cellValue && anyTypeDateFormat(cellValue)
              }
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
              title: '状态',
              formatter: ({ cellValue }) => {
                return status2Str(cellValue)
              }
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
        loading: false,
        firstLoaded: false
      }
    },
    methods: {
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
          this.loading = false
          if (this.queryDataFormatter) {
            this.listData = this.queryDataFormatter(res.data)
          }
          this.$emit('dataChange', this.listData)
        }).catch(error => {
          console.log(error)
          this.loading = false
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
            orgLongNum: this.orgInfo.longNumber,
            status: 0,
            createTime: new Date(),
            period: this.searchForm.period
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
      submit () {
        const { fullData } = this.getData()
        if (!fullData || fullData.length == 0) {
          this.$message.warning('无数据可提交!')
          return
        }

        if (fullData[0].status != 0) {
          this.$message.warning('该状态提交审批')
          return
        }

        if (fullData.length > 1 && this.$refs.xTable.getSelectRecords() == 0) {
          this.$message.warning('请选择一行进行提交!')
          return
        }

        this.$confirm('提交后无法修改，是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$emit('submit',this.getData())
        })
      },
      audit () {
        const { fullData } = this.getData()
        if (!fullData || fullData.length == 0) {
          this.$message.warning('无数据可审批!')
          return
        }

        if (fullData[0].status > 1) {
          this.$message.warning('该状态无法审批')
          return
        }

        if (fullData.length > 1 && this.$refs.xTable.getSelectRecords() == 0) {
          this.$message.warning('请选择一行进行审核!')
          return
        }

        this.$confirm('审核后无法修改，是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$emit('audit',this.getData())
        })
      }
    },
    created() {
      // searchForm.period
      // this.$set(this.searchForm, 'period', moment().subtract(1, 'month').format('YYYY-MM'))
      // this.$set(this.searchForm, 'period', moment().format('YYYY-MM'))
    },
    watch: {
      orgInfo: {
        handler (val) {
          if (val) {
            this.orgList = [{
              label: val.name,
              value: val.id
            }]
            this.searchForm.orgId = val.id
            if (!this.firstLoaded) {
              this.firstLoaded = true
              this.$set(this.searchForm, 'period', moment().format('YYYY-MM'))
              this.queryData()
            }
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
      ...mapGetters(['orgInfo']),
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
    }
  }
</script>

<style scoped lang="scss">
  .wrap {
    margin: 12px 0;
  }
</style>
