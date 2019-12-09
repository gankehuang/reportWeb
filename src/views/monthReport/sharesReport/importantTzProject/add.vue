<template>
	<div>
		<div class="search-container"  v-loading.fullscreen.lock="loading">
			<el-row>
				<el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
					<el-button type="default" icon="el-icon-arrow-left" size="small" @click="goBack">
						返回
					</el-button>
				</el-col>
				<el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
					<div class="pull-right">
						<el-button type="default" plain class="save-btn" size="small" @click="save(0)">
							保存
						</el-button>
					</div>
				</el-col>
			</el-row>
		</div>
		<card>
			<page-form v-bind="formOptions" :model="form" ref="pageForm" @dataChange="dataChange" @handleChange="handleChange"></page-form>
		</card>

		<card>
			<vxe-toolbar>
				<template #buttons>
					<vxe-button @click="insertEvent">新增行</vxe-button>
					<vxe-button @click="$refs.xTable.removeSelecteds()">删除选中</vxe-button>
				</template>
			</vxe-toolbar>

			<vxe-table ref="xTable" resizable :edit-config="{trigger: 'click', mode: 'cell'}" :loading="loading" :data="tableData" :edit-rules="validRules" :mouse-config="{selected: true}" :keyboard-config="{isArrow: true, isDel: true, isTab: true, isEdit: true}" border size="medium" stripe highlight-hover-row height="500">
				<vxe-table-column type="checkbox" width="60" fixed="left"></vxe-table-column>
				<vxe-table-column title="项目名称" width="120" field="projectName" :edit-render="{name: 'input', props: {placeholder: '请输入值'}}" fixed="left"></vxe-table-column>
				<vxe-table-column title="项目主要内容" width="120" field="projectContent" :edit-render="{name: 'input', props: {placeholder: '请输入值'}}"></vxe-table-column>
				<vxe-table-column title="项目规模" width="200" field="projectScale" :edit-render="{name: 'input', props: {placeholder: '请输入值'}}"></vxe-table-column>
				<vxe-table-column title="预期交付结果" width="120" field="expectResults" :edit-render="{name: 'input', props: {placeholder: '请输入值'}}"></vxe-table-column>
				<vxe-table-column title="预期达成目标" width="120" field="expectGoal" :edit-render="{name: 'input', props: {placeholder: '请输入值'}}"></vxe-table-column>
				<vxe-table-column title="项目启动时间" width="150" field="projectStartTime" :edit-render="{type: 'default'}">
					<template v-slot:edit="{ row }">
						<el-date-picker v-model="row.projectStartTime" type="date" format="yyyy-MM-dd" value-format="timestamp" style="width: 100%;"></el-date-picker>
					</template>
					<template v-slot="{ row }">
						{{formatDate(row.projectStartTime,'yyyy-MM-dd')}}
					</template>
				</vxe-table-column>
				<vxe-table-column title="目标完成时间" width="150" field="goalFinishTime" :edit-render="{type: 'default'}">
					<template v-slot:edit="{ row }">
						<el-date-picker v-model="row.goalFinishTime" type="date" format="yyyy-MM-dd" value-format="timestamp" style="width: 100%;"></el-date-picker>
					</template>
					<template v-slot="{ row }">{{ formatDate(row.goalFinishTime,'yyyy-MM-dd')}}</template>
				</vxe-table-column>
				<vxe-table-column title="上月节点目标" width="200" field="lastMonthGoal" :edit-render="{name: 'input', props: {placeholder: '请输入值'}}"></vxe-table-column>
				<vxe-table-column title="上月达成情况" width="200" field="lastMonthCondition" :edit-render="{name: 'input', props: {placeholder: '请输入值'}}"></vxe-table-column>
				<vxe-table-column title="差距与原因分析" width="200" field="causeAnalysis" :edit-render="{name: 'input', props: {placeholder: '请输入值'}}"></vxe-table-column>
				<vxe-table-column title="下月节点目标" width="200" field="nextMonthGoal" :edit-render="{name: 'input', props: {placeholder: '请输入值'}}"></vxe-table-column>
				<vxe-table-column title="责任人" width="100" field="ownersName" :edit-render="{type: 'default'}">
					<template v-slot:edit="{ row }">
						<auto-search v-model="row.ownersName" @dataChange="setOwner($event,row)" :placeholder="'请选择'" :props="props" url="/BUILD/projectNew/getListAll">
						</auto-search>
					</template>
					<template v-slot="{ row }">{{ row.ownersName}}</template>
				</vxe-table-column>
				<vxe-table-column title="直接上级" width="100" field="superiorName" :edit-render="{name: 'input', props: {placeholder: '请输入翻译的内容'}}"></vxe-table-column>
			</vxe-table>
		</card>
	</div>
