import { MessageBox } from 'element-ui';

const BeforeRouteLeaveMixin = {
    beforeRouteLeave(to, from, next) {
        // 审核中 审核完成不提示保存
        if (to.path === from.path || to.query.changeTag == 1 || this.isAudit == 1 || this.isSubmit || this.billState == 1 || this.billState == 2) {
            if (this.isAudit == 1) {
                this.closeSelectedTag(from)
            }
            next()
        } else {
            next(false)
            MessageBox.confirm('您将离开本页面，是否保存当前修改？', '提示', {
                distinguishCancelAndClose: true,
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.save();
                next()
            }).catch(() => {
                next()
            });
        }
    },
    data() {
        return {
            isSubmit: false,
            isAudit: '',
            billState: ''
        }
    },
    mounted() {
        // window.addEventListener('beforeunload', e => this.beforeRouteLeaveHandler(e))
    },
    methods: {
        closeSelectedTag(view) {
            this.$store.dispatch('tagsView/delView', view)
        },
        beforeRouteLeaveHandler(e) {
            this.$confirm('您将离开本页面，是否保存当前修改？', '提示', {
                distinguishCancelAndClose: true,
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.save();
            }).catch(() => {});
        }
    },
    beforeDestroy() {
        window.removeEventListener('beforeunload', e => this.beforeRouteLeaveHandler(e))
    }
}

export default BeforeRouteLeaveMixin