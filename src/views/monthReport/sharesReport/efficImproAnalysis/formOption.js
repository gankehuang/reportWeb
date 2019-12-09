export default {
  data () {
    return {
      autoHeight: '500px',
      formOptions: {
        labelWidth: "150px",
        options: [
          {
            label: "提交人",
            prop: "submiterName",
            span: 4.8
          },
          {
            label: "提交日期",
            prop: "createTime",
            span: 4.8,
            dateFormat: true
          },
          {
            label: "审批人",
            prop: "approveName",
            span: 4.8
          },
          {
            label: "审批日期",
            prop: "approveDate",
            span: 4.8,
            dateFormat: true
          },
          {
            label: "状态",
            prop: "status",
            span: 4.8,
            fontStyle: {color: '#2BB687'},
            valueFormat: true
          }
        ]
      },
      formData: {},
      fullscreen: false
    }
  },
  methods: {
    init () {
    },
    getAutoHeightEl () { // 返回自动计算高度的dom元素
      return this.$refs.xTable.$el
    },
    getFullScreenEl () { // 返回全屏的dom元素
      return this.$refs.pageContent.$el
    },
    computedAutoHeight() {

      setTimeout(() => {
        this.autoHeight = document.body.clientHeight -
          this.getAutoHeightEl().getBoundingClientRect().top - 20 + 'px'
      },200)
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
        // this.autoHeight = document.body.clientHeight - 270 + 'px'
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
        // this.autoHeight = 750 + 'px'
      }
    },
    handleFullscreen() {  // 切换全屏
      this._toggleFullscreen(this.fullscreen, this.$refs.pageContent)
      this.fullscreen = !this.fullscreen
      this.$nextTick(() => {
        this.computedAutoHeight();
      })
    },
  },
  beforeDestroy () {
    window.onresize = null
  },
  mounted () {
    this.init()
    let self = this;
    window.onresize = () => {
      this.computedAutoHeight()
    }
    this.$nextTick(() => {  // 根据当前屏幕高度计算子表内容区高度
      this.computedAutoHeight()
    })
    // 错误事件为：fullscreenerror ， 同样注意前缀
    document.addEventListener('fullscreenchange' , function() {
      self.fullscreen = document.fullscreen
    })
    document.addEventListener('webkitfullscreenchange' , function() {
      self.fullscreen = document.fullscreen
    })
    document.addEventListener('mozfullscreenchange' , function() {
      self.fullscreen = document.fullscreen
    })
    document.addEventListener('MSFullscreenChange' , function() {
      self.fullscreen = document.fullscreen
    })
  }
}
