<template>
  <el-card>
    <!-- 1.面包屑 -->
    <my-bread level1="权限管理" level2="角色列表"></my-bread>

    <el-row class="addRolebtn">
      <el-col>
        <el-button type="info" @click="showAddRoleDia()">添加角色</el-button>
      </el-col>
    </el-row>

    <!-- 2.表格 -->
    <el-table :data="roleList" style="width: 100%">
      <el-table-column type="expand" width="150">
        <template slot-scope="scope">
          <el-row v-for="(item1,i) in scope.row.children" :key="i">
            <el-col :span="4">
              <el-tag closable @close="deleRight(scope.row,item1.id)" type="danger">{{item1.authName}}</el-tag>
              <i class="el-icon-arrow-right"></i>
            </el-col>
            <el-col :span="20">
              <el-row v-for="(item2,j) in item1.children" :key="j">
                <el-col :span="4">
                  <el-tag @close="deleRight(scope.row,item2.id)" closable type="success">{{item2.authName}}</el-tag>
                  <i class="el-icon-arrow-right"></i>
                </el-col>
                <el-col :span="20">
                  <el-tag @close="deleRight(scope.row,item3.id)" closable type="warning" v-for="(item3,t) in item2.children"
                    :key="t">{{item3.authName}}</el-tag>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
          <span v-if="scope.row.children.length === 0">未分配权限</span>
        </template>
      </el-table-column>
      <el-table-column type="index" label="#" width="150">
      </el-table-column>
      <el-table-column prop="roleName" label="角色名称" width="200">
      </el-table-column>
      <el-table-column prop="roleDesc" label="角色描述" width="200">
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" @click="showEditUserDia(scope.row)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" @click="showDeleUserMsgBox(scope.row.id)">删除</el-button>
          <el-button type="warning" icon="el-icon-setting" @click="showSetRightDia(scope.row)">分配权限</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 修改权限对话框 -->
    <el-dialog title="修改权限" :visible.sync="dialogFormVisibleRight">
      <!-- 树形结构 -->
      <el-tree
      ref="tree"
      :data="treeList"
      show-checkbox
      node-key="id"
      default-expand-all
      :default-checked-keys="arrcheck"
      :props="defaultProps">
      </el-tree>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisibleRight = false">取 消</el-button>
        <el-button type="primary" @click="setRoleRight()">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 对话框，添加角色 -->
    <el-dialog title="添加角色" @close="addRoleDialogClosed" :visible.sync="dialogFormVisibleAdd">
      <el-form :model="roleForm" :rules="addRoleFormRules">
        <el-form-item label="角色名称" prop="roleName" label-width="100px">
          <el-input v-model="roleForm.roleName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" label-width="100px">
          <el-input v-model="roleForm.roleDesc" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisibleAdd = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 对话框，修改角色 -->
    <el-dialog title="修改角色" :visible.sync="dialogFormVisibleEdit">
      <el-form :model="editRoleForm" :rules="editRoleFormRules">
        <el-form-item label="角色名称" prop="roleName" label-width="100px">
          <el-input v-model="editRoleForm.roleName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" label-width="100px">
          <el-input v-model="editRoleForm.roleDesc" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisibleEdit = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </div>
    </el-dialog>
  </el-card>
</template>

