import { test } from 'node:test'
import assert from 'node:assert/strict'
import { heightAt } from './height.ts'

test('the ground under the door is level at zero', () => {
  for (const [x, z] of [
    [0, 0],
    [0.6, 0.2],
    [-0.6, -0.2],
    [0, 1.4]
  ]) {
    assert.ok(Math.abs(heightAt(x, z)) < 1e-9, `${x}, ${z}`)
  }
})

test('nothing between the camera and the door rises above its base', () => {
  for (let x = -2; x <= 2; x += 0.5) {
    for (let z = 0.5; z <= 30; z += 0.5) {
      assert.ok(heightAt(x, z) <= 0, `${x}, ${z}`)
    }
  }
})

test('soft hills rise far behind and not in front', () => {
  let tallest = -Infinity
  for (let x = -200; x <= 200; x += 5) {
    tallest = Math.max(tallest, heightAt(x, -320))
  }
  assert.ok(tallest > 8 && tallest < 25)
  assert.ok(heightAt(0, 30) < 0)
})
