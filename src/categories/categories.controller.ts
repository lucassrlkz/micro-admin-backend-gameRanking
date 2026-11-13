import { Controller, Logger } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import {
    Ctx,
    EventPattern,
    MessagePattern,
    Payload,
    RmqContext,
} from '@nestjs/microservices';
import type {
    Category,
    UpdateCategory,
} from '../interfaces/category.interface';

const ackErrors: string[] = ['E11000'];

@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) {}

    private logger = new Logger(CategoriesController.name);

    @EventPattern('criar-categoria') // ouvir um evento da fila do RMQ da api-gateway. Evento assíncrono. client.emit() vai chamar este evento
    async createCategory(
        @Payload() category: Category,
        @Ctx() rawContext: unknown, // espera um unknow e depois converte para o tipo RmqContext
    ) {
        const context: RmqContext = rawContext as RmqContext;
        const channel = context.getChannelRef(); // pega o canal de mensagem do RMQ atraves do contexto
        const originalMsg = context.getMessage(); // pega a mensagem do RMQ

        this.logger.log(`category: ${JSON.stringify(category)}`);

        try {
            await this.categoriesService.createCategory(category);
            await channel.ack(originalMsg); // devolve a confirmação para o RMQ
        } catch (error) {
            // faz o log do erro no sistema
            // procura o tipo do erro no array AckErrors.
            // E11000: erro de chave duplicada no banco de dados, pode excluir msg da fila do RMQ
            const message =
                error instanceof Error
                    ? JSON.stringify(error.message)
                    : String(error);
            this.logger.error(
                `error-create-category: ${JSON.stringify(message)}`,
            );

            const filterAckErros = ackErrors.filter((ackError) =>
                message.includes(ackError),
            );

            if (filterAckErros) {
                await channel.ack(originalMsg); // envia de volta o ack do RMQ
            }
        }
    }

    @MessagePattern('consultar-categorias') // comunicação req/reply da fila do RMQ
    async findCategories(@Payload() _id: string, @Ctx() context: RmqContext) {
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();
        try {
            if (_id) {
                return await this.categoriesService.findCategoryById(_id);
            } else {
                return await this.categoriesService.findAllCategories();
            }
        } finally {
            await channel.ack(originalMsg);
        }
    }

    @EventPattern('atualizar-categoria')
    async updateCategory(
        @Payload() dataPayload: any,
        @Ctx() rawContext: unknown,
    ) {
        const context: RmqContext = rawContext as RmqContext;
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();
        this.logger.log(`data_payload: ${JSON.stringify(dataPayload)}`);

        try {
            const _id: string = dataPayload.id;
            const updateCategory: UpdateCategory = dataPayload.updateCategory;

            await this.categoriesService.updateCategory(_id, updateCategory);
            await channel.ack(originalMsg);
        } catch (error) {
            const message =
                error instanceof Error
                    ? JSON.stringify(error.message)
                    : String(error);
            this.logger.error(
                `error-update-category: ${JSON.stringify(message)}`,
            );
            const filterAckErros = ackErrors.filter((ackError) =>
                message.includes(ackError),
            );

            if (filterAckErros) {
                await channel.ack(originalMsg);
            }
        }
    }
}
