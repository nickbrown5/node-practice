import Fastify from 'fastify';
import { createClient } from 'redis';

const redisClient = createClient({ url: 'redis://localhost:6379' });
redisClient.on('error', (err) => console.log('Redis Client Error', err));
await redisClient.connect();

const app = Fastify({
    logger: true
});

app.route({
    method: 'GET',
    url: '/',
    schema: {
        querystring: {
            type: 'object',
            properties: {
                name: { type: 'string' }
            },
            required: ['name']
        },
        response: {
            200: {
                type: 'object',
                properties: {
                    message: { type: 'string' }
                }
            }
        }
    },
    handler: async (request, reply) => {
        const keys = await redisClient.keys('*');
        let people = {};
        for (const key of keys) {
            const value = await redisClient.get(key);
            people[key] = value;
        }
        return { message: `${JSON.stringify(people)}` };
    }
});

app.route({
    method: 'POST',
    url: '/save',
    schema: {
        body: {
            type: 'object',
            properties: {
                firstName: { type: 'string' },
                lastName: { type: 'string' }
            },
            required: ['firstName', 'lastName']
        },
        response: {
            200: {
                type: 'object',
                properties: {
                    message: { type: 'string' }
                }
            }
        }
    },
    handler: async (request, reply) => {
        const { firstName, lastName } = request.body;
        await redisClient.set(firstName, lastName);
        return { message: `Saved ${firstName} ${lastName}` };
    }
});

app.route({
    method: 'PUT',
    url: '/update',
    schema: {
        body: {
            type: 'object',
            properties: {
                firstName: { type: 'string' },
                lastName: { type: 'string' }
            },
            required: ['firstName', 'lastName']
        },
        response: {
            200: {
                type: 'object',
                properties: {
                    message: { type: 'string' }
                }
            }
        }
    },
    handler: async (request, reply) => {
        if (await redisClient.exists(request.body.firstName) === 0) {
            return reply.status(404).send({ message: 'Person not found' });
        }
        const { firstName, lastName } = request.body;
        await redisClient.set(firstName, lastName);
        return { message: `Updated ${firstName} ${lastName}` };
    }
});

app.route({
    method: 'DELETE',
    url: '/remove',
    schema: {
        body: {
            type: 'object',
            properties: {
                firstName: { type: 'string' },
                lastName: { type: 'string' }
            },
            required: ['firstName', 'lastName']
        },
        response: {
            200: {
                type: 'object',
                properties: {
                    message: { type: 'string' }
                }
            }
        }
    },
    handler: async (request, reply) => {
        if (await redisClient.exists(request.body.firstName) === 0) {
            return reply.status(404).send({ message: 'Person not found' });
        }
        await redisClient.del(request.body.firstName);
        return { message: `Deleted ${request.body.firstName} ${request.body.lastName}` };
    }
});

try {
    await app.listen({ port: 3000 });
} catch (err) {
    app.log.error(err);
    process.exit(1);
}
