// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import ProductTabs from '@/components/ProductTabs.vue';
import HistoryPage from '@/components/HistoryPage.vue';
import CouponPage from '@/components/CouponPage.vue';
import ShowOrder from '../components/ShowOrder.vue'
import MenuManagement from '../components/MenuManagement.vue'
import ChargePage from '../components/ChargePage.vue'
import PermissionManagement from '../components/PermissionManagement.vue';
import CouponDistributePage from '../components/CouponDistributePage.vue';
import CustomerService from '../components/CustomerService.vue';

const routes = [
  { 
    path: '/', 
    name: 'ProductTabs', 
    component: ProductTabs,
    props: route => ({
      userId: route.query.userId,
      userToken: route.query.userToken
    })
  },
  { 
    path: '/history', 
    name: 'HistoryPage', 
    component: HistoryPage,
    props: route => ({
      userId: route.query.userId,
      userToken: route.query.userToken
    })
  },
  {
    path: '/coupons',
    name: 'CouponPage',
    component: CouponPage,
    props: route => ({
      userId: route.query.userId,
      userToken: route.query.userToken
    })
  },
  {
    path: '/show-orders',
    name: 'ShowOrder',
    component: ShowOrder,
    props: route => ({
      userId: route.query.userId,
      userToken: route.query.userToken
    })
  },
  {
    path: '/menu-management',
    name: 'MenuManagement',
    component: MenuManagement,
    props: route => ({
      userId: route.query.userId,
      userToken: route.query.userToken
    })
  },
  {
    path: '/charge-page',
    name: 'ChargePage',
    component: ChargePage,
    // props: route => ({
    //   userId: route.query.userId,
    //   userToken: route.query.userToken
    // })
  },
  {
    path: '/permission-management',
    name: 'PermissionManagement',
    component: PermissionManagement,
    props: route => ({
      userId: route.query.userId,
      userToken: route.query.userToken
    })
  },
  {
    path: '/coupon-distribution-page',
    name: 'CouponDistributionPage',
    component: CouponDistributePage,
    props: route => ({
      userId: route.query.userId,
      userToken: route.query.userToken
    })
  },
  {
    path: '/customer-service',
    name: 'CustomerService',
    component: CustomerService,
    props: route => ({
      userId: route.query.userId,
      userToken: route.query.userToken
    })
  }
];

const router = createRouter({
  history: createWebHistory(), // Use createWebHistory for history mode
  routes
});

export default router;