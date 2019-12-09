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
		<card title="任务清单新增">
			<page-form v-bind="formOptions" :model="form" ref="pageForm" @dataChange="dataChange" @handleChange="handleChange"></page-form>
		</card>

		<card title="明细">
			<vxe-toolbar>
				<template #buttons>
					<vxe-button @click="insertEvent">新增行</vxe-button>
					<vxe-button @click="$refs.xTable.removeSelecteds()">删除选中</vxe-button>
				</template>
			</vxe-toolbar>

			<vxe-table ref="xTable" resizable :edit-config="{trigger: 'click', mode: 'cell'}" :loading="loading" :data="tableData" :edit-rules="validRules" :mouse-config="{selected: true}" :keyboard-config="{isArrow: true, isDel: true, isTab: true, isEdit: true}" border size="medium" stripe highlight-hover-row height="500">
				<vxe-table-column type="checkbox" width="60" fixed="left"></vxe-table-column>
				<vxe-table-column title="任务名称" width="120" field="taskName" :edit-render="{name: 'input', props: {placeholder: '请输入值'}}" fixed="left"></vxe-table-column>
				<vxe-table-column title="任务内容描述" width="120" field="desc" :edit-render="{name: 'input', props: {placeholder: '请输入值'}}"></vxe-table-column>
				<vxe-table-column title="任务来源" width="200" field="source" :edit-render="{name: 'input', props: {placeholder: '请输入值'}}"></vxe-table-column>
				<vxe-table-column title="要求交付结果" width="120" field="yqresult" :edit-render="{name: 'input', props: {placeholder: '请输入值'}}"></vxe-table-column>
				<vxe-table-column title="要求达成目标" width="120" field="yqTarget" :edit-render="{name: 'input', props: {placeholder: '请输入值'}}"></vxe-table-column>
				<vxe-table-column title="发布时间" width="150" field="publishTime" :edit-render="{name: 'input'}">
					<template v-slot:edit="{ row }">
						<el-date-picker v-model="row.publishTime" type="date" format="yyyy-MM-dd" value-format="timestamp" style="width: 100%;"></el-date-picker>
					</template>
					<template v-slot="{ row }">
						{{formatDate(row.publishTime,'yyyy-MM-dd')}}
					</template>
				</vxe-table-column>
				<vxe-table-column title="目标完成时间" width="150" field="plancompleteTime" :edit-render="{type: 'default'}">
					<template v-slot:edit="{ row }">
						<el-date-picker v-model="row.plancompleteTime" type="date" format="yyyy-MM-dd" value-format="timestamp" style="width: 100%;"></el-date-picker>
					</template>
					<template v-slot="{ row }">{{ formatDate(row.plancompleteTime,'yyyy-MM-dd')}}</template>
				</vxe-table-column>
				<vxe-table-column title="责任人" width="100" field="responsibilityer" :edit-render="{name: 'input', props: {placeholder: '请输入键值'}}"></vxe-table-column>
			</vxe-table>
		</card>
	</div>
</template>

<script>
	import request from '@/utils/request'
	import card from '@/components/card'
	import PageForm from "@/components/form/Form"
	import { timeFormat } from "@/utils/dateUtils"

	import addMinxins from "./addMinxins";
	import { mapGetters } from 'vuex'
	export default {
		name: "add",
		components: {
			PageForm,
			card
		},
		mixins: [addMinxins],
		data() {
			return {
				tableData: [{
					taskName: '任务名称',
					desc: '任务内容描述',
					source: '任务来源',
					yqresult: '要求交付结果',
					yqTarget: '要求达成目标',
					publishTime: new Date().getTime(),
					plancompleteTime: new Date().getTime(),
					responsibilityer: '责任人'
				}],
				loading: false,
				validRules: { // 校验规则
					taskName: [{
						required: true,
						message: '任务名称必须填写'
					}],
					desc: [{
						required: true,
						message: '任务内容描述必须填写'
					}],
					source: [{
						required: true,
						message: '任务来源必须填写'
					}],
					yqresult: [{
						required: true,
						message: '要求交付结果必须填写'
					}],
					yqTarget: [{
						required: true,
						message: '要求达成目标必须填写'
					}],
					publishTime: [{
						required: true,
						message: '发布时间必须填写'
					}],
					plancompleteTime: [{
						required: true,
						message: '计划完成时间必须填写'
					}],
					responsibilityer: [{
						required: true,
						message: '责任人必须填写'
					}]
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
			getProjectData() {

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