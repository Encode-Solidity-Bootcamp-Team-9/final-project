"use strict";(self.webpackChunkapp=self.webpackChunkapp||[]).push([[97],{97:(O,_,e)=>{e.r(_),e.d(_,{AnalyticsPage:()=>f});var h=e(5861),d=e(6895),v=e(433),a=e(6114),c=e(1600),n=e(7844),u=e(2155),g=e(2858),l=e(2064),t=e(8256),p=e(2494);function P(o,r){if(1&o&&(t.TgZ(0,"div"),t._uU(1),t.ALo(2,"toETH"),t._UZ(3,"br"),t._uU(4),t.ALo(5,"toETH"),t.qZA()),2&o){const i=t.oxw();t.xp6(1),t.hij(" TVL invested: ",t.lcZ(2,2,i.arbitrage.totalStaked)," NAS"),t.xp6(3),t.hij(" Total Profits: ",t.lcZ(5,4,i.arbitrage.totalProfits)," NAS ")}}function A(o,r){if(1&o&&(t.TgZ(0,"div"),t._uU(1),t.ALo(2,"toETH"),t._UZ(3,"br"),t._uU(4),t.ALo(5,"toETH"),t.qZA()),2&o){const i=t.oxw();t.xp6(1),t.hij(" NAS: ",t.lcZ(2,2,i.poolsState.uniNAS),""),t.xp6(3),t.hij(" FETH: ",t.lcZ(5,4,i.poolsState.uniFETH)," ")}}function T(o,r){if(1&o&&(t.TgZ(0,"div"),t._uU(1),t.ALo(2,"toETH"),t._UZ(3,"br"),t._uU(4),t.ALo(5,"toETH"),t.qZA()),2&o){const i=t.oxw();t.xp6(1),t.hij(" NAS: ",t.lcZ(2,2,i.poolsState.sushiNAS),""),t.xp6(3),t.hij(" FETH: ",t.lcZ(5,4,i.poolsState.sushiFETH)," ")}}function Z(o,r){if(1&o&&(t.TgZ(0,"div",12)(1,"ion-card",6)(2,"ion-card-header")(3,"ion-card-title"),t._uU(4),t.qZA()(),t.TgZ(5,"ion-card-content")(6,"div",13)(7,"div",14)(8,"div")(9,"div",15),t._uU(10,"Date:"),t.qZA(),t.TgZ(11,"div",16),t._uU(12),t.ALo(13,"date"),t.qZA()(),t.TgZ(14,"div")(15,"div",15),t._uU(16,"Funds used:"),t.qZA(),t.TgZ(17,"div",16),t._uU(18),t.ALo(19,"toETH"),t.TgZ(20,"em"),t._uU(21,"NAS"),t.qZA()()(),t.TgZ(22,"div")(23,"div",15),t._uU(24,"Fees generated:"),t.qZA(),t.TgZ(25,"div",16),t._uU(26),t.ALo(27,"toETH"),t.TgZ(28,"em"),t._uU(29,"NAS"),t.qZA()()(),t.TgZ(30,"div")(31,"div",15),t._uU(32,"Bought from:"),t.qZA(),t.TgZ(33,"div",16)(34,"em"),t._uU(35),t.qZA()()(),t.TgZ(36,"div")(37,"div",15),t._uU(38,"Sold to:"),t.qZA(),t.TgZ(39,"div",16)(40,"em"),t._uU(41),t.qZA()()()()()()()()),2&o){const i=r.$implicit;t.xp6(4),t.Oqu(i.hash),t.xp6(8),t.hij(" ",t.xi3(13,6,i.date,"dd/MM/yyyy HH:mm:ss")," "),t.xp6(6),t.hij(" ",t.lcZ(19,9,i.used)," "),t.xp6(8),t.hij(" ",t.lcZ(27,11,i.profits)," "),t.xp6(9),t.Oqu(i.pool0?"Sushiswap":"Uniswap"),t.xp6(6),t.Oqu(i.pool1?"Sushiswap":"Uniswap")}}let f=(()=>{class o{constructor(i){this.infoService=i,this.openState=["overview","history"],this.subs=[],this.totalProfits=(0,c.j)([{value:0,name:"Total Profits"},{value:0,name:"TVL Invested"}],[n.v1,n.v1]),this.poolUniBalance=(0,c.j)([{value:0,name:"NAS"},{value:0,name:"FETH"}],[n.v1,n.v1]),this.poolSushiBalance=(0,c.j)([{value:0,name:"NAS"},{value:0,name:"FETH"}],[n.v1,n.v1]),this.history=[]}get arbitrage(){return this.infoService.arbitrage}get poolsState(){return this.infoService.poolsState}ngOnInit(){this.infoService.getArbitrageInfo().then(i=>{this.updateArbitrage()}),this.infoService.getPoolsInfo().then(i=>{this.updatePools()}),this.subs.push(this.infoService.refresh.subscribe(()=>{this.updateArbitrage(),this.updatePools(),this.updateHistory()})),this.updateHistory()}updateHistory(){var i=this;return(0,h.Z)(function*(){i.history=yield i.infoService.getHistory()})()}updateArbitrage(){if(!this.arbitrage)return;const i=+Number(l.dF(this.arbitrage.totalProfits)).toFixed(2),s=+Number(l.dF(this.arbitrage.totalStaked)).toFixed(2);this.totalProfits=(0,c.j)([{value:i,name:"Profits Generated"},{value:s,name:"TVL Invested"}],[n.v1,n.v1])}updatePools(){if(!this.poolsState)return;const i=+Number(l.dF(this.poolsState.sushiNAS)).toFixed(2),s=+Number(l.dF(this.poolsState.sushiFETH)).toFixed(2);this.poolSushiBalance=(0,c.j)([{value:i,name:"NAS"},{value:s,name:"FETH"}],[n.v1,n.WI]);const m=+Number(l.dF(this.poolsState.uniNAS)).toFixed(2),y=+Number(l.dF(this.poolsState.uniFETH)).toFixed(2);this.poolUniBalance=(0,c.j)([{value:m,name:"NAS"},{value:y,name:"FETH"}],[n.v1,n.WI])}ngOnDestroy(){this.subs.forEach(i=>i.unsubscribe())}}return o.\u0275fac=function(i){return new(i||o)(t.Y36(p.C))},o.\u0275cmp=t.Xpm({type:o,selectors:[["app-analytics"]],standalone:!0,features:[t._Bn([{provide:u.ZM,useFactory:()=>({echarts:()=>e.e(1701).then(e.bind(e,1701))})}]),t.jDz],decls:37,vars:9,consts:[[1,"container"],[3,"multiple","value"],["value","overview","toggleIconSlot","start"],["slot","header"],["slot","content",1,"ion-padding"],[1,"overview"],[1,"chart"],[4,"ngIf"],["echarts","",1,"chart-container",3,"options"],["value","history","toggleIconSlot","start"],[1,"history"],["class","history-item",4,"ngFor","ngForOf"],[1,"history-item"],[1,"history-item-content"],[1,"stats"],[1,"title"],[1,"value"]],template:function(i,s){1&i&&(t.TgZ(0,"ion-content")(1,"div",0)(2,"ion-accordion-group",1)(3,"ion-accordion",2)(4,"ion-item",3)(5,"ion-label"),t._uU(6,"Overview"),t.qZA()(),t.TgZ(7,"div",4)(8,"div",5)(9,"ion-card",6)(10,"ion-card-header")(11,"ion-card-title"),t._uU(12,"TVL vs Profits Generated"),t.qZA()(),t.TgZ(13,"ion-card-content"),t.YNc(14,P,6,6,"div",7),t._UZ(15,"div",8),t.qZA()(),t.TgZ(16,"ion-card",6)(17,"ion-card-header")(18,"ion-card-title"),t._uU(19,"Uniswap Pool Balance"),t.qZA()(),t.TgZ(20,"ion-card-content"),t.YNc(21,A,6,6,"div",7),t._UZ(22,"div",8),t.qZA()(),t.TgZ(23,"ion-card",6)(24,"ion-card-header")(25,"ion-card-title"),t._uU(26,"Sushiswap Pool Balance"),t.qZA()(),t.TgZ(27,"ion-card-content"),t.YNc(28,T,6,6,"div",7),t._UZ(29,"div",8),t.qZA()()()()(),t.TgZ(30,"ion-accordion",9)(31,"ion-item",3)(32,"ion-label"),t._uU(33,"Arbitrage Transaction History"),t.qZA()(),t.TgZ(34,"div",4)(35,"div",10),t.YNc(36,Z,42,13,"div",11),t.qZA()()()()()()),2&i&&(t.xp6(2),t.Q6J("multiple",!0)("value",s.openState),t.xp6(12),t.Q6J("ngIf",s.arbitrage),t.xp6(1),t.Q6J("options",s.totalProfits),t.xp6(6),t.Q6J("ngIf",s.poolsState),t.xp6(1),t.Q6J("options",s.poolUniBalance),t.xp6(6),t.Q6J("ngIf",s.poolsState),t.xp6(1),t.Q6J("options",s.poolSushiBalance),t.xp6(7),t.Q6J("ngForOf",s.history))},dependencies:[a.Pc,a.We,a.eh,a.PM,a.FN,a.Zi,a.Dq,a.W2,a.Ie,a.Q$,d.ez,d.sg,d.O5,d.uU,v.u5,u.Ns,u._w,g.o],styles:[".overview[_ngcontent-%COMP%]{display:flex}.overview[_ngcontent-%COMP%]   ion-card[_ngcontent-%COMP%]{flex:1}.history[_ngcontent-%COMP%]   .history-item[_ngcontent-%COMP%]   .history-item-content[_ngcontent-%COMP%]{display:flex;justify-content:center}.history[_ngcontent-%COMP%]   .history-item[_ngcontent-%COMP%]   .history-item-content[_ngcontent-%COMP%]   .chart-container[_ngcontent-%COMP%]{min-height:150px;min-width:150px}.history[_ngcontent-%COMP%]   .history-item[_ngcontent-%COMP%]   .history-item-content[_ngcontent-%COMP%]   .stats[_ngcontent-%COMP%]{flex:1;display:flex;flex-direction:column;justify-content:center}.history[_ngcontent-%COMP%]   .history-item[_ngcontent-%COMP%]   .history-item-content[_ngcontent-%COMP%]   .stats[_ngcontent-%COMP%] > div[_ngcontent-%COMP%]{display:flex}.history[_ngcontent-%COMP%]   .history-item[_ngcontent-%COMP%]   .history-item-content[_ngcontent-%COMP%]   .stats[_ngcontent-%COMP%] > div[_ngcontent-%COMP%]   .title[_ngcontent-%COMP%]{flex:1;text-align:left}"]}),o})()}}]);