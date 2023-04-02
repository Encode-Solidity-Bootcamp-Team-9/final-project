import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {ArbTriggerModule} from './arb-trigger/arb-trigger.module';
import {ConfigModule} from "@nestjs/config";
import * as Joi from 'joi';

@Module({
  imports: [ArbTriggerModule, ConfigModule.forRoot({
    //make sure that all the required env variables are set
    validationSchema: Joi.object({
      WALLET_ADDRESS: Joi.string().required(),
      WALLET_PRIVATE_KEY: Joi.string().required(),
      ALCHEMY_API_KEY: Joi.string().required(),
      PRICE_DIFF_PERCENTAGE: Joi.number().required()
    }),
  })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
}
