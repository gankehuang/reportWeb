import moment from 'moment'
import axios from 'axios'
import request from '@/utils/request'
const common={
  data(){
    return{
      loading: false,
      searchForm:{
        orgId:'',
        yearMonth:''
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
      childTableHeight: 300,
      status:0,
      statusText:['保存','审核中','已审核'],
      formOptions: {
        labelWidth: "150px",
        options: [
          {
            label: "提交人",
            prop: "fcreatorname",
            span: 4.8
          },
          {
            label: "提交日期",
            prop: "fcreatetime",
            span: 4.8,
            dateFormat:true
          },
          {
            label: "审批人",
            prop: "flastupdateusername",
            span: 4.8
          },
          {
            label: "审批日期",
            prop: "flastupdatetime",
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
      formData: {},
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
        this.searchForm.yearMonth=val;
        this.getProjectList(this.searchForm);
      })
    },
  },
  created(){
    // this.searchForm.yearMonth=moment(new Date()).format('YYYY-MM');
    if(this.$route.query.orgId){
      this.searchForm=this.$route.query;
      this.orgName=this.orgInfo.name;
      this.getProjectList(this.searchForm);
    }else{
      if(this.orgInfo&&this.orgInfo.id){//获取默认orgId
        this.searchForm.orgId=this.orgInfo.id;
        this.orgName=this.orgInfo.name;
        this.searchForm.yearMonth=this.planYearMonth;
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
    })
  },
  methods:{
    formatYearMonth(data){
      if(data){
        return data.slice(0,4)+'-'+data.slice(4)
      }
    },
    computedDOMHeight() {
      let curClientHeight = document.body.clientHeight  // 当前屏幕高度
      let pageContentHeight = curClientHeight - this.$refs.pageContent.getBoundingClientRect().top
      this.$refs.pageContent.style.height = (pageContentHeight - 10) + 'px'

      let contentHeadHeight = document.querySelectorAll('.content-head')[0].offsetHeight

     if( document.querySelectorAll('.vxe-pager')[0]){
       let pagerHeight = document.querySelectorAll('.vxe-pager')[0].offsetHeight
       this.childTableHeight = pageContentHeight - contentHeadHeight - pagerHeight - 20
     }else {
       this.childTableHeight = pageContentHeight - contentHeadHeight  - 40
     }

    },
    formatMonth(num){
      if(Number(this.searchForm.yearMonth.slice(-2)) + num>12){
        return Number(this.searchForm.yearMonth.slice(-2))+num-12
      }else{
        return Number(this.searchForm.yearMonth.slice(-2))+num
      }
    },
    _toggleFullscreen() {
      let fullarea = this.$refs.pageContent

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
    exportChildData(url,name){
      // this.$refs.xTable.exportData({ type: 'xml' })
        if(this.projectId){
          axios({
          url: `${process.env.BASE_API}/BUSINESSREPORT/${url}/${this.projectId}`,
          method: 'get',
          responseType: 'blob', // important
          timeout: 1000 * 30,
            headers: {
              Authentication: this.token,
              filename:'utf-8'
            }
        }).then(response => {
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', name+'.xls');
          document.body.appendChild(link);
          link.click();

        }).catch(function(reason) {
          console.log('catch:', reason);
        });
      }else{
          this.$message.warning('暂无数据！')
        }
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
      this.getProjectList(this.searchForm)
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
