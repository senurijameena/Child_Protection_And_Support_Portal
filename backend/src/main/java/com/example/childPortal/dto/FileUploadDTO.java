package com.example.childPortal.dto;

public class FileUploadDTO {
    private String fileName;
    private String fileUrl;
    private String fileType;

    public String getFileName() { 
        return fileName; 
    }
    public void setFileName(String fileName) {
         this.fileName = fileName; 
    }
    
    public String getFileUrl() { 
        return fileUrl; 
    }
    public void setFileUrl(String fileUrl) {
         this.fileUrl = fileUrl; 
    }
    
    public String getFileType() { 
        return fileType;
 }
    public void setFileType(String fileType) {
         this.fileType = fileType; 
    }
}
