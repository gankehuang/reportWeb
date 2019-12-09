<template>
	<div v-loading.fullscreen.lock="loading">
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
		
		<card title="重要投资项目新增">
			<page-form 
				v-bind="formOptions" 
				:model="form" 
				:editable="!lockUI"
				ref="pageForm" 
				@dataChange="dataChange" 
				@handleChange="handleChange"></page-form>
		</card>

		<card title="明细">
			<vxe-toolbar>
				<template #buttons>
					<vxe-button @click="insertEvent">新增行</vxe-button>
					<vxe-button @click="$refs.xTable.removeSelecteds()">删除选中</vxe-button>
				</template>
			</vxe-toolbar>

			<vxe-table 
				ref="xTable" 
				resizable 
				:edit-config="{trigger: 'click', mode: 'cell'}" 
				:loading="loading" 
				:data="tableData" 
				:edit-rules="validRules" 
				:mouse-config="{selected: true}" 
				:keyboard-config="{isArrow: true, isDel: true, isTab: true, isEdit: true}" 
				border
				size="medium" 
				stripe highlight-hover-row 
				height="500">
				<vxe-table-column type="checkbox" width="60" fixed="left"></vxe-table-column>
				<vxe-table-column title="项目名称" width="120" field="projectName" :edit-render="{name: 'input', props: {placeholder: '请输入值'}}"></vxe-table-column>
				<vxe-table-column title="项目主要内容" width="120" field="content" :edit-render="{name: 'input', props: {placeholder: '请输入值'}}"></vxe-table-column>
				<vxe-table-column title="达成目标" width="200" field="target" :edit-render="{name: 'input', props: {placeholder: '请输入值'}}"></vxe-table-column>
				<vxe-table-column title="对标企业" width="120" field="dbqy" :edit-render="{name: 'input', props: {placeholder: '请输入值'}}"></vxe-table-column>
				<vxe-table-column title="项目启动时间" width="150" field="startTime" :edit-render="{name: 'input'}">
					<template v-slot:edit="{ row }">
						<el-date-picker v-model="row.startTime" type="date" format="yyyy-MM-dd" value-format="timestamp" style="width: 100%;"></el-date-picker>
					</template>
					<template v-slot="{ row }">
						{{formatDate(row.startTime,'yyyy-MM-dd')}}
					</template>
				</vxe-table-column>
				<vxe-table-column title="目标完成时间" width="150" field="completeTime" :edit-render="{type: 'default'}">
					<template v-slot:edit="{ row }">
						<el-date-picker v-model="row.completeTime" type="date" format="yyyy-MM-dd" value-format="timestamp" style="width: 100%;"></el-date-picker>
					</template>
					<template v-slot="{ row }">{{ formatDate(row.completeTime,'yyyy-MM-dd')}}</template>
				</vxe-table-column>
				<vxe-table-column title="上月节点目标" width="200" field="lastMonthNodeTarget" :edit-render="{name: 'input', props: {placeholder: '请输入值'}}"></vxe-table-column>
				<vxe-table-column title="上月达成情况" width="200" field="lastMonthComplteInfo" :edit-render="{name: 'input', props: {placeholder: '请输入值'}}"></vxe-table-column>
				<vxe-table-column title="差距与原因分析" width="200" field="differCause" :edit-render="{name: 'input', props: {placeholder: '请输入值'}}"></vxe-table-column>
				<vxe-table-column title="应对策略及措施" width="200" field="ydMeature" :edit-render="{name: 'input', props: {placeholder: '请输入值'}}"></vxe-table-column>

				<vxe-table-column title="下月节点目标" width="200" field="nextMonthNodeTarget" :edit-render="{name: 'input', props: {placeholder: '请输入值'}}"></vxe-table-column>
				<vxe-table-column title="组长" width="100" field="teamer" :edit-render="{name: 'input', props: {placeholder: '请输入键值'}}"></vxe-table-column>
				<vxe-table-column title="成员" width="100" field="member" :edit-render="{name: 'input', props: {placeholder: '请输入翻译的内容'}}"></vxe-table-column>
				<vxe-table-column title="直接上级" width="100" field="upper" :edit-render="{name: 'input', props: {placeholder: '请输入翻译的内容'}}"></vxe-table-column>
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
					projectName: '项目',
					content: '项目主要内容',
					target: '达成目标',
					dbqy: '对标企业',
					startTime: new Date().getTime(),
					completeTime: new Date().getTime(),
					lastMonthNodeTarget: '上月节点目标',
					lastMonthComplteInfo: '上月达成情况',
					differCause: '差距与原因分析',
					nextMonthNodeTarget: '下月节点目标',
					teamer: '组长',
					member: '成员',
					upper: '直接上级'
				}],
				loading: false,
				validRules: { // 校验规则
					projectName: [{
						required: true,
						message: '项目名称必须填写'
					}],
					content: [{
						required: true,
						message: '项目主要内容必须填写'
					}],
					target: [{
						required: true,
						message: '达成目标必须填写'
					}],
					dbqy: [{
						required: true,
						message: '对标企业必须填写'
					}],
					startTime: [{
						required: true,
						message: '项目启动时间必须填写'
					}],
					completeTime: [{
						required: true,
						message: '目标完成时间必须填写'
					}],
					lastMonthNodeTarget: [{
						required: true,
						message: '上月节点目标必须填写'
					}],
					lastMonthComplteInfo: [{
						required: true,
						message: '上月达成情况必须填写'
					}],
					
					differCause: [{
						required: true,
						message: '差距与原因分析必须填写'
					}],
					ydMeature: [{
						required: true,
						message: '应对策略及措施必须填写'
					}],
					nextMonthNodeTarget: [{
						required: true,
						message: '下月节点目标必须填写'
					}],
					teamer: [{
						required: true,
						message: '组长必须填写'
					}],
					member: [{
						required: true,
						message: '成员必须填写'
					}],
					upper: [{
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
			]),
			lockUI(){
				return false;
			}
		},
		mounted() {

		},
		methods: {
			dataChange (val, key) {
		        
		    },
	     	handleChange (val, key) {},
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