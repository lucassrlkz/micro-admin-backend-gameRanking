import { Controller, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import type { Category } from './interfaces/categories/category.interface';

const ackErrors: string[] = ['E11000'];

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  private logger = new Logger(AppController.name);

  @EventPattern('criar-categoria') // ouvir um evento da fila do RMQ da api-gateway. Evento assíncrono. client.emit() vai chamar este evento
  async createCategory(
    @Payload() category: Category,
    @Ctx() rawContext: unknown, // espera um unknow e depois converte para o tipo RmqContext
  ) {
    const context: RmqContext = rawContext as RmqContext;
    const channel = context.getChannelRef(); // pega o canal de mensagem do RMQ atraves do contexto
    const originalMsg = context.getMessage(); // pega a mensagem do RMQ

    this.logger.log(`categoria: ${JSON.stringify(category)}`);

    try {
      await this.appService.createCategory(category);
      await channel.ack(originalMsg); // devolve a confirmação para o RMQ
    } catch (error) {
      // faz o log do erro no sistema
      // procura o tipo do erro no array AckErrors.
      // E11000: erro de chave duplicada no banco de dados, pode excluir msg da fila do RMQ
      const message =
        error instanceof Error ? JSON.stringify(error.message) : String(error);
      this.logger.error(`error: ${JSON.stringify(message)}`);

      ackErrors.map(async (ackError) => {
        if (message.includes(ackError)) {
          await channel.ack(originalMsg);
        }
      });
    }
  }

  @MessagePattern('consultar-categorias') // comunicação req/reply da fila do RMQ
  async findCategories(@Payload() _id: string) {
    if (_id) {
      return await this.appService.findCategoryById(_id);
    } else {
      return await this.appService.findAllCategories();
    }
  }
}
