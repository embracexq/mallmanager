<template>
    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <!-- 1.面包屑 -->
      <my-bread level1="商品管理" level2="商品分类"></my-bread>
      <el-row class="seachRow">
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <tree-table class="tree-table" :data="cateList" :columns="columns" :expand-type="false"
      :selection-type="false" show-index border show-row-hover index-text="#">
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" style="color: lightgreen;" v-if="scope.row.cat_deleted === false"></i>
          <i class="el-icon-error" style="color: red;" v-else></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0" size="mini">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditCateDialog(scope.row)">编辑</el-button>
          <el-button type="danger" size="mini" icon="el-icon-delete" @click="showDeleCateDialog(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>

      <!-- 分页区域 -->
      <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="querInfo.pagenum"
      :page-sizes="[3, 5, 10, 15]"
      :page-size="querInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>

    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类" :visible.sync="addCateDialogVisible"
     width="50%" @close="addCateDialogClosed">
      <!-- 添加分类表单 -->
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef">
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类:">
          <!-- options:用来指定数据源 -->
          <!-- props:用来指定配置对象 -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChanged"
            clearable change-on-select></el-cascader>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 编辑分类对话框 -->
    <el-dialog title="修改分类" :visible.sync="editCateDialogVisible">
      <!-- 编辑分类表单 -->
      <el-form :model="editCateForm" :rules="editCateFormRules"
      ref="editCateFormRef">
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </div>
    </el-dialog>

    </el-card>

</template>

<script>
export default {
  data () {
    return {
      // 商品分类的数据列表,默认为空
      cateList: [],
      // 查询商品分类条件
      querInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      total: 0,
      // 为table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 表示,将当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用模板名称
          template: 'isok'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],
      // 控制添加分类对话框
      addCateDialogVisible: false,
      // 添加分类表单的数据对象
      addCateForm: {
        // 将要添加分类的名称
        cate_name: '',
        // 父级分类的id
        cat_pid: 0,
        // 分类等级,默认要添加的是一级分类
        cat_level: 0
      },
      // 添加分类表单的验证规则对象
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 父级分类列表
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 选中的父级分类id数组
      selectedKeys: [],
      // 控制编辑分类对话框
      editCateDialogVisible: false,
      // 修改分类表单的验证规则对象
      editCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      editCateForm: {
        cat_name: '',
        cat_id: -1
      }
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取商品分类数组
    async getCateList () {
      const {data: res} = await this.$http.get('categories', {
        params: this.querInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败！')
      }
      // 把数据列表赋值给cateList
      this.cateList = res.data.result
      // 为总数据条数赋值
      this.total = res.data.total
    },
    // 监听 pagesize 改变
    handleSizeChange (newSize) {
      this.querInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听 pagenum 改变
    handleCurrentChange (newPage) {
      this.querInfo.pagenum = newPage
      this.getCateList()
    },
    // 点击分类按钮,打开添加分类对话框
    showAddCateDialog () {
      // 先获取父级分类的数据列表
      this.getParentCateList()
      // 再展示父级分类的对话框
      this.addCateDialogVisible = true
    },
    // 获取父级分类的数据列表
    async getParentCateList () {
      const {data: res} = await this.$http.get('categories', {params: {
        type: 2
      }})
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类失败')
      }
      this.parentCateList = res.data
    },
    // 选择项发生变化触发这个函数
    parentCateChanged () {
      // console.log(this.selectedKeys)
      // 如果 selectedKeys 数组中的 length 大于0, 证明选中的分级分类
      // 反之,说明没有选中任何父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类的id
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        // 父级分类的id
        this.addCateForm.cat_pid = 0
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = 0
      }
    },
    // 添加新分类
    addCate () {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const {data: res} = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败！')
        }
        this.$message.success('添加分类成功！')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 监听对话框的关闭事件,重置表单数据
    addCateDialogClosed () {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      // 父级分类的id
      this.addCateForm.cat_pid = 0
      // 为当前分类的等级赋值
      this.addCateForm.cat_level = 0
    },
    // 点击分类按钮,打开编辑分类对话框
    showEditCateDialog (cate) {
      // console.log(cate)
      this.editCateForm.cat_name = cate.cat_name
      this.editCateForm.cat_id = cate.cat_id
      this.editCateDialogVisible = true
    },
    // 修改商品分类
    async editCate () {
      const {data: res} = await this.$http.put(`categories/${this.editCateForm.cat_id}`, {cat_name: this.editCateForm.cat_name})
      if (res.meta.status !== 200) {
        return this.$message.error('修改商品分类失败！')
      }
      this.$message.success('修改商品分类成功！')
      this.getCateList()
      this.editCateDialogVisible = false
    },
    // 点击分类按钮,打开删除分类对话框
    showDeleCateDialog (catId) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        // 发送删除请求 id:用户id
        const res = await this.$http.delete(`categories/${catId}`)
        // console.log(res)
        if (res.data.meta.status !== 200) {
          return this.$message.error('删除商品分类失败！')
        }
        this.$message.success('删除商品分类成功！')
        this.getCateList()
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
  .box-card {
    height: 100%;
  }
  .seachRow {
    margin-top: 20px;
  }
  .tree-table {
    margin-top: 20px;
  }
  .el-cascader {
    width: 100%;
  }
</style>
