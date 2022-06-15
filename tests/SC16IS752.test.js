/* global describe, it, beforeEach, afterEach */
const { expect } = require('chai')
const mock = require('mock-require')
const path = require('path')

let calls = {}
let dummyRead

const mockReadWriter = {
  readByteSync: () => { calls.readByteSync = 'called'; return dummyRead },
  writeByteSync: (address, register, value) => {
    calls.writeByteSync = { address, register, value }
  },
  closeSync: () => { calls.closeSync = 'called' }
}
const mockI2cBus = {
  openSync: () => {
    calls.openSync = 'called'
    return mockReadWriter
  }
}

describe('the SC16IS752 class', () => {
  let SC16IS752
  let extendedGpio
  beforeEach(() => {
    mock('i2c-bus', mockI2cBus)
    delete require.cache[path.join(__dirname, '../SC16IS752.js')]
    SC16IS752 = require('../SC16IS752')
    calls = {}
    extendedGpio = new SC16IS752()
  })
  afterEach(() => {
    mock.stop('i2c-bus')
  })
  describe('on instantiation', () => {
    it('should set the ioDir register to 0x0A', () => {
      expect(extendedGpio.ioDir).to.equal(0x0A)
    })
    it('should set the ioState register to 0x0B', () => {
      expect(extendedGpio.ioState).to.equal(0x0B)
    })
    it('should set the dirMask to 0000-0000', () => {
      expect(extendedGpio.dirMask).to.equal(0x00)
    })
    it('should call writeByteSync to store the dirMask in the ioDir register', () => {
      expect('writeByteSync' in calls).to.equal(true)
    })
  })
  describe('shen setOut(n) is called', () => {
    it('should set the dirMask bit at position n should be set to 1', () => {
      extendedGpio.setOut(5)
      expect(extendedGpio.dirMask).to.equal(32) // 0010-0000
    })
  })
  describe('when setIn(n) is called', () => {
    it('should set the dirMask bit at position n should be set to 0', () => {
      extendedGpio.setOut(5)
      expect(extendedGpio.dirMask).to.equal(32)
      extendedGpio.setIn(5)
      expect(extendedGpio.dirMask).to.equal(0)
    })
  })
  describe('when readByte() is called', () => {
    it('should return the byte value of the ioState', () => {
      dummyRead = 10
      const result = extendedGpio.readByte()
      expect(result).to.equal(10)
    })
  })
  describe('when getBit(n) is called', () => {
    it('should return the bit value of the ioState at the selected bit position', () => {
      dummyRead = 10 // 0000-1010
      const bit3 = extendedGpio.getBit(3)
      const bit2 = extendedGpio.getBit(2)
      const bit1 = extendedGpio.getBit(1)
      const bit0 = extendedGpio.getBit(0)
      expect(bit3).to.equal(true)
      expect(bit2).to.equal(false)
      expect(bit1).to.equal(true)
      expect(bit0).to.equal(false)
    })
  })
  describe('when setBit(bit) is called', () => {
    describe('when the GPIO pin is an output', () => {
      it('should write 1 to a GPIO pin', () => {
        dummyRead = 0
        extendedGpio.setOut(5)
        extendedGpio.setBit(5)
        expect(calls.writeByteSync.value).to.equal(32) // set bit 5 = 32
      })
      it('should write 1 to a GPIO pin in addition to other values', () => {
        dummyRead = 0x0A
        extendedGpio.setOut(5)
        extendedGpio.setBit(5)
        expect(calls.writeByteSync.value).to.equal(42) // set bit 5 = 32
      })
    })
    describe('when the GPIO pin is an input', () => {
      it('should not change the state of the GPIO pin', () => {
        dummyRead = 0x0A
        extendedGpio.setIn(5) // bit 5 is an inpt
        extendedGpio.setBit(5) // set bit 5
        expect(calls.writeByteSync.value).to.equal(0x0A) // set bit 5 = 32
      })
    })
  })
  describe('when unsetBit() is called', () => {
    it('should write a 0 to a gpio pin', () => {
      dummyRead = 0x0A
      extendedGpio.setOut(5) // set an output pin
      extendedGpio.setBit(5) // turn it on
      expect(calls.writeByteSync.value).to.equal(42)
      extendedGpio.unsetBit(5) // turn off gpio5
      expect(calls.writeByteSync.value).to.equal(0x0A)
    })
  })
  describe('when setAllIn() is called', () => {
    it('should set all the pins to 0', () => {
      extendedGpio.setOut(5) // set something that needs to be reset
      expect(extendedGpio.dirMask).to.equal(32)
      extendedGpio.setAllIn()
      expect(extendedGpio.dirMask).to.equal(0)
    })
  })
  describe('when setAllOut() is called', () => {
    it('should set all the pins to 1', () => {
      extendedGpio.setOut(5)
      expect(extendedGpio.dirMask).to.equal(32) // set something that needs to be reset
      extendedGpio.setAllOut()
      expect(extendedGpio.dirMask).to.equal(255)
    })
  })
  describe('when writeByte(value) is called', () => {
    it('should set the bits in the dirMask to match the value', () => {
      extendedGpio.writeByte(0xAA) // 1010-1010
      expect((extendedGpio.dirMask).toString(2)).to.equal('10101010')
    })
  })
})
