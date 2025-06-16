package com.example.RhNova.model.entity.ResponRH;

import com.example.RhNova.model.entity.User;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import lombok.*;

import java.time.LocalDateTime;

@Document(collection = "entretiens")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Entretien {

    @Id
    private String id;

    @DBRef
    private User candidat;

    @DBRef
    private JobOffer offre;

    private LocalDateTime dateHeure;

    private String lieu;

    private String informationsComplementaires;
}
