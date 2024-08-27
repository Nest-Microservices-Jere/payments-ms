import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  NATS_SERVERS: string[];
  STRIPE_API_KEY: string;
  ENDPOINT_SECRET: string;
}

const envSchema: joi.ObjectSchema = joi
  .object({
    PORT: joi.number().default(3000),
    NATS_SERVERS: joi.array().required(),
    STRIPE_API_KEY: joi.string().required(),
    ENDPOINT_SECRET: joi.string().required(),
  })
  .unknown(true);

const { error, value } = envSchema.validate({
  ...process.env,
  NATS_SERVERS: process.env.NATS_SERVERS?.split(','),
  STRIPE_API_KEY: process.env.STRIPE_API_KEY,
  ENDPOINT_SECRET: process.env.ENDPOINT_SECRET,
});

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envsVars: EnvVars = value;

export const envs = {
  PORT: envsVars.PORT,
  NATS_SERVERS: envsVars.NATS_SERVERS,
  STRIPE_API_KEY: envsVars.STRIPE_API_KEY,
  ENDPOINT_SECRET: envsVars.ENDPOINT_SECRET,
};
