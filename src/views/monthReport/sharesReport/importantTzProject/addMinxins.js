import request from '@/utils/request'
const PREFIX = '/BUILD'
const addMixins = {
	data() {
		return {
			loading: false,
			form: {},
			formOptions: {
				labelWidth: "150px",
				// 校验部分
				rules: {
					orgId: [{
						required: true,
						message: '组织不能为空',
						trigger: ['blur', 'change']
					}],
					period: [{
						required: true,
						message: '业务期间不能为空',
						trigger: 'change'
					}]
				},
				options: [{
					label: "组织",
					prop: "orgId",
					type: "selectData",
					placeholder: "请选择",
					value: "",
					span: 6,
					searchKey: "name",
					url: PREFIX+"/dict/listCompany",
		            props: {
		              label: "NAME",
		              value: "ID"
		            }
				}, {
					label: "业务期间",
					prop: "period",
					type: 'month',
					span: 6,
					valueFormat:'yyyy-DD'
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
					prop: "approve",
					span: 6,
				}, {
					label: "审批日期",
					prop: "approveDate",
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
					prop: "projectName",
					align: "center",
					label: "项目名称",
					type: 'text',
					width: 200
				},
				{
					prop: "projectContent",
					align: "center",
					label: "项目主要内容",
					type: 'number',
					width: 200
				},
				{
					prop: "projectScale",
					align: "center",
					label: "项目规模",
					type: 'number',
					width: 200
				},
				{
					prop: "expectResults",
					align: "center",
					label: "预期交付结果",
					type: 'text',
					width: 200
				},
				{
					prop: "expectGoal",
					align: "center",
					label: "预期达成目标",
					type: 'text',
					width: 200
				},
				{
					prop: "projectStartTime",
					align: "center",
					label: "项目启动时间",
					type: 'date',
					width: 200
				},
				{
					prop: "goalFinishTime",
					align: "center",
					label: "目标完成时间",
					type: 'date',
					width: 200
				},
				{
					prop: "lastMonthGoal",
					align: "center",
					label: "上月节点目标",
					type: 'text',
					width: 200
				},
				{
					prop: "lastMonthCondition",
					align: "center",
					label: "上月达成情况",
					type: 'text',
					width: 200
				},
				{
					prop: "causeAnalysis",
					align: "center",
					label: "差距与原因分析",
					type: 'text',
					width: 200
				},
				{
					prop: "nextMonthGoal",
					align: "center",
					label: "下月节点目标",
					type: 'text',
					width: 200
				},
				{
					prop: "ownersName",
					align: "center",
					label: "责任人",
					type: 'text',
					width: 200
				},
				{
					prop: "superiorName",
					align: "center",
					label: "直接上级",
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