import { test } from 'node:test'
import assert from 'node:assert/strict'
import { countSlots, fillTemplate } from './template.ts'
import { matchesCoordinate } from './gate.ts'

const TEMPLATE = '__.____, -_.____'

test('an empty entry shows the bare template, waiting on the first slot', () => {
  assert.deepEqual(fillTemplate(TEMPLATE, ''), { text: TEMPLATE, next: 0 })
})

test('digits fill slots in order and skip the printed characters', () => {
  assert.deepEqual(fillTemplate(TEMPLATE, '520'), {
    text: '52.0___, -_.____',
    next: 4
  })
  assert.deepEqual(fillTemplate(TEMPLATE, '520083'), {
    text: '52.0083, -_.____',
    next: 10
  })
})

test('a full entry has no next slot and reads as the coordinate', () => {
  const { text, next } = fillTemplate(TEMPLATE, '52008330856')
  assert.equal(text, '52.0083, -3.0856')
  assert.equal(next, null)
  assert.equal(matchesCoordinate(text, '52.0083, -3.0856'), true)
})

test('counts the digits a template takes', () => {
  assert.equal(countSlots(TEMPLATE), 11)
})

const DMS = '__°__′__″N\n_°__′__″W'

test('a two-line DMS template fills across the line break', () => {
  assert.equal(countSlots(DMS), 11)
  assert.deepEqual(fillTemplate(DMS, '520030'), {
    text: '52°00′30″N\n_°__′__″W',
    next: 11
  })
  const { text, next } = fillTemplate(DMS, '52003030508')
  assert.equal(text, '52°00′30″N\n3°05′08″W')
  assert.equal(next, null)
  assert.equal(matchesCoordinate(text, '52.0083, -3.0856'), true)
})
