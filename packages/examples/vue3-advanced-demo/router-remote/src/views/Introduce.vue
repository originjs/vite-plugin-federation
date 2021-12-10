<template>
  <el-card class="account-container">
    <h1>Introduce.vue</h1>
    <div style="line-height: 30px">
      Use vite-plugin-federation to split the system into two parts, `router-host` (Host) and `router-remote` (Remote), and work together.
    </div>
    <h1>Development and deployment documentation</h1>
    <div style="line-height: 30px">
      <ul style="font-weight: bold;">
        <li>http://localhost:5004/</li>
        <li>http://localhost:5005/</li>
      </ul>
    </div>
    <ul class="course" @click="goGithub">
      <li>Github</li>
    </ul>
    <h1>Technical selection</h1>
    <ul style="font-weight: bold;">
      <li>Vue 3.x</li>
      <li>Vite 2.x</li>
      <li>Vue-Router 4.x</li>
      <li>Element-Plus(Adapt to the new Vue 3.x PC-side component library)</li>
      <li>Echarts 5.0</li>
      <li>axios</li>
      <li>wangEditor</li>
    </ul>
  </el-card>
</template>

<script>
export default {
  name: 'Introduce',
  setup() {
    console.log(`The router-remote‘s  Introduce call its own setup.`);
    const goGithub = () => {
      console.log('goGithub')
      window.open('https://github.com/originjs/vite-plugin-federation', 'target')
    }

    return {
      goGithub
    }
  }
}
</script>
<style scoped>
.account-container {
  width: 420px;
  height: 500px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0px 21px 41px 0px rgba(0, 0, 0, 0.2);
}

.course {
  font-weight: bold;
  display: inline-block;
}

.course li {
  line-height: 36px;
  color: #409eff;
  cursor: pointer;
}
</style>
