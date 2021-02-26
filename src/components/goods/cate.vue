<template>
    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <!-- 1.面包屑 -->
      <my-bread level1="商品管理" level2="商品分类"></my-bread>
      <el-row class="seachRow">
        <el-col>
          <el-button type="primary">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <tree-table :data="cateList" :columns="columns" :expand-type="false"
      :selection-type="false" show-index border show-row-hover index-text="#">
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" style="color: lightgreen;" v-if="scope.row.cat_deleted === false"></i>
          <i class="el-icon-error" style="color: red;" v-else></i>
        </template>
      </tree-table>

      <!-- 分页区域 -->
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
        }
      ]
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
</style>
