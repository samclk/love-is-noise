import { test } from 'node:test'
import assert from 'node:assert/strict'
import { matchesCoordinate, matchesRiddle, parseCoordinate } from './gate.ts'

const LONDON = '51.5074,-0.1278'

test('accepts the coordinate in the forms people paste or type', () => {
  for (const guess of [
    '51.5074,-0.1278',
    '51.5074, -0.1278',
    '51.5074 -0.1278',
    ' 51.5074 ,  -0.1278 ',
    '51.5074° N, 0.1278° W',
    '51.5074 N 0.1278 W',
    '51.5074n 0.1278w',
    '+51.5074, -0.1278'
  ]) {
    assert.equal(matchesCoordinate(guess, LONDON), true, guess)
  }
})

test('rounds the guess to the precision of the stored answer', () => {
  assert.equal(matchesCoordinate('51.50741, -0.12779', LONDON), true)
  assert.equal(matchesCoordinate('51.51, -0.13', LONDON), false)
  assert.equal(matchesCoordinate('51.5075, -0.1278', LONDON), false)
})

test('rejects the wrong hemisphere and swapped order', () => {
  assert.equal(matchesCoordinate('51.5074, 0.1278', LONDON), false)
  assert.equal(matchesCoordinate('51.5074 S, 0.1278 W', LONDON), false)
  assert.equal(matchesCoordinate('-0.1278, 51.5074', LONDON), false)
})

test('rejects anything that is not exactly two numbers', () => {
  for (const guess of ['', '51.5074', '0000000', 'abc', '1, 2, 3']) {
    assert.equal(matchesCoordinate(guess, LONDON), false, guess)
  }
})

test('the 0, 0 placeholder matches zeroes in any spelling', () => {
  for (const guess of ['0 0', '0,0', '0.0000, 0.0000', '-0, 0']) {
    assert.equal(matchesCoordinate(guess, '0, 0'), true, guess)
  }
  assert.equal(matchesCoordinate('1, 0', '0, 0'), false)
})

test('a malformed stored answer never matches', () => {
  assert.equal(parseCoordinate('0000000'), null)
  assert.equal(matchesCoordinate('0', '0000000'), false)
})

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

const BRECON = '52.0083, -3.0856'

test('accepts degrees, minutes and seconds in the forms people type', () => {
  for (const guess of [
    '52°00′30″N 3°05′08″W',
    `52°00'30"N 3°05'08"W`,
    `52°00'30"N, 3°05'08"W`,
    '52 00 30 N 3 05 08 W',
    '52 0 30 n 3 5 8 w',
    '52 0 30, -3 5 8',
    '52 0 30 -3 5 8',
    '52° 0.5′ N 3° 5.1333′ W'
  ]) {
    assert.equal(matchesCoordinate(guess, BRECON), true, guess)
  }
})

test('still accepts the decimal forms of the same place', () => {
  for (const guess of [
    '52.0083, -3.0856',
    '52.008333, -3.085556',
    '52.0083 N 3.0856 W'
  ]) {
    assert.equal(matchesCoordinate(guess, BRECON), true, guess)
  }
})

test('rejects a wrong second, the wrong hemisphere and out-of-range minutes', () => {
  for (const guess of [
    '52°00′31″N 3°05′08″W',
    '52°00′30″N 3°05′08″E',
    '52°60′30″N 3°05′08″W',
    '52 00 30 N'
  ]) {
    assert.equal(matchesCoordinate(guess, BRECON), false, guess)
  }
})
