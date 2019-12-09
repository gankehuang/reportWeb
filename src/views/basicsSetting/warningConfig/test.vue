<template>
  <div class="content-container">
    <FormHead
      url="/BUSINESSREPORT/warningConfiguration/getAll"
      ref="formHead"
      @save="saveHandler"
      :addNewDataFormatter="addNewBody"
      :queryDataFormatter="bodyDataFormatter"
      @del="delHandler"
      @cell-click="cellClick"
      :tableHead="tableHead">
    </FormHead>
    <vxe-toolbar>
      <template #buttons>
        <vxe-button @click="insertEvent()">行新增</vxe-button>
        <vxe-button @click="insertEvent(-1)">在最后行插入</vxe-button>
        <vxe-button @click="delRow">删除选中行</vxe-button>
        <vxe-button @click="getData">获取数据</vxe-button>
      </template>
    </vxe-toolbar>
    <vxe-table
      ref="xTable"
      resizable
      :edit-config="{trigger: 'click', mode: 'row'}"
      :loading="loading"
      :span-method="rowspanMethod"
      :data="tableData"
      :edit-rules="validRules"
      :mouse-config="{selected: true}"
      :keyboard-config="{isArrow: true, isDel: true, isTab: true, isEdit: true}"
      border
      height="500">
      <vxe-table-column align="center" type="checkbox" width="60"></vxe-table-column>
      <vxe-table-column
        align="center"
        field="category"
        title="类别"
        :edit-render="{type: 'default'}">
        <template v-slot:edit="scope">
          <el-select v-model="scope.row.category" @change="$refs.xTable.updateStatus(scope)">
            <el-option v-for="item in categoryList" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </template>
        <template v-slot="{ row }">{{ getSelectLabel(row.category, categoryList) }}</template>
      </vxe-table-column>
      <vxe-table-column align="center" field="examinationContent" title="考核内容"
                        :edit-render="{name: 'input', props: {placeholder: '请输入键值'}}"></vxe-table-column>
      <vxe-table-column align="center" field="standardValueLogic" title="标准比较符"
                        :edit-render="{name: 'select', options: symbolList ,props: {placeholder: '请选择值'}}"></vxe-table-column>
      <vxe-table-column align="center" field="standardValue" title="标准值"
                        :edit-render="{name: 'input',props: {type: 'number',placeholder: '请输入键值'}}"></vxe-table-column>
      <vxe-table-column align="center" field="warningValueLogic" title="预警比较符"
                        :edit-render="{name: 'select',options: symbolList ,props: {type: 'number', placeholder: '请选择值'}}"></vxe-table-column>
      <vxe-table-column align="center" field="warningValue" title="预警值"
                        :edit-render="{name: 'input', props: {placeholder: '请输入键值'}}"></vxe-table-column>
    </vxe-table>
  </div>
</template>

