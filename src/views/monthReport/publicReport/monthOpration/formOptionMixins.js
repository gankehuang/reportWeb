export default {
  data () {
    return {
      formData: {},
      fullscreen: false,
      autoHeight: '500px',
      formOptions: {
        labelWidth: "150px",
        options: [
          {
            label: "提交人",
            prop: "submitor",
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
            prop: "approver",
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
      },{
        label: '服务部',
        value: 6
      }], // 7 分场
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
        }],
        6: [{
          label: '服务部',
          value: 'FWB'
        }]
      },
      levelMap: {
        1: '事业部',
        2: '大区',
        3: '片区',
        4: '分公司',
        5: '猪场',
        6: '服务部',
        7: '分场'
      }
    }
  },
  methods: {
    init () {
    },
    back () {
      this.$router.back(-1)
    },
    getAutoHeightEl () { // 返回自动计算高度的dom元素
      return this.$refs.xTable.$el
    },
    getFullScreenEl () { // 返回全屏的dom元素
      return this.$refs.pageContent.$el
    },
    computedAutoHeight() {
      this.autoHeight = document.body.clientHeight -
        this.getAutoHeightEl().getBoundingClientRect().top - 26 + 'px'
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

    }
    // handleFullscreen () {
    //   let fullarea = this.$refs.pageContent
    //   if (document.fullscreen) {       // 退出全屏
    //     if (document.exitFullscreen) {
    //       document.exitFullscreen()
    //     } else if (document.webkitCancelFullScreen) {
    //       document.webkitCancelFullScreen()
    //     } else if (document.mozCancelFullScreen) {
    //       document.mozCancelFullScreen()
    //     } else if (document.msExitFullscreen) {
    //       document.msExitFullscreen()
    //     }
    //   } else {        // 进入全屏
    //     if (fullarea.requestFullscreen) {
    //       fullarea.requestFullscreen()
    //     } else if (fullarea.webkitRequestFullScreen) {
    //       fullarea.webkitRequestFullScreen()
    //     } else if (fullarea.mozRequestFullScreen) {
    //       fullarea.mozRequestFullScreen()
    //     } else if (fullarea.msRequestFullscreen) {
    //       // IE11
    //       fullarea.msRequestFullscreen()
    //     }
    //   }
    //   this.fullscreen = !this.fullscreen
    //   // this.computedAutoHeight();
    // }
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
