// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import ProductTabs from '@/components/ProductTabs.vue';
import HistoryPage from '@/components/HistoryPage.vue';
import CouponPage from '@/components/CouponPage.vue';

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
  }
];

const router = createRouter({
  history: createWebHistory(), // Use createWebHistory for history mode
  routes
});

export default router;