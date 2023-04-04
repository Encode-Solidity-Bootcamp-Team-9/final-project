import { Module } from '@nestjs/common';
import {AppService} from "../app.service";
import { ArbTriggerService } from './arb-trigger.service';
import {ConfigModule} from "@nestjs/config";
import { ArbTriggerController } from './arb-trigger.controller';
import {ChainProviderService} from "../chain-provider/chain-provider.service";
import {ContractsProviderService} from "../contracts-provider/contracts-provider.service";
import {PriceCalculation} from "./price-calculation-provider.service";

@Module({
  providers: [ChainProviderService, ArbTriggerService, ContractsProviderService, PriceCalculation],
  imports: [ConfigModule],
  controllers: [ArbTriggerController]
})
export class ArbTriggerModule {}
