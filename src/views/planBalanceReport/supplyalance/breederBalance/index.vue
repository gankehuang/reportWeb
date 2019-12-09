<template>
  <div class="swine-warp">
    <div ref="pageContent">
      <formTitle title="月度种猪平衡表">
        <div slot="context">
          <div>
            <vxe-table
              border
              :footer-method="footerMethod"
              resizable
              show-footer
              highlight-hover-row
              ref="xTable"
              :data="tableData"
              :height="childTableHeight">
              <vxe-table-column width="60" type="index" title="序号"></vxe-table-column>
              <vxe-table-column
                v-for="(item, index) in columnsHeads"
                :key="index"
                :title="item.title"
                :field="item.field"
                :width="item.width"
                :edit-render="item.editRender"
                :align="item.align">
                <template v-slot="{ row }">{{ row[item.field] ? row[item.field] : '-' }}</template>
                <vxe-table-column
                  v-for="i in item.children"
                  :key="i.filed"
                  :title="i.title"
                  :field="i.field"
                  :width="i.width"
                  :edit-render="i.editRender"
                  :align="i.align">
                  <template v-slot="{ row }">{{ row[i.field] ? row[i.field] : '-' }}</template>
                </vxe-table-column>
              </vxe-table-column>
            </vxe-table>
          </div>
        </div>
        <div slot="title-suffix" class="content-head">
          <el-button @click="exportDataEvent" class="export-btn" icon="el-icon-upload2" size="small">导出
          </el-button>
          <el-button size="small" icon="el-icon-rank" @click="handleFullscreen">{{fullscreen?'退出全屏':'全屏'}}</el-button>
        </div>
      </formTitle>
    </div>
  </div>
