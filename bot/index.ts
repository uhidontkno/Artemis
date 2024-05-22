import { Client } from 'seyfert';

const client = new Client();

// This will start the connection with the gateway and load commands, events, components and langs
client.start();