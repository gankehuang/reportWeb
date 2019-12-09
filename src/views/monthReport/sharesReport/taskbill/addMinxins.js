import request from '@/utils/request'
const addMixins = {
	data() {
		return {
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
					/*  url: PREFIX+"/p-contract/select",
					  method:'post',
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
			toolbar: {
				hidden: true
			},
			tableHead: [ //表格表头设置
				{
					prop: "taskName",
					align: "center",
					label: "任务名称",
					type: 'text',
					width: 200
				},
				{
					prop: "desc",
					align: "center",
					label: "任务内容描述",
					type: 'number',
					width: 200
				},
				{
					prop: "source",
					align: "center",
					label: "任务来源",
					type: 'number',
					width: 200
				},
				{
					prop: "yqresult",
					align: "center",
					label: "要求交付结果",
					type: 'text',
					width: 200
				},
				{
					prop: "yqTarget",
					align: "center",
					label: "要求达成目标",
					type: 'text',
					width: 200
				},
				{
					prop: "publishTime",
					align: "center",
					label: "发布时间",
					type: 'date',
					width: 200
				},
				{
					prop: "plancompleteTime",
					align: "center",
					label: "计划完成时间",
					type: 'date',
					width: 200
				},
				{
					prop: "responsibilityer",
					align: "center",
					label: "责任人",
					type: 'text',
					width: 200
				}
			]
		}
	},
	methods: {
		goBack() {
			this.$router.go('-1')
		},
		handleClick(tab, event) {
			tab.name == "first" ? this.stepsShow = true : this.stepsShow = false;
		},
		queryDeptName() {

		}
	}
};
export default addMixins;