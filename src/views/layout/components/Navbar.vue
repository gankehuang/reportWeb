<template>
  <el-menu class="navbar" mode="horizontal">
    <hamburger :toggle-click="toggleSideBar" :is-active="sidebar.opened" class="hamburger-container"/>
    <breadcrumb/>
    <el-menu-item class="org-select" index="4">
      <a href="javascript:void(0)" @click="showOrg" style="color:#fff;">
        <img src="../../../assets/orgIcon.png" style="transform: translate(-3px, -1px);">
        {{ orgInfo ? orgInfo.name : '请选择组织' }}
      </a>
      <i class="el-icon-caret-bottom" @click="showOrg" style="color:#fff;"></i>
    </el-menu-item>
    <el-menu-item class="month-select">
      <el-date-picker ref="datePicker" v-model="myPlanYearMonth"
                      type="month"
                      placeholder="请选择月"
                      format="yyyy-MM"
                      size="mini"
                      :clearable="false"
                      :editable="false"
                      value-format="yyyy-MM">
      </el-date-picker>
      <i class="el-icon-caret-bottom" style="color:#fff;" @click="showSelectMonth"></i>
    </el-menu-item>
    <el-dropdown class="avatar-container" trigger="click">
      <div class="avatar-wrapper">
        <span class="user-name">{{name}}</span>
        <!--        <img src="@/assets/avatar.png" class="user-avatar">-->
        <i class="el-icon-caret-bottom"/>
      </div>
      <el-dropdown-menu slot="dropdown" class="user-dropdown">
        <router-link class="inlineBlock" to="/">
          <el-dropdown-item>
            首页
          </el-dropdown-item>
        </router-link>
        <el-dropdown-item divided>
          <span style="display:block;" @click="logout">注销</span>
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </el-menu>
</template>

<script>
    import moment from 'moment'
    import {mapGetters} from 'vuex'
    import Breadcrumb from '@/components/Breadcrumb'
    import Hamburger from '@/components/Hamburger'

    export default {
        data() {
            return {
                myPlanYearMonth: ''
            }
        },
        components: {
            Breadcrumb,
            Hamburger
        },
        computed: {
            ...mapGetters([
                'sidebar',
                'avatar',
                'orgInfo',
                'planYearMonth',
                'name'
            ])
        },
        watch: {
            myPlanYearMonth(newVal, oldVal) {  // 监听月份切换
                this.$store.commit('SET_PLANYEARMONTH_INFO', newVal)
            }
        },
        created() {
            if (this.planYearMonth != 'null' && this.planYearMonth) {
                this.myPlanYearMonth = this.planYearMonth
            } else {
                this.myPlanYearMonth = moment(new Date()).add('year', 0).format('YYYY-MM')
            }

        },
        methods: {
            toggleSideBar() {
                this.$store.dispatch('ToggleSideBar')
            },
            logout() {
                this.$store.dispatch('LogOut').then(() => {
                    location.reload() // 为了重新实例化vue-router对象 避免bug
                })
            },
            showOrg() {
                this.$orgDialog.show()
            },
            showSelectMonth() {
                this.$refs.datePicker.showPicker();

            }
        }
    }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .navbar {
    height: 50px;
    line-height: 50px;
    border-radius: 0px !important;
    background-color: #3F526B;
    
    .el-menu-item:hover {
      background-color: #3F526B !important;
    }

    .hamburger-container {
      line-height: 52px;
      height: 50px;
      float: left;
      padding: 0 14px;
    }

    .screenfull {
      position: absolute;
      right: 90px;
      top: 16px;
      color: red;
    }

    .org-select {
      display: inline-flex;
      align-items: center;
      border-bottom-color: transparent;
      position: absolute;
      right: 220px;
      top: 0;
      height: 49px;
    }

    .month-select {
      display: inline-flex;
      align-items: center;
      border-bottom-color: transparent;
      position: absolute;
      right: 90px;
      top: 0;
      height: 49px;

      /deep/ .el-date-editor.el-input, .el-date-editor.el-input__inner {
        width: 86px;

        .el-input__inner {
          padding-right: 0 !important;
          font-size: 14px;
          border: 0;
          background-color: #3F526B;
          color: #fff;
        }
        
        .el-icon-date {
          color: #fff;
        }
      }
    }

    .avatar-container {
      height: 50px;
      display: inline-block;
      position: absolute;
      right: 35px;

      .avatar-wrapper {
        cursor: pointer;
        margin-top: 5px;
        position: relative;
        line-height: initial;

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          position: absolute;
          right: -20px;
          top: 11px;
          font-size: 17px;
          color: #fff;
        }

        .user-name {
          display: inline-block;
          height: 40px;
          line-height: 40px;
          color: #fff;
        }
      }
    }
  }
</style>

