package com.example.RhNova.util;

import java.util.Random;


public class IdGenerator {
    public static String generateId(int length) {
        final Random random = new Random();
        final String numbers = "0123456789";
        final String lowercaseLetters = "abcdefghijklmnopqrstuvwxyz";
        final String uppercaseLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        final String allChars = numbers + lowercaseLetters + uppercaseLetters;

        StringBuilder value = new StringBuilder();
        for (int i = 0; i < length; i++) {
            value.append(allChars.charAt(random.nextInt(allChars.length())));
        }

        return value.toString();
    }
    
}


