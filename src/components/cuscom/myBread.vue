<template>
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>{{level1}}</el-breadcrumb-item>
    <el-breadcrumb-item>{{level1}}</el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script>
export default {
  name: 'my-bread',
  // props 值字符串数组，用法和data数据的一样，来源于使用组件时 传的值
  // props 中的数据也是该组件的属性 <child-a :msg="abc">
  props: [
    'level1',
    'level2'
  ]
}
</script>

<style>
</style>
