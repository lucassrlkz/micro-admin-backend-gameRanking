import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CategorySchema } from './interfaces/categories/category.schema';
import { PlayerSchema } from './interfaces/players/player.schema';

const createMongoOptions = (configService: ConfigService) => {
  const mongoUri = configService.get<string>('DB_CONNECTION');
  if (!mongoUri) {
    throw new Error('DB_CONNECTION is not configured');
  }

  return { uri: mongoUri };
};

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        createMongoOptions(configService),
    }),
    MongooseModule.forFeature([
      { name: 'categories', schema: CategorySchema },
      { name: 'players', schema: PlayerSchema },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
