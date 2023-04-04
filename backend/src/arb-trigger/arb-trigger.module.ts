import {Module} from '@nestjs/common';
import {AppService} from "../app.service";
import {ArbTriggerService} from './arb-trigger.service';
import {ConfigModule} from "@nestjs/config";
import {ArbTriggerController} from './arb-trigger.controller';
import {ChainProviderService} from "../chain-provider/chain-provider.service";
import {ContractsProviderService} from "../contracts-provider/contracts-provider.service";
import {PriceCalculation} from "./price-calculation-provider.service";
import {ChooseStrategy} from "./choose-strategy-provider.service";
import {DetermineProfitability} from "./profitability-provider.service";
import {StrategyExecution} from "./execution-provider.service";
import {Results} from "./results-provider.service";

@Module({
  providers: [ChainProviderService, ArbTriggerService, ContractsProviderService, PriceCalculation, ChooseStrategy, DetermineProfitability, StrategyExecution, Results],
  imports: [ConfigModule],
  controllers: [ArbTriggerController]
})
export class ArbTriggerModule {
}
