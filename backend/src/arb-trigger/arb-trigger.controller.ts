import { Controller, Get, Post } from '@nestjs/common';
import { ArbTriggerService } from './arb-trigger.service';
import { Dex } from '../config';

@Controller('arb-trigger')
export class ArbTriggerController {
  constructor(private readonly arbTriggerService: ArbTriggerService) {}

  @Get('trigger')
  async triggerArbitrage() {
    return this.arbTriggerService.arbitrage(Dex.UNISWAP);
  }
}
