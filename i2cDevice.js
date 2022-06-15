const i2c = require('i2c-bus')

class i2cDevice {
  constructor (options) {
    Object.assign(this, options)
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
}

module.exports = i2cDevice
