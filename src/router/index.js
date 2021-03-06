import Vue from 'vue'
import Router from 'vue-router'
// import Login from '../components/login/login'
import Login from '@/components/login/login'
import Home from '@/components/home/home'
import Users from '@/components/users/users'
import Right from '@/components/rights/right'
import Role from '@/components/rights/role'
import Cate from '@/components/goods/cate'


Vue.use(Router)

export default new Router({
  routes: [{
      name: 'login',
      path: '/login',
      component: Login
    },
    {
      name: 'home',
      path: '/',
      component: Home,
      children: [{
        name: 'users',
        path: 'users',
        component: Users
      }, {
        name: 'right',
        path: '/right',
        component: Right
      },{
        name: 'role',
        path: '/role',
        component: Role
      },
      {
        name: 'cate',
        path: '/cate',
        component: Cate
      }]
    }
  ]
})
