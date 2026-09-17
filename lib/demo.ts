import type { World, Entry } from './types';
const stamp='2025-01-01T12:00:00Z';
export const demoWorlds:World[]=[
{id:'demo-survival',user_id:'demo',name:"Zach’s Survival World",description:'One block at a time. A little home, a lot of adventure, and a world full of stories.',edition:'Bedrock',game_mode:'Survival',seed:'-6537256334104833826',started_on:'2021-07-02',status:'Active',version:'1.21',cover_path:null,cover_url:'/images/world.jpg',created_at:stamp,updated_at:stamp},
{id:'demo-creative',user_id:'demo',name:'Somewhere in the mountains',description:'A quiet place to build something extraordinary.',edition:'Java',game_mode:'Creative',seed:'',started_on:'2023-11-18',status:'Active',version:'1.21',cover_path:null,cover_url:'/images/mountains.jpg',created_at:stamp,updated_at:stamp},
{id:'demo-lost',user_id:'demo',name:'The world we grew up in',description:'The save is gone. The late nights, crooked first house, and memories are still here.',edition:'Java',game_mode:'Survival',seed:'',started_on:'2016-06-12',status:'Lost',version:'1.12',cover_path:null,cover_url:'/images/valley.jpg',created_at:stamp,updated_at:stamp}];
const raw:[string,string,string,Entry['entry_type'],number,string,number,number,number,string][]=[
['The Beginning','2021-07-02','A new world. A wooden pickaxe. Absolutely no idea how much this place would come to mean to us.','Memory',1,'Spawn',128,64,-240,'/images/valley.jpg'],
['First Diamonds','2021-07-08','Just one more block… and there they were. Our first diamonds, after a very long night underground.','Discovery',14,'The old mineshaft',214,-54,-312,''],
['Our First Real Base','2021-08-14','Finally, a place to call home. Built the roof three times, but the view makes it all worth it.','Build',86,'Riverside home',342,78,-186,'/images/world.jpg'],
['Ender Dragon','2021-10-03','We finally did it. Weeks of preparation, a few very close calls, and one unforgettable adventure.','Milestone',187,'The End',0,64,0,''],
['Nether Hub Complete','2022-02-19','Every tunnel leads somewhere we love. The whole world feels a little more connected now.','Build',340,'Nether hub',43,72,-23,'']];
export const demoEntries:Entry[]=raw.map(([title,date,description,type,day,location,x,y,z,img],i)=>({id:`demo-entry-${i}`,world_id:'demo-survival',title,description,entry_type:type,occurred_on:date,minecraft_day:day,location_name:location,x,y,z,created_at:stamp,updated_at:stamp,images:img?[{id:`demo-image-${i}`,entry_id:`demo-entry-${i}`,world_id:'demo-survival',storage_path:'',alt:title,url:img,created_at:stamp}]:[]}));
