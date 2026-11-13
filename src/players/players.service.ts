import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Player } from '../interfaces/player.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { errorInstance } from '../common/ErrorInstance';

@Injectable()
export class PlayersService {
    constructor(
        @InjectModel('players') private readonly playerModel: Model<Player>,
    ) {}

    private readonly logger = new Logger(PlayersService.name);

    async createPlayer(player: Player): Promise<void> {
        try {
            const createdPlayer = new this.playerModel(player);
            await createdPlayer.save();
        } catch (error) {
            const message = errorInstance(error);

            this.logger.error(`error: ${JSON.stringify(message)}`);
            throw new RpcException(message);
        }
    }

    async FindAllPlayers(): Promise<Player[]> {
        try {
            return await this.playerModel.find().populate('category').exec();
        } catch (error) {
            const message = errorInstance(error);
            this.logger.error(`error: ${JSON.stringify(message)}`);
            throw new RpcException(message);
        }
    }

    async findPlayerById(_id: string): Promise<Player | null> {
        try {
            return await this.playerModel.findOne({ _id }).exec();
        } catch (error) {
            const message = errorInstance(error);
            this.logger.error(`error: ${JSON.stringify(message)}`);
            throw new RpcException(message);
        }
    }

    async updatePlayer(_id: string, player: Player): Promise<void> {
        try {
            await this.playerModel
                .findOneAndUpdate({ _id }, { $set: player })
                .exec();
        } catch (error) {
            const message = errorInstance(error);
            this.logger.error(`error: ${JSON.stringify(message)}`);
            throw new RpcException(message);
        }
    }

    async deletePlayer(_id: string): Promise<void> {
        try {
            await this.playerModel.deleteOne({ _id }).exec();
        } catch (error) {
            const message = errorInstance(error);
            this.logger.error(`error: ${JSON.stringify(message)}`);
            throw new RpcException(message);
        }
    }
}
