<template>
  <el-card class="box-card">
    <!-- 1.面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 2.搜索框 -->
    <el-row class="seachRow">
      <el-col>
        <el-input placeholder="请输入内容" v-model="query" @clear="loadUserList" clearable class="inputSearch">
          <el-button @click="sreachUser" slot="append" icon="el-icon-search"></el-button>
        </el-input>
        <el-button type="success" @click="showAddUserDia()">添加用户</el-button>
      </el-col>
    </el-row>

    <!-- 3.表格 -->
    <el-table :data="userList" style="width: 100%">
      <el-table-column type="index" label="#" width="60">
      </el-table-column>
      <el-table-column prop="username" label="姓名" width="180">
      </el-table-column>
      <el-table-column prop="email" label="邮箱" width="180">
      </el-table-column>
      <el-table-column prop="mobile" label="电话" width="180">
      </el-table-column>
      <el-table-column prop="create_time" label="创建时间" width="180">
        <!-- 如果单元格内显示的内容不是字符串（文本），需要给被显示内容外层包裹一个template -->
        <!-- template内部要用数据 设置slot-scope属性，该属性的值是要用数据create_time的数据源userList -->
        <!-- slot-scope的值userList其实就是el-table绑定的数据userList，slot-scope会自动找上一级数据源,userList.row -> 数组中的每个对象 -->
        <template slot-scope="scope">
          {{scope.row.create_time | fmtdate}}
        </template>
      </el-table-column>
      <el-table-column label="用户状态" width="180">
        <template slot-scope="scope">
          <el-switch @change="changeState(scope.row)" v-model="scope.row.mg_state" active-color="#13ce66"
            inactive-color="#ff4949">
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template slot-scope="scope">
          <el-button size="mini" plain type="primary" icon="el-icon-edit" circle @click="showEditUserDia(scope.row)"></el-button>
          <el-button size="mini" plain type="danger" icon="el-icon-delete" circle @click="showDeleUserMsgBox(scope.row.id)"></el-button>
          <el-button size="mini" plain type="success" icon="el-icon-check" circle @click="showSetUserRoleDia(scope.row)"></el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 4.分页 -->
    <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pagenum"
      :page-sizes="[2, 4, 6, 8]" :page-size="2" layout="total, sizes, prev, pager, next, jumper" :total="total">
    </el-pagination>

    <!-- 对话框，添加用户 -->
    <el-dialog title="添加用户" :visible.sync="dialogFormVisibleAdd">
      <el-form :model="form">
        <el-form-item label="用户名" label-width="100px">
          <el-input v-model="form.username" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码" label-width="100px">
          <el-input v-model="form.password" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" label-width="100px">
          <el-input v-model="form.email" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="电话" label-width="100px">
          <el-input v-model="form.mobile" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisibleAdd = false">取 消</el-button>
        <el-button type="primary" @click="addUser()">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 对话框，编辑用户 -->
    <el-dialog title="添加用户" :visible.sync="dialogFormVisibleEdit">
      <el-form :model="form">
        <el-form-item label="用户名" label-width="100px">
          <el-input v-model="form.username" disabled autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" label-width="100px">
          <el-input v-model="form.email" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="电话" label-width="100px">
          <el-input v-model="form.mobile" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisibleEdit = false">取 消</el-button>
        <el-button type="primary" @click="editUser()">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 分配角色 对话框 -->
    <el-dialog title="分配角色" :visible.sync="dialogFormVisibleRol">
      <el-form :model="form">
        <el-form-item label="用户名" label-width="100px">
          {{currUserName}}
        </el-form-item>
        <el-form-item label="角色" label-width="100px">
          <!-- 如果select绑定的数据值 和 option的value一样，就会显示该option的label值 -->
          <el-select v-model="currRoleId">
            <el-option label="请选择" disabled :value="-1"></el-option>
            <el-option :label="item.roleName" :value="item.id" v-for="(item,i) in roles" :key="i"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisibleRol = false">取 消</el-button>
        <el-button type="primary" @click="setRole()">确 定</el-button>
      </div>
    </el-dialog>
  </el-card>
</template>

