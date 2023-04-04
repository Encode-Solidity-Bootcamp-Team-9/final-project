import {Controller, Get, Param} from '@nestjs/common';
import {UserInfo} from "./dtos/UserInfo";
import {InfoService} from "./info.service";
import {Arbitrage, ArbitrageTx} from "./dtos/Arbitrage";
import {PoolsState} from "./dtos/Pools";

@Controller('info')
export class InfoController {

  constructor(private readonly infoService: InfoService) {
  }

  @Get('user/:address')
  getUser(@Param('address') address: string): Promise<UserInfo> {
    return this.infoService.getUser(address);
  }

  @Get('contract')
  getArbitrageInfo(): Promise<Arbitrage> {
    return this.infoService.getArbitrageInfo();
  }

  @Get('pools')
  getPoolsInfo(): Promise<PoolsState> {
    return this.infoService.getPoolsInfo();
  }

  @Get('arbitrage-transactions')
  getArbiTxs(): Promise<ArbitrageTx[]> {
    return this.infoService.getArbitrageTxs();
  }

}
