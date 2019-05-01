import { spawn } from 'child_process'
import test from 'tape-promise/tape'
import sinon from 'sinon'
import { join } from 'path'
import rimraf from 'rimraf'
import LndGrpc from '../src'
import { spawnLnd, killLnd, grpcOptions } from './helpers/lnd'
import { waitForFile } from '../src/utils'

let lndProcess
let grpc

test('genSeed:setup', async t => {
  lndProcess = await spawnLnd({ cleanLndDir: true })
  t.end()
})

test('genSeed:test', async t => {
  t.plan(2)
  try {
    grpc = new LndGrpc(grpcOptions)
    await grpc.connect()
    const res = await grpc.services.WalletUnlocker.genSeed()
    t.equal(grpc.state, 'locked', 'should be in locked state')
    t.equal(res.cipherSeedMnemonic.length, 24, 'should return 24 word seed')
  } catch (e) {
    console.error(e)
    t.fail(e)
  }
})

test('genSeed:teardown', async t => {
  if (grpc.can('disconnect')) {
    await grpc.disconnect()
  }
  await killLnd(lndProcess, { cleanLndDir: true })
  t.end()
})
