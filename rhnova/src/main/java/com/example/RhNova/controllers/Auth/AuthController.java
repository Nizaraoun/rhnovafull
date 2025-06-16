package com.example.RhNova.controllers.Auth;

import com.example.RhNova.dto.AuthResponseDto;
import com.example.RhNova.dto.CreateInternalUserRequestDto;
import com.example.RhNova.dto.LoginRequestDto;
import com.example.RhNova.dto.RegisterRequestDto;
import com.example.RhNova.services.Auth.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDto> registerCandidat(@RequestBody RegisterRequestDto request) {
        try {
            AuthResponseDto response = authService.registerCandidat(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new AuthResponseDto(null, null, null, null, null, e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(@RequestBody LoginRequestDto request) {
        try {
            AuthResponseDto response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new AuthResponseDto(null, null, null, null, null, e.getMessage()));
        }
    }

    @PostMapping("/create-internal-user")
    public ResponseEntity<AuthResponseDto> createInternalUser(@RequestBody CreateInternalUserRequestDto request) {
        try {
            AuthResponseDto response = authService.createInternalUser(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new AuthResponseDto(null, null, null, null, null, e.getMessage()));
        }
    }
}
