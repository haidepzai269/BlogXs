require('dotenv').config();
const client = require('./utils/elasticsearchClient');

async function test() {
  try {
    const result = await client.search({
      index: 'posts',
      body: {
        query: {
          match_all: {}
        }
      }
    });

    console.log(JSON.stringify(result, null, 2)); // In toàn bộ response để kiểm tra
  } catch (error) {
    console.error('❌ Elasticsearch error:');
    if (error.meta?.body?.error) {
      console.error(JSON.stringify(error.meta.body.error, null, 2));
    } else {
      console.error(error);
    }
  }
}

test();
