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
