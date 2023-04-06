import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ContractsProviderService } from './contracts-provider/contracts-provider.service';
import { ChainProviderService } from './chain-provider/chain-provider.service';
import * as Joi from 'joi';
import { PriceCalculation } from './arb-trigger/price-calculation-provider.service';
import { InfoController } from './info/info.controller';
import { InfoService } from './info/info.service';
import { ArbTriggerService } from './arb-trigger/arb-trigger.service';
import { ChooseStrategy } from './arb-trigger/choose-strategy-provider.service';
import { DetermineProfitability } from './arb-trigger/profitability-provider.service';
import { StrategyExecution } from './arb-trigger/execution-provider.service';
import { Results } from './arb-trigger/results-provider.service';
import { ArbTriggerController } from './arb-trigger/arb-trigger.controller';
import { DbModule } from './db/db.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      //make sure that all the required env variables are set
      validationSchema: Joi.object({
        WALLET_ADDRESS: Joi.string().required(),
        WALLET_PRIVATE_KEY: Joi.string().required(),
        ALCHEMY_API_KEY: Joi.string().required(),
      }),
    }),
    // expose static files (front-end)
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'front'),
      exclude: ['/api*', '/arb-trigger*', '/info*'],
    }),
    DbModule,
  ],
  controllers: [AppController, ArbTriggerController, InfoController],
  providers: [
    AppService,
    InfoService,
    ChainProviderService,
    ArbTriggerService,
    ContractsProviderService,
    PriceCalculation,
    ChooseStrategy,
    DetermineProfitability,
    StrategyExecution,
    Results,
  ],
})
export class AppModule {}
