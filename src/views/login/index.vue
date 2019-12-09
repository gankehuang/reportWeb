<template>
  <div class="page-container">
    <div class="page-content">
      <div class="content-left"></div>
      <div class="content-right">
        <div class="logo-block"></div>
        <div class="content-title">
          <img class="avatar-img" src="../../assets/login-avatar.png"/>
          <div class="system-title">欢迎登录养殖业务报表系统</div>
        </div>
        <el-form class="login-form" ref="loginForm" :model="loginForm" size="small" :rules="loginRules">
          <el-form-item prop="userName">
            <el-input prefix-icon="el-icon-user" v-model="loginForm.userName" placeholder="请输入您的账号"></el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input prefix-icon="el-icon-lock" v-model="loginForm.password"
                      show-password
                      placeholder="请输入您的密码" @keyup.enter.native="handleLogin"></el-input>
          </el-form-item>

          <el-form-item>
            <el-button class="login-btn" type="primary" style="width:100%;" @click="handleLogin">登录</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>

  export default {
    name: 'Login',
    data() {
      const validatePass = (rule, value, callback) => {
        // if (value.length < 5) {
        //   callback(new Error('密码不能小于5位'))
        // } else {
        //   callback()
        // }
        callback()
      }
      return {
        loginForm: {
          userName: '',
          password: ''
        },
        loginRules: {
          userName: [{ required: true, message: '请输入账号', trigger: 'blur' }],
          password: [{ required: true, trigger: 'blur', validator: validatePass }]
        },
        loading: false,
        pwdType: 'password',
        redirect: undefined
      }
    },
    watch: {
      $route: {
        handler: function(route) {
          this.redirect = route.query && route.query.redirect
        },
        immediate: true
      }
    },
    methods: {
      handleLogin() {
        this.$refs.loginForm.validate(valid => {
          if (valid) {
            this.loading = true
            this.$store.dispatch('Login', this.loginForm).then(() => {
              this.loading = false
              this.$router.push({ path: this.redirect || '/' })
            }).catch(() => {
              this.loading = false
            })
          } else {
            console.log('error submit!!')
            return false
          }
        })
      }
    }
  }
</script>

<style scoped lang="scss">
  .page-container {
    background: url('../../assets/login-bg.png') no-repeat;
    background-size: 100% 100%;
    width: 100%;
    height: 100%;

    .page-content {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 1024px;
      height: 550px;
      background-color: #fff;

      .content-left {
        float: left;
        width: 70%;
        height: 100%;
        background: url('../../assets/login-form-bg.png') no-repeat;
        background-size: cover;
      }

      .content-right {
        float: left;
        width: 30%;
        padding: 20px;

        .logo-block {
          width: 96px;
          height: 26px;
          background: url('../../assets/login-logo.png') no-repeat;
          margin-bottom: 60px;
        }

        .content-title {
          width: 100%;
          text-align: center;
          position: relative;

          .avatar-img {
            width: 80px;
            height: 80px;
            border-radius: 50%;
          }

          .system-title {
            margin-top: 20px;
          }
        }

        .login-form {
          margin-top: 30px;

          .login-btn {
            width: 100%;
            margin-top: 15px;
            background-color: #256DFF;
          }
        }
      }
    }
  }
</style>
