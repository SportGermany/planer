(function(){
    if (localStorage.getItem('seeded3')) return; localStorage.setItem('seeded3','1');
    const pad=n=>String(n).padStart(2,'0'), d0=new Date(), iso=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()), add=n=>iso(new Date(d0.getTime()+n*864e5)), td=iso(d0);
    localStorage.setItem('schulkalender-bayern-v1', JSON.stringify({v:2,settings:{periods:[{s:'08:00',e:'08:45'},{s:'08:45',e:'09:30'},{s:'09:45',e:'10:30'},{s:'10:30',e:'11:15'},{s:'11:30',e:'12:15'},{s:'12:15',e:'13:00'}],ab:{on:false}},
      subjects:[{id:'m',name:'Mathematik',short:'M',color:'#2b5fd9'},{id:'e',name:'Englisch',short:'E',color:'#c0303f'},{id:'d',name:'Deutsch',short:'D',color:'#2f7d57'},{id:'s',name:'Sport',short:'Sp',color:'#b4532a'}],
      timetable:[1,2,3,4,5].flatMap(d=>[{day:d,period:1,subject:'m',room:'204'},{day:d,period:2,subject:'e',room:'112'},{day:d,period:3,subject:'d'},{day:d,period:4,subject:'d'},{day:d,period:5,subject:'s',room:'Halle'}]),
      events:[{id:'x1',type:'sa',subject:'m',date:add(3),prep:5},{id:'x2',type:'ka',subject:'e',date:add(6),prep:3}], homework:[{id:'h1',subject:'e',text:'Vokabeln Unit 2',due:td,done:false},{id:'h2',subject:'d',text:'Aufsatz Einleitung',due:add(1),done:false}],
      study:[{id:'l1',subject:'m',date:td,min:35}], camps:[]}));
    localStorage.setItem('rodelmobility.v1', JSON.stringify({sessions:[{date:add(-1),type:'daily',block:'A',sec:240}],tests:[{date:add(-7),cm:-3}],next:1,dur:40}));
    const morning=[]; for(let i=10;i>=1;i--) morning.push({date:add(-i),hr:52,rmssd:70+(i%3)*4}); morning.push({date:td,hr:54,rmssd:68});
    localStorage.setItem('pulsplan.v1', JSON.stringify({settings:{start:add(-14)},entries:[{id:'p1',date:td,time:'18:30',type:'Langsames Atmen',dur:10},{id:'p2',date:add(1),time:'07:15',type:'Morgenmessung',dur:3}],sessions:[],morning,tests:[],weeks:[],checked:{}}));
    localStorage.setItem('denkpause.v1', JSON.stringify({sessions:{[td]:{count:2,minutes:4,items:[]}},dailyGoal:5}));
    localStorage.setItem('zweiminutenbibel_v2', JSON.stringify({streak:4,lastDate:add(-1)}));
    localStorage.setItem('wk_onboarded','true');
    localStorage.setItem('wk_weather_cache', JSON.stringify({fetchedAt:Date.now(),data:{current:{temp:12,code:2},days:[0,1,2,3,4,5,6].map(i=>({date:add(i),code:[2,61,3,0,1,80,2][i],tmax:14-i%3,tmin:6,pop:[10,70,20,0,0,60,10][i]}))}}));
    localStorage.setItem('sg-shared-calendar-v1', JSON.stringify({v:1,events:[{id:'c1',title:'Rodeltraining',date:td,time:'16:00',end:'17:30',app:'Training',created:1,changed:1},{id:'c2',title:'Zahnarzt',date:add(1),time:'14:30',end:'15:15',app:'Kalender',created:1,changed:1}]}));
    localStorage.setItem('sg-shared-tasks-v1', JSON.stringify({v:1,events:[{id:'t1',title:'Trikot waschen',due:td,done:false,app:'Kalender',created:1,changed:1}]}));
})();