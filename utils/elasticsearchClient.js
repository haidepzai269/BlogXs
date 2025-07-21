// utils/elasticsearchClient.js
const { Client } = require('@elastic/elasticsearch');
require('dotenv').config();

const client = new Client({
  node: process.env.ELASTICSEARCH_URL,
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME,
    password: process.env.ELASTICSEARCH_PASSWORD,
  }
});

module.exports = client;