</template>

<script>
	import request from '@/utils/request'
	import card from '@/components/card'
	import PageForm from "@/components/form/Form"
	import { timeFormat } from "@/utils/dateUtils"
  	import autoSearch from "@/components/form/form-select-data"

	import addMinxins from "./addMinxins";
	import { mapGetters } from 'vuex'
	export default {
		name: "add",
		components: {
			PageForm,
			card,
			autoSearch
		},
		mixins: [addMinxins],
		data() {
			return {
				props:{
			        label:'name',
			        value:'id'
			    },
				tableData: [{
					id:'',//主键
					projectName: '项目名称',//项目名称
					projectContent: '项目主要内容',//项目主要内容
					projectScale: '项目规模',//项目规模
					expectResults: '预期交付结果',//预期交付结果
					expectGoal: '预期达成目标',
					projectStartTime: new Date().getTime(),//项目启动时间
					goalFinishTime: new Date().getTime(),//目标完成时间
					lastMonthGoal: '上月节点目标',//上月节点目标
					lastMonthCondition: '上月达成情况',
					causeAnalysis: '差距与原因分析',
					nextMonthGoal: '下月节点目标',
					ownersName: '责任人',
					superiorName: '直接上级'
				}],
				loading: false,
				validRules: { // 校验规则
					projectName: [{
						required: true,
						message: '项目名称必须填写'
					}],
					projectContent: [{
						required: true,
						message: '项目主要内容必须填写'
					}],
					projectScale: [{
						required: true,
						message: '项目规模必须填写'
					}],
					expectResults: [{
						required: true,
						message: '预期交付结果必须填写'
					}],
					expectGoal: [{
						required: true,
						message: '预期达成目标必须填写'
					}],
					projectStartTime: [{
						required: true,
						message: '项目启动时间必须填写'
					}],
					goalFinishTime: [{
						required: true,
						message: '目标完成时间必须填写'
					}],
					lastMonthGoal: [{
						required: true,
						message: '上月节点目标必须填写'
					}],
					lastMonthCondition: [{
						required: true,
						message: '上月达成情况必须填写'
					}],
					causeAnalysis: [{
						required: true,
						message: '差距与原因分析必须填写'
					}],
					nextMonthGoal: [{
						required: true,
						message: '下月节点目标必须填写'
					}],
					ownersName: [{
						required: true,
						message: '责任人必须填写'
					}],
					superiorName: [{
						required: true,
						message: '直接上级必须填写'
					}],
				}
			}
		},
		created() {},
		computed: {
			...mapGetters([
				'name'
			])
		},
		mounted() {

		},
		methods: {
			dataChange (val, key) {
				debugger
				console.log(this.form)
		        if (val && val.hasOwnProperty('NAME')) { // 发包人
		        }
	     	},
		    handleChange (val, key) { // change事件
		       debugger
		       console.log(this.form)
		    },
			setOwner(val,row){
				debugger
				row.ownersName = val.name
			},
			formatDate(value, format) {
				return timeFormat(value, format)
			},
			insertEvent() {
				const record = {}
				this.$refs.xTable.insert(record)
					.then(({
						row
					}) => this.$refs.xTable.setActiveCell(row, 'type'))
			},
			rowspanMethod({
				row,
				$rowIndex,
				column,
				columnIndex,
				data
			}) {
				const fields = ['projectType', 'project']
				const cellValue = row[column.property]
				if(cellValue && fields.includes(column.property)) {
					const prevRow = data[$rowIndex - 1]
					let nextRow = data[$rowIndex + 1]
					if(prevRow && prevRow[column.property] === cellValue) {
						return {
							rowspan: 0,
							colspan: 0
						}
					} else {
						let countRowspan = 1
						while(nextRow && nextRow[column.property] === cellValue) {
							nextRow = data[++countRowspan + $rowIndex]
						}
						if(countRowspan > 1) {
							return {
								rowspan: countRowspan,
								colspan: 1
							}
						}
					}
				}
			}
		}
	}
</script>

<style scoped lang="scss">
	.searchBar .el-form-item .el-form-item__label{
    line-height: 40px !important;
  }
  .mb-15{
    margin-bottom: 15px;
  }
</style>