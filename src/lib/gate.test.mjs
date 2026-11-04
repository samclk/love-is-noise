import { test } from 'node:test'
import assert from 'node:assert/strict'
import { matchesRiddle } from './gate.ts'

test('the riddle ignores case, spacing, punctuation and a leading "the"', () => {
  for (const guess of [
    'black sheep',
    'Black Sheep',
    'BLACK  SHEEP ',
    'blacksheep',
    'the black sheep',
    'The Black Sheep.'
  ]) {
    assert.equal(matchesRiddle(guess, 'black sheep'), true, guess)
  }
})

test('the riddle rejects other answers, and an empty answer', () => {
  assert.equal(matchesRiddle('white sheep', 'black sheep'), false)
  assert.equal(matchesRiddle('', 'black sheep'), false)
  assert.equal(matchesRiddle('', ''), false)
})

test('the riddle ignores accents on either side', () => {
  assert.equal(matchesRiddle('noel', 'Noël'), true)
  assert.equal(matchesRiddle('Noël', 'noel'), true)
})

test('a riddle answer with no letters or digits never matches', () => {
  assert.equal(matchesRiddle('!!', '!!'), false)
})
