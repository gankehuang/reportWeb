<template>
  <div class="dashboard-container">
    <div class="page-content">
      <div class="welcome-text">{{this.name}}，您好！欢迎访问养殖业务报表系统</div>
      <span class="welcome-img-box"><img class="welcome-img" src="../../assets/welcome-bg.png"></span>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'

  export default {
    name: 'Dashboard',
    computed: {
      ...mapGetters([
        'name',
        'roles'
      ])
    }

  }
</script>

<style lang="scss" scoped media="screen">
  .dashboard-container {
    .page-content {
      text-align: center;
      margin-top: 90px;

      .welcome-text {
        font-size: 25px;
        color: #3779BD;
        margin-bottom: 35px;
      }

      .welcome-img-box {
        display: inline-block;
        .welcome-img {
        }
      }

    }
  }

  @media screen and (max-device-width: 1600px) {

    .welcome-img-box {
      width: 500px;
      height: 300px;
      display: inline-block;
      .welcome-img {
        width: 100%;
        height: 100%;
      }
    }
  }


</style>
