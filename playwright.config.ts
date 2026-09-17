import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests',timeout:45000,fullyParallel:false,workers:1,use:{baseURL:process.env.TEST_BASE_URL??'http://localhost:3000',headless:true,trace:'retain-on-failure',screenshot:'only-on-failure'},reporter:[['list']],projects:[{name:'chromium',use:{browserName:'chromium',viewport:{width:1440,height:1000}}}]});
