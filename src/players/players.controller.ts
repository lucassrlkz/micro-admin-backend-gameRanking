import { Controller, Logger } from '@nestjs/common';
import { PlayersService } from './players.service';
import {
    EventPattern,
    RmqContext,
    MessagePattern,
    Payload,
    Ctx,
} from '@nestjs/microservices';
import type { Player } from '../interfaces/player.interface';
import { errorInstance } from '../common/ErrorInstance';

const ackErrors: string[] = ['E11000'];

@Controller('players')
export class PlayersController {
    logger = new Logger(PlayersController.name);
    constructor(private readonly playersService: PlayersService) {}

    @EventPattern('criar-jogador')
    async createPlayer(@Payload() player: Player, @Ctx() rawContext: unknown) {
        const Context: RmqContext = rawContext as RmqContext;
        const channel = Context.getChannelRef();
        const originalMsg = Context.getMessage();
        try {
            this.logger.log(`jogador: ${JSON.stringify(player)}`);
            await this.playersService.createPlayer(player);
            await channel.ack(originalMsg);
        } catch (error) {
            const message = errorInstance(error);

            this.logger.log(
                `error (criar-jogador): ${JSON.stringify(message)}`,
            );
            const filterAckError = ackErrors.filter((ackError) =>
                message.includes(ackError),
            );

            if (filterAckError.length > 0) {
                await channel.ack(originalMsg);
            }
        }
    }

    @MessagePattern('consultar-jogadores')
    async FindPlayers(@Payload() _id: string, @Ctx() context: RmqContext) {
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();
        try {
            if (_id) {
                return await this.playersService.findPlayerById(_id);
            } else {
                return await this.playersService.FindAllPlayers();
            }
        } finally {
            await channel.ack(originalMsg);
        }
    }

    @EventPattern('atualizar-jogador')
    async updatePlayer(
        @Payload() dataPayload: any,
        @Ctx() rawContext: unknown,
    ) {
        const context: RmqContext = rawContext as RmqContext;
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();
        try {
            console.log(`data: ${JSON.stringify(dataPayload)}`);
            const _id: string = dataPayload.id;
            const player: Player = dataPayload.updatePlayer;

            await this.playersService.updatePlayer(_id, player);
            await channel.ack(originalMsg);
        } catch (error) {
            const message = errorInstance(error);
            const filterAckError = ackErrors.filter((ackError) =>
                message.includes(ackError),
            );

            if (filterAckError.length > 0) {
                await channel.ack(originalMsg);
            }
        }
    }

    @EventPattern('deletar-jogador')
    async deletePlayer(@Payload() _id: string, @Ctx() rawContext: unknown) {
        const context: RmqContext = rawContext as RmqContext;
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();
        try {
            await this.playersService.deletePlayer(_id);
            await channel.ack(originalMsg);
        } catch (error) {
            const message = errorInstance(error);
            const filterAckError = ackErrors.filter((ackError) =>
                message.includes(ackError),
            );

            if (filterAckError.length > 0) {
                await channel.ack(originalMsg);
            }
        }
    }
}
