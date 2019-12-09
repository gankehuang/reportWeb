<template>
  <div>
    <div class="mbody-container" ref="pageContent">
      <el-tabs v-model="activeName">
        <el-tab-pane v-for="item in panelList" :label="item.label" :name="item.key">
        </el-tab-pane>
      </el-tabs>
      <deepGridTable v-for="item in panelList"
                     url="/BUSINESSREPORT/roma/getPZRank"
                     v-show="activeName === item.key"
                     :show="activeName === item.key"
                     :autoHeight="autoHeight"
                     :name="item.key"
                     :key="item.key"
                     :dataFormatter="dataFormatter"
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
              配种分娩率排名趋势图
            </div>
            <div style="flex: 1;display: flex;flex-direction: row;justify-content: flex-end;margin-right: 40px;" >
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
  import PageForm from '@/components/form/Form'
  import formOptionMixins from './formOptionMixins'
  import { mapGetters } from 'vuex'
  import deepGridTable from '../../components/deepGridTable'
  import moment from 'moment'
	import chart from '@/components/chart/chart1'
  import request from '@/utils/request'
  export default {
    name: 'matingDeepDetail',
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
        chartVisible: false,
        deepPanellist: [{
          label: '事业部',
          key: 'syb',
          value: 1
        }, {
          label: '片区',
          key: 'pq',
          value: 3
        }, {
          label: '分公司',
          key: 'fgs',
          value: 4
        }, {
          label: '猪场排名',
          key: 'zc',
          value: 5
        }],
        chartData: [],
        tableHead: [{
          width: 180,
          field: 'ORGNAME',
          title: '单位名称',
          className: 'bg-dark',
          slots: {
            default: ({ row, column }) => {
              return [
                <div class="column-orgName-wrapper">
                {
                  row.FLEVEL === 3 ? <el-link type="primary" onClick={(e) => this.linkFgsRank(row,e)} >{row.ORGNAME}</el-link> : <span>{ row.ORGNAME }</span>
                }
                <img style="cursor:pointer;" src={require("@/assets/pathIcon.png")} onClick={ (e) =>  this.showChart(row, e) } />
              </div>
            ]
            }
          }
        }, {
          field: 'RN',
          width: 70,
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
        }, {
          width: 80,
          field: '配种分娩率',
          title: '配种分娩率(%)',
          align: 'right',
          className: 'bg-green2',
          formatter: ({cellValue}) => {
            return this.formatRate(cellValue)
          }
        }, {
          width: 100,
          field: '分娩窝数',
          align: 'right',
          title: '分娩总窝数'
        }, {
          width: 90,
          field: '超期分娩',
          align: 'right',
          title: '超期分娩'
        }, {
          width: 90,
          field: '待分娩',
          align: 'right',
          title: '待分娩'
        }, {
          width: 80,
          field: '114天前配种总数',
          title: '114天前配种总数',
          align: 'right',
        }, {
          title: '损失头数',
          align: 'center',
          children: [
            {
              width: 60,
              field: '小计',
              title: '小计',
              className: 'bg-blue2',
              align: 'right',
            }, {
              width: 60,
              field: '流产',
              title: '流产',
              align: 'right',
            }, {
              width: 60,
              field: '空怀',
              title: '空怀',
              align: 'right',
            }, {
              width: 60,
              field: '返情',
              title: '返情',
              align: 'right',
            }, {
              width: 60,
              field: '死亡',
              title: '死亡',
              align: 'right',
            }]
        },
          {
            title: '异常损失区间',
            align: 'center',
            children: [{
              width: 80,
              field: '21天以下',
              title: '21天以下',
              align: 'right',
            }, {
              width: 80,
              field: '21-42天',
              title: '21-42天',
              align: 'right',
            }, {
              width: 80,
              field: '43-63天',
              title: '43-63天',
              align: 'right',
            }, {
              width: 80,
              field: '64-84天',
              title: '64-84天',
              align: 'right',
            }, {
              width: 80,
              field: '84天以上',
              title: '84天以上',
              align: 'right',
            }]
          }],
        activeName: '',
        chartLoading: false,
        currentLevel: 1
      }
    },
    methods: {
      initData() {
      },
      getFullScreenEl () {
        return this.$refs.pageContent.$el
      },
      getAutoHeightEl () {
        return this.$refs.pageContent
      },
      dataFormatter (data,params) {
        const level = params.params.type
        return data.map((item, index) => {
          if (item.FLEVEL < level) {
            item.RN = '-'
          }
          return item
        })
      },
      init () {
        this.currentLevel = parseInt(this.orgInfo.type)
        this.initData()
      },
      computedAutoHeight() {
        console.log('computed Height....mating')
        this.autoHeight = Math.floor(Math.random() * 100)
      },
      elSelect(e){
      	e.preventDefault()
      	debugger
      },
      linkFgsRank(row,e) {
        e.stopPropagation()
        this.$router.push({
          name: 'matingDeepFgs',
          params: {
            orgId: row.ORGID,
            period: this.planYearMonth,
            level: row.FLEVEL + 2,
            orgName: row.ORGNAME
          }
        })
      },
      showChart (row,e) {
        e.stopPropagation()
        this.chartVisible = true
        this.chartLoading = true
        request({
          url: 'BUSINESSREPORT/roma/getPZQS',
          params: {
            orgId: row.ORGID,
            period: this.planYearMonth
          }
        }).then(res => {
          this.chartLoading = false
          const arr = []
          res.data.forEach(item => {
            arr.push([item.FDATE, this.fixedNumber(item.CNUM * 100)])
          })
          this.chartData = arr
          // this.chartData = res.data.reduce((prev,item) => {
          //   const arr = [item.FDATE, this.fixedNumber(item.CNUM)]
          //   prev.push(arr)
          // },[])
        }).catch(error => {
          this.chartLoading = false
        })
      },
      getParams(item) {
        return {
          orgId: this.orgInfo.id,
          type: item.value,
          period: this.planYearMonth
        }
      },
      fixedNumber(num) {
        if (num == null || num == '' || num == 0) {
          return '-'
        }
        return Math.round(num * 100) / 100
      },
      formatRate(num) {
        if (num == null || num == '' || num == 0) {
          return '-'
        }
        return (num * 100).toFixed(2) + '%'
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
      panelList() {
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
            console.log(arr[0].key)
            this.activeName = arr[0].key
          }, 0)
          return arr
        }
      },
      ...mapGetters(['orgInfo', 'planYearMonth'])
    }
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
  }

  /deep/.el-dialog__body {
	  padding:0px !important;
	}
</style>

<style>
  .bg-blue2{
    background-color:#F5FAFC;
  }
  .bg-green2{
    background-color:#F0F9F5;
  }
  .bg-dark{
    background-color:#F8F8F9;
    border-bottom: 1px solid #EBEEF3;
  }
</style>
