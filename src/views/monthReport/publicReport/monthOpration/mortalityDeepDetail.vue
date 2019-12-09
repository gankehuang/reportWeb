<template>
  <div>
    <div class="mbody-container" ref="pageContent">
      <el-tabs v-model="activeName">
        <el-tab-pane v-for="item in panelList" :label="item.label" :name="item.key">
        </el-tab-pane>
      </el-tabs>
      <deepGridTable v-for="item in panelList"
                     :key="item.key"
                     :autoHeight="autoHeight"
                     v-show="activeName == item.key"
                     :show="activeName === item.key"
                     :dataFormatter="dataFormatter"
                     url="/BUSINESSREPORT/roma/getDeadRank"
                     :params="getParams(item)"
                     :tableHead="tableHead">
      </deepGridTable>

      <div class="floatBtnWrapper">
        <el-button style="border:1px solid #1989FA;color:#1989FA;"
                   size="mini"
                   icon="el-icon-download">导出
        </el-button>
        <el-button size="mini"
                   icon="el-icon-rank" @click="handleFullscreen">{{fullscreen?'退出全屏':'全屏'}}
        </el-button>
      </div>

    <el-dialog :visible.sync="chartVisible" width="800px" v-loading="chartLoading">

      <template #title>
      	<div style="display: flex;flex-direction: row;">
	      	<div>
	      		 月度死亡率排名趋势图
	      	</div>
	       	<div style="flex: 1;display: flex;flex-direction: row;justify-content: flex-end;margin-right: 40px;" :popper-append-to-body="false">
	       		<el-select size="mini" v-model="type" placeholder="请选择" :popper-append-to-body="false">
					    <el-option
					      v-for="item in options"
					      :key="item.value"
					      :label="item.label"
					      :value="item.value">
					    </el-option>
					  </el-select>
	      	</div>
      	</div>
      </template>
      <chart width="100%" :height="'400'" :data="myCHartData"></chart>
    </el-dialog>
  </div>
  </div>
</template>

