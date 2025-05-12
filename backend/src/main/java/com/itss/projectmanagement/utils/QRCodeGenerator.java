package com.itss.projectmanagement.utils;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
public class QRCodeGenerator {

    /**
     * Generate a QR code as a byte array from a string
     * 
     * @param text The text to encode in the QR code
     * @param width The width of the QR code image
     * @param height The height of the QR code image
     * @return Byte array containing the QR code image data
     */
    public byte[] generateQRCode(String text, int width, int height) {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            Map<EncodeHintType, Object> hints = new HashMap<>();
            hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H);
            hints.put(EncodeHintType.MARGIN, 1);
            
            BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, width, height, hints);
            
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
            
            return outputStream.toByteArray();
        } catch (WriterException | IOException e) {
            log.error("Error generating QR code", e);
            throw new RuntimeException("Could not generate QR code", e);
        }
    }
    
    /**
     * Generate a QR code for project access code
     * 
     * @param projectName The project name
     * @param accessCode The access code
     * @return Byte array containing the QR code image data
     */
    public byte[] generateProjectAccessQRCode(String projectName, String accessCode) {
        // Create a formatted text for the QR code that includes both project name and access code
        String qrCodeText = "Project: " + projectName + "\nAccess Code: " + accessCode;
        
        // Generate QR code with standard dimensions
        return generateQRCode(qrCodeText, 250, 250);
    }
}
