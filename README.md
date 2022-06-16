# SC16IS752 GPIO port

The sb-components serial expansion Hat comes with some documentation showing how to add the 2 new UART devices to your Raspberry Pi, however there's nothing to cover how to access the 8 GPIO pins available on this Hat.

I searched github, gitlab, npmjs etc and didn't find any examples of how to access these new ports. So I turned to the datasheet to see if I could work out how to use it.

I've created a nodejs class which exposes some methods to allow access to the GPIO.  This chip has a register (0x0B) which is mapped to a single byte, reading this register gives the values of the individual pins. Another register (0x0A) is mapped to a byte which indicates if the pins are inputs or outputs.

Consider the GPIO pins are numbered 0 to 7 which corresponds to bits 0 to 7, some of you will think that's obvious, some will have a lightbulb moment.

<img width="615" alt="image" src="https://user-images.githubusercontent.com/5994927/173930582-9e7e9887-84f9-49b9-af75-9bae01acd383.png">

## Usage
Clone the class and copy it into your application.  The class depends on the "i2c-bus" module so you'll need to add this to your project if you haven't already:
```
npm i i2c-bus
```

Within your application:
```
const SC16IS752 = require('SC16IS752')
const gpio = new SC16IS752({ i2cAddress: 0x48 })
```
The i2cAddress is optional and defaults to 0x48 but these Hat's can be modified to use different addresses so the option is there to set it to your own requirements.

## Methods
* setIn()
* setAllIn()
* setOut()
* setAllOut()
* getBit()
* setBit()
* unsetBit()
* writeByte()
* readByte()

### setIn()
Set a GPIO pin to be an input.  All pins default to input.

Example - Set gpio5 to be an input:
```
gpio.setIn(5)
```

### setAllIn()
Set all GPIO pins to be inputs.  All ports default to input.

Example - Set all gpio pins to input:
```
gpio.setAllIn()
```

### setOut()
Set a GPIO pin to be an output. All ports default to input so you will need to do this if
you're defining outputs.

Example - Set gpio3 to be an output:
```
gpio.setOut(3)
```

### setAllOut()
Set all GPIO pins to be outputs. All ports default to input.

Example - Set all gpio pins to be outputs:
```
gpio.setAllOut()
```

### getBit()
Get the state of a particular gpio pin.

Example - get the value of gpio6:
```
const gpio6 = gpio.getBit(6)
```

### setBit()
Set an output pin to 1 or "on"

Example - set gpio2 on:
```
gpio.setBit(2)
```

### unsetBit()
Set an output pin to 0 or "off"

Example - set gpio2 off:
```
gpio.unsetBit(2)
```

### writeByte()
Set all the bits in one go.  If you know your way around 8-bit binary it's easier to set 
all the bits in one write.

Given that 1 is on and 0 is off
```
gpio gpio 
7654 3210
|||| ||||
1001 1100 = 0x9C = 156
```
Writing 156 to the gpio register will set the on's and off's in the pattern seen above.

```
gpio.writeByte(156)
or
gpio.writeByte(0x9C)
```

Be aware that only pins set to output will write a value.
```
1001 1100 <- value to write = 9C = 156
0001 0100 <- inputs and outputs (1 is output, 0 is input)
0001 0100 <- actual value written = 0x14 = 20
```




