package com.orienteering.dto;

public class RegisterReq {
    private String email;
    private String password;

    public RegisterReq() {}

    public RegisterReq(String email, String password) {
        this.email = email;
        this.password = password;
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
