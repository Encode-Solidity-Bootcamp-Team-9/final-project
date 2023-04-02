import { Module } from '@nestjs/common';
import {AppService} from "../app.service";
import {ChainProviderService} from "./chain-provider.service";
import { ArbTriggerService } from './arb-trigger.service';
import {ConfigModule} from "@nestjs/config";

@Module({
  providers: [ChainProviderService, ArbTriggerService],
  imports: [ConfigModule]
})
export class ArbTriggerModule {}
