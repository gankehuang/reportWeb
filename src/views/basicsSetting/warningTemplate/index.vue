<template>
  <div class="content-container"  v-loading.fullscreen.lock="fullLoading">
    <FormHead
      url="/BUSINESSREPORT/summaryTemplate/selectAll"
      ref="formHead"
      @save="saveHandler"
      :addNewDataFormatter="addNewBody"
      :queryDataFormatter="bodyDataFormatter"
      :showDelBtn="false"
      :showAuditBtn="false"
      @del="delHandler"
      @getRowData="cellClick"
      :tableHead="tableHead">
    </FormHead>
 <!--   <vxe-toolbar>
      <template #buttons>
        <vxe-button @click="insertEvent()">新增</vxe-button>
        <vxe-button @click="insertEvent(-1)">在最后行插入</vxe-button>
        <vxe-button @click="delRow">删除</vxe-button>
&lt;!&ndash;        <vxe-button @click="getData">获取数据</vxe-button>&ndash;&gt;
      </template>
    </vxe-toolbar>-->
    <div class="divide">
    </div>
    <div class="page-content" ref="pageContent">
      <vxe-toolbar class="child-button-list">
        <template v-slot:buttons>
          <div style="height: 32px;display: flex; align-items: center;">
            <span class="dot" style="margin-right: 10px;"></span>
            <span class="title">模板信息</span>
          </div>
        </template>
        <template v-slot:tools>
          <el-button size="small" @click="insertEvent()" class="el-button-audit">新增行</el-button>
          <el-button size="small" @click="insertEvent(-1)" class="el-button-audit">在最后行插入</el-button>
          <el-button size="small" @click="delRow"  class="el-button-unaudit">删除行</el-button>
       <!--   <el-button size="small" @click="exportDataEvent" icon="el-icon-upload2"
                     class="el-button-audit">导出
          </el-button>
          <el-button size="small"  class="el-button-full"
                     icon="el-icon-rank" @click="handleFullscreen">{{fullscreen?'退出全屏':'全屏'}}
          </el-button>-->
        </template>
      </vxe-toolbar>

    <vxe-table
      ref="xTable"
      resizable
      id="bodyTable"
      :edit-config="{trigger: 'click', mode: 'row'}"
      :loading="loading"
      :span-method="rowspanMethod"
      :data="tableData"
      :height="childTableHeight"
      :cell-class-name="cellClassName"
      :edit-rules="validRules"
      :mouse-config="{selected: true}"
      :keyboard-config="{isArrow: true, isDel: true, isTab: true, isEdit: true}"
      border>
      <vxe-table-column  type="checkbox" align="center" width="60"></vxe-table-column>
      <vxe-table-column title="项目" sortable field="topCategory" ></vxe-table-column>
      <vxe-table-column title="项目" sortable field="secondCategory" ></vxe-table-column>

      <vxe-table-column
        field="quotaId"
        title="指标"
        width="200"
        :edit-render="{type: 'default'}">
        <template v-slot:edit="scope">
          <search-selector
            url="/BUSINESSREPORT/summaryTemplate/getAllDEF"
            style="width: 100%"
            v-model="scope.row.quotaId"
            @change="quotaChange($event, scope)"
            valueKey="id"
            labelKey="label"
            :defaultValue="scope.row.quotaId"
            :formatter="kpiFormatter"
            :defaultLabel="scope.row.quotaName"
          ></search-selector>
        </template>
        <template v-slot="{ row }">
          <div :class="{'ch-textIndent': row.quotaName?row.quotaName.indexOf('其中') >= 0:false }">
          {{ row.quotaName || '' }}
          </div>
        </template>
      </vxe-table-column>
      <vxe-table-column
        field="templateSequence"
        title="排序号"
        width="80"
        align="right"
        :edit-render="{type: 'default'}">
        <template v-slot:edit="scope">
          <el-input type="number" v-model="scope.row.templateSequence"></el-input>
        </template>
        <template v-slot="{ row }">
          {{ row.templateSequence }}
        </template>
      </vxe-table-column>
      <!--<vxe-table-column

        field="category"
        title="类别"
        :edit-render="{type: 'default'}">
        <template v-slot:edit="scope">
          <el-select v-model="scope.row.category" @change="$refs.xTable.updateStatus(scope)">
            <el-option v-for="item in categoryList" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </template>
        <template v-slot="{ row }">{{ getSelectLabel(row.category, categoryList) }}</template>
      </vxe-table-column>-->
      <vxe-table-column
        field="comparType" title="比较类型"
        :edit-render="{name: 'default'}">
        <template v-slot:edit="scope">
          <el-select  v-model="scope.row.comparType" placeholder="请选择">
            <el-option
              v-for="item in typeOption"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </template>
        <template v-slot="{ row }">
          {{ turnData(row.comparType) || '' }}
        </template>
      </vxe-table-column>
      <vxe-table-column
        field="standardComparType"
        title="标准比较符"
        :edit-render="{name: 'select', options: symbolList ,props: {placeholder: '请选择值'}}">
      </vxe-table-column>
      <vxe-table-column
        field="standardValue" title="标准值"
        align="right"
        :edit-render="{type: 'default'}">
        <template v-slot:edit="scope">
          <el-input type="number" v-model="scope.row.standardValue" @change="$refs.xTable.updateStatus(scope)"></el-input>
        </template>
        <template v-slot="{ row }">
          {{ row.standardValue || '' }}
        </template>
      </vxe-table-column>
      <vxe-table-column
        field="warningComparType"
        title="预警比较符"
        :edit-render="{name: 'select',options: symbolList ,props: {type: 'number', placeholder: '请选择值'}}">
      </vxe-table-column>
      <vxe-table-column
        field="warningValue"
        title="预警值"
        align="right"
        :edit-render="{type: 'default'}">
        <template v-slot:edit="scope">
          <el-input type="number" v-model="scope.row.warningValue" @change="$refs.xTable.updateStatus(scope)"></el-input>
        </template>
        <template v-slot="{ row }">
          {{ row.warningValue || '' }}
        </template>
      </vxe-table-column>
    </vxe-table>
    </div>
  </div>
