package org.xi.audiofsk.terminal;

import java.util.LinkedList;
import java.util.Queue;

import org.xi.audiofsk.FSKModem;
import org.xi.audiofsk.FSKModemListener;
import android.os.Bundle;
import android.app.Activity;
import android.view.Menu;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;

import com.cs.reedsolomon.*;

public class MainActivity extends Activity {
	//static byte codeword[] = new byte[20];
	private ReedSolomonDecoder rsDecoder;
	private FSKModem fskm;
	private Queue<byte[]> qArray;
	

	@Override
	protected void onCreate(Bundle savedInstanceState) {
	
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_main);

		fskm = new FSKModem();
		qArray = new LinkedList<byte[]>();
		FSKModem.debugPrint(fskm);
    	rsDecoder = new ReedSolomonDecoder(GenericGF.DATA_MATRIX_FIELD_256);


		fskm.addDataReceiver(new FSKModemListener() {
			@Override
			public void dataReceivedFromFSKModem(final byte[] data) {
				runOnUiThread(new Runnable() {
				    public void run() {
						//int erasures[] = new int[16];
						//int nerasures = 15;
						/*
				    	RS.decode_data(data, data.length);
						if (RS.check_syndrome() != 0) {
							Berlekamp.correct_errors_erasures(data, data.length,nerasures,erasures);
						}
						*/
				    	qArray.add(data);
				    	//correctErrors(data, 5);
				    	StringBuilder sb = new StringBuilder();
						TextView recvView = (TextView) findViewById(R.id.tvReceived);
						sb.append(recvView.getText().toString());
						for(int i=0; data != null && i < data.length; i++) {
							int v = data[i] & 0xff;
							if (v == 0xff) {
								continue;
							}

							if (v > 31 && v < 127) {
								sb.append((char)v);
							} else {
								if (v < 16) {
									sb.append(" 0");
									sb.append(Integer.toHexString(v));
									sb.append(' ');
								} else {
									sb.append(' ');
									sb.append(Integer.toHexString(v));
									sb.append(' ');
								}
							}
						}
						/* Now decode -- encoded codeword size must be passed */
						
						recvView.setText(sb.toString());
				    }
				});
			}
		});
//encode_data(byte[] msg, int nbytes, byte[] codeword)
		final Button sendBtn = (Button) findViewById(R.id.btnSend);
		sendBtn.setOnClickListener(new View.OnClickListener() {
			public void onClick(View v) {
				
				EditText inputBox = (EditText) findViewById(R.id.edtInput);
				String msg = inputBox.getText().toString();
				/*
				// Initial ECC
				RS.initialize_ecc();
				// Encode data by using RS ECC
				RS.encode_data(msg.getBytes(), msg.length(), codeword);
				// To show ECC message
				
				String tt = new String(codeword);
				recvView.setText(tt);
				// Send ECC
				 * 
				 */
				// public void encode(int[] toEncode, int ecBytes)
				byte[] codeword = generateECBytes(msg.getBytes(),25);
				//fskm.writeBytes(msg.getBytes());
				//fskm.writeBytes(codeword);
				//fskm.writeBytes(endbyte);
				byte[] sendata = new byte[msg.length()+codeword.length];
				System.arraycopy(msg.getBytes(),0,sendata,0,msg.length());
				System.arraycopy(codeword,0,sendata,msg.length(),codeword.length);
				//System.arraycopy(endbyte,0,sendata,msg.length()+codeword.length,1);
				TextView recvView = (TextView) findViewById(R.id.tvReceived);
				//String tt = new String(codeword);
				//String tt2 = new String(endbyte);
				String senddata2 = new String(sendata);
				fskm.writeBytes(sendata);
				//recvView.setText(msg+tt+tt2);
				recvView.setText("DATASEND:"+senddata2+"\n");
				inputBox.setText(null);
				
			}
		});

		final Button clearBtn = (Button) findViewById(R.id.btnClear);
		clearBtn.setOnClickListener(new View.OnClickListener() {
			public void onClick(View v) {
				TextView recvView = (TextView) findViewById(R.id.tvReceived);
				recvView.setText(null);
				recvView.setText(String.valueOf(qArray.size()));
			}
		});
		
		final Button decodeBtn = (Button) findViewById(R.id.btnDecode);
		decodeBtn.setOnClickListener(new View.OnClickListener(){
			public void onClick(View v){
				TextView recvView = (TextView) findViewById(R.id.tvReceived);
				recvView.setText(String.valueOf(qArray.size()));
				byte[] received = new byte[256];
				int i = 0;
				while (qArray.size() > 0){
					byte[] temp = qArray.poll();
					System.arraycopy(temp,0,received,i,temp.length);
					i = i + temp.length;
				}
		    	try {
					correctErrors(received,25);
				} catch (ChecksumException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
				recvView.setText(new String(received));

				

			}
		});
		

		fskm.start();
	}
	


	@Override
	protected void onDestroy() {
		fskm.stop();
		fskm = null;
		super.onDestroy();
	}

	  static byte[] generateECBytes(byte[] dataBytes, int numEcBytesInBlock) {
		    int numDataBytes = dataBytes.length;
		    int[] toEncode = new int[numDataBytes + numEcBytesInBlock];
		    for (int i = 0; i < numDataBytes; i++) {
		      toEncode[i] = dataBytes[i] & 0xFF;
		    }
		    new ReedSolomonEncoder(GenericGF.QR_CODE_FIELD_256).encode(toEncode, numEcBytesInBlock);

		    byte[] ecBytes = new byte[numEcBytesInBlock];
		    for (int i = 0; i < numEcBytesInBlock; i++) {
		      ecBytes[i] = (byte) toEncode[numDataBytes + i];
		    }
		    return ecBytes;
		  }
	  /**
	   * <p>Given data and error-correction codewords received, possibly corrupted by errors, attempts to
	   * correct the errors in-place using Reed-Solomon error correction.</p>
	   *
	   * @param codewordBytes data and error correction codewords
	   * @param numDataCodewords number of codewords that are data bytes
	   * @throws ChecksumException if error correction fails
	   */
	  
	  private void correctErrors(byte[] codewordBytes, int numDataCodewords) throws ChecksumException {
	    int numCodewords = codewordBytes.length;
	    // First read into an array of ints
	    int[] codewordsInts = new int[numCodewords];
	    for (int i = 0; i < numCodewords; i++) {
	      codewordsInts[i] = codewordBytes[i] & 0xFF;
	    }
	    int numECCodewords = codewordBytes.length - numDataCodewords;
	    try {
	      rsDecoder.decode(codewordsInts, numECCodewords);
	    } catch (ReedSolomonException rse) {
	      throw ChecksumException.getChecksumInstance();
	    }
	    // Copy back into array of bytes -- only need to worry about the bytes that were data
	    // We don't care about errors in the error-correction codewords
	    for (int i = 0; i < numDataCodewords; i++) {
	      codewordBytes[i] = (byte) codewordsInts[i];
	    }
	  }
	  
	/*
	 * Trim off excess zeros and parity bytes.
	 */
	/*
	static byte[] rtrim(byte[] bytes) {
		int t = bytes.length - 1;
		while (bytes[t] == 0)
			t -= 1;
		byte[] trimmed = new byte[(t+1) - Settings.kParityBytes];
		for (int i = 0; i < trimmed.length; i++) {
			trimmed[i] = bytes[i];
		}
		return trimmed;
	}
*/
	
	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		// Inflate the menu; this adds items to the action bar if it is present.
		getMenuInflater().inflate(R.menu.activity_main, menu);
		return true;
	}
}
