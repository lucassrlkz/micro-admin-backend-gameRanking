import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

const logger = new Logger('Main');

async function bootstrap() {
    const user = process.env.RABBITMQ_USER;
    const password = process.env.RABBITMQ_PASSWORD;
    const host = process.env.RABBITMQ_HOST;
    const vhost = process.env.RABBITMQ_VIRTUAL_HOST;
    const rmqProtocol = process.env.RABBITMQ_PROTOCOL;
    const rmq_queue = process.env.RABBITMQ_QUEUE;

    const url = `${rmqProtocol}${user}:${password}@${host}${vhost}`;

    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
        AppModule,
        {
            transport: Transport.RMQ,
            options: {
                urls: [url],
                noAck: false, // confirmação para o rmq de que a mensagem foi recebida e processada
                queue: rmq_queue,
            },
        },
    );

    await app.listen();
    logger.log('Microservice is listening');
}
void bootstrap();