</template>
<script>
  import formTitle from '@/components/formTitle/formTitle'
  import {getPigs} from '@/api/breederBalance/index'
  import {mapGetters} from 'vuex'
  import {exportReport} from '@/utils/export'

  export default {
    name: 'breederBalance',
    components: {
      formTitle
    },
    data() {
      return {
        loading: false,
        orgLongNum: '',
        childTableHeight: 300,
        fullscreen: false,
        form: {
          typeQuery: '',
          orgIdQuery: '',
          orgName: '',
          orgLongNumQuery: '',
          timeDataQuery: new Date()
        },
        columnsHeads: [
          {
            title: '猪场名称',
            field: 'pigFarmName',
            width: 130
          },
          {
            title: '性别',
            field: 'pigSex',
            // width: 60
          },
          {
            title: '品种',
            field: 'breed',
            // width: 70
          },
          {
            title: '平衡',
            field: 'balance',
            // width: 60,
            align: 'right'
          },
          {
            title: '种猪存栏结构',
            children: [
              {
                title: '50日龄以下',
                field: 'pigStruct50',
                // width: 95,
                align: 'right'
              },
              {
                title: '50-80日龄',
                field: 'pigStruct5080',
                // width: 95,
                align: 'right'
              },
              {
                title: '80-110日龄',
                field: 'pigStruct80110',
                // width: 95,
                align: 'right'
              },
              {
                title: '110日龄以上',
                field: 'pigStruct110',
                // width: 100,
                align: 'right'
              }
            ]
          },
          {
            title: '计划自留',
            field: 'planRetention',
            // width: 80,
            align: 'right'
          },
          {
            title: '引种计划',
            children: [
              {
                title: '单位名称',
                field: 'breedPlanUnitName',
                width: 130
              },
              {
                title: '数量',
                field: 'breedPlanAmount',
                // width: 80,
                align: 'right'
              },
              {
                title: '日龄',
                field: 'breedPlanDay',
                // width: 80,
                align: 'right'
              }
            ]
          }
        ],
        props: {
          label: 'name',
          value: 'longNumber'
        },
        tableData: []
      }
    },
    created() {
      this.initData()
      this.getList()
    },
    computed: {
      ...mapGetters(['orgInfo', 'planYearMonth'])
    },
    mounted() {
      window.onresize = () => {
        // 动态监听窗口大小
        this.fullscreen = this._isFullscreenEnable()
        return (() => {
          this.computedDOMHeight()
        })()
      }

      this.$nextTick(() => {
        // 根据当前屏幕高度计算子表内容区高度
        this.computedDOMHeight()
      })
    },
    watch: {
      orgInfo(newVal, oldVal) {
        // 动态监听切换组织
        console.log(newVal)
        this.form.orgIdQuery = newVal.id
        this.form.orgName = newVal.name
        this.form.orgLongNumQuery = newVal.longNumber
        this.getList()
      },
      planYearMonth(newVal, oldVal) {
        // 动态监听计划期间
        this.form.timeDataQuery = new Date(newVal)
        this.getList()
      }
    },
    methods: {
      computedDOMHeight() {
        let curClientHeight = document.body.clientHeight  // 当前屏幕高度
        let pageContentHeight = curClientHeight - this.$refs.pageContent.getBoundingClientRect().top
        this.$refs.pageContent.style.height = (pageContentHeight - 40) + 'px'
        let contentHeadHeight = document.querySelectorAll('.content-head')[0].offsetHeight
        this.childTableHeight = pageContentHeight - contentHeadHeight - 65
      },
      getList() {
        this.loading = true
        getPigs(this.form)
          .then(res => {
            res.data.map(item => {
              if (item.pigSex === '1') {
                item.pigSex = '母'
              } else {
                item.pigSex = '公'
              }
            })
            this.tableData = res.data
            this.loading = false
          })
          .catch(() => {
            this.loading = false
          })
      },
      initData() {
        if (this.orgInfo && this.orgInfo.id) {
          //获取默认orgId
          this.form.timeDataQuery = new Date(this.planYearMonth)
          this.form.orgIdQuery = this.orgInfo.id
          this.form.typeQuery = this.orgInfo.type
          this.form.orgName = this.orgInfo.name
          this.form.orgLongNumQuery = this.orgInfo.longNumber
        } else {
          this.$message.warning('请选择组织!')
        }
      },
      footerMethod({columns, data}) {
        return [
          columns.map((column, columnIndex) => {
            if (columnIndex === 0) {
              return '合计';
            }
            if (['balance','pigStruct50',
              'pigStruct5080','pigStruct80110',
              'pigStruct110','breedPlanAmount','breedPlanDay'].includes(column.property)) {
              let result = this.$utils.sum(data, column.property);
              if (result) {
                return parseInt(result)
              } else {
                return 0;
              }

            }
            return '-'
          }),
        ]
      },
      formatDate(value, format) {
        return this.$utils.toDateString(value, format)
      },
      handleChangeEvent(val, data) {
        this.form.typeQuery = parseInt(data.type)
        this.form.orgIdQuery = data.id
        this.form.orgName = data.name
        this.form.orgLongNumQuery = data.longNumber
      },
      handleFullscreen() {
        let fullarea = this.$refs.pageContent
        if (this.fullscreen) {
          // 退出全屏
          if (document.exitFullscreen) {
            document.exitFullscreen()
          } else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen()
          } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen()
          } else if (document.msExitFullscreen) {
            document.msExitFullscreen()
          }
        } else {
          // 进入全屏
          if (fullarea.requestFullscreen) {
            fullarea.requestFullscreen()
          } else if (fullarea.webkitRequestFullScreen) {
            fullarea.webkitRequestFullScreen()
          } else if (fullarea.mozRequestFullScreen) {
            fullarea.mozRequestFullScreen()
          } else if (fullarea.msRequestFullscreen) {
            // IE11
            fullarea.msRequestFullscreen()
          }
        }
        // this.fullscreen = !this.fullscreen
      },
      _isFullscreenEnable() {
        return document.fullscreen || document.isFullScreen || document.mozIsFullScreen || document.webkitIsFullScreen
      },
      exportDataEvent() {  // 导出
        let data = {
          method: 'post',
          url: `BreedPigBalanceController/exportExcel`,
          fileName: '月度种猪平衡表',
          data: this.form
        };
        exportReport(data);
      },
    }
  }
</script>
<style lang="scss" scoped>
  .swine-warp {
    .export-btn {
      border: 1px solid rgba(25, 137, 250, 1);
      color: rgba(0, 136, 255, 1);
    }
    
    /deep/ .content-warp {
      padding: 0;
    }
  }
</style>
