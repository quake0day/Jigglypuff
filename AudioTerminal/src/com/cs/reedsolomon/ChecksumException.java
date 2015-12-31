package com.cs.reedsolomon;

public final class ChecksumException extends ReaderException {

	  private static final ChecksumException instance = new ChecksumException();

	  private ChecksumException() {
	    // do nothing
	  }

	  public static ChecksumException getChecksumInstance() {
	    return instance;
	  }

	}