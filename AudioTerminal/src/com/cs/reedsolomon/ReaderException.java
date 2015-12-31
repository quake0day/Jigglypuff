package com.cs.reedsolomon;

public abstract class ReaderException extends Exception {

	  ReaderException() {
	    // do nothing
	  }

	  // Prevent stack traces from being taken
	  // srowen says: huh, my IDE is saying this is not an override. native methods can't be overridden?
	  // This, at least, does not hurt. Because we use a singleton pattern here, it doesn't matter anyhow.
	  @Override
	  public final Throwable fillInStackTrace() {
	    return null;
	  }

	}