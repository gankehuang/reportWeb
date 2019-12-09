const commMixin = {
  data() {
    return {
      fullscreenLoading: false, // 全屏loading
      loading: false, // 子表loading
      childTableHeight: 300,  // 子表高度
      fullscreen: false, // 切换全屏
      fparentid: '',  // 父表ID
      curStatus: '', // 当前页面状态
      isCanUnAudit: '', // 是否可以审核
      parentData: [], // 主表数据
      childTableData: [], // 子表数据
      searchForm: { // 查询参数
        orgId: '',
        organization: '',
        businessMonth: ''
      },
      childTablePage: { // 分页配置
        currentPage: 1,
        pageSize: 10,
        totalResult: 0
      },
      formData: {},  // 主表数据
      formOptions: {  // 主表配置
        labelWidth: '130px',
        options: [
          {
            label: '提交人',
            prop: 'fcreatorname',
            span: 4.8
          },
          {
            label: '提交日期',
            prop: 'fbizdate',
            span: 4.8
          },
          {
            label: '审批人',
            prop: 'fauditorname',
            span: 4.8
          },
          {
            label: '审批日期',
            prop: 'faudittime',
            span: 4.8
          },
          {
            label: '状态',
            prop: 'status',
            span: 4.8,
            fontStyle: {color: '#2BB687'},
            valueFormat: true
          }
        ]
      }
    }
  },
  created() {

  },
  mounted() {
    window.onresize = () => {  // 动态监听窗口大小
      return (() => {
        this.computedDOMHeight()
      })()
    }

    this.$nextTick(() => {  // 根据当前屏幕高度计算子表内容区高度
      this.computedDOMHeight()
      this._onFullscreenchange() // 监听全屏
    })
  },
  destroyed() {
    window.onresize = null
  },
  watch: {
    orgInfo(newVal, oldVal) { // 动态监听切换组织
      this.searchForm.orgId = newVal.id
      this.searchForm.organization = newVal.name
      this.getPageList()
    },
    planYearMonth(newVal, oldVal) {  // 动态监听计划期间
      this.searchForm.businessMonth = newVal
      this.getPageList()
    }
  },
  methods: {
    computedDOMHeight() { // 计算DOM高度
      let curClientHeight = document.body.clientHeight  // 当前屏幕高度
      let pageContentHeight = curClientHeight - this.$refs.pageContent.getBoundingClientRect().top  // 子表区距离屏幕顶部的高度
      this.$refs.pageContent.style.height = (pageContentHeight - 10) + 'px'

      let contentHeadHeight = document.querySelectorAll('.content-head')[0].offsetHeight
      let pagerHeight = document.querySelectorAll('.vxe-pager')[0].offsetHeight

      this.childTableHeight = pageContentHeight - contentHeadHeight - pagerHeight - 45
    },
    initData() {  // 初始化数据
      if (this.orgInfo && this.orgInfo.id) { //获取默认orgId
        this.searchForm.orgId = this.orgInfo.id
        this.searchForm.organization = this.orgInfo.name
      } else {
        this.$message.warning('请选择组织!')
      }

      if (this.planYearMonth) {
        this.searchForm.businessMonth = this.planYearMonth
      } else {
        this.$message.warning('请选择计划期间!')
      }
    },
    handlePageChange({currentPage, pageSize}) { // 监听分页
      this.childTablePage.currentPage = currentPage
      this.childTablePage.pageSize = pageSize
      this.getChildList()
    },
    formatDate(value, format) {  // 格式化时间
      return this.$utils.toDateString(value, format)
    },
    exportChildData() {  // 导出
      this.$refs.xTable.exportData({type: 'xml'})
    },
    enumStatus(type) {  // 枚举状态
      let enumTypeText = ''
      if (type == 0) {
        enumTypeText = '保存'
      } else if (type == 1) {
        enumTypeText = '提交'
      } else if (type == 2) {
        enumTypeText = '审核'
      }
      return enumTypeText
    },
    enumBoolean(type) { // 枚举是否
      let enumTypeText = ''
      if (type == 0) {
        enumTypeText = '否'
      } else if (type == 1) {
        enumTypeText = '是'
      }
      return enumTypeText
    },
    _toggleFullscreen(isFullscreen, fullarea) {
      if (isFullscreen) { // 退出全屏
        if (document.exitFullscreen) {
          document.exitFullscreen()
        } else if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen()
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen()
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen()
        }
      } else {  // 进入全屏
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
    },
    handleFullscreen() {  // 切换全屏
      this._toggleFullscreen(this.fullscreen, this.$refs.pageContent)
    },
    _onFullscreenchange () { // 监听全屏事件
      document.addEventListener("fullscreenchange", () => {
        this.fullscreen = this._isFullscreenEnable()
      }, false)


      document.addEventListener("mozfullscreenchange", () => {
        this.fullscreen = this._isFullscreenEnable()
      }, false)


      document.addEventListener("webkitfullscreenchange", () => {
        this.fullscreen = this._isFullscreenEnable()
      }, false)


      document.addEventListener("msfullscreenchange", () => {
        this.fullscreen = this._isFullscreenEnable()
      }, false)
    },
    _isFullscreenEnable() { // 判断当前是否在全屏状态
      return document.fullscreenElement ||
        document.msFullscreenElement ||
        document.mozFullScreenElement ||
        document.webkitFullscreenElement ||
        document.fullscreen ||  false;
    }
  }
}
export default commMixin
