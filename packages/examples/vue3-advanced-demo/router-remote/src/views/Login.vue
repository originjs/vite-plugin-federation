<template>
  <div class="login-body">
    <div class="login-container">
      <div class="head">
        <div class="name">
          <div class="title">Advance Demo Mall</div>
          <div class="tips">Vue3.0 background management system</div>
        </div>
      </div>
      <el-form label-position="top" :rules="rules" :model="ruleForm" ref="loginForm" class="login-form">
        <el-form-item label="账号" prop="username">
          <el-input type="text" v-model.trim="ruleForm.username" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model.trim="ruleForm.password" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item>
          <div style="color: #333">Sign in means you have agreed<a>《Terms of Service》</a></div>
          <el-button style="width: 100%" type="primary" @click="submitForm">Login immediately</el-button>
          <el-checkbox v-model="checked" @change="!checked">Remember login</el-checkbox>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>


<script>
import {reactive, ref, toRefs} from 'vue'
import {ElButton, ElCheckbox, ElForm, ElFormItem, ElInput, ElMessage} from 'element-plus'
import * as api from "../utils/remoteUtils.js"

export default {
  name: 'Login',
  components: {ElForm, ElFormItem, ElCheckbox, ElInput, ElMessage, ElButton},
  setup() {
    const loginForm = ref("")
    const state = reactive({
      ruleForm: {
        username: '',
        password: ''
      },
      checked: true,
      rules: {
        username: [
          {required: 'true', message: '账户不能为空', trigger: 'blur'}
        ],
        password: [
          {required: 'true', message: '密码不能为空', trigger: 'blur'}
        ]
      }
    })
    const submitForm = () => {
      loginForm.value.validate((valid) => {
        if (valid) {
          const res = api.login(state.ruleForm.username, state.ruleForm.password)
          if (res === undefined) {
            ElMessage({message: 'The user name or password is incorrect.', type: "error"})
            return false;
          }
          api.localSet('token', res.token)
          window.location.href = '/'
        } else {
          console.log('error submit!!')
          return false;
        }
      })
    }
    const resetForm = () => {
      loginForm.value.resetFields();
    }
    return {
      ...toRefs(state),
      loginForm,
      submitForm,
      resetForm
    }
  }
}
</script>

<style scoped>
.login-body {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  background-color: #fff;
  /* background-image: linear-gradient(25deg, #077f7c, #3aa693, #5ecfaa, #7ffac2); */
}

.login-container {
  width: 420px;
  height: 500px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0px 21px 41px 0px rgba(0, 0, 0, 0.2);
}

.head {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 0 20px 0;
}

.head img {
  width: 100px;
  height: 100px;
  margin-right: 20px;
}

.head .title {
  font-size: 28px;
  color: #4c95fd;
  font-weight: bold;
}

.head .tips {
  font-size: 12px;
  color: #999;
}

.login-form {
  width: 70%;
  margin: 0 auto;
}
</style>
<style>
.el-form--label-top .el-form-item__label {
  padding: 0;
}

.login-form .el-form-item {
  margin-bottom: 12px;
}
</style>
