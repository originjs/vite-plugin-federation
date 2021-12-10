<template>
  <el-card class="account-container">
    <el-form :model="nameForm" :rules="rules" ref="nameRef" label-width="140px" label-position="right" class="demo-ruleForm">
      <el-form-item label="User Name:" prop="loginName">
        <el-input style="width: 200px" v-model="nameForm.loginName" disabled></el-input>
      </el-form-item>
      <el-form-item label="Nick name:" prop="nickName">
        <el-input style="width: 200px" v-model="nameForm.nickName" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="danger" @click="submitName">Confirm</el-button>
      </el-form-item>
    </el-form>
  </el-card>
  <el-card class="account-container">
    <el-form :model="passForm" :rules="rules" ref="passRef" label-width="140px" label-position="right" class="demo-ruleForm">
      <el-form-item label="Old Password：" prop="oldpass">
        <el-input style="width: 200px" v-model="passForm.oldpass" show-password clearable></el-input>
      </el-form-item>
      <el-form-item label="New Password：" prop="newpass">
        <el-input style="width: 200px" v-model="passForm.newpass" show-password clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="danger" @click="submitPass">Confirm</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script>
import {onMounted, reactive, ref, toRefs} from 'vue'

import * as api from "../utils/hostUtils.js"
import {ElButton, ElCard, ElForm, ElFormItem, ElInput, ElMessage} from 'element-plus'

export default {
  name: 'Account',
  components: {ElButton, ElCard, ElForm, ElFormItem, ElInput, ElMessage},
  setup() {
    const nameRef = ref(null)
    const passRef = ref(null)
    const state = reactive({
      user: null,
      nameForm: {
        loginName: '',
        nickName: ''
      },
      passForm: {
        oldpass: '',
        newpass: ''
      },
      rules: {
        loginName: [
          { required: 'true', message: 'Login name cannot be empty.', trigger: ['change'] }
        ],
        nickName: [
          { required: 'true', message: 'User Name can not be blank.', trigger: ['change'] }
        ],
        oldpass: [
          { required: 'true', message: 'The original password cannot be empty.', trigger: ['change'] }
        ],
        newpass: [
          { required: 'true', message: 'New password cannot be empty.', trigger: ['change'] }
        ]
      },
    })
    onMounted(() => {
      const res = api.getUserInfo()
      state.user = res
      state.nameForm.loginName = res.loginUserName
      state.nameForm.nickName = res.nickName

    })
    const submitName = () => {
      nameRef.value.validate((vaild) => {
        if (vaild) {
          api.changeNickName(state.nameForm.nickName).then(res => {
            if (res) {
              ElMessage.success('Successfully')
              window.location.reload()
            } else {
              ElMessage.error('Failed')
            }
          })
        }
      })
    }
    const submitPass = () => {
      passRef.value.validate((vaild) => {
        if (vaild) {
          const res = api.changePassword(state.passForm.oldpass, state.passForm.newpass)
          if (res) {
            ElMessage.success('Successfully')
            window.location.reload()
          } else {
            ElMessage.error('Failed')
          }
        }
      })
    }
    return {
      ...toRefs(state),
      nameRef,
      passRef,
      submitName,
      submitPass
    }
  }
}
</script>

<style>
  .account-container {
    margin-bottom: 20px;
  }
</style>
