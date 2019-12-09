import moment from 'moment'
var _self;
const common={
  data(){
    return{
      loading: false,
      isInit:false,//是否初始化了
      searchForm: {
					orgId: '',
					period: ''
			},
			fullscreen:false,
      mainTableData:[],
      childTableHeight: 300,
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
            prop: "submitDate",
             dateFormat:true,
            span: 5
          },
          {
            label: "审批人",
            prop: "approve",
            span: 4.8
          },
          {
            label: "审批日期",
            prop: "approveDate",
             dateFormat:true,
            span: 5
          },
          {
            label: "状态",
            prop: "status",
            span: 4.4,
            fontStyle: {color: '#2BB687'},
            valueFormat: true
          }
        ]
      },
    }
  },
  watch:{
    	orgInfo:{
    		handler (val){
	    		if(this.orgInfo){
	    				if(this.isInit){
	    						this.searchForm.orgId = this.orgInfo.id;
					    		this.$nextTick(() => {
							      	_self.find()
							    });
	    				}
			    	
				  }
	    	},
        immediate: true,
        deep: true
    	},
    	planYearMonth:{
    		handler (val){
	    		if(this.planYearMonth){
	    			if(this.isInit){
			    		this.searchForm.period = val;
			    		this.$nextTick(() => {
					      	_self.find()
					    });
	    			}
				  }
	    	},
        immediate: true,
        deep: true
    	}

  },
  created(){
    	_self = this;
    	_self.isInit = true
			this.searchForm.period=this.planYearMonth;//设置默认一个
			if(this.orgInfo){
    		this.searchForm.orgId = this.orgInfo.id;
    
	      this.$nextTick(() => {
	      	_self.find()
	      });
    	}
    
  },
  mounted(){
  	let self = this;
    window.onresize = () => {  // 动态监听窗口大小
      return (() => {
        this.computedDOMHeight()
      })()
    }
    this.$nextTick(() => {  // 根据当前屏幕高度计算子表内容区高度
      this.computedDOMHeight()
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


  },
  methods:{
  	monthText (offset = 0) {
        return moment(this.planYearMonth, 'YYYY-MM').add(offset, 'months').format('YYYY年MM月')
    },
  	find(){
  
  	},
    formatYearMonth(data){
      if(data){
        return data.slice(0,4)+'-'+data.slice(4)
      }
    },
    computedDOMHeight() {
    	let curClientHeight = document.body.clientHeight  // 当前屏幕高度
      let pageContentHeight = curClientHeight - this.$refs.pageContent.getBoundingClientRect().top
      this.$refs.pageContent.style.height = (pageContentHeight - 10) + 'px'
      let contentHeadHeight = document.querySelectorAll('#toolbar')[0].offsetHeight
      this.childTableHeight = pageContentHeight - contentHeadHeight -30
    	
    },
    
    handleFullscreen() {
      let fullarea = this.$refs.pageContent

      if (document.fullscreen) {       // 退出全屏

        if (document.exitFullscreen) {

          document.exitFullscreen()

        } else if (document.webkitCancelFullScreen) {

          document.webkitCancelFullScreen()

        } else if (document.mozCancelFullScreen) {

          document.mozCancelFullScreen()

        } else if (document.msExitFullscreen) {

          document.msExitFullscreen()

        }
      } else {        // 进入全屏

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

      this.fullscreen = !this.fullscreen
			this.computedDOMHeight();
    },
  }
}
export default  common;
