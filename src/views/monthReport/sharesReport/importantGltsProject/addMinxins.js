import request from '@/utils/request'
const PREFIX = '/BUILD'
const addMixins={
  data(){
    return{
      loading: false,
			form: {},
			formOptions: {
				labelWidth: "150px",
				// 校验部分
				rules: {
					org: [{
						required: true,
						message: '组织不能为空',
						trigger: ['blur', 'change']
					}],
					qj: [{
						required: true,
						message: '业务期间不能为空',
						trigger: 'change'
					}],
					busyDate: [{
						required: true,
						message: '填报日期不能为空',
						trigger: 'change'
					}]
				},
				options: [{
					label: "组织",
					prop: "org",
					type: "selectData",
					placeholder: "请选择",
					value: "",
					span: 6,
					url: PREFIX + '/dict/listByFlag/contract_type'
					/*  method:'post',
					  params:{
					    pageSize:20,
					    pageNum:1
					  },
					  props: {
					    label: "name",
					    type: "selectData",
					    value: "id"
					  }*/
				}, {
					label: "业务期间",
					prop: "qj",
					type: 'month',
					span: 6,
				}, {
					label: "填报日期",
					prop: "busyDate",
					type: 'date',
					span: 6,
				}, {
					label: "提交人",
					prop: "submiter",
					span: 6,
				}, {
					label: "提交日期",
					prop: "submitDate",
					span: 6,
				}, {
					label: "审批人",
					prop: "approver",
					span: 6,
				}, {
					label: "审批日期",
					prop: "approvalDate",
					span: 6,
				}, {
					label: "状态",
					prop: "status",
					span: 6
				}]
			},
      toolbar:{
        hidden:true
      },
      tableHead: [ //表格表头设置
        {
          prop: "projectName",
          align: "center",
          label: "项目名称",
          type:'text',
           width:200
        },
        {
          prop: "content",
          align: "center",
          label: "项目主要内容",
          type:'number',
           width:200
        },
        {
          prop: "target",
          align: "center",
          label: "达成目标",
          type:'number',
           width:200
        },
        {
          prop: "dbqy",
          align: "center",
          label: "对标企业",
          type:'text',
           width:200
        },
        {
          prop: "startTime",
          align: "center",
          label: "项目启动时间",
          type:'date',
          width:200
        },
        {
          prop: "completeTime",
          align: "center",
          label: "目标完成时间",
          type:'date',
          width:200
        },
        {
          prop: "lastMonthNodeTarget",
          align: "center",
          label: "上月节点目标",
          type:'text',
           width:200
        },
        {
          prop: "lastMonthComplteInfo",
          align: "center",
          label: "上月达成情况",
          type:'text',
           width:200
        },
        {
          prop: "differCause",
          align: "center",
          label: "差距与原因分析",
          type:'text',
           width:200
        },
        {
          prop: "ydMeature",
          align: "center",
          label: "应对策略及措施",
          type:'text',
           width:200
        },
        {
          prop: "nextMonthNodeTarget",
          align: "center",
          label: "下月节点目标",
          type:'text',
           width:200
        },
        {
          prop: "teamer",
          align: "center",
          label: "组长",
          type:'text',
           width:200
        },
        {
          prop: "member",
          align: "center",
          label: "成员",
          type:'text',
           width:200
        },
        {
          prop: "upper",
          align: "center",
          label: "直接上级",
          type:'text',
           width:200
        }
      ]
    }
  },
  methods:{
    goBack(){
      this.$router.go('-1')
    },
    handleClick(tab, event) {
      tab.name=="first"?this.stepsShow=true:this.stepsShow=false;
    },
    queryDeptName(){

    }
  }
};
export  default  addMixins;
