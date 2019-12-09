import moment from 'moment'
const common={
  data(){
    return{
      loading: false,
      searchForm:{
        orgId:'',
        period:''
      },
      orgName:'',
      isCanUnAudit:'',
      tableData: [],
      projectId:'',
      mainTableData:[],
      tablePage: {
        currentPage: 1,
        pageSize: 10,
        totalResult: 0
      },
      fullscreen: false, // 切换全屏
      status:0,
      statusText:['保存','提交','提交','已审核'],
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
            span: 4.8,
            dateFormat:true
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
            dateFormat:true
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
      childTableHeight: 300,
      formData: {}
    }
  },
  watch:{
    orgInfo:{
      handler:function (val,oldVal) {
        this.$nextTick(()=>{
          this.searchForm.orgId=val.id;
          this.orgName=val.name;
          this.getProjectList(this.searchForm);
        })
      },
      deep:true
    },
    planYearMonth:function (val,oldVal) {
      this.$nextTick(()=>{
        this.searchForm.period=val;
        this.getProjectList(this.searchForm);
      })
    },
  },
  created(){
    // const startDate = moment().month(moment().month() - 1).startOf('month').valueOf()
    // this.searchForm.period=moment(parseInt(startDate)).format('YYYY-MM');//设置默认一个月的时间
    // this.searchForm.period=moment(new Date).format('YYYY-MM');
    if(this.$route.query.orgId){
      this.searchForm=this.$route.query;
      this.orgName=this.orgInfo.name;
      this.getProjectList(this.searchForm);
    }else{
      if(this.orgInfo&&this.orgInfo.id){//获取默认orgId
        this.searchForm.orgId=this.orgInfo.id;
        this.orgName=this.orgInfo.name;
        this.searchForm.period=this.planYearMonth
        this.getProjectList(this.searchForm);
      }else {
        this.$message.warning('请选择组织')
      }
    }
  },
  mounted(){
    window.onresize = () => {  // 动态监听窗口大小
      return (() => {
        this.computedDOMHeight()
      })()
    }

    this.$nextTick(() => {  // 根据当前屏幕高度计算子表内容区高度
      this.computedDOMHeight()
      this._onFullscreenchange() // 监听全屏
    });
  },
  beforeDestroy () {
    window.onresize = null
    window.removeEventListener('resize', this.computedHeight)
  },
  methods:{
    formatMonth(num){
      if(Number(this.planYearMonth.slice(-2)) + num>12){
        return Number(this.planYearMonth.slice(-2))+num-12
      }else{
        return Number(this.planYearMonth.slice(-2))+num
      }
    },
    formatTime({ cellValue, row, column }) {
      if(cellValue) {
        return this.$utils.toDateString(cellValue, 'yyyy-MM-dd HH:ss:mm')
      } else {
        return ''
      }
    },
    computedDOMHeight() {
      let curClientHeight = document.body.clientHeight  // 当前屏幕高度
      let pageContentHeight = curClientHeight - this.$refs.pageContent.getBoundingClientRect().top
      this.$refs.pageContent.style.height = (pageContentHeight - 10) + 'px'

      let contentHeadHeight = document.querySelectorAll('.content-head')[0].offsetHeight
      // let pagerHeight = document.querySelectorAll('.vxe-pager')[0].offsetHeight

      this.childTableHeight = pageContentHeight - contentHeadHeight  - 40
    },
    _toggleFullscreen() {
      let fullarea = this.$refs.pageContent
      console.log(this.fullscreen);
      if (this.fullscreen) {       // 退出全屏

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
    },
    formatterStatus({ cellValue }) {
      let item = this.formStates.find(item => item.value === cellValue)
      return item ? item.label : '新增'
    },
    auditData(){//审核
      this.$confirm('此操作将进行审核操作, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        auditId(this.projectId).then(res=>{
          if(res.status==200){
            this.$message.success('审核成功！');
            this.getProjectList(this.searchForm);
          }
        }).catch(err=>{
          console.log(err);
        })
      }).catch(() => {

      });
    },
    reverseAuditData(){//反审核操作
      this.$confirm('此操作将进行反审操作, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        reverseAuditId(this.projectId).then(res=>{
          if(res.status==200){
            this.$message.success('反审核成功！');
            this.getProjectList(this.searchForm);
          }
        }).catch(err=>{
          console.log(err);
        })
      }).catch(() => {

      });
    },
    dateChange(val){
      this.getProjectList(this.searchForm);
    },
    getOrgId(val){
      this.searchForm.orgId=val;
    },
    timeFormat (data) {
      if (data) {
        return moment(parseInt(data)).format('YYYY-MM-DD')
      }
    },
    dataTableSearch(query){
      if(this.orgInfo&&this.orgInfo.id){
        this.getProjectList(query);
      }else {
        this.$message.warning('请选择组织！')
      }

    },
    handlePageChange({ currentPage, pageSize }){
      this.tablePage.currentPage = currentPage
      this.tablePage.pageSize = pageSize
    },
    getProjectDetail(){
      getById(this.projectId).then(res=>{
        this.tableData=res.data;
      }).catch(err=>{

      })
    }
  }
}
export default  common;