</template>

<script>
  import card from '@/components/card'
  import FormHead from './tempHead'
  import { anyTypeDateFormat } from '@/utils/dateUtils'
  import { status2Str } from '@/utils'
  import { mapGetters } from 'vuex'
  import request from '@/utils/request'
  import searchSelector from '@/components/searchSelector'

  export default {
    name: 'warningTemplate',
    components: {
      card,
      FormHead,
      searchSelector
    },
    data() {
      return {
        loading: false,
        childTableHeight:300,
        tableHead: [{
          field: 'level',
          minWidth: '120',
          align:'left',
          title: '层级',
          formatter: ({cellValue}) => {
            if (!cellValue) return ''
            const item = this.levelList.find(item => item.value == cellValue)
            return item.label || ''
          }
        },{
          field: 'post',
          minWidth: '120',
          title: '岗位',
          align:'left',
          formatter: ({cellValue}) => {
            if (!cellValue) return ''
            return this.postLabelMap[cellValue] || ''
          }
        }, {
          field: 'name',
          minWidth: '120',
          align:'left',
          title: '名称'
        }, {
          field: 'lastUpdateTime',
          minWidth: '120',
          align:'left',
          title: '最后更新时间',
          formatter: ({ cellValue }) => {
            return cellValue && anyTypeDateFormat(cellValue)
          }
        },
        //   {
        //   field: 'approve',
        //   minWidth: '120',
        //   title: '审批人'
        // }, {
        //   field: 'approveDate',
        //   minWidth: '120',
        //   title: '审批日期',
        //   formatter: ({ cellValue }) => {
        //     return cellValue && anyTypeDateFormat(cellValue)
        //   }
        // },
        //   {
        //   field: 'status',
        //   minWidth: '120',
        //   title: '状态',
        //   formatter: ({ cellValue }) => {
        //     return status2Str(cellValue)
        //   }
        // }
        ],
        tableData: [],
        checkHeadData:'',
        typeOption: [
          { label: '无', value: null },
          { label: '达成率', value: 1 },
          { label: '实际值', value: 2 }
        ],
        symbolList:[
          { label: '无', value: null },
          { label: '>', value: '>' },
          { label: '≥', value: '≥' },
          { label: '<', value: '<' },
          { label: '≤', value: '≤' },
          { label: '=', value: '=' }
        ],
        validRules: { // 校验规则
          quotaId: [
            { required: true, message: '指标必须填写' }
          ],
        },
        deleteIds: [],
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
        fullLoading: false,
        postLabelMap: {
          'SYBZC': '事业部总裁',
          'PQZJL': '片区总经理',
          'PQYFFZ': '片区育肥副总',
          'PQFZFZ': '片区繁殖副总',
          'FZFGS': '繁殖分公司',
          'YFFGS': '育肥分公司',
        },
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
          }],
          6: [{
            label: '服务部',
            value: 'FWB'
          }]
        }
      }
    },
    mounted () {
      window.onresize = () => {  // 动态监听窗口大小
        return (() => {
          this.computedDOMHeight()
        })()
      }
      this.$nextTick(() => {
        this.computedDOMHeight()
        let spanTag = document.getElementById('bodyTable').getElementsByTagName("tr")[0].getElementsByTagName("th")[1]; //设置第一行第一个单元格，占2行2列
        spanTag.colSpan="2"
        let removeTag = document.getElementById('bodyTable').getElementsByTagName("tr")[0].getElementsByTagName("th")[2];
        document.getElementById('bodyTable').getElementsByTagName('tr')[0].removeChild(removeTag)
        // spanTag.rowSpan="2"
        // let removeTag = document.getElementById('childTable').getElementsByTagName("tr")[1].getElementsByTagName("th")[0];
        // let removeTag1 = document.getElementById('childTable').getElementsByTagName("tr")[1].getElementsByTagName("th")[1];
        // document.getElementById('childTable').getElementsByTagName("tr")[1].removeChild(removeTag) //移除第二行第一列
        // document.getElementById('childTable').getElementsByTagName("tr")[1].removeChild(removeTag1)//移除第二行第二列
      })
    },
    methods: {
      cellClassName ({ row, rowIndex, column, columnIndex }) {
        if(['topCategory','secondCategory','quotaId'].includes(column.property)){
          return 'col-grey'
        }
      },
      computedDOMHeight() {
        let curClientHeight = document.body.clientHeight  // 当前屏幕高度
        this.childTableHeight = curClientHeight  - 506
      },
      kpiClassRender (row) {
        if (row.quotaName.indexOf('其中') >= 0) {
          return 'ch-textIndent'
        } else {
          return ''
        }
      },
      goBack() {
        history.back()
      },
      kpiFormatter(data) {
        return data.map(item => {
          item.label = `${item.top_category}-${item.second_category}-${item.name}(${item.code || '编码为空'})`
          return item
        })

      },
      insertEvent(row) {
        const record = {}
        this.$refs.xTable.insertAt(record, row)
          .then(({ row }) => this.$refs.xTable.setActiveCell(row, 'category'))
      },
      rowspanMethod({ row, $rowIndex, column,columnIndex, data }) {
        const fields = ['topCategory', 'secondCategory']
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
            let colspan = 1
            if (columnIndex == 1 && row.topCategory == row.secondCategory) {
              colspan = 2
            } else if (columnIndex == 2 && row.topCategory == row.secondCategory) {
              colspan = 0
            }
            if (countRowspan > 1) {
              return { rowspan: countRowspan, colspan: colspan }
            }
          }
        }
      },
      addNewBody({ searchForm }) {
        const obj = {
          level: searchForm.level,
          post: searchForm.post,
          createTime: new Date()
        }
        return obj
      },
      saveHandler() {
        const { fullData } = this.$refs.formHead.getData() // 获取表头数据
        let entryData = this.$refs.xTable.getTableData().fullData // 获取子表数据
        if (!fullData || fullData.length === 0) {
          this.$XModal.message({ message: '请填写必要信息!', status: 'warning' })
          return
        }
        if (!entryData || entryData.length === 0) {
          this.$XModal.message({ message: '请填写必要信息!', status: 'warning' })
          return
        }
        this.fullLoading = true

        const formData = {
          lord: this.checkHeadData,
          entrys: entryData,
          deleteIds:this.deleteIds
        }
           let url = '/BUSINESSREPORT/summaryTemplate/update'
            request({
              url: url,
              method: 'post',
              data: formData
            }).then(res => {
              this.fullLoading = false
              if (res.status === 200) {
                this.$XModal.message({ message: '保存成功!', status: 'success' })
              }
              // 刷新数据
              this.$refs.formHead.refreshData()
            }).catch(error => {
              this.fullLoading = false
              console.log(error)
            })

      },
      getData() {
        console.log(this.$refs.xTable.getTableData())
      },
      bodyDataFormatter (data) {
        if (!data || data.length == 0) {
          this.tableData =  []
          return []
        } else {
        this.getChildData(data[0].id)
        return data
        }
      },
      getSelectLabel (value, list, valueProp = 'value', labelField = 'label') {
        let item = list.find(item => item[valueProp] === value)
        return item ? item[labelField] : null
      },
      quotaChange(value,scope) {
        this.$refs.xTable.updateStatus(scope)
        scope.row.topCategory = value.top_category
        scope.row.secondCategory = value.second_category
        scope.row.quotaName = value.name
      },
      cellClick (val) {
        this.getChildData(val.id)
      },
      turnData(type){
        if(type==1){
          return '达成率'
        }else if(type==2){
          return '实际值'
        }else {
          return '无'
        }
      },
      getChildData(id){
        request({
          url:`/BUSINESSREPORT/summaryTemplate/selectById/${id}`,
          method: 'get',
        }).then(res=>{
          if(res.status==200) {
            if (res.data && res.data.entryVos) {
              this.tableData = res.data.entryVos
              this.checkHeadData=res.data.lord;
            }
          }
        }).catch(err=>{
          console.log(err);
        })
      },
      delHandler (rows) {
        let ids = []
        rows.forEach(item => {
          ids.push(item.id)
        });
        request({
          url: '/BUSINESSREPORT/summaryTemplate/delete',
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
        let _this=this;
        this.$refs.xTable.removeSelecteds().then(({rows}) => {
         /* let ids = []
          rows.forEach(item => {
            ids.push(item.id)
          })*/
          // this.deleteIds = this.deleteIds.concat(rows)
          this.delHandler(rows)
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
    margin: 10px;
    padding: 16px 0;
    background-color: #fff;
    height: calc(100vh - 108px);
  }
  /deep/ .col-grey {
    background-color: #F8F8F9;
    color: #333333;
  }
  .page-content{
    padding:6px  20px 10px;
  }
  .ch-textIndent{
    text-indent: 20px;
  }
  .divide{
    width: 100%;
    height:10px;
    background: #F3F5F9;
  }
  /deep/ .vxe-toolbar,.child-button-list{
    padding:10px 0 16px;
  }
</style>