<script>
export default {
  data () {
    return {
      roleList: [],
      dialogFormVisibleRight: false,
      // 树型结构的数据
      treeList: [],
      defaultProps: {
        label: 'authName',
        children: 'children'
      },
      arrcheck: [],
      // 当前即将分配角色的id
      currRoleId: -1,
      dialogFormVisibleAdd: false,
      dialogFormVisibleEdit: false,
      // 添加角色表单的验证规则对象
      addRoleFormRules: {
        roleName: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 添加角色数据表单
      roleForm: {
        roleName: '',
        roleDesc: ''
      },
      // 添加分类表单的验证规则对象
      editRoleFormRules: {
        roleName: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 修改角色数据表单
      editRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      // 修改角色id
      editRoleId: 0
    }
  },
  created () {
    this.getRoleList()
  },
  methods: {
    // 修改权限 - 发送请求
    async setRoleRight (roleId) {
      // roles/:roleId/rights  roleId 当前要修改权限的角色id
      // rids 树形节点中  所有全选和半选的label的id []
      // el-tree标签的js方法  el-tree.get
      // 1.给要操作的dom元素 设置ref属性值 input ref="txt"
      // 2.this.$refs.ref属性值.js方法名() this.$refs.txt.foucs()

      // 获取全选的id的数组arr1 getCheckedKeys()
      let arr1 = this.$refs.tree.getCheckedKeys()
      // 获取半选的id的数组arr2 getHalfCheckedKeys()
      let arr2 = this.$refs.tree.getHalfCheckedKeys()
      // arr 拿到半选和全选状态下的id 以‘,’相隔的数组
      let arr = arr1 + ',' + arr2
      const res = await this.$http.post(`roles/${this.currRoleId}/rights`, {rids: arr})
      if (res.data.meta.status !== 200) {
        return this.$message.error('分配权限失败！')
      }
      this.$message.success('分配权限成功！')
      this.getRoleList()
      this.dialogFormVisibleRight = false
    },
    // 修改/分配 权限 - 打开对话框
    async showSetRightDia (role) {
      // 给currRoleId赋值，获取当前角色的id
      this.currRoleId = role.id
      // 获取树形钢结构的数据
      const res = await this.$http.get('rights/tree')
      // console.log(res.data)
      this.treeList = res.data.data

      // 获取当前角色role 的权限
      let arrtemp2 = []
      role.children.forEach(item1 => {
        // arrtemp2.push(item1.id)
        item1.children.forEach(item2 => {
          // arrtemp2.push(item2.id)
          item2.children.forEach(item3 => {
            arrtemp2.push(item3.id)
          })
        })
      })
      this.arrcheck = arrtemp2
      this.dialogFormVisibleRight = true
    },
    // 取消权限
    async deleRight (role, rightId) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        // roles/:roleId/rights/:rightId
        const res = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
        // console.log(res.data)
        // 删除成功 返回200和该角色剩下的角色
        if (res.data.meta.status === 200) {
          role.children = res.data.data
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    // 获取用户权限
    async getRoleList () {
      const res = await this.$http.get('roles')
      // console.log(res.data)
      this.roleList = res.data.data
    },
    // 点击分类按钮,打开添加角色对话框
    showAddRoleDia () {
      this.dialogFormVisibleAdd = true
    },
    // 添加角色
    async addRole () {
      const {data: res} = await this.$http.post('roles', this.roleForm)
      if (res.meta.status !== 201) {
        return this.$message.error('添加角色失败！')
      }
      this.$message.success('添加角色成功！')
      this.dialogFormVisibleAdd = false
      this.getRoleList()
    },
    // 监听对话框的关闭事件,重置表单数据
    addRoleDialogClosed () {
      this.roleForm = {}
    },
    // 点击分类按钮,打开编辑角色对话框
    showEditUserDia (role) {
      this.editRoleForm.roleName = role.roleName
      this.editRoleForm.roleDesc = role.roleDesc
      this.editRoleId = role.id
      console.log(role)
      this.dialogFormVisibleEdit = true
    },
    // 修改角色
    async editRole () {
      const {data: res} = await this.$http.put(`roles/${this.editRoleId}`, this.editRoleForm)
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('修改角色失败！')
      }
      this.$message.success('修改角色成功！')
      this.dialogFormVisibleEdit = false
      this.getRoleList()
    },
    // 点击分类按钮,打开删除分类对话框
    showDeleUserMsgBox (roleId) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        // 发送删除请求 id:用户id
        const res = await this.$http.delete(`roles/${roleId}`)
        // console.log(res)
        if (res.data.meta.status !== 200) {
          return this.$message.error('删除角色失败！')
        }
        this.$message.success('删除角色成功！')
        this.getRoleList()
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    }
  }
}
</script>

<style>
  .addRolebtn {
    margin-top: 20px;
  }
</style>
