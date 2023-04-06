"use strict";(self.webpackChunkapp=self.webpackChunkapp||[]).push([[678],{678:(v,s,e)=>{e.r(s),e.d(s,{HomePage:()=>C});var _=e(6895),u=e(433),a=e(6114),g=e(2155),l=e(1600),r=e(7844),P=e(2858),d=e(2064),t=e(8256),h=e(2494),m=e(7551);function O(o,c){if(1&o&&(t.TgZ(0,"div"),t._uU(1),t.qZA()),2&o){const n=t.oxw();t.xp6(1),t.hij(" ",n.arbitrage.totalReturn," % ")}}function M(o,c){if(1&o&&(t.TgZ(0,"div"),t._uU(1),t.ALo(2,"toETH"),t.TgZ(3,"em"),t._uU(4,"NAS"),t.qZA()()),2&o){const n=t.oxw();t.xp6(1),t.hij(" ",t.lcZ(2,1,n.arbitrage.totalStaked)," ")}}function p(o,c){if(1&o&&(t.TgZ(0,"div"),t._uU(1),t.ALo(2,"toETH"),t.TgZ(3,"em"),t._uU(4,"NAS"),t.qZA()()),2&o){const n=t.oxw();t.xp6(1),t.hij(" ",t.lcZ(2,1,n.arbitrage.totalProfits)," ")}}let C=(()=>{class o{constructor(n,i){this.infoService=n,this.router=i,this.subs=[],this.chartOptions=(0,l.j)([{value:0,name:"Profits Generated"},{value:0,name:"TVL Invested"}],[r.v1,r.v1])}get arbitrage(){return this.infoService.arbitrage}ngOnInit(){this.infoService.getArbitrageInfo().then(n=>{this.updateChart()}),this.subs.push(this.infoService.refresh.subscribe(()=>{this.updateChart()}))}updateChart(){if(!this.arbitrage)return;const n=+Number(d.dF(this.arbitrage.totalProfits)).toFixed(2),i=+Number(d.dF(this.arbitrage.totalStaked)).toFixed(2);this.chartOptions=(0,l.j)([{value:n,name:"Total profits"},{value:i,name:"Total investment"}],[r.v1,r.v1])}ngOnDestroy(){this.subs.forEach(n=>n.unsubscribe())}goTo(n){this.router.navigate([n])}}return o.\u0275fac=function(n){return new(n||o)(t.Y36(h.C),t.Y36(m.F0))},o.\u0275cmp=t.Xpm({type:o,selectors:[["app-home"]],standalone:!0,features:[t._Bn([{provide:g.ZM,useFactory:()=>({echarts:()=>e.e(1701).then(e.bind(e,1701))})}]),t.jDz],decls:65,vars:4,consts:[[1,"content"],["id","home",1,"section"],[1,"title"],[1,"block"],[1,"block-content"],[1,"name"],[1,"subtext"],[1,"image"],[1,"chart"],["echarts","",1,"chart-container",3,"options"],[1,"stats"],[4,"ngIf"],[1,"buttons"],["fill","clear",3,"click"]],template:function(n,i){1&n&&(t.TgZ(0,"ion-content")(1,"div",0)(2,"div",1)(3,"div",2),t._uU(4,"Hello and welcome to"),t.qZA(),t.TgZ(5,"div",3)(6,"div",4)(7,"p",5),t._uU(8,"Team 9 "),t.TgZ(9,"em"),t._uU(10,"Arbitrage"),t.qZA(),t._uU(11," DAO"),t.qZA(),t.TgZ(12,"p",6),t._uU(13," Your place to learn about arbitrage and enjoy some of the profits ! "),t.qZA(),t.TgZ(14,"p"),t._uU(15," We use "),t.TgZ(16,"em"),t._uU(17,"AI"),t.qZA(),t._uU(18," to extract the best "),t.TgZ(19,"em"),t._uU(20,"arbitrage"),t.qZA(),t._uU(21," opportunity and share the profits with "),t.TgZ(22,"em"),t._uU(23,"you"),t.qZA(),t._uU(24,"! Using a set of algorithms that listen to arbitrage opportunities between "),t.TgZ(25,"em"),t._uU(26,"Uniswap"),t.qZA(),t._uU(27," and "),t.TgZ(28,"em"),t._uU(29,"Sushiswap"),t.qZA(),t._uU(30," pools and run a smartcontract to make the pools balanced "),t.TgZ(31,"em"),t._uU(32,"as everything should be"),t.qZA(),t._uU(33,". "),t.qZA(),t.TgZ(34,"div",7)(35,"ion-card",8)(36,"ion-card-header")(37,"ion-card-title"),t._uU(38,"Lifetime Investment and Profits"),t.qZA()(),t.TgZ(39,"ion-card-content"),t._UZ(40,"div",9),t.qZA()(),t.TgZ(41,"div",10)(42,"ion-card")(43,"ion-card-header")(44,"ion-card-title"),t._uU(45,"Lifetime Return on Investment"),t.qZA()(),t.TgZ(46,"ion-card-content"),t.YNc(47,O,2,1,"div",11),t.qZA()(),t.TgZ(48,"ion-card")(49,"ion-card-header")(50,"ion-card-title"),t._uU(51,"Total Value Locked"),t.qZA()(),t.TgZ(52,"ion-card-content"),t.YNc(53,M,5,3,"div",11),t.qZA()(),t.TgZ(54,"ion-card")(55,"ion-card-header")(56,"ion-card-title"),t._uU(57,"Total Profits Generated"),t.qZA()(),t.TgZ(58,"ion-card-content"),t.YNc(59,p,5,3,"div",11),t.qZA()()()(),t.TgZ(60,"div",12)(61,"ion-button",13),t.NdJ("click",function(){return i.goTo("about")}),t._uU(62,"How it works ?"),t.qZA(),t.TgZ(63,"ion-button",13),t.NdJ("click",function(){return i.goTo("invest")}),t._uU(64,"Invest"),t.qZA()()()()()()()),2&n&&(t.xp6(40),t.Q6J("options",i.chartOptions),t.xp6(7),t.Q6J("ngIf",i.arbitrage),t.xp6(6),t.Q6J("ngIf",i.arbitrage),t.xp6(6),t.Q6J("ngIf",i.arbitrage))},dependencies:[a.Pc,a.YG,a.PM,a.FN,a.Zi,a.Dq,a.W2,_.ez,_.O5,u.u5,g.Ns,g._w,P.o],styles:[".content[_ngcontent-%COMP%]{display:flex;flex-direction:column;align-items:center;color:var(--ion-color-white-shade);text-align:justify}.content[_ngcontent-%COMP%]   em[_ngcontent-%COMP%]{color:var(--ion-color-primary);font-style:normal}.content[_ngcontent-%COMP%]   q[_ngcontent-%COMP%]{color:var(--ion-color-primary);font-style:italic}.content[_ngcontent-%COMP%]   .section[_ngcontent-%COMP%]{padding:8px 10%;min-height:100vh;width:100%;display:flex;flex-direction:column;justify-content:center}.content[_ngcontent-%COMP%]   .section[_ngcontent-%COMP%]   .title[_ngcontent-%COMP%]{color:var(--ion-color-white);font-size:20px}.content[_ngcontent-%COMP%]   .section[_ngcontent-%COMP%]   .block[_ngcontent-%COMP%]{display:flex}.content[_ngcontent-%COMP%]   .section[_ngcontent-%COMP%]   .block[_ngcontent-%COMP%]   .sub-title[_ngcontent-%COMP%]{color:var(--ion-color-white);font-size:18px;margin-right:8px}.content[_ngcontent-%COMP%]   .section[_ngcontent-%COMP%]   .block[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{padding:8px;margin:0;font-size:18px;line-height:24px}#home[_ngcontent-%COMP%]   .name[_ngcontent-%COMP%]{color:var(--ion-color-white);font-size:60px;line-height:normal;font-variant:bold}#home[_ngcontent-%COMP%]   .subtext[_ngcontent-%COMP%]{font-size:30px;line-height:normal}@media (max-width: 576px){#home[_ngcontent-%COMP%]   .name[_ngcontent-%COMP%]{font-size:40px}#home[_ngcontent-%COMP%]   .subtext[_ngcontent-%COMP%]{font-size:25px}}#home[_ngcontent-%COMP%]   .image[_ngcontent-%COMP%]{display:flex;margin-top:32px}#home[_ngcontent-%COMP%]   .image[_ngcontent-%COMP%]   .chart[_ngcontent-%COMP%]{flex:1}#home[_ngcontent-%COMP%]   .image[_ngcontent-%COMP%]   .chart[_ngcontent-%COMP%]   .chart-container[_ngcontent-%COMP%]{min-width:300px;min-height:300px}#home[_ngcontent-%COMP%]   .image[_ngcontent-%COMP%]   .stats[_ngcontent-%COMP%]{display:flex;flex-direction:column;flex:1}#home[_ngcontent-%COMP%]   .image[_ngcontent-%COMP%]   .stats[_ngcontent-%COMP%] > *[_ngcontent-%COMP%]{flex:1}#home[_ngcontent-%COMP%]   .buttons[_ngcontent-%COMP%]{display:flex;justify-content:center}#home[_ngcontent-%COMP%]   .buttons[_ngcontent-%COMP%] > *[_ngcontent-%COMP%]{flex:1}ion-card[_ngcontent-%COMP%]{--background: var(--ion-background-color-lighter);--color: var(--ion-color-white)}ion-card[_ngcontent-%COMP%]   ion-card-title[_ngcontent-%COMP%]{text-align:center;--color: var(--ion-color-white);font-size:16px}ion-card[_ngcontent-%COMP%]   ion-card-content[_ngcontent-%COMP%]{text-align:center}"]}),o})()}}]);