<script>
  import card from '@/components/card'
  import FormHead from '@/components/FormHead'
  import { anyTypeDateFormat } from '@/utils/dateUtils'
  import { status2Str } from '@/utils'
  import { mapGetters } from 'vuex'
  import request from '@/utils/request'

  export default {
    name: 'WarningConfigDetail',
    components: {
      card,
      FormHead
    },
    data() {
      return {
        loading: false,
        tableHead: [{
          field: 'orgName',
          minWidth: '120',
          title: '组织'
        }, {
          field: 'creatorTime',
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
          title: '审批日期',
          formatter: ({ cellValue }) => {
            return cellValue && anyTypeDateFormat(cellValue)
          }
        }, {
          field: 'status',
          minWidth: '120',
          title: '状态',
          formatter: ({ cellValue }) => {
            return status2Str(cellValue)
          }
        }],
        tableData: [],
        categoryList: [{
          label: '请选择', value: null
        }, {
          label: '业绩指标', value: 1
        }, {
          label: '团队建设指标', value: 2
        }, {
          label: '扣分项', value: 3
        }, {
          label: '效率指标', value: 4
        }],
        symbolList: [
          { label: '>', value: '>' },
          { label: '<', value: '<' },
          { label: '>=', value: '>=' },
          { label: '<=', value: '<=' }
        ],
        validRules: { // 校验规则
          category: [
            { required: true, message: '类别值必须填写' }
          ],
          examinationContent: [
            { required: true, message: '考核内容值必须填写' }
          ],
          standardValue: [
            { required: true, message: '标准值必须填写' }
          ],
          warningValue: [
            { required: true, message: '预警值必须填写' }
          ],
          standardValueLogic: [
            { required: true, message: '标准值比较符必须填写' }
          ],
          warningValueLogic: [
            { required: true, message: '预警值比较符必须填写' }
          ]
        },
        deleteIds: []
      }
    },
    created() {
    },
    methods: {
      goBack() {
        history.back()
      },
      insertEvent(row) {
        const record = { standardValueLogic: '>', warningValueLogic: '>', aces: '123' }
        this.$refs.xTable.insertAt(record, row)
          .then(({ row }) => this.$refs.xTable.setActiveCell(row, 'category'))
      },
      rowspanMethod({ row, $rowIndex, column, data }) {
        const fields = ['category']
        const cellValue = row[column.property]
        if (cellValue && fields.includes(column.property)) {
          const prevRow = data[$rowIndex - 1]
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
      addNewBody() {
        const obj = {
          orgName: this.orgInfo.name,
          orgId: this.orgInfo.id,
          orgLongNumber: this.orgInfo.longNumber,
          status: 0,
          creatorTime: new Date()
        }
        return obj
      },
      saveHandler() {
        const { fullData } = this.$refs.formHead.getData()
        const entryData = this.$refs.xTable.getTableData().fullData
        if (!fullData || fullData.length === 0) {
          this.$XModal.message({ message: '请填写必要信息!', status: 'warning' })
          return
        }
        if (!entryData || entryData.length === 0) {
          this.$XModal.message({ message: '请填写必要信息!', status: 'warning' })
          return
        }
        const formData = {
          lord: fullData[0],
          entrys: entryData
        }
        let url = '/BUSINESSREPORT/warningConfiguration/inset'
        if (formData.lord.id) {
          url = '/BUSINESSREPORT/warningConfiguration/update'
          formData.delectIds = this.deleteIds
        }
        request({
          url: url,
          method: 'post',
          data: formData
        }).then(res => {
          if (res.status === 200) {
            this.$XModal.message({ message: '保存成功!', status: 'success' })
          }
          // 刷新数据
          this.$refs.formHead.refreshData()
        }).catch(error => {
          console.log(error)
        })

      },
      getData() {
        console.log(this.$refs.xTable.getTableData())
      },
      bodyDataFormatter (data) {
        if (!data || data.length == 0) {
          return []
        } else {
          this.tableData = data[0].entrys
          return data.map(item => {
            const obj = {
              ...item.lord
            }
            return obj
          })
        }
      },
      getSelectLabel (value, list, valueProp = 'value', labelField = 'label') {
        let item = list.find(item => item[valueProp] === value)
        return item ? item[labelField] : null
      },
      cellClick () {

      },
      delHandler (rows) {
        let ids = []
        rows.forEach(item => {
          ids.push(item.id)
        })
        request({
          url: '/BUSINESSREPORT/warningConfiguration/delete',
          method: 'post',
          data: ids
        }).then(res => {
          if (res.status === 200) {
            this.$message.success('删除成功')
            this.$refs.formHead.refreshData()
          }
        })
      },
      delRow () {
        this.$refs.xTable.removeSelecteds().then( ({rows}) => {
          let ids = []
          rows.forEach(item => {
            ids.push(item.id)
          })
          this.deleteIds = this.deleteIds.concat(ids)
        })
      }
    },
    computed: {
      ...mapGetters(['orgInfo', 'userId', 'name'])
    }
  }
</script>

<style scoped lang="scss">
  .content-container {
    margin: 20px 16px;
    padding: 8px;
    background-color: #fff;
    height: calc(100vh - 90px);
  }
</style>
