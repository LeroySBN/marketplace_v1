package main.java.com.api.model;

import javax.persistence.Entity;

@Entity
public class User extends BaseModel {

    private String username;
    private String password;

    // Getters and setters for username and password
}

