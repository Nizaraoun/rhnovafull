# CORS Configuration for Spring Boot Backend

## Add this CORS configuration to your Spring Boot application:

### Option 1: Global CORS Configuration (Recommended)

Create a new file: `src/main/java/com/example/RhNova/config/CorsConfig.java`

```java
package com.example.RhNova.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration corsConfiguration = new CorsConfiguration();
        
        // Allow Angular development server
        corsConfiguration.addAllowedOriginPattern("http://localhost:*");
        corsConfiguration.addAllowedOriginPattern("http://127.0.0.1:*");
        
        // Allow all headers and methods
        corsConfiguration.addAllowedHeader("*");
        corsConfiguration.addAllowedMethod("*");
        
        // Allow credentials
        corsConfiguration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", corsConfiguration);
        
        return new CorsFilter(source);
    }
}
```

### Option 2: Controller-level CORS (Alternative)

Add this annotation to your controller:

```java
@RestController
@RequestMapping("/api/conges")
@CrossOrigin(origins = {"http://localhost:4200", "http://127.0.0.1:4200"})
public class CongeController {
    // ... your existing controller code
}
```

### Option 3: Application Properties (Simple)

Add this to your `application.properties` or `application.yml`:

```properties
# application.properties
spring.web.cors.allowed-origins=http://localhost:4200,http://127.0.0.1:4200
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,PATCH,OPTIONS
spring.web.cors.allowed-headers=*
spring.web.cors.allow-credentials=true
```

**Choose Option 1 (CorsConfig.java) as it's the most comprehensive solution.**

## Steps to implement:

1. Create the `CorsConfig.java` file in your Spring Boot project
2. Restart your Spring Boot application
3. The Angular frontend should now be able to connect successfully

## Why this happens:

- **Browser Security**: Browsers block requests between different origins (localhost:4200 → localhost:8080)
- **Postman Works**: Postman doesn't enforce CORS policies
- **CORS Headers**: The backend needs to explicitly allow cross-origin requests

After implementing the CORS configuration, your Angular application will successfully connect to the backend!
