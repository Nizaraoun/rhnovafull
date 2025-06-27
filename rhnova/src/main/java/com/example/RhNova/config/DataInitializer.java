package com.example.RhNova.config;
                           
import com.example.RhNova.model.enums.Role;
import com.example.RhNova.model.entity.User;
import com.example.RhNova.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;    @Override
    public void run(String... args) throws Exception {
        initializeAdminUser();
    }

    private void initializeAdminUser() {
        String adminEmail = "admin@rhnova.com";
        String adminPassword = "admin123";

        // Check if admin user already exists
        if (!userRepository.existsByEmail(adminEmail)) {
            logger.info("Creating default admin user...");

            User adminUser = new User();
            adminUser.setEmail(adminEmail);
            adminUser.setPassword(passwordEncoder.encode(adminPassword));
            adminUser.setName("Admin");
            adminUser.setRole(Role.ADMIN);

            userRepository.save(adminUser);
            logger.info("Default admin user created successfully with email: {}", adminEmail);
        } else {
            logger.info("Admin user already exists, skipping creation.");
        }
    }
}