<script>
import PageForm from "@/components/form/Form";
import formOptionMixins from './formOptionMixins'
import { mapGetters } from 'vuex'
import deepGridTable from '../../components/deepGridTable'
import moment from 'moment'
import chart from '@/components/chart/chart1'
import request from '@/utils/request'
export default {
  name: 'mortalityDeepDetail',
  mixins: [formOptionMixins],
  components: {
    PageForm,
    deepGridTable,
    chart
  },
  data() {
    return {
    	options: [{
          value: '1',
          label: '近三月'
        }, {
          value: '2',
          label: '近六月'
        }, {
          value: '3',
          label: '近十二个月'
        }, {
          value: '4',
          label: '今年'
        }],
      type: '3',
      autoHeight: '70vh',
      chartLoading: false,
      chartVisible: false,
      chartData: [],
      deepPanellist: [{
        label: '事业部',
        key: 'syb',
        value: 1
      },{
        label: '片区',
        key: 'pq',
        value: 3
      },{
        label: '分公司',
        key: 'fgs',
        value: 4
      },{
        label: '服务部排名',
        key: 'zc',
        value: 6
      }],
      tableHead: [{
        width: 180,
        field: 'ORGNAME',
        title: '单位名称',
        slots: {
          default: ({ row, column }) => {
            return [
              <div class="column-orgName-wrapper">
                <span>{ row.ORGNAME }</span>
                <img style="cursor:pointer;" src={require("@/assets/pathIcon.png")} onClick={ (e) => this.showChart(row,e) } />
              </div>
          ]
          }
        }
      },{
        field: 'RN',
        width: 80,
        title: '排名',
        align: 'center',
        sortable: true,
        sortMethod: (a,b,c) => {
          console.log(a.ORGNAME, b.ORGNAME)
          if (a.FLONGNUMBER == '01' || b.FLONGNUMBER == '01') {
            if (b.FLONGNUMBER == '01') {
              return true
            }  else {
              return true
            }
          } else {
            return b.RN > a.RN
          }
        }
      },{
        field: '月均存栏',
        width: 160,
        title: '月均存栏',
        formatter: ({cellValue}) => {
          return this.fixedNumber(cellValue)
        }
      },{
        field: '当期死亡',
        width: 160,
        title: '当期死亡头数'
      },{
        field: '当期死亡率',
        width: 160,
        title: '当期死亡率', // formatRate
        formatter: ({cellValue}) => {
          return this.formatRate(cellValue)
        }
      },{
        field: '进苗-70日龄',
        width: 160,
        title: '进苗-70日龄',
        formatter: ({cellValue}) => {
          return this.fixedNumber(cellValue)
        }
      },{
        field: '71-100日龄',
        width: 160,
        title: '71-100日龄',
        formatter: ({cellValue}) => {
          return this.fixedNumber(cellValue)
        }
      },{
        field: '101-130日龄',
        width: 160,
        title: '101-130日龄',
        formatter: ({cellValue}) => {
          return this.fixedNumber(cellValue)
        }
      },{
        field: '131-清栏',
        width: 160,
        title: '131-清栏',
        formatter: ({cellValue}) => {
          return this.fixedNumber(cellValue)
        }
      }],
      activeName: '',
      currentLevel: 1
    }
  },
  methods: {
    getFullScreenEl () {
      return this.$refs.pageContent.$el
    },
    getAutoHeightEl () {
      return this.$refs.pageContent
    },
    computedAutoHeight() {

      this.autoHeight = Math.floor(Math.random() * 100)
    },
    getParams (item) {
      return {
        orgId: this.orgInfo.id,
        type: item.value,
        period: this.planYearMonth
      }
    },
    dataFormatter (data,params) {
      const level = params.params.type
      return data.map((item, index) => {
        if (item.FLEVEL === 5) {
          return item
        }
        if (item.FLEVEL < level) {
          item.RN = '-'
        }
        return item
      })
    },
    showChart (row,e) {
      // e.stopPropagation()
      this.chartVisible = true
      this.chartLoading = true
      request({
        url: 'BUSINESSREPORT/roma/getSWQS',
        params: {
          orgId: row.ORGID,
          period: this.planYearMonth
        }
      }).then(res => {
        this.chartLoading = false
        const arr = []
        res.data.forEach(item => {
          arr.push([item.FDATE, this.fixedNumber(item.CNUM * 100) ])
        })
        this.chartData = arr
      }).catch(error => {
        this.chartLoading = false
      })
    },
    fixedNumber (num) {
      if (num == null || num == '' || num == 0) {
        return '-'
      }
      return Math.round(num * 100) / 100
    },
    formatRate (num) {
      if (num == null || num == '' || num == 0) {
        return '-'
      }
      return (num * 100).toFixed(2) + '%'
    },
    init () {
      this.currentLevel = parseInt(this.orgInfo.type)
    }
  },
  computed: {
  	myCHartData () {
  		let lastPeriod = null;
      if (this.type == 1) {
      	//近三月
      	  lastPeriod = moment().month(moment().month() - 3).format('YYYY-MM');
      } else if (this.type == 2) {
      	//近六月
      	lastPeriod = moment().month(moment().month() - 6).format('YYYY-MM');
      } else if (this.type == 3) {
      	//近十二个月
      	lastPeriod = moment().month(moment().month() - 12).format('YYYY-MM');
      } else if (this.type == 4) {
					//label: '今年'
      	 lastPeriod = moment().month(0).format('YYYY-MM');
      }

      if (lastPeriod){
      	let tempData = this.chartData.filter(item => {
      	 		return item[0] >= lastPeriod
      	});
      	return tempData
      }else {
      	return this.chartData;
      }
    },
    panelList () {
      if (!this.currentLevel) {
        return []
      } else {
        const arr = []
        this.deepPanellist.forEach(item => {
          if (item.value > this.currentLevel) {
            arr.push(item)
          }
        })
        setTimeout(() => {
          this.activeName = arr[0].key
        }, 0)
        return arr
      }
    },
    ...mapGetters(['orgInfo','planYearMonth'])
  },

}
</script>

<style scoped lang="scss">
  .mhead-container{
    height: 150px;
    margin: 10px;
    padding: 20px 20px 10px 20px;
    background-color: #fff;
  }
  .mbody-container{
    background-color: white;
    margin: 10px;
    padding: 20px;
    height: auto;
    .floatBtnWrapper{
      position: absolute;
      right: 24px;
      top: 24px;
    }
  }
  /deep/ .el-tabs__nav-wrap::after{
    height: 1px;
  }
  /deep/ .el-tabs__nav-wrap{
    padding-left: 20px;
  }
  .column-orgName-wrapper {
    display: flex;
    align-items: center;
    padding: 0 5px;
    height: 42px;
    justify-content: space-between;
  }
  /deep/ .el-dialog__wrapper {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    overflow: auto;
    margin: 0;
    z-index:8888888888 !important;
  }

  /deep/.el-dialog__body {
    padding:0px !important;
  }

  .chbg-green2{
    background-color:#F0F9F5;
  }

</style>

<style>
  .chbg-blue2{
    background-color:#F5FAFC;
  }
  .chbg-green2{
    background-color:#F0F9F5;
  }
  .chbg-dark{
    background-color:#F8F8F9;
    border-bottom: 1px solid #EBEEF3;
  }
  .chbg-yellow {
    background-color: #FFFDF3;
  }
</style>