<script>
export default {
  data () {
    return {
      query: '',
      // 表格绑定数据
      userList: [],
      // 分页相关数据
      total: -1,
      pagenum: 1,
      pagesize: 2,
      // 添加对话框的属性
      dialogFormVisibleAdd: false,
      dialogFormVisibleEdit: false,
      dialogFormVisibleRol: false,
      // 添加用户的表单数据
      form: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 分配角色
      currRoleId: -1,
      currUserName: '',
      currUserId: -1,
      // 保存所有的角色数据
      roles: []
    }
  },
  created () {
    this.getUserLiset()
  },
  methods: {
    // 分配用户角色 发送请求
    async setRole () {
      const res = await this.$http.put(`users/${this.currUserId}/role`, {
        rid: this.currRoleId
      })
      this.dialogFormVisibleRol = false
    },
    // 分配用户角色 打开模态框
    async showSetUserRoleDia (user) {
      this.currUserName = user.username
      this.currUserId = user.id
      // 获取所有的角色
      const res1 = await this.$http.get('roles')
      // console.log(res1)
      this.roles = res1.data.data
      // 获取当前用户角色的id->rid
      const res = await this.$http.get(`users/${user.id}`)
      this.currRoleId = res.data.data.rid
      console.log(this.currRoleId)
      this.dialogFormVisibleRol = true
    },
    // 修改用户状态，发送请求
    async changeState (user) {
      const res = await this.$http.put(`users/${user.id}/state/${user.mg_state}`)
      if (res.data.meta.status === 200) {
        this.$message.success(res.data.meta.msg)
      }
    },
    // 编辑用户信息，发送请求
    async editUser () {
      const res = await this.$http.put(`users/${this.form.id}`, this.form)
      // console.log(res)
      this.dialogFormVisibleEdit = false
      if (res.data.meta.status === 200) {
        this.getUserLiset()
      }
    },
    // 编辑用户信息，打开对话框
    showEditUserDia (user) {
      // 获取用户数据
      this.form = user
      this.dialogFormVisibleEdit = true
    },
    // 删除用户,打开消息盒子
    showDeleUserMsgBox (userId) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        // 发送删除请求 id:用户id
        const res = await this.$http.delete(`users/${userId}`)
        console.log(res)
        if (res.data.meta.status === 200) {
          this.getUserLiset()
          this.pagenum = 1
          this.$message({
            type: 'success',
            message: res.data.meta.msg
          })
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    // 添加用户,发送请求
    async addUser () {
      // 关闭对话框
      this.dialogFormVisibleAdd = false
      const res = await this.$http.post('users', this.form)
      // console.log(res)
      const {
        meta: {
          status,
          msg
        },
        data
      } = res.data
      if (status === 201) {
        // 提交成功,更新视图,清空对话框
        // 提示
        this.$message.success(msg)
        // 重新请求
        this.getUserLiset()
        // 清空输入框
        // this.form.username = ''
        this.form = {}
        // for (const key in this.form) {
        //   if (this.form.hasOwnProperty(key)) {
        //     this.form[key] = ''
        //   }
        // }
      } else {
        this.$message.warning(msg)
      }
    },
    // 添加用户，打开对话框
    showAddUserDia () {
      this.form = {}
      this.dialogFormVisibleAdd = true
    },
    // 清空搜索框 重新获取数据
    loadUserList () {
      this.getUserLiset()
    },
    // 搜索用户
    sreachUser () {
      // v-model绑定数据,值已经自动修改
      this.getUserLiset()
    },
    // 分页相关方法
    handleSizeChange (val) {
      console.log(`每页 ${val} 条`)
      this.pagesize = val
      this.pagenum = 1
      this.getUserLiset()
    },
    handleCurrentChange (val) {
      console.log(`当前页: ${val}`)
      this.pagenum = val
      this.getUserLiset()
    },
    // 获取用户列表的请求
    async getUserLiset () {
      // query 查询参数 可以为空
      // pagenum 当前页码 不能为空
      // pagesize 每页显示条数 不能为空

      // 需要授权的 API ，必须在请求头中使用 `Authorization` 字段提供 `token` 令牌
      const AUTH_TOKEN = localStorage.getItem('token')
      this.$http.defaults.headers.common['Authorization'] = AUTH_TOKEN
      const res = await this.$http.get(
        `users?query=${this.query}&pagenum=${this.pagenum}&pagesize=${this.pagesize}`)
      // console.log(res)
      const {
        meta: {
          status,
          msg
        },
        data: {
          users,
          total
        }
      } = res.data
      if (status === 200) {
        // 1. 给表格数据赋值
        this.userList = users
        // 2. 给total 赋值
        this.total = total
        // 3. 提示
        // this.$message.success(msg)
      } else {
        // 提示
        this.$message.warning(msg)
      }
    }
  }
}
</script>

<style>
  .box-card {
    height: 100%;
  }

  .seachRow {
    margin-top: 20px;
  }

  .inputSearch {
    width: 300px;
  }
</style>
