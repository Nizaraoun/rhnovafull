package com.example.RhNova.model.entity;
import java.util.List;
import com.example.RhNova.model.entity.Candidat.Candidature;
import com.example.RhNova.model.entity.Manager.Equipe;
import com.example.RhNova.model.enums.Role;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.index.Indexed;
import lombok.*;

@Document(collection = "users")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class User {

    @Id
    private String id;

    private String name;

    @Indexed(unique = true)
    private String email;

    private String password;

    private Role role;

    @DBRef
    private Equipe equipe;

    @DBRef
    private List<Candidature> candidatures; //accéder à toutes les candidatures d'un user.

    // Constructeur personnalisé utile à l'inscription
    public User(String name, String email, String password, Role role) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
    }
}


