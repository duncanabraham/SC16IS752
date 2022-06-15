/**
 * I couldn't find any code showing how to use the 8 GPIO pins on the sb-components serial expansion hat:
 * https://shop.sb-components.co.uk/products/serial-expansion-hat-for-raspberry-pi
 *
 * So after reading through the datasheet I found the required registers and thought I'd write a quick class
 * to allow access to the additional GPIOs.
 */

const i2c = require('i2c-bus')

/**
 * Class wrapper for the SC16IS752 Dual UART chip with integrated 8 port GPIO
 * The GPIO pins are accessed via I2C with a default address of 0X48 although
 * this can be changed on some/all boards by soldering over one or more address
 * bridges to cause the address to change.
 *
 * The state of each pin is controlled through a bit mask on register 0x0A (ioDir) and the
 * current value of the GPIO port(s) can be read on the state register 0x0B (ioState).
 *
 * Each bit in the value of the state register corresponds to a value on a specific GPIO
 * pin, so bit 5 in the state value would be the value from GPIO5 etc
 *
 * It's worth double checking this and don't hold me responsible if you break something,
 * but I think these GPIO pins are 5v tolerant which could be very useful for integrating
 * older devices.
 *
 * Here's the link to the datasheet for YOU to check:
 * https://www.nxp.com/docs/en/data-sheet/SC16IS752_SC16IS762.pdf
 *
 */
class SC16IS752 {
  constructor (options = { i2cAddress: 0x48 }) {
    this.ioDir = 0x0A
    this.ioState = 0x0B
    this.dirMask = 0x00
    Object.assign(this, options)
    this.writeByte(this.dirMask)
  }

  _openI2C () {
    if (!this.i2cOpen) {
      this.i2cOpen = true
      this.i2cPort = i2c.openSync(1)
      return true
    } else {
      return false
    }
  }

  _closeI2C () {
    if (this.i2cOpen) {
      this.i2cPort.closeSync()
      this.i2cOpen = false
    }
  }

  _read (register) {
    if (this._openI2C()) {
      const value = this.i2cPort.readByteSync(this.i2cAddress, register)
      this._closeI2C()
      return value
    }
  }

  _write (register, value) {
    if (this._openI2C()) {
      this.i2cPort.writeByteSync(this.i2cAddress, register, value)
      this._closeI2C()
    }
  }

  setIn (bit) {
    const setBit = Math.pow(2, bit)
    this.dirMask = this.dirMask & setBit
      ? this.dirMask - setBit
      : this.dirMask
    this._write(this.ioDir, this.dirMask)
  }

  setAllIn () {
    this.dirMask = 0
    this._write(this.ioDir, this.dirMask)
  }

  setOut (bit) {
    const setBit = Math.pow(2, bit)
    this.dirMask = !(this.dirMask & setBit)
      ? this.dirMask + setBit
      : this.dirMask
    this._write(this.ioDir, this.dirMask)
  }

  setAllOut () {
    this.dirMask = 255
    this._write(this.ioDir, this.dirMask)
  }

  getBit (bit) {
    const value = this.readByte()
    const setBit = Math.pow(2, bit)
    return (value & setBit) === setBit
  }

  setBit (bit) {
    const setValue = Math.pow(2, bit)
    const value = this.readByte()
    this._write(this.ioState, value | setValue & this.dirMask)
  }

  unsetBit (bit) {
    const setBit = Math.pow(2, bit)
    const value = this.readByte()
    const setValue = value & setBit === value ? value - setBit : value
    this._write(this.ioState, setValue)
  }

  writeByte (value) {
    this.dirMask = value
    this._write(this.ioDir, this.dirMask)
  }

  readByte () {
    return this._read(this.ioState)
  }
}

module.exports = SC16IS752
