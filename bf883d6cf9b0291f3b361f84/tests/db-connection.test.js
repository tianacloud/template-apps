import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('connection metadata failure can recover; successful client and dynamic auth provider stay shared', async () => {
  const originalWindow = globalThis.window;
  const failure = new Error('temporary connection metadata failure');
  let connectionCalls = 0, clientCreations = 0, token = 'first', seenTokens = [];
  const auth = {getAccessToken: async () => token};
  globalThis.window = {tiana: {auth, connection: async () => {
    connectionCalls++;
    if (connectionCalls === 1) throw failure;
    return {sql_api: 'hrana-v3', origin: 'https://connection.invalid'};
  }}};
  // Replace only the SDK transport boundary; run the actual application db module.
  globalThis.__dbConnectionTransport = options => {
    clientCreations++;
    assert.equal(options.auth, auth);
    return async () => {
      seenTokens.push(await options.auth.getAccessToken());
      return {ok: true, json: async () => ({results: [{type: 'ok', response: {
        type: 'execute', result: {cols: [{name: 'value'}], rows: [[{value: 'ok'}]]}
      }}]})};
    };
  };
  try {
    const source = (await readFile(new URL('../src/db.js', import.meta.url), 'utf8'))
      .replace("import {createTianaFetch} from '@tianacloud/serverless';",
        'const createTianaFetch = globalThis.__dbConnectionTransport;');
    const {sql} = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
    await assert.rejects(sql('SELECT 1'), error => error === failure);
    assert.equal(connectionCalls, 1);
    assert.equal(clientCreations, 0);
    assert.deepEqual(await Promise.all([sql('SELECT 1'), sql('SELECT 1')]),
      [[{value: 'ok'}], [{value: 'ok'}]]);
    assert.equal(connectionCalls, 2);
    assert.equal(clientCreations, 1);
    token = 'renewed';
    await sql('SELECT 1');
    assert.equal(connectionCalls, 2);
    assert.equal(clientCreations, 1);
    assert.deepEqual(seenTokens, ['first', 'first', 'renewed']);
  } finally {
    globalThis.window = originalWindow;
    delete globalThis.__dbConnectionTransport;
  }
});
