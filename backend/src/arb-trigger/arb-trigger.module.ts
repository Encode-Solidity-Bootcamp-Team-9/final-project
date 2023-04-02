import { Module } from '@nestjs/common';
import {AppService} from "../app.service";
import {ChainProviderService} from "./chain-provider.service";
import { ArbTriggerService } from './arb-trigger.service';
import {ConfigModule} from "@nestjs/config";
import { ArbTriggerController } from './arb-trigger.controller';

@Module({
  providers: [ChainProviderService, ArbTriggerService],
  imports: [ConfigModule],
  controllers: [ArbTriggerController]
})
export class ArbTriggerModule {}
