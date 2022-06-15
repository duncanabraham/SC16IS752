const i2cDevice = require('./i2cDevice')

class SC16IS752 {
  constructor(options = { i2cAddress: 0x48 }) {
    super(options)
    this.ioDir = 0x0A
    this.ioState = 0x0B
    this.dirMask = 0x00
    this.writeByte(this.dirMask)
  }

  setIn(bit) {
    const setBit = Math.pow(2, bit)
    this.dirMask = this.dirMask & setBit
      ? this.dirMask - setBit
      : this.dirMask
    this._write(this.ioDir, this.dirMask)
  }

  setAllIn() {
    this.dirMask = 0
    this._write(this.ioDir, this.dirMask)
  }

  setOut(bit) {
    const setBit = Math.pow(2, bit)
    this.dirMask = !(this.dirMask & setBit)
      ? this.dirMask + setBit
      : this.dirMask
    this._write(this.ioDir, this.dirMask)
  }

  setAllOut() {
    this.dirMask = 255
    this._write(this.ioDir, this.dirMask)
  }

  getBit(bit) {
    const value = this.readByte()
    const setBit = Math.pow(2, bit)
    return (value & setBit) === setBit
  }

  setBit(bit) {
    const setValue = Math.pow(2, bit)
    const value = this.readByte()
    this._write(this.ioState, value | setValue & this.dirMask)
  }

  unsetBit(bit) {
    const setBit = Math.pow(2, bit)
    const value = this.readByte()
    const setValue = value & setBit === value ? value - setBit : value
    this._write(this.ioState, setValue)
  }

  writeByte(value) {
    this.dirMask = value
    this._write(this.ioDir, this.dirMask)
  }

  readByte() {
    return this._read(this.ioState)
  }
}

module.exports = SC16IS752
