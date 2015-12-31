# Jigglypuff
Enabling Secure Keyless Acoustic Communication for Smartphones

![Copy Right:https://i.v2ex.co/68EFXZQT.png](https://i.v2ex.co/68EFXZQT.png)


## How to Use
===
When you start the application, there are two buttons. First for sender and another for receiver.

## Main Class && Methods
===

### Main Part:

**SenderActivity**: Keep input value, encode that value.

	encodeMessage: Encodes the message and plays the sound signal using FSK. 

**ReceiverActivity**: Start the receiver to receive the sound signal from mic.  The data received is stored in a buffer and then will appear on the screen

**AudioReceiver**: Receive the data/message.

	messageReceived: Check the message is received, if not then send last message.

###FSK Modulation/Demodulation:
When app starts a thread object that continuously records sound.

**ArduinoService**: sound acquisition

	AudioRecordingRun(): loop that records sound
    write(int): encodes the integer and plays the sound signal.

**FSKDecoder**: Thread object that demodulates the sound signal.

**FSKModule**: Utility static methods related to FSK modulation/demodulation.

          encode(int): encodes the number into a sound signal
          decodeSound(double): decodes the sound signal into an integer
**ErrorDetection**: Before transmission the number(between 0 and 31) is added with a checksum. Then at the reception, the message is decoded and if checksum check:

          fails: an ARQ (Automatic Request Query) code is sent, then the sender repeats the last message sent.
          agrees: an ACK (Acknowledgment) code is sent (if not received the sender tries to the send the last message again). 

## Proposal
===

### 1. Demonstrate encode function by transferring text to voice frequency (9,000~10,000 Hz).(1 week)

In this process, we use two major techniques to implement transition, **FSK** and **ECC**. 

Frequency shift keying (FSK) is a frequency modulation scheme in which digital information is transmitted through discrete frequency changes of a carrier wave. Normally, the transmitted audio alternates between two tones: one , the "mark", represents a binary one, the other, the "space", represents a binary zero.
	
Error correction code (ECC) is a systematic way of building codes that could detect and correct multiple random symbols. It viewed as cyclic BCH codes, where encoding symbols are derived from the coefficients of a polynomial constructed by multiplying p(x) with a cyclic generator polynomial, which gives rise to efficient decoding algorithms.

### 2.  Demonstrate decode function by transferring voice frequency to text.(1 week)



### 3.  Do the test on smart phones. To see if we can get the right text by choosing a specific voice frequency (handled by FSK).(1 week)



### 4.  Testing if we can use FSK algorithm to transfer any text information to the voice frequency, and vice versa.(2 weeks)



### 5. By adding the white noise, our group implement security function and test the correctness.(4 weeks)

The applications of **accelerometer and distance detector** determine: 

1. the receiver generates jamming signal;  
2. sender sends information to receiver;
3. after receiver gets the mixed signal, it will remove the jamming signal.

## Team Member
====
Chen Si

Wang Jun

Tu Yujin